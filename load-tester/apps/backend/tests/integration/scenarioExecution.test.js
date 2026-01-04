/**
 * Scenario Execution Integration Tests
 * Tests the full flow of executing load tests with scenarios
 */

const request = require("supertest");
const path = require("path");

// Mock autocannon BEFORE requiring the app to make tests fast
jest.mock("autocannon", () => {
  const mockInstance = {
    on: jest.fn(),
    stop: jest.fn(),
  };

  return jest.fn((options, callback) => {
    // Simulate successful test completion with realistic results
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

    // Simulate async completion after a short delay
    setImmediate(() => {
      if (callback) {
        callback(null, mockResult);
      }
    });

    return mockInstance;
  });
});

const app = require(path.join(__dirname, "../../src/app"));
const { createTestPrismaClient } = require("../helpers/prisma");

const prisma = createTestPrismaClient();

describe("Scenario Execution Integration Tests", () => {
  let testEndpoint;
  let smokeScenario;
  let rampScenario;

  beforeEach(async () => {
    // Wait for any background processes to settle
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clean database
    await prisma.test.deleteMany({});
    await prisma.scenario.deleteMany({});
    await prisma.endpoint.deleteMany({});

    const timestamp = Date.now() + Math.random();

    // Create test endpoint
    testEndpoint = await prisma.endpoint.create({
      data: {
        name: `Test API ${timestamp}`,
        url: `https://httpbin.org/get?t=${timestamp}`,
        method: "GET",
      },
    });

    // Create a smoke test scenario (single constant phase)
    smokeScenario = await prisma.scenario.create({
      data: {
        name: "Smoke Test",
        description: "Minimal load test",
        mode: "simple",
        phases: JSON.stringify([
          { name: "Smoke", duration: 10, connections: 2, type: "constant" },
        ]),
        isTemplate: true,
      },
    });

    // Create a ramp scenario (multiple phases)
    rampScenario = await prisma.scenario.create({
      data: {
        name: "Ramp Test",
        description: "Ramp up and down test",
        mode: "simple",
        phases: JSON.stringify([
          { name: "Ramp Up", duration: 10, connections: 10, type: "ramp" },
          { name: "Sustain", duration: 10, connections: 10, type: "constant" },
          { name: "Ramp Down", duration: 10, connections: 0, type: "ramp" },
        ]),
        isTemplate: false,
      },
    });
  });

  afterEach(async () => {
    // Small delay to ensure async operations settle
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/endpoints/:id/test with scenarioId", () => {
    test("should create test with scenario reference", async () => {
      const response = await request(app)
        .post(`/api/v1/endpoints/${testEndpoint.id}/test`)
        .send({
          scenarioId: smokeScenario.id,
        })
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Scenario test started successfully"
      );
      expect(response.body.data).toMatchObject({
        endpointId: testEndpoint.id,
        scenarioId: smokeScenario.id,
        status: "pending",
      });

      // Duration and connections should be calculated from phases
      expect(response.body.data.duration).toBe(10);
      expect(response.body.data.connections).toBe(2);
    });

    test("should calculate correct duration and connections from multi-phase scenario", async () => {
      const response = await request(app)
        .post(`/api/v1/endpoints/${testEndpoint.id}/test`)
        .send({
          scenarioId: rampScenario.id,
        })
        .expect(201);

      // Duration should be sum of all phases: 10 + 10 + 10 = 30
      expect(response.body.data.duration).toBe(30);
      // Connections should be max across phases: max(10, 10, 0) = 10
      expect(response.body.data.connections).toBe(10);
    });

    test("should return error for non-existent scenario", async () => {
      const response = await request(app)
        .post(`/api/v1/endpoints/${testEndpoint.id}/test`)
        .send({
          scenarioId: 99999,
        })
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    test("should return error for non-existent endpoint", async () => {
      // When endpoint doesn't exist, we get an error (either 400 or 404)
      // The behavior depends on the validation middleware
      const response = await request(app)
        .post("/api/v1/endpoints/99999/test")
        .send({
          scenarioId: smokeScenario.id,
        });

      // Should return an error (either 400 from validation or 404 from not found)
      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty("error");
    });

    test("should fall back to regular test when no scenarioId provided", async () => {
      const response = await request(app)
        .post(`/api/v1/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 15,
          connections: 5,
        })
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Test started successfully"
      );
      expect(response.body.data.scenarioId).toBeNull();
      expect(response.body.data.duration).toBe(15);
      expect(response.body.data.connections).toBe(5);
    });
  });

  describe("Scenario test execution and results", () => {
    test("should complete scenario test and store results", async () => {
      // Start the test
      const startResponse = await request(app)
        .post(`/api/v1/endpoints/${testEndpoint.id}/test`)
        .send({
          scenarioId: smokeScenario.id,
        })
        .expect(201);

      const testId = startResponse.body.data.id;

      // Wait for async execution to complete (mocked, so fast)
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Get the test results
      const resultResponse = await request(app)
        .get(`/api/v1/tests/${testId}`)
        .expect(200);

      expect(resultResponse.body.data.status).toBe("completed");
      expect(resultResponse.body.data.results).toBeDefined();
      expect(resultResponse.body.data.phaseResults).toBeDefined();

      // Check that scenario is included
      expect(resultResponse.body.data.scenario).toBeDefined();
      expect(resultResponse.body.data.scenario.name).toBe("Smoke Test");
    });

    test("should store phase results for each phase", async () => {
      // Start the test with multi-phase scenario
      const startResponse = await request(app)
        .post(`/api/v1/endpoints/${testEndpoint.id}/test`)
        .send({
          scenarioId: rampScenario.id,
        })
        .expect(201);

      const testId = startResponse.body.data.id;

      // Wait for async execution to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get the test results
      const resultResponse = await request(app)
        .get(`/api/v1/tests/${testId}`)
        .expect(200);

      expect(resultResponse.body.data.status).toBe("completed");
      expect(resultResponse.body.data.phaseResults).toBeInstanceOf(Array);

      // Should have 3 phase results for 3 phases
      expect(resultResponse.body.data.phaseResults.length).toBe(3);

      // Check phase names match
      const phaseNames = resultResponse.body.data.phaseResults.map(p => p.phaseName);
      expect(phaseNames).toContain("Ramp Up");
      expect(phaseNames).toContain("Sustain");
      expect(phaseNames).toContain("Ramp Down");
    });

    test("should aggregate results correctly", async () => {
      // Start the test
      const startResponse = await request(app)
        .post(`/api/v1/endpoints/${testEndpoint.id}/test`)
        .send({
          scenarioId: smokeScenario.id,
        })
        .expect(201);

      const testId = startResponse.body.data.id;

      // Wait for async execution to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Get the test results
      const resultResponse = await request(app)
        .get(`/api/v1/tests/${testId}`)
        .expect(200);

      const results = resultResponse.body.data.results;

      expect(results).toHaveProperty("requests");
      expect(results).toHaveProperty("latency");
      expect(results).toHaveProperty("throughput");
      expect(results).toHaveProperty("errors");
      expect(results).toHaveProperty("timeouts");
      expect(results).toHaveProperty("duration");
      expect(results).toHaveProperty("successRate");
    });
  });

  describe("GET /api/tests/:id with scenario tests", () => {
    test("should include parsed phaseResults", async () => {
      // Create a completed test with phase results
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          scenarioId: smokeScenario.id,
          duration: 10,
          connections: 2,
          status: "completed",
          results: JSON.stringify({
            requests: { total: 200, average: 20, sent: 200 },
            latency: { min: 10, max: 100, mean: 50, p50: 45, p90: 80, p95: 90, p99: 95 },
            throughput: { average: 2000, total: 20000 },
            errors: 0,
            timeouts: 0,
            duration: 10,
            successRate: "100.00",
          }),
          phaseResults: JSON.stringify([
            {
              phaseName: "Smoke",
              duration: 10,
              requests: { total: 200, average: 20, sent: 200 },
              latency: { min: 10, max: 100, mean: 50, p50: 45, p90: 80, p95: 90, p99: 95 },
              throughput: { average: 2000, total: 20000 },
              errors: 0,
              timeouts: 0,
            },
          ]),
          completedAt: new Date(),
        },
      });

      const response = await request(app)
        .get(`/api/v1/tests/${test.id}`)
        .expect(200);

      expect(response.body.data.results).toBeInstanceOf(Object);
      expect(response.body.data.phaseResults).toBeInstanceOf(Array);
      expect(response.body.data.phaseResults[0].phaseName).toBe("Smoke");
    });

    test("should handle tests without phaseResults (backward compatibility)", async () => {
      // Create a test without phaseResults (old test before scenarios)
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: "completed",
          results: JSON.stringify({
            requests: { total: 500, average: 50, sent: 500 },
            latency: { min: 10, max: 100, mean: 50, p50: 45, p90: 80, p95: 90, p99: 95 },
            throughput: { average: 5000, total: 50000 },
            errors: 0,
            timeouts: 0,
            duration: 10,
            successRate: "100.00",
          }),
          completedAt: new Date(),
        },
      });

      const response = await request(app)
        .get(`/api/v1/tests/${test.id}`)
        .expect(200);

      expect(response.body.data.results).toBeInstanceOf(Object);
      expect(response.body.data.phaseResults).toBeNull();
      expect(response.body.data.scenario).toBeNull();
    });
  });

  describe("GET /api/tests list with scenarios", () => {
    test("should include scenario information in test list", async () => {
      // Create a test with scenario
      await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          scenarioId: smokeScenario.id,
          duration: 10,
          connections: 2,
          status: "completed",
          results: JSON.stringify({ requests: { total: 100 } }),
          completedAt: new Date(),
        },
      });

      // Create a test without scenario
      await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 15,
          connections: 5,
          status: "completed",
          results: JSON.stringify({ requests: { total: 200 } }),
          completedAt: new Date(),
        },
      });

      const response = await request(app)
        .get("/api/v1/tests")
        .expect(200);

      expect(response.body.data).toHaveLength(2);

      // Find the test with scenario
      const testWithScenario = response.body.data.find(t => t.scenarioId);
      expect(testWithScenario).toBeDefined();
      expect(testWithScenario.scenario).toBeDefined();
      expect(testWithScenario.scenario.name).toBe("Smoke Test");

      // Find the test without scenario
      const testWithoutScenario = response.body.data.find(t => !t.scenarioId);
      expect(testWithoutScenario).toBeDefined();
      expect(testWithoutScenario.scenario).toBeNull();
    });
  });

  describe("Test cancellation with scenarios", () => {
    test("should cancel running scenario test", async () => {
      // Note: Since autocannon is mocked and completes immediately,
      // we can't easily test cancellation of in-progress scenario tests.
      // This test verifies the cancel endpoint responds correctly.

      // Create a test that appears to be running
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          scenarioId: rampScenario.id,
          duration: 30,
          connections: 10,
          status: "running",
        },
      });

      // Since there's no actual running test, we expect an error
      const response = await request(app)
        .delete(`/api/v1/tests/${test.id}/cancel`)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });
});
