const request = require("supertest");
const path = require("path");
const app = require(path.join(__dirname, "../../src/app"));
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Tests Integration Tests - REST API", () => {
  let testEndpoint;

  beforeEach(async () => {
    // Wait a bit to let any background processes from previous tests settle
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clean database and create a fresh test endpoint for each test
    await prisma.test.deleteMany({});
    await prisma.endpoint.deleteMany({});

    testEndpoint = await prisma.endpoint.create({
      data: {
        name: "Test API",
        url: "https://httpbin.org/get",
        method: "GET",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/endpoints/:id/test", () => {
    test("should create test and start execution", async () => {
      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 10,
          connections: 5,
          rps: 50,
        })
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Test started successfully"
      );
      expect(response.body.data).toMatchObject({
        duration: 10,
        connections: 5,
        rps: 50,
        status: "pending",
      });

      // Verify test was created
      const tests = await prisma.test.findMany();
      expect(tests).toHaveLength(1);
      expect(tests[0].duration).toBe(10);
      expect(tests[0].connections).toBe(5);
      expect(tests[0].rps).toBe(50);
    });

    test("should create test without optional rps", async () => {
      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 10,
          connections: 5,
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        duration: 10,
        connections: 5,
      });

      const test = await prisma.test.findFirst();
      expect(test.rps).toBeNull();
    });

    test("should create test with custom timeout", async () => {
      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 10,
          connections: 5,
          timeout: 120,
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        duration: 10,
        connections: 5,
        timeout: 120,
      });

      const test = await prisma.test.findFirst();
      expect(test.timeout).toBe(120);
    });

    test("should use default timeout when not provided", async () => {
      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 10,
          connections: 5,
        })
        .expect(201);

      const test = await prisma.test.findFirst();
      expect(test.timeout).toBe(300);
    });

    test("should reject invalid test configuration", async () => {
      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 0,
          connections: 1001,
          rps: -1,
        })
        .expect(400);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body).toHaveProperty("details");

      const tests = await prisma.test.findMany();
      expect(tests).toHaveLength(0);
    });

    test("should handle missing required fields", async () => {
      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error", true);
    });
  });

  describe("GET /api/tests/:id", () => {
    test("should return test results for completed test", async () => {
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: "completed",
          results: JSON.stringify({
            requests: { total: 100, average: 10, sent: 100 },
            latency: {
              min: 10,
              max: 100,
              mean: 50,
              p50: 45,
              p90: 80,
              p95: 90,
              p99: 95,
            },
            throughput: { average: 1000, total: 10000 },
            errors: 0,
            timeouts: 0,
            successRate: 100,
            duration: 10,
          }),
          completedAt: new Date(),
        },
      });

      const response = await request(app)
        .get(`/api/tests/${test.id}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        duration: 10,
        connections: 5,
        status: "completed",
      });
      expect(response.body.data.results).toBeDefined();
      expect(response.body.data.results.successRate).toBe(100);
      expect(response.body.data.endpoint).toMatchObject({
        name: "Test API",
        url: "https://httpbin.org/get",
      });
    });

    test("should return test with null results for pending test", async () => {
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: "pending",
        },
      });

      const response = await request(app)
        .get(`/api/tests/${test.id}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        status: "pending",
      });
      expect(response.body.data.results).toBeNull();
    });

    test("should return 404 for non-existent test", async () => {
      const response = await request(app).get("/api/tests/999").expect(404);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body).toHaveProperty("message", "Test not found");
    });
  });

  describe("GET /api/tests/:id/status", () => {
    test("should return test status for pending test", async () => {
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: "pending",
        },
      });

      const response = await request(app)
        .get(`/api/tests/${test.id}/status`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: test.id,
        status: "pending",
        completedAt: null,
      });
    });

    test("should return test status for completed test", async () => {
      const completedAt = new Date();
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: "completed",
          completedAt,
        },
      });

      const response = await request(app)
        .get(`/api/tests/${test.id}/status`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: test.id,
        status: "completed",
      });
      expect(response.body.data.completedAt).toBeDefined();
    });

    test("should return 404 for non-existent test", async () => {
      const response = await request(app)
        .get("/api/tests/999/status")
        .expect(404);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body).toHaveProperty("message", "Test not found");
    });
  });

  describe("DELETE /api/tests/:id/cancel", () => {
    test("should return error for non-running test", async () => {
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: "pending",
        },
      });

      const response = await request(app)
        .delete(`/api/tests/${test.id}/cancel`)
        .expect(400);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body.message).toContain("not currently running");
    });

    test("should return error for completed test", async () => {
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: "completed",
          completedAt: new Date(),
        },
      });

      const response = await request(app)
        .delete(`/api/tests/${test.id}/cancel`)
        .expect(400);

      expect(response.body).toHaveProperty("error", true);
    });
  });

  describe("GET /api/tests", () => {
    test("should return all tests", async () => {
      // Create multiple tests
      await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: "completed",
        },
      });

      await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 20,
          connections: 10,
          status: "pending",
        },
      });

      const response = await request(app).get("/api/tests").expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty("endpoint");
      expect(response.body.data[0].endpoint.name).toBe("Test API");
    });

    test("should return empty array when no tests exist", async () => {
      const response = await request(app).get("/api/tests").expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    test("should handle validation errors with empty body", async () => {
      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body.details).toContain("Duration is required");
      expect(response.body.details).toContain("Connections is required");
    });

    test("should execute test with endpoint that has headers", async () => {
      // Create endpoint with headers
      const endpointWithHeaders = await prisma.endpoint.create({
        data: {
          name: "API with Headers",
          url: "https://httpbin.org/get",
          method: "GET",
          headers: JSON.stringify({ "X-Custom-Header": "test-value" }),
        },
      });

      const response = await request(app)
        .post(`/api/endpoints/${endpointWithHeaders.id}/test`)
        .send({
          duration: 5,
          connections: 2,
        })
        .expect(201);

      expect(response.body.message).toBe("Test started successfully");
      expect(response.body.data.status).toBe("pending");
    });

    test("should execute test with endpoint that has body", async () => {
      // Create endpoint with body
      const endpointWithBody = await prisma.endpoint.create({
        data: {
          name: "API with Body",
          url: "https://httpbin.org/post",
          method: "POST",
          body: JSON.stringify({ key: "value" }),
        },
      });

      const response = await request(app)
        .post(`/api/endpoints/${endpointWithBody.id}/test`)
        .send({
          duration: 5,
          connections: 2,
        })
        .expect(201);

      expect(response.body.message).toBe("Test started successfully");
    });

    test("should handle test with RPS parameter", async () => {
      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 5,
          connections: 2,
          rps: 10,
        })
        .expect(201);

      expect(response.body.data.rps).toBe(10);
    });
  });
});
