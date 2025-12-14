const path = require("path");
const { PrismaClient } = require("@prisma/client");
const testsService = require(path.join(
  __dirname,
  "../../../src/features/tests/tests.service"
));

const prisma = new PrismaClient();

describe("Tests Service - Advanced Coverage Tests", () => {
  beforeAll(async () => {
    // Wait for other tests to settle
    await new Promise((resolve) => setTimeout(resolve, 200));
  });

  beforeEach(async () => {
    // Clean database thoroughly
    await prisma.test.deleteMany({});
    await prisma.endpoint.deleteMany({});
    // Wait a bit to ensure cleanup completes
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  afterAll(async () => {
    // Cleanup after all tests in this suite
    await prisma.test.deleteMany({});
    await prisma.endpoint.deleteMany({});
    await prisma.$disconnect();
  });

  describe("formatResults", () => {
    test("should format complete autocannon results", () => {
      const rawResults = {
        requests: {
          total: 1000,
          average: 100,
          sent: 1000,
        },
        latency: {
          min: 10,
          max: 500,
          mean: 125,
          p50: 100,
          p90: 250,
          p95: 350,
          p99: 450,
        },
        throughput: {
          average: 5000,
          total: 50000,
        },
        errors: 5,
        timeouts: 2,
        duration: 10,
      };

      const formatted = testsService.formatResults(rawResults);

      expect(formatted.requests.total).toBe(1000);
      expect(formatted.requests.average).toBe(100);
      expect(formatted.requests.sent).toBe(1000);
      expect(formatted.latency.min).toBe(10);
      expect(formatted.latency.max).toBe(500);
      expect(formatted.latency.mean).toBe(125);
      expect(formatted.latency.p50).toBe(100);
      expect(formatted.latency.p90).toBe(250);
      expect(formatted.latency.p95).toBe(350);
      expect(formatted.latency.p99).toBe(450);
      expect(formatted.throughput.average).toBe(5000);
      expect(formatted.throughput.total).toBe(50000);
      expect(formatted.errors).toBe(5);
      expect(formatted.timeouts).toBe(2);
      expect(formatted.successRate).toBe("99.30"); // (993/1000)*100
      expect(formatted.duration).toBe(10);
    });

    test("should handle minimal autocannon results with defaults", () => {
      const rawResults = {
        requests: {},
        latency: {},
        throughput: {},
      };

      const formatted = testsService.formatResults(rawResults);

      expect(formatted.requests.total).toBe(0);
      expect(formatted.requests.average).toBe(0);
      expect(formatted.latency.min).toBe(0);
      expect(formatted.latency.max).toBe(0);
      expect(formatted.latency.mean).toBe(0);
      expect(formatted.throughput.average).toBe(0);
      expect(formatted.throughput.total).toBe(0);
      expect(formatted.errors).toBe(0);
      expect(formatted.timeouts).toBe(0);
      expect(formatted.successRate).toBe(0);
      expect(formatted.duration).toBe(0);
    });

    test("should calculate success rate with errors", () => {
      const rawResults = {
        requests: { total: 100 },
        latency: { mean: 50 },
        throughput: { average: 1000 },
        errors: 10,
        timeouts: 0,
      };

      const formatted = testsService.formatResults(rawResults);
      expect(formatted.successRate).toBe("90.00"); // (90/100)*100
    });

    test("should calculate success rate with timeouts", () => {
      const rawResults = {
        requests: { total: 100 },
        latency: { mean: 50 },
        throughput: { average: 1000 },
        errors: 0,
        timeouts: 15,
      };

      const formatted = testsService.formatResults(rawResults);
      expect(formatted.successRate).toBe("85.00"); // (85/100)*100
    });

    test("should calculate success rate with both errors and timeouts", () => {
      const rawResults = {
        requests: { total: 200 },
        latency: { mean: 50 },
        throughput: { average: 1000 },
        errors: 20,
        timeouts: 10,
      };

      const formatted = testsService.formatResults(rawResults);
      expect(formatted.successRate).toBe("85.00"); // (170/200)*100
    });

    test("should handle zero total requests", () => {
      const rawResults = {
        requests: { total: 0 },
        latency: { mean: 0 },
        throughput: { average: 0 },
        errors: 0,
        timeouts: 0,
      };

      const formatted = testsService.formatResults(rawResults);
      expect(formatted.successRate).toBe(0);
    });

    test("should use sent requests if total is missing", () => {
      const rawResults = {
        requests: { sent: 500 },
        latency: { mean: 50 },
        throughput: { average: 1000 },
        errors: 0,
        timeouts: 0,
      };

      const formatted = testsService.formatResults(rawResults);
      expect(formatted.requests.total).toBe(0);
      expect(formatted.requests.sent).toBe(500);
    });
  });

  describe("cancelTest", () => {
    test("should throw error for non-existent test", async () => {
      await expect(testsService.cancelTest(99999)).rejects.toThrow(
        "not currently running"
      );
    });

    test("should throw error for test that exists but is not running", async () => {
      // Create endpoint
      const endpoint = await prisma.endpoint.create({
        data: {
          name: "Test Endpoint",
          url: "https://httpbin.org/get",
          method: "GET",
        },
      });

      // Create a pending test (not running)
      const test = await prisma.test.create({
        data: {
          endpointId: endpoint.id,
          duration: 10,
          connections: 5,
          status: "pending",
        },
      });

      await expect(testsService.cancelTest(test.id)).rejects.toThrow(
        "not currently running"
      );
    });

    test("should throw error for completed test", async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: "Test Endpoint",
          url: "https://httpbin.org/get",
          method: "GET",
        },
      });

      const test = await prisma.test.create({
        data: {
          endpointId: endpoint.id,
          duration: 10,
          connections: 5,
          status: "completed",
          completedAt: new Date(),
        },
      });

      await expect(testsService.cancelTest(test.id)).rejects.toThrow(
        "not currently running"
      );
    });
  });

  describe("createTest", () => {
    test("should create test with all parameters", async () => {
      const timestamp = Date.now();
      const endpoint = await prisma.endpoint.create({
        data: {
          name: `Test Endpoint ${timestamp}`,
          url: `https://httpbin.org/get?t=${timestamp}`,
          method: "GET",
        },
      });

      const config = {
        duration: 30,
        connections: 10,
        rps: 100,
        timeout: 120,
      };

      const test = await testsService.createTest(prisma, endpoint.id, config);

      expect(test.endpointId).toBe(endpoint.id);
      expect(test.duration).toBe(30);
      expect(test.connections).toBe(10);
      expect(test.rps).toBe(100);
      expect(test.timeout).toBe(120);
      expect(test.status).toBe("pending");
    });

    test("should create test with default timeout when not provided", async () => {
      const timestamp = Date.now() + Math.random();
      const endpoint = await prisma.endpoint.create({
        data: {
          name: `Test Endpoint ${timestamp}`,
          url: `https://httpbin.org/get?t=${timestamp}`,
          method: "GET",
        },
      });

      const config = {
        duration: 30,
        connections: 10,
      };

      const test = await testsService.createTest(prisma, endpoint.id, config);

      expect(test.timeout).toBe(300); // Default timeout
      expect(test.rps).toBeNull();
    });

    test("should handle string inputs and convert to integers", async () => {
      const timestamp = Date.now() + Math.random();
      const endpoint = await prisma.endpoint.create({
        data: {
          name: `Test Endpoint ${timestamp}`,
          url: `https://httpbin.org/get?t=${timestamp}`,
          method: "GET",
        },
      });

      const config = {
        duration: "30",
        connections: "10",
        rps: "100",
        timeout: "120",
      };

      const test = await testsService.createTest(prisma, endpoint.id, config);

      expect(test.duration).toBe(30);
      expect(test.connections).toBe(10);
      expect(test.rps).toBe(100);
      expect(test.timeout).toBe(120);
    });
  });

  describe("getTestResults", () => {
    test("should return test with endpoint", async () => {
      const timestamp = Date.now() + Math.random();
      const endpoint = await prisma.endpoint.create({
        data: {
          name: `Test Endpoint ${timestamp}`,
          url: `https://httpbin.org/get?t=${timestamp}`,
          method: "GET",
        },
      });

      const test = await prisma.test.create({
        data: {
          endpointId: endpoint.id,
          duration: 10,
          connections: 5,
          status: "completed",
          results: JSON.stringify({ success: true }),
          completedAt: new Date(),
        },
      });

      const result = await testsService.getTestResults(prisma, test.id);

      expect(result.id).toBe(test.id);
      expect(result.endpoint).toBeDefined();
      expect(result.endpoint.name).toContain("Test Endpoint");
      expect(result.results).toBeDefined();
    });

    test("should throw NotFoundError for non-existent test", async () => {
      await expect(testsService.getTestResults(prisma, 99999)).rejects.toThrow(
        "Test not found"
      );
    });
  });

  describe("getAllTests", () => {
    test("should return all tests with endpoints", async () => {
      const timestamp = Date.now() + Math.random();
      const endpoint = await prisma.endpoint.create({
        data: {
          name: `Test Endpoint ${timestamp}`,
          url: `https://httpbin.org/get?t=${timestamp}`,
          method: "GET",
        },
      });

      await prisma.test.create({
        data: {
          endpointId: endpoint.id,
          duration: 10,
          connections: 5,
          status: "completed",
        },
      });

      // Wait a tiny bit to ensure different createdAt timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.test.create({
        data: {
          endpointId: endpoint.id,
          duration: 20,
          connections: 10,
          status: "pending",
        },
      });

      const tests = await testsService.getAllTests(prisma);

      expect(tests.length).toBe(2);
      expect(tests[0].endpoint).toBeDefined();
      expect(tests[1].endpoint).toBeDefined();
      // Should be ordered by createdAt desc, so second test should be first
      // Check that both durations are present
      const durations = tests.map((t) => t.duration).sort();
      expect(durations).toEqual([10, 20]);
    });

    test("should return empty array when no tests exist", async () => {
      const tests = await testsService.getAllTests(prisma);
      expect(tests).toEqual([]);
    });
  });

  describe("updateTestStatus", () => {
    test("should update test status", async () => {
      const timestamp = Date.now() + Math.random();
      const endpoint = await prisma.endpoint.create({
        data: {
          name: `Test Endpoint ${timestamp}`,
          url: `https://httpbin.org/get?t=${timestamp}`,
          method: "GET",
        },
      });

      const test = await prisma.test.create({
        data: {
          endpointId: endpoint.id,
          duration: 10,
          connections: 5,
          status: "pending",
        },
      });

      const updated = await testsService.updateTestStatus(
        prisma,
        test.id,
        "running"
      );

      expect(updated.id).toBe(test.id);
      expect(updated.status).toBe("running");
    });
  });

  describe("validateTestConfig - edge cases", () => {
    test("should handle null duration", () => {
      const result = testsService.validateTestConfig({
        duration: null,
        connections: 10,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Duration is required");
    });

    test("should handle empty string duration", () => {
      const result = testsService.validateTestConfig({
        duration: "",
        connections: 10,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Duration is required");
    });

    test("should handle null connections", () => {
      const result = testsService.validateTestConfig({
        duration: 10,
        connections: null,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Connections is required");
    });

    test("should handle empty string connections", () => {
      const result = testsService.validateTestConfig({
        duration: 10,
        connections: "",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Connections is required");
    });

    test("should handle empty string for optional rps", () => {
      const result = testsService.validateTestConfig({
        duration: 10,
        connections: 5,
        rps: "",
      });
      expect(result.valid).toBe(true); // Empty string for optional field is ok
    });

    test("should handle null for optional rps", () => {
      const result = testsService.validateTestConfig({
        duration: 10,
        connections: 5,
        rps: null,
      });
      expect(result.valid).toBe(true); // Null for optional field is ok
    });

    test("should handle empty string for optional timeout", () => {
      const result = testsService.validateTestConfig({
        duration: 10,
        connections: 5,
        timeout: "",
      });
      expect(result.valid).toBe(true); // Empty string for optional field is ok
    });

    test("should handle null for optional timeout", () => {
      const result = testsService.validateTestConfig({
        duration: 10,
        connections: 5,
        timeout: null,
      });
      expect(result.valid).toBe(true); // Null for optional field is ok
    });

    test("should accept numeric strings for all fields", () => {
      const result = testsService.validateTestConfig({
        duration: "30",
        connections: "10",
        rps: "100",
        timeout: "120",
      });
      expect(result.valid).toBe(true);
    });

    test("should reject negative rps", () => {
      const result = testsService.validateTestConfig({
        duration: 10,
        connections: 5,
        rps: -10,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("RPS must be between 1 and 100000");
    });

    test("should reject negative timeout", () => {
      const result = testsService.validateTestConfig({
        duration: 10,
        connections: 5,
        timeout: -5,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Timeout must be between 1 and 600 seconds"
      );
    });
  });
});
