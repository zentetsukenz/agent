/**
 * Workflow Execution Integration Tests
 * Tests the full flow of executing load tests with workflow scenarios
 */

const request = require("supertest");
const path = require("path");
const nock = require("nock");

// Mock autocannon BEFORE requiring the app
jest.mock("autocannon", () => {
  const mockInstance = {
    on: jest.fn(),
    stop: jest.fn(),
  };

  return jest.fn((options, callback) => {
    // Simulate successful test completion
    const mockResult = {
      requests: {
        total: Math.floor(options.duration * options.connections * 10),
        average: options.connections * 10,
        sent: Math.floor(options.duration * options.connections * 10),
      },
      latency: {
        min: 10,
        max: 200,
        mean: 50,
        p50: 45,
        p90: 100,
        p95: 150,
        p99: 180,
      },
      throughput: {
        average: options.connections * 1000,
        total: options.duration * options.connections * 1000,
      },
      errors: 0,
      timeouts: 0,
      duration: options.duration || 10,
    };

    setImmediate(() => {
      if (callback) {
        callback(null, mockResult);
      }
    });

    return mockInstance;
  });
});

const { getPrismaClient } = require("../../src/config/database");
const app = require("../../src/app");

describe("Workflow Execution API", () => {
  let prisma;
  let testEndpoint;
  let workflowScenario;

  beforeAll(async () => {
    prisma = getPrismaClient();

    // Create test endpoint for workflow scenarios
    testEndpoint = await prisma.endpoint.create({
      data: {
        name: "Workflow Test API",
        url: "https://api.workflow-test.com",
        method: "GET",
      },
    });

    // Create a workflow scenario
    workflowScenario = await prisma.scenario.create({
      data: {
        name: "Integration Test Workflow",
        description: "Test workflow with setup, load, teardown",
        mode: "workflow",
        endpointId: testEndpoint.id,
        setup: JSON.stringify([
          {
            name: "Create Resource",
            method: "POST",
            path: "https://api.workflow-test.com/resources",
            body: '{"name": "Test Resource"}',
            extractors: [{ name: "resourceId", source: "body", path: "id" }],
          },
        ]),
        workflow: JSON.stringify([
          {
            name: "Use Resource",
            method: "GET",
            path: "https://api.workflow-test.com/resources/{{resourceId}}",
            runOnce: false,
          },
        ]),
        teardown: JSON.stringify([
          {
            name: "Delete Resource",
            method: "DELETE",
            path: "https://api.workflow-test.com/resources/{{resourceId}}",
          },
        ]),
        phases: JSON.stringify([
          { name: "Load", duration: 5, connections: 2, type: "constant" },
        ]),
        setupErrorHandling: "abort",
        setupRetryCount: 3,
        teardownErrorHandling: "ignore",
        teardownRetryCount: 1,
        isTemplate: false,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.test.deleteMany({ where: { endpointId: testEndpoint.id } });
    await prisma.scenario.deleteMany({ where: { id: workflowScenario.id } });
    await prisma.endpoint.delete({ where: { id: testEndpoint.id } });
    nock.cleanAll();
  });

  beforeEach(() => {
    // Setup nock mocks for the external API
    nock.cleanAll();
  });

  describe("POST /api/endpoints/:id/test with workflow scenario", () => {
    it("should execute workflow scenario with setup, load test, and teardown", async () => {
      // Mock the external API calls
      nock("https://api.workflow-test.com")
        .post("/resources")
        .reply(201, { id: "res-123", name: "Test Resource" })
        .get("/resources/res-123")
        .times(100) // Allow multiple calls during load test
        .reply(200, { id: "res-123", status: "active" })
        .delete("/resources/res-123")
        .reply(204);

      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({ scenarioId: workflowScenario.id })
        .expect(201);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.scenarioId).toBe(workflowScenario.id);
      expect(response.body.data.status).toBe("pending");
      expect(response.body.message).toContain("Scenario test started");
    });

    it("should detect workflow mode from scenario", async () => {
      nock("https://api.workflow-test.com")
        .post("/resources")
        .reply(201, { id: "res-456" })
        .get("/resources/res-456")
        .times(100)
        .reply(200, {})
        .delete("/resources/res-456")
        .reply(204);

      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({ scenarioId: workflowScenario.id })
        .expect(201);

      // Verify test was created
      const test = await prisma.test.findUnique({
        where: { id: response.body.data.id },
        include: { scenario: true },
      });

      expect(test.scenario.mode).toBe("workflow");
    });
  });

  describe("GET /api/tests/:id with workflow results", () => {
    it("should return workflow test results including setup/teardown info", async () => {
      // Create a completed test with workflow results
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          scenarioId: workflowScenario.id,
          status: "completed",
          duration: 5,
          connections: 2,
          results: JSON.stringify({
            requests: { total: 100, average: 20, sent: 100 },
            latency: { min: 10, max: 200, mean: 50, p50: 45, p90: 100, p95: 150, p99: 180 },
            throughput: { average: 2000, total: 10000 },
            errors: 0,
            timeouts: 0,
            successRate: "100.00",
            setupResults: [
              { step: "Create Resource", success: true, status: 201, duration: 150 },
            ],
            teardownResults: [
              { step: "Delete Resource", success: true, status: 204, duration: 50 },
            ],
          }),
          phaseResults: JSON.stringify([
            {
              phaseName: "Load",
              duration: 5,
              requests: { total: 100, average: 20, sent: 100 },
              latency: { min: 10, max: 200, mean: 50, p50: 45, p90: 100, p95: 150, p99: 180 },
              throughput: { average: 2000, total: 10000 },
              errors: 0,
              timeouts: 0,
            },
          ]),
        },
      });

      const response = await request(app)
        .get(`/api/tests/${test.id}`)
        .expect(200);

      expect(response.body.data.results).toBeDefined();
      expect(response.body.data.results.setupResults).toHaveLength(1);
      expect(response.body.data.results.setupResults[0].step).toBe("Create Resource");
      expect(response.body.data.results.teardownResults).toHaveLength(1);
      expect(response.body.data.phaseResults).toHaveLength(1);
      expect(response.body.data.phaseResults[0].phaseName).toBe("Load");

      // Cleanup
      await prisma.test.delete({ where: { id: test.id } });
    });
  });

  describe("Simple vs Workflow mode scenarios", () => {
    it("should use simple execution for mode=simple scenarios", async () => {
      // Create a simple mode scenario (with endpointId linked)
      const simpleScenario = await prisma.scenario.create({
        data: {
          name: "Simple Mode Test Scenario",
          mode: "simple",
          endpointId: testEndpoint.id,
          phases: JSON.stringify([
            { name: "Load", duration: 5, connections: 5, type: "constant" },
          ]),
          isTemplate: false,
        },
      });

      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({ scenarioId: simpleScenario.id })
        .expect(201);

      expect(response.body.data.scenarioId).toBe(simpleScenario.id);

      // Cleanup
      await prisma.test.deleteMany({ where: { scenarioId: simpleScenario.id } });
      await prisma.scenario.delete({ where: { id: simpleScenario.id } });
    });

    it("should calculate duration from phases for simple mode", async () => {
      const simpleScenario = await prisma.scenario.create({
        data: {
          name: "Multi-Phase Simple Test",
          mode: "simple",
          endpointId: testEndpoint.id,
          phases: JSON.stringify([
            { name: "Ramp", duration: 10, connections: 10, type: "ramp" },
            { name: "Sustain", duration: 30, connections: 10, type: "constant" },
            { name: "Cooldown", duration: 10, connections: 0, type: "ramp" },
          ]),
          isTemplate: false,
        },
      });

      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({ scenarioId: simpleScenario.id })
        .expect(201);

      // Total duration should be 50 seconds (10+30+10)
      expect(response.body.data.duration).toBe(50);

      // Cleanup
      await prisma.test.deleteMany({ where: { scenarioId: simpleScenario.id } });
      await prisma.scenario.delete({ where: { id: simpleScenario.id } });
    });
  });
});
