/**
 * Sanitization Integration Tests
 *
 * Critical regression tests for sanitization bug fix (Dec 13, 2025)
 * Verifies that URLs and JSON are stored correctly without HTML-escaping corruption
 *
 * Background: Initial implementation had sanitizeInput middleware that applied
 * HTML escaping AFTER validation, corrupting validated URLs and JSON in database.
 * Fix: Removed redundant middleware, added context-specific sanitization within
 * validation chains (.escape() for text only, not for URLs/JSON).
 */

const request = require("supertest");
const app = require("../../src/app");
const { createTestPrismaClient } = require("../helpers/prisma");

const prisma = createTestPrismaClient();

describe("Sanitization Integration Tests - Data Integrity", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("URL and JSON storage integrity", () => {
    let createdEndpointId;

    afterEach(async () => {
      // Clean up created endpoint
      if (createdEndpointId) {
        await prisma.endpoint
          .delete({ where: { id: createdEndpointId } })
          .catch(() => {});
        createdEndpointId = null;
      }
    });

    test("should store URLs without HTML-escaping (regression test)", async () => {
      const timestamp = Date.now();
      const testUrl = `https://api.example.com/v1/users/${timestamp}`;

      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: `URL Integrity Test ${timestamp}`,
          url: testUrl,
          method: "GET",
        })
        .expect(201);

      createdEndpointId = response.body.data.id;

      // Verify URL stored in database is NOT HTML-escaped
      const storedEndpoint = await prisma.endpoint.findUnique({
        where: { id: createdEndpointId },
      });

      expect(storedEndpoint.url).toBe(testUrl);
      expect(storedEndpoint.url).not.toContain("&#x2F;"); // Should NOT contain HTML entity for /
      expect(storedEndpoint.url).not.toContain("&#x3A;"); // Should NOT contain HTML entity for :
      expect(storedEndpoint.url).not.toContain("&"); // Should NOT contain any HTML entities
    });

    test("should store headers as valid JSON (regression test)", async () => {
      const timestamp = Date.now();
      const testHeaders = {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token-123",
        "X-Custom-Header": "value/with/slashes",
      };

      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: `Headers JSON Test ${timestamp}`,
          url: `https://api.test.com/endpoint/${timestamp}`,
          method: "POST",
          headers: JSON.stringify(testHeaders),
        })
        .expect(201);

      createdEndpointId = response.body.data.id;

      // Verify headers stored as valid JSON
      const storedEndpoint = await prisma.endpoint.findUnique({
        where: { id: createdEndpointId },
      });

      expect(storedEndpoint.headers).toBeTruthy();

      // Should parse without errors
      const parsedHeaders = JSON.parse(storedEndpoint.headers);
      expect(parsedHeaders).toEqual(testHeaders);

      // Should NOT contain HTML entities
      expect(storedEndpoint.headers).not.toContain("&#x");
    });

    test("should store body as valid JSON (regression test)", async () => {
      const timestamp = Date.now();
      const testBody = {
        user: "test@example.com",
        data: {
          nested: "value",
          url: "https://callback.com/webhook",
        },
        array: [1, 2, 3],
      };

      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: `Body JSON Test ${timestamp}`,
          url: `https://api.test.com/create/${timestamp}`,
          method: "POST",
          body: JSON.stringify(testBody),
        })
        .expect(201);

      createdEndpointId = response.body.data.id;

      // Verify body stored as valid JSON
      const storedEndpoint = await prisma.endpoint.findUnique({
        where: { id: createdEndpointId },
      });

      expect(storedEndpoint.body).toBeTruthy();

      // Should parse without errors
      const parsedBody = JSON.parse(storedEndpoint.body);
      expect(parsedBody).toEqual(testBody);

      // Should NOT contain HTML entities
      expect(storedEndpoint.body).not.toContain("&#x");
    });

    test("should sanitize name field for XSS protection", async () => {
      const timestamp = Date.now();
      const xssAttempt = '<script>alert("xss")</script>Endpoint Name';

      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: xssAttempt,
          url: `https://api.test.com/safe/${timestamp}`,
          method: "GET",
        })
        .expect(201);

      createdEndpointId = response.body.data.id;

      // Verify name is HTML-escaped (XSS protection)
      const storedEndpoint = await prisma.endpoint.findUnique({
        where: { id: createdEndpointId },
      });

      // Name should be escaped - validator.escape() converts < to &lt; then & to &amp;
      expect(storedEndpoint.name).not.toContain("<script>");
      expect(storedEndpoint.name).not.toContain("<");
      expect(storedEndpoint.name).not.toContain(">");
      // Verify HTML entities are present (may be double-escaped by validator.escape)
      expect(storedEndpoint.name).toMatch(/&(amp;)?lt;/); // < escaped as &lt; or &amp;lt;
      expect(storedEndpoint.name).toMatch(/&(amp;)?gt;/); // > escaped as &gt; or &amp;gt;
    });

    test("should handle complex URLs with query params and fragments", async () => {
      const timestamp = Date.now();
      const complexUrl = `https://api.example.com/v2/search?q=test&limit=10&offset=0&t=${timestamp}#results`;

      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: `Complex URL Test ${timestamp}`,
          url: complexUrl,
          method: "GET",
        })
        .expect(201);

      createdEndpointId = response.body.data.id;

      // Verify complex URL stored correctly
      const storedEndpoint = await prisma.endpoint.findUnique({
        where: { id: createdEndpointId },
      });

      expect(storedEndpoint.url).toBe(complexUrl);
      expect(storedEndpoint.url).toContain("?"); // Query params preserved
      expect(storedEndpoint.url).toContain("&"); // Multiple params preserved
      expect(storedEndpoint.url).toContain("#"); // Fragment preserved
    });

    test("should handle URLs with authentication in path", async () => {
      const timestamp = Date.now();
      const authUrl = `https://user:password@api.secure.com/endpoint/${timestamp}`;

      const response = await request(app)
        .post("/api/endpoints")
        .send({
          name: `Auth URL Test ${timestamp}`,
          url: authUrl,
          method: "GET",
        })
        .expect(201);

      createdEndpointId = response.body.data.id;

      // Verify auth URL stored correctly
      const storedEndpoint = await prisma.endpoint.findUnique({
        where: { id: createdEndpointId },
      });

      expect(storedEndpoint.url).toBe(authUrl);
      expect(storedEndpoint.url).toContain(":"); // Colon preserved
      expect(storedEndpoint.url).toContain("@"); // @ symbol preserved
    });
  });

  describe("Update operations maintain data integrity", () => {
    let testEndpoint;

    beforeEach(async () => {
      // Create test endpoint with unique URL
      const timestamp = Date.now() + Math.random(); // Ensure uniqueness even in fast tests
      testEndpoint = await prisma.endpoint.create({
        data: {
          name: `Update Test Endpoint ${timestamp}`,
          url: `https://original.com/api/${timestamp}`,
          method: "GET",
        },
      });
    });

    afterEach(async () => {
      // Clean up
      if (testEndpoint) {
        await prisma.endpoint
          .delete({ where: { id: testEndpoint.id } })
          .catch(() => {});
        testEndpoint = null;
      }
    });

    test("should update URL without HTML-escaping (regression test)", async () => {
      const newUrl = "https://updated.com/v2/endpoint?param=value";

      await request(app)
        .put(`/api/endpoints/${testEndpoint.id}`)
        .send({
          name: testEndpoint.name,
          url: newUrl,
          method: testEndpoint.method,
        })
        .expect(200);

      // Verify updated URL not HTML-escaped
      const updatedEndpoint = await prisma.endpoint.findUnique({
        where: { id: testEndpoint.id },
      });

      expect(updatedEndpoint.url).toBe(newUrl);
      expect(updatedEndpoint.url).not.toContain("&#x");
    });

    test("should update headers as valid JSON (regression test)", async () => {
      const newHeaders = {
        Authorization: "Bearer updated-token",
        "X-API-Version": "v2",
      };

      await request(app)
        .put(`/api/endpoints/${testEndpoint.id}`)
        .send({
          name: testEndpoint.name,
          url: testEndpoint.url,
          method: testEndpoint.method,
          headers: JSON.stringify(newHeaders),
        })
        .expect(200);

      // Verify updated headers are valid JSON
      const updatedEndpoint = await prisma.endpoint.findUnique({
        where: { id: testEndpoint.id },
      });

      const parsedHeaders = JSON.parse(updatedEndpoint.headers);
      expect(parsedHeaders).toEqual(newHeaders);
      expect(updatedEndpoint.headers).not.toContain("&#x");
    });
  });
});
