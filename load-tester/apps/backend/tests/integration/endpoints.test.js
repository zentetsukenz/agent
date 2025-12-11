const request = require("supertest");
const path = require("path");
const app = require(path.join(__dirname, "../../src/app"));
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Endpoints Integration Tests - REST API", () => {
  beforeEach(async () => {
    // Clean database before each test to prevent pollution
    await prisma.test.deleteMany({});
    await prisma.endpoint.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/health", () => {
    test("should return health check status", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("GET /api/endpoints", () => {
    test("should return empty endpoints list", async () => {
      const response = await request(app).get("/api/endpoints").expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveLength(0);
    });

    test("should return endpoints list", async () => {
      // Create test endpoint
      await prisma.endpoint.create({
        data: {
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
        },
      });

      const response = await request(app).get("/api/endpoints").expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        name: "Test API",
        url: "https://api.example.com",
        method: "GET",
      });
    });
  });

  describe("GET /api/endpoints/:id", () => {
    test("should return single endpoint", async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
        },
      });

      const response = await request(app)
        .get(`/api/endpoints/${endpoint.id}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        name: "Test API",
        url: "https://api.example.com",
        method: "GET",
      });
    });

    test("should return 404 for non-existent endpoint", async () => {
      const response = await request(app).get("/api/endpoints/999").expect(404);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body).toHaveProperty("message", "Endpoint not found");
    });
  });

  describe("POST /api/endpoints", () => {
    test("should create new endpoint", async () => {
      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: "New API",
          url: "https://api.example.com",
          method: "GET",
        })
        .expect(201);

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
        .expect(201);

      const endpoint = await prisma.endpoint.findFirst();
      expect(endpoint.headers).toBe('{"Authorization": "Bearer token"}');
      expect(endpoint.body).toBe('{"key": "value"}');
    });

    test("should reject invalid endpoint data", async () => {
      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: "",
          url: "not-a-url",
          method: "INVALID",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body).toHaveProperty("details");

      // Verify no endpoint was created
      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(0);
    });

    test("should reject invalid URL formats", async () => {
      const invalidUrls = [
        "not-a-url",
        "ftp://example.com",
        "javascript:alert(1)",
        "file:///etc/passwd",
        "",
      ];

      for (const url of invalidUrls) {
        const response = await request(app)
          .post("/api/endpoints")
          .send({
            name: "Test",
            url,
            method: "GET",
          })
          .expect(400);

        expect(response.body).toHaveProperty("error", true);
      }

      // Verify no endpoints were created
      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(0);
    });

    test("should reject invalid JSON in headers", async () => {
      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
          headers: "{invalid json}",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Headers must be valid JSON"),
        ])
      );

      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(0);
    });

    test("should reject invalid JSON in body", async () => {
      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: "Test API",
          url: "https://api.example.com",
          method: "POST",
          body: "{invalid: json}",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Body must be valid JSON"),
        ])
      );

      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(0);
    });

    test("should sanitize HTML in endpoint name", async () => {
      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: "<script>alert('xss')</script>Test",
          url: "https://api.example.com",
          method: "GET",
        })
        .expect(201);

      const endpoint = await prisma.endpoint.findFirst();
      expect(endpoint.name).not.toContain("<script>");
      expect(endpoint.name).toContain("&lt;script&gt;");
    });

    test("should handle missing required fields", async () => {
      const response = await request(app)
        .post("/api/endpoints")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error", true);
      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(0);
    });
  });

  describe("PUT /api/endpoints/:id", () => {
    test("should update endpoint", async () => {
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
        .expect(200);

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
      expect(updated.url).toBe("https://api.updated.com");
      expect(updated.method).toBe("POST");
    });

    test("should reject invalid update data", async () => {
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
        .expect(400);

      expect(response.body).toHaveProperty("error", true);

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
        .expect(404);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body).toHaveProperty("message", "Endpoint not found");
    });
  });

  describe("DELETE /api/endpoints/:id", () => {
    test("should delete endpoint", async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
        },
      });

      const response = await request(app)
        .delete(`/api/endpoints/${endpoint.id}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Endpoint deleted successfully"
      );

      const deleted = await prisma.endpoint.findUnique({
        where: { id: endpoint.id },
      });
      expect(deleted).toBeNull();
    });

    test("should return 404 for non-existent endpoint", async () => {
      const response = await request(app)
        .delete("/api/endpoints/999")
        .expect(404);

      expect(response.body).toHaveProperty("error", true);
      expect(response.body).toHaveProperty("message", "Endpoint not found");
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
});
