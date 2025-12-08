const request = require("supertest");
const path = require("path");
const app = require(path.join(__dirname, "../../src/app"));
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Tests API Integration Tests", () => {
  let testEndpoint;

  beforeAll(async () => {
    await prisma.test.deleteMany();
    await prisma.endpoint.deleteMany();
  });

  beforeEach(async () => {
    // Create a test endpoint
    testEndpoint = await prisma.endpoint.create({
      data: {
        name: "Test API",
        url: "https://httpbin.org/get",
        method: "GET",
      },
    });
  });

  afterEach(async () => {
    await prisma.test.deleteMany();
    await prisma.endpoint.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/endpoints/:id/test", () => {
    test("should create test and return 201", async () => {
      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 10,
          connections: 5,
          rps: 50,
        })
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("message", "Load test started");
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
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body.data.rps).toBeNull();

      const test = await prisma.test.findFirst();
      expect(test.rps).toBeNull();
    });

    test("should return 400 for invalid test configuration", async () => {
      const response = await request(app)
        .post(`/api/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 0,
          connections: 1001,
          rps: -1,
        })
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toMatchObject({
        error: true,
        message: "Validation failed",
      });
      expect(response.body.details).toBeInstanceOf(Array);
      expect(response.body.details.length).toBeGreaterThan(0);

      const tests = await prisma.test.findMany();
      expect(tests).toHaveLength(0);
    });

    test("should return 404 for non-existent endpoint", async () => {
      const response = await request(app)
        .post("/api/endpoints/999/test")
        .send({
          duration: 10,
          connections: 5,
        })
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        error: true,
        message: "Endpoint not found",
      });
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
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: test.id,
        status: "completed",
        duration: 10,
        connections: 5,
      });
      expect(response.body.data.results).toMatchObject({
        requests: { total: 100 },
        successRate: 100,
      });
      expect(response.body.data.endpoint).toMatchObject({
        name: "Test API",
      });
    });

    test("should return test with pending status", async () => {
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
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: test.id,
        status: "pending",
      });
      expect(response.body.data.results).toBeNull();
    });

    test("should return 404 for non-existent test", async () => {
      const response = await request(app)
        .get("/api/tests/999")
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        error: true,
        message: "Test not found",
      });
    });
  });

  describe("GET /api/tests/:id/status", () => {
    test("should return only test status", async () => {
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: "running",
        },
      });

      const response = await request(app)
        .get(`/api/tests/${test.id}/status`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: test.id,
        status: "running",
        completedAt: null,
      });
      // Should not include full test details
      expect(response.body.data).not.toHaveProperty("duration");
      expect(response.body.data).not.toHaveProperty("results");
    });

    test("should return status for completed test", async () => {
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
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: test.id,
        status: "completed",
      });
      expect(response.body.data.completedAt).toBeTruthy();
    });

    test("should return 404 for non-existent test", async () => {
      const response = await request(app)
        .get("/api/tests/999/status")
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        error: true,
        message: "Test not found",
      });
    });
  });
});
