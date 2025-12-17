/**
 * Tests Service - Execute Test Tests with Mocked Autocannon
 *
 * This file tests the executeTest function with autocannon mocked
 * to provide fast, deterministic tests without network calls.
 */
const path = require("path");
const { createTestPrismaClient } = require("../../helpers/prisma");

// Mock autocannon BEFORE requiring the service
jest.mock("autocannon", () => {
  const mockInstance = {
    on: jest.fn(),
    stop: jest.fn(),
  };

  return jest.fn((options, callback) => {
    // Default: simulate successful test completion
    const mockResult = {
      requests: {
        total: 1000,
        average: 100,
        sent: 1000,
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
        average: 5000,
        total: 50000,
      },
      errors: 5,
      timeouts: 2,
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

const testsService = require(path.join(
  __dirname,
  "../../../src/features/tests/tests.service"
));

const prisma = createTestPrismaClient();

describe("Tests Service - Execute Test (Mocked Autocannon)", () => {
  let testEndpoint;

  beforeEach(async () => {
    // Clean database
    await prisma.test.deleteMany({});
    await prisma.endpoint.deleteMany({});

    // Reset the autocannon mock
    const autocannon = require("autocannon");
    autocannon.mockClear();

    // Create a test endpoint
    const timestamp = Date.now() + Math.random();
    testEndpoint = await prisma.endpoint.create({
      data: {
        name: `Test API ${timestamp}`,
        url: `https://api.example.com/test?t=${timestamp}`,
        method: "GET",
      },
    });
  });

  afterAll(async () => {
    await prisma.test.deleteMany({});
    await prisma.endpoint.deleteMany({});
    await prisma.$disconnect();
  });

  describe("executeTest", () => {
    test("should execute test and update status to completed", async () => {
      // Create a test
      const test = await testsService.createTest(prisma, testEndpoint.id, {
        duration: 10,
        connections: 5,
      });

      // Execute the test
      await testsService.executeTest(prisma, test.id);

      // Verify test status was updated
      const updatedTest = await prisma.test.findUnique({
        where: { id: test.id },
      });

      expect(updatedTest.status).toBe("completed");
      expect(updatedTest.results).not.toBeNull();
      expect(updatedTest.completedAt).not.toBeNull();

      // Verify results were formatted correctly
      const results = JSON.parse(updatedTest.results);
      expect(results.requests.total).toBe(1000);
      expect(results.successRate).toBe("99.30"); // (993/1000)*100
    });

    test("should pass correct options to autocannon", async () => {
      const autocannon = require("autocannon");

      const test = await testsService.createTest(prisma, testEndpoint.id, {
        duration: 30,
        connections: 10,
      });

      await testsService.executeTest(prisma, test.id);

      expect(autocannon).toHaveBeenCalledWith(
        expect.objectContaining({
          url: testEndpoint.url,
          method: testEndpoint.method,
          duration: 30,
          connections: 10,
        }),
        expect.any(Function)
      );
    });

    test("should handle endpoint with headers", async () => {
      const autocannon = require("autocannon");

      // Create endpoint with headers
      const endpointWithHeaders = await prisma.endpoint.create({
        data: {
          name: "API with Headers",
          url: "https://api.example.com/auth",
          method: "GET",
          headers: JSON.stringify({ Authorization: "Bearer token123" }),
        },
      });

      const test = await testsService.createTest(
        prisma,
        endpointWithHeaders.id,
        {
          duration: 10,
          connections: 5,
        }
      );

      await testsService.executeTest(prisma, test.id);

      expect(autocannon).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { Authorization: "Bearer token123" },
        }),
        expect.any(Function)
      );
    });

    test("should handle endpoint with body", async () => {
      const autocannon = require("autocannon");

      // Create endpoint with body
      const endpointWithBody = await prisma.endpoint.create({
        data: {
          name: "API with Body",
          url: "https://api.example.com/data",
          method: "POST",
          body: JSON.stringify({ key: "value" }),
        },
      });

      const test = await testsService.createTest(prisma, endpointWithBody.id, {
        duration: 10,
        connections: 5,
      });

      await testsService.executeTest(prisma, test.id);

      expect(autocannon).toHaveBeenCalledWith(
        expect.objectContaining({
          body: JSON.stringify({ key: "value" }),
        }),
        expect.any(Function)
      );
    });

    test("should handle RPS parameter", async () => {
      const autocannon = require("autocannon");

      const test = await testsService.createTest(prisma, testEndpoint.id, {
        duration: 10,
        connections: 5,
        rps: 100,
      });

      await testsService.executeTest(prisma, test.id);

      // RPS is converted to amount (rps * duration)
      expect(autocannon).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1000, // 100 rps * 10 seconds
        }),
        expect.any(Function)
      );
    });

    test("should handle non-existent test gracefully", async () => {
      // executeTest handles errors internally, doesn't throw
      // For non-existent tests, it will silently fail during status update
      const result = await testsService.executeTest(prisma, 99999);

      // Function returns undefined since test doesn't exist
      expect(result).toBeUndefined();
    });
  });

  describe("executeTest - Error Handling", () => {
    test("should handle autocannon errors", async () => {
      const autocannon = require("autocannon");

      // Mock autocannon to simulate an error
      autocannon.mockImplementationOnce((options, callback) => {
        setImmediate(() => {
          callback(new Error("Network error"), null);
        });
        return { on: jest.fn(), stop: jest.fn() };
      });

      const test = await testsService.createTest(prisma, testEndpoint.id, {
        duration: 10,
        connections: 5,
      });

      await testsService.executeTest(prisma, test.id);

      // Test should be marked as failed
      const updatedTest = await prisma.test.findUnique({
        where: { id: test.id },
      });

      expect(updatedTest.status).toBe("failed");
      expect(updatedTest.completedAt).not.toBeNull();

      const results = JSON.parse(updatedTest.results);
      expect(results.type).toBe("error");
    });

    test("should handle invalid headers JSON", async () => {
      const autocannon = require("autocannon");

      // Create endpoint with invalid headers JSON
      const endpointWithBadHeaders = await prisma.endpoint.create({
        data: {
          name: "Bad Headers Endpoint",
          url: "https://api.example.com/test",
          method: "GET",
          headers: "invalid-json{",
        },
      });

      const test = await testsService.createTest(
        prisma,
        endpointWithBadHeaders.id,
        {
          duration: 10,
          connections: 5,
        }
      );

      await testsService.executeTest(prisma, test.id);

      // Test should be marked as failed
      const updatedTest = await prisma.test.findUnique({
        where: { id: test.id },
      });

      expect(updatedTest.status).toBe("failed");
    });
  });

  describe("getTestResults", () => {
    test("should return test with endpoint", async () => {
      const test = await testsService.createTest(prisma, testEndpoint.id, {
        duration: 10,
        connections: 5,
      });

      const result = await testsService.getTestResults(prisma, test.id);

      expect(result.id).toBe(test.id);
      expect(result.endpoint).toBeDefined();
      expect(result.endpoint.name).toContain("Test API");
    });

    test("should throw NotFoundError for non-existent test", async () => {
      await expect(testsService.getTestResults(prisma, 99999)).rejects.toThrow(
        "Test not found"
      );
    });
  });

  describe("getAllTests", () => {
    test("should return all tests with endpoints", async () => {
      // Create multiple tests
      await testsService.createTest(prisma, testEndpoint.id, {
        duration: 10,
        connections: 5,
      });

      await testsService.createTest(prisma, testEndpoint.id, {
        duration: 20,
        connections: 10,
      });

      const tests = await testsService.getAllTests(prisma);

      expect(tests.length).toBe(2);
      expect(tests[0].endpoint).toBeDefined();
    });

    test("should return empty array when no tests exist", async () => {
      const tests = await testsService.getAllTests(prisma);

      expect(tests).toEqual([]);
    });

    test("should order tests by createdAt descending", async () => {
      await testsService.createTest(prisma, testEndpoint.id, {
        duration: 10,
        connections: 5,
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 50));

      await testsService.createTest(prisma, testEndpoint.id, {
        duration: 20,
        connections: 10,
      });

      const tests = await testsService.getAllTests(prisma);

      // Most recent should be first
      expect(tests[0].duration).toBe(20);
      expect(tests[1].duration).toBe(10);
    });
  });

  describe("updateTestStatus", () => {
    test("should update test status", async () => {
      const test = await testsService.createTest(prisma, testEndpoint.id, {
        duration: 10,
        connections: 5,
      });

      expect(test.status).toBe("pending");

      const updated = await testsService.updateTestStatus(
        prisma,
        test.id,
        "running"
      );

      expect(updated.status).toBe("running");
    });
  });
});
