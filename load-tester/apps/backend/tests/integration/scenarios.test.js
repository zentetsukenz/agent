const request = require("supertest");
const path = require("path");
const app = require(path.join(__dirname, "../../src/app"));
const { createTestPrismaClient } = require("../helpers/prisma");

const prisma = createTestPrismaClient();

describe("Scenarios Integration Tests - REST API", () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.test.deleteMany({});
    await prisma.scenario.deleteMany({});
    await prisma.endpoint.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const validScenario = {
    name: "Test Scenario",
    description: "A test scenario for integration tests",
    mode: "simple",
    phases: [
      { name: "Ramp Up", duration: 30, connections: 10, type: "ramp" },
      { name: "Sustain", duration: 60, connections: 10, type: "constant" },
    ],
  };

  describe("GET /api/scenarios", () => {
    test("should return empty scenarios list", async () => {
      const response = await request(app).get("/api/scenarios").expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveLength(0);
    });

    test("should return scenarios list with templates first", async () => {
      // Create a template
      await prisma.scenario.create({
        data: {
          name: "Template",
          phases: JSON.stringify([{ name: "Test", duration: 60, connections: 10, type: "constant" }]),
          isTemplate: true,
        },
      });

      // Create a custom scenario
      await prisma.scenario.create({
        data: {
          name: "Custom",
          phases: JSON.stringify([{ name: "Test", duration: 60, connections: 10, type: "constant" }]),
          isTemplate: false,
        },
      });

      const response = await request(app).get("/api/scenarios").expect(200);

      expect(response.body.data).toHaveLength(2);
      // Templates should be first
      expect(response.body.data[0].name).toBe("Template");
      expect(response.body.data[0].isTemplate).toBe(true);
      expect(response.body.data[1].name).toBe("Custom");
      expect(response.body.data[1].isTemplate).toBe(false);
    });

    test("should parse JSON fields in response", async () => {
      await prisma.scenario.create({
        data: {
          name: "Test",
          phases: JSON.stringify([{ name: "Phase 1", duration: 60, connections: 10, type: "constant" }]),
        },
      });

      const response = await request(app).get("/api/scenarios").expect(200);

      expect(response.body.data[0].phases).toEqual([
        { name: "Phase 1", duration: 60, connections: 10, type: "constant" },
      ]);
    });
  });

  describe("GET /api/scenarios/:id", () => {
    test("should return single scenario", async () => {
      const scenario = await prisma.scenario.create({
        data: {
          name: "Test Scenario",
          description: "A test",
          phases: JSON.stringify([{ name: "Phase 1", duration: 60, connections: 10, type: "constant" }]),
        },
      });

      const response = await request(app)
        .get(`/api/scenarios/${scenario.id}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        name: "Test Scenario",
        description: "A test",
      });
      expect(response.body.data.phases).toEqual([
        { name: "Phase 1", duration: 60, connections: 10, type: "constant" },
      ]);
    });

    test("should return 404 for non-existent scenario", async () => {
      const response = await request(app)
        .get("/api/scenarios/999")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    test("should return 400 for invalid ID", async () => {
      const response = await request(app)
        .get("/api/scenarios/invalid")
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/scenarios", () => {
    test("should create new scenario", async () => {
      const response = await request(app)
        .post("/api/scenarios")
        .send(validScenario)
        .expect(201);

      expect(response.body.data).toMatchObject({
        name: validScenario.name,
        description: validScenario.description,
        mode: validScenario.mode,
      });
      expect(response.body.data.phases).toEqual(validScenario.phases);
      expect(response.body.message).toBe("Scenario created successfully");
    });

    test("should create scenario with workflow steps", async () => {
      const workflowScenario = {
        ...validScenario,
        name: "Workflow Scenario",
        mode: "workflow",
        setup: [
          { name: "Login", method: "POST", path: "/api/login" },
        ],
        workflow: [
          { name: "Create Resource", method: "POST", path: "/api/resources", runOnce: false },
        ],
        teardown: [
          { name: "Cleanup", method: "DELETE", path: "/api/cleanup" },
        ],
      };

      const response = await request(app)
        .post("/api/scenarios")
        .send(workflowScenario)
        .expect(201);

      expect(response.body.data.setup).toEqual(workflowScenario.setup);
      expect(response.body.data.workflow).toEqual(workflowScenario.workflow);
      expect(response.body.data.teardown).toEqual(workflowScenario.teardown);
    });

    test("should reject scenario without name", async () => {
      const response = await request(app)
        .post("/api/scenarios")
        .send({ ...validScenario, name: undefined })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    test("should reject scenario without phases", async () => {
      const response = await request(app)
        .post("/api/scenarios")
        .send({ ...validScenario, phases: undefined })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    test("should reject scenario with invalid phase type", async () => {
      const response = await request(app)
        .post("/api/scenarios")
        .send({
          ...validScenario,
          phases: [{ name: "Test", duration: 60, connections: 10, type: "invalid" }],
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    test("should reject duplicate scenario name", async () => {
      // Create first scenario
      await request(app).post("/api/scenarios").send(validScenario).expect(201);

      // Try to create with same name - Prisma unique constraint returns 400
      const response = await request(app)
        .post("/api/scenarios")
        .send(validScenario)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("already exists");
    });

    test("should sanitize input to prevent XSS", async () => {
      const response = await request(app)
        .post("/api/scenarios")
        .send({
          ...validScenario,
          name: '<script>alert("xss")</script>',
        })
        .expect(201);

      expect(response.body.data.name).not.toContain("<script>");
    });
  });

  describe("PUT /api/scenarios/:id", () => {
    test("should update scenario", async () => {
      const scenario = await prisma.scenario.create({
        data: {
          name: "Original Name",
          phases: JSON.stringify([{ name: "Phase 1", duration: 60, connections: 10, type: "constant" }]),
        },
      });

      const response = await request(app)
        .put(`/api/scenarios/${scenario.id}`)
        .send({
          name: "Updated Name",
          description: "Updated description",
        })
        .expect(200);

      expect(response.body.data.name).toBe("Updated Name");
      expect(response.body.data.description).toBe("Updated description");
      expect(response.body.message).toBe("Scenario updated successfully");
    });

    test("should update phases", async () => {
      const scenario = await prisma.scenario.create({
        data: {
          name: "Test",
          phases: JSON.stringify([{ name: "Phase 1", duration: 60, connections: 10, type: "constant" }]),
        },
      });

      const newPhases = [
        { name: "Ramp Up", duration: 30, connections: 50, type: "ramp" },
        { name: "Sustain", duration: 120, connections: 50, type: "constant" },
      ];

      const response = await request(app)
        .put(`/api/scenarios/${scenario.id}`)
        .send({ phases: newPhases })
        .expect(200);

      expect(response.body.data.phases).toEqual(newPhases);
    });

    test("should reject update to template", async () => {
      const template = await prisma.scenario.create({
        data: {
          name: "Template",
          phases: JSON.stringify([{ name: "Phase 1", duration: 60, connections: 10, type: "constant" }]),
          isTemplate: true,
        },
      });

      const response = await request(app)
        .put(`/api/scenarios/${template.id}`)
        .send({ name: "New Name" })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain("Cannot edit built-in templates");
    });

    test("should return 404 for non-existent scenario", async () => {
      const response = await request(app)
        .put("/api/scenarios/999")
        .send({ name: "New Name" })
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/scenarios/:id", () => {
    test("should delete scenario", async () => {
      const scenario = await prisma.scenario.create({
        data: {
          name: "To Delete",
          phases: JSON.stringify([{ name: "Phase 1", duration: 60, connections: 10, type: "constant" }]),
        },
      });

      const response = await request(app)
        .delete(`/api/scenarios/${scenario.id}`)
        .expect(200);

      expect(response.body.message).toBe("Scenario deleted successfully");

      // Verify deleted
      const deleted = await prisma.scenario.findUnique({
        where: { id: scenario.id },
      });
      expect(deleted).toBeNull();
    });

    test("should reject delete of template", async () => {
      const template = await prisma.scenario.create({
        data: {
          name: "Template",
          phases: JSON.stringify([{ name: "Phase 1", duration: 60, connections: 10, type: "constant" }]),
          isTemplate: true,
        },
      });

      const response = await request(app)
        .delete(`/api/scenarios/${template.id}`)
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain("Cannot delete built-in templates");
    });

    test("should return 404 for non-existent scenario", async () => {
      const response = await request(app)
        .delete("/api/scenarios/999")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/scenarios/:id/duplicate", () => {
    test("should duplicate scenario", async () => {
      const original = await prisma.scenario.create({
        data: {
          name: "Original",
          description: "Original description",
          phases: JSON.stringify([
            { name: "Ramp Up", duration: 30, connections: 10, type: "ramp" },
            { name: "Sustain", duration: 60, connections: 10, type: "constant" },
          ]),
          mode: "simple",
        },
      });

      const response = await request(app)
        .post(`/api/scenarios/${original.id}/duplicate`)
        .send({ name: "Copy of Original" })
        .expect(201);

      expect(response.body.data.name).toBe("Copy of Original");
      expect(response.body.data.description).toBe("Original description");
      expect(response.body.data.phases).toEqual([
        { name: "Ramp Up", duration: 30, connections: 10, type: "ramp" },
        { name: "Sustain", duration: 60, connections: 10, type: "constant" },
      ]);
      expect(response.body.data.isTemplate).toBe(false);
      expect(response.body.message).toBe("Scenario duplicated successfully");
    });

    test("should duplicate template", async () => {
      const template = await prisma.scenario.create({
        data: {
          name: "Smoke Test",
          phases: JSON.stringify([{ name: "Smoke", duration: 60, connections: 2, type: "constant" }]),
          isTemplate: true,
        },
      });

      const response = await request(app)
        .post(`/api/scenarios/${template.id}/duplicate`)
        .send({ name: "My Smoke Test" })
        .expect(201);

      expect(response.body.data.name).toBe("My Smoke Test");
      expect(response.body.data.isTemplate).toBe(false);
    });

    test("should reject duplicate without name", async () => {
      const original = await prisma.scenario.create({
        data: {
          name: "Original",
          phases: JSON.stringify([{ name: "Phase 1", duration: 60, connections: 10, type: "constant" }]),
        },
      });

      const response = await request(app)
        .post(`/api/scenarios/${original.id}/duplicate`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe("Validation Error");
      expect(response.body.message).toContain("Name is required");
    });

    test("should return 404 for non-existent scenario", async () => {
      const response = await request(app)
        .post("/api/scenarios/999/duplicate")
        .send({ name: "Copy" })
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Rate Limiting", () => {
    test("should allow requests within rate limit", async () => {
      // Make multiple requests
      for (let i = 0; i < 5; i++) {
        await request(app).get("/api/scenarios").expect(200);
      }
    });
  });
});
