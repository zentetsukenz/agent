const request = require("supertest");
const path = require("path");
const app = require(path.join(__dirname, "../../src/app"));
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Endpoints API Integration Tests", () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.test.deleteMany();
    await prisma.endpoint.deleteMany();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.test.deleteMany();
    await prisma.endpoint.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/endpoints", () => {
    test("should return empty array when no endpoints exist", async () => {
      const response = await request(app)
        .get("/api/endpoints")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toEqual([]);
    });

    test("should return list of endpoints", async () => {
      // Create test endpoint
      await prisma.endpoint.create({
        data: {
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
        },
      });

      const response = await request(app)
        .get("/api/endpoints")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        name: "Test API",
        url: "https://api.example.com",
        method: "GET",
      });
    });
  });

  describe("GET /api/endpoints/:id", () => {
    test("should return endpoint by id", async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
        },
      });

      const response = await request(app)
        .get(`/api/endpoints/${endpoint.id}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: endpoint.id,
        name: "Test API",
        url: "https://api.example.com",
        method: "GET",
      });
    });

    test("should return 404 for non-existent endpoint", async () => {
      const response = await request(app)
        .get("/api/endpoints/999")
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        error: true,
        message: "Endpoint not found",
      });
    });
  });

  describe("POST /api/endpoints", () => {
    test("should create new endpoint and return 201", async () => {
      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: "New API",
          url: "https://api.example.com",
          method: "GET",
        })
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty(
        "message",
        "Endpoint created successfully"
      );
      expect(response.body.data).toMatchObject({
        name: "New API",
        url: "https://api.example.com",
        method: "GET",
      });

      // Verify endpoint was created
      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(1);
      expect(endpoints[0].name).toBe("New API");
    });

    test("should create endpoint with optional headers and body", async () => {
      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: "API with Headers",
          url: "https://api.example.com",
          method: "POST",
          headers: '{"Authorization": "Bearer token"}',
          body: '{"key": "value"}',
        })
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body.data.headers).toBe(
        '{"Authorization": "Bearer token"}'
      );
      expect(response.body.data.body).toBe('{"key": "value"}');
    });

    test("should return 400 for invalid endpoint data", async () => {
      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: "",
          url: "not-a-url",
          method: "INVALID",
        })
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toMatchObject({
        error: true,
        message: "Validation failed",
      });
      expect(response.body.details).toBeInstanceOf(Array);
      expect(response.body.details.length).toBeGreaterThan(0);

      // Verify no endpoint was created
      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(0);
    });

    test("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/endpoints")
        .send({})
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toMatchObject({
        error: true,
        message: "Validation failed",
      });

      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(0);
    });
  });

  describe("PUT /api/endpoints/:id", () => {
    test("should update endpoint and return 200", async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: "Old Name",
          url: "https://api.example.com",
          method: "GET",
        },
      });

      const response = await request(app)
        .put(`/api/endpoints/${endpoint.id}`)
        .send({
          name: "New Name",
          url: "https://api.updated.com",
          method: "POST",
        })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty(
        "message",
        "Endpoint updated successfully"
      );
      expect(response.body.data).toMatchObject({
        name: "New Name",
        url: "https://api.updated.com",
        method: "POST",
      });

      const updated = await prisma.endpoint.findUnique({
        where: { id: endpoint.id },
      });
      expect(updated.name).toBe("New Name");
    });

    test("should return 400 for invalid update data", async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
        },
      });

      const response = await request(app)
        .put(`/api/endpoints/${endpoint.id}`)
        .send({
          name: "",
          url: "not-a-url",
          method: "INVALID",
        })
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toMatchObject({
        error: true,
        message: "Validation failed",
      });

      // Verify endpoint was not updated
      const notUpdated = await prisma.endpoint.findUnique({
        where: { id: endpoint.id },
      });
      expect(notUpdated.name).toBe("Test API");
    });

    test("should return 404 for non-existent endpoint", async () => {
      const response = await request(app)
        .put("/api/endpoints/999")
        .send({
          name: "Test",
          url: "https://api.example.com",
          method: "GET",
        })
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        error: true,
        message: "Endpoint not found",
      });
    });
  });

  describe("DELETE /api/endpoints/:id", () => {
    test("should delete endpoint and return 200", async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
        },
      });

      const response = await request(app)
        .delete(`/api/endpoints/${endpoint.id}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        message: "Endpoint deleted successfully",
      });

      const deleted = await prisma.endpoint.findUnique({
        where: { id: endpoint.id },
      });
      expect(deleted).toBeNull();
    });

    test("should return 404 for non-existent endpoint", async () => {
      const response = await request(app)
        .delete("/api/endpoints/999")
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        error: true,
        message: "Endpoint not found",
      });
    });

    test("should cascade delete associated tests", async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
          tests: {
            create: {
              duration: 30,
              connections: 10,
              status: "completed",
            },
          },
        },
      });

      await request(app).delete(`/api/endpoints/${endpoint.id}`).expect(200);

      const tests = await prisma.test.findMany({
        where: { endpointId: endpoint.id },
      });
      expect(tests).toHaveLength(0);
    });
  });

  describe("GET /api/health", () => {
    test("should return health status", async () => {
      const response = await request(app)
        .get("/api/health")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        status: "ok",
        environment: "test",
      });
      expect(response.body).toHaveProperty("timestamp");
    });
  });
});
