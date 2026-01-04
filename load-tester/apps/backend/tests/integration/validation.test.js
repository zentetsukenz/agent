/**
 * Validation Middleware Tests
 * Test request validation and sanitization
 */

const request = require("supertest");
const path = require("path");
const app = require(path.join(__dirname, "../../src/app"));
const { createTestPrismaClient } = require("../helpers/prisma");

const prisma = createTestPrismaClient();

describe("Validation Middleware Tests", () => {
  beforeEach(async () => {
    await prisma.test.deleteMany({});
    await prisma.endpoint.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Endpoint Validation", () => {
    test("should reject endpoint without name", async () => {
      const response = await request(app)
        .post("/api/v1/endpoints")
        .send({
          url: "https://api.example.com",
          method: "GET",
        })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.details).toContain("Name is required");
    });

    test("should reject endpoint without URL", async () => {
      const response = await request(app)
        .post("/api/v1/endpoints")
        .send({
          name: "Test API",
          method: "GET",
        })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.details).toContain("URL is required");
    });

    test("should reject invalid URL", async () => {
      const response = await request(app)
        .post("/api/v1/endpoints")
        .send({
          name: "Test API",
          url: "not-a-url",
          method: "GET",
        })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.details).toContain(
        "URL must be valid (http:// or https://)"
      );
    });

    test("should reject invalid HTTP method", async () => {
      const response = await request(app)
        .post("/api/v1/endpoints")
        .send({
          name: "Test API",
          url: "https://api.example.com",
          method: "INVALID",
        })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.details).toContain(
        "Method must be one of: GET, POST, PUT, DELETE, PATCH"
      );
    });

    test("should reject headers that are JSON arrays", async () => {
      const response = await request(app)
        .post("/api/v1/endpoints")
        .send({
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
          headers: '["array", "not", "object"]',
        })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.details.some(d => d.includes("Headers must be a valid JSON object"))).toBe(true);
    });

    test("should accept valid endpoint data", async () => {
      const response = await request(app)
        .post("/api/v1/endpoints")
        .send({
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
        })
        .expect(201);

      expect(response.body.message).toBe("Endpoint created successfully");
      expect(response.body.data).toHaveProperty("id");
    });
  });

  describe("Test Configuration Validation", () => {
    let endpoint;

    beforeEach(async () => {
      endpoint = await prisma.endpoint.create({
        data: {
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
        },
      });
    });

    test("should reject test without duration", async () => {
      const response = await request(app)
        .post(`/api/v1/endpoints/${endpoint.id}/test`)
        .send({
          connections: 5,
        })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.details).toContain("Duration is required");
    });

    test("should reject test without connections", async () => {
      const response = await request(app)
        .post(`/api/v1/endpoints/${endpoint.id}/test`)
        .send({
          duration: 10,
        })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.details).toContain("Connections is required");
    });

    test("should reject duration exceeding limit", async () => {
      const response = await request(app)
        .post(`/api/v1/endpoints/${endpoint.id}/test`)
        .send({
          duration: 999,
          connections: 5,
        })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Duration must be between"),
        ])
      );
    });

    test("should reject connections exceeding limit", async () => {
      const response = await request(app)
        .post(`/api/v1/endpoints/${endpoint.id}/test`)
        .send({
          duration: 10,
          connections: 9999,
        })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Connections must be between"),
        ])
      );
    });

    test("should accept valid test configuration", async () => {
      const response = await request(app)
        .post(`/api/v1/endpoints/${endpoint.id}/test`)
        .send({
          duration: 10,
          connections: 5,
        })
        .expect(201);

      expect(response.body.message).toBe("Test started successfully");
      expect(response.body.data).toHaveProperty("id");
    });
  });

  describe("ID Parameter Validation", () => {
    test("should reject invalid ID parameter", async () => {
      const response = await request(app)
        .get("/api/v1/endpoints/invalid-id")
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.details).toContain("ID must be a positive integer");
    });

    test("should reject negative ID", async () => {
      const response = await request(app).get("/api/v1/endpoints/-1").expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.details).toContain("ID must be a positive integer");
    });

    test("should accept valid ID", async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: "Test API",
          url: "https://api.example.com",
          method: "GET",
        },
      });

      const response = await request(app)
        .get(`/api/v1/endpoints/${endpoint.id}`)
        .expect(200);

      expect(response.body.data).toHaveProperty("id", endpoint.id);
    });
  });

  describe("Input Sanitization", () => {
    test("should sanitize XSS attempt in name", async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post("/api/v1/endpoints")
        .send({
          name: "<script>alert('xss')</script>Test",
          url: `https://api.example.com/xss-test/${timestamp}`,
          method: "GET",
        })
        .expect(201);

      // Should be HTML-escaped - validator.escape() may double-escape & characters
      expect(response.body.data.name).not.toContain("<script>");
      expect(response.body.data.name).not.toContain("<");
      expect(response.body.data.name).not.toContain(">");
      // Check for escaped HTML entities (may be double-escaped)
      expect(response.body.data.name).toMatch(/&(amp;)?lt;script&(amp;)?gt;/);
    });
  });
});
