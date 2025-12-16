/**
 * Tests Service
 * Business logic for load test execution
 */

const autocannon = require("autocannon");
const config = require("../../config");
const {
  ValidationError,
  NotFoundError,
  TimeoutError,
} = require("../../utils/errors");

// In-memory store for running test processes
// Map: testId -> { instance: autocannonInstance, startTime: Date }
const runningTests = new Map();

/**
 * Validate test configuration
 * @param {Object} config - Test configuration
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateTestConfig(testConfig) {
  const errors = [];

  // Validate duration
  if (
    testConfig.duration === undefined ||
    testConfig.duration === null ||
    testConfig.duration === ""
  ) {
    errors.push("Duration is required");
  } else if (
    typeof testConfig.duration !== "number" &&
    isNaN(Number(testConfig.duration))
  ) {
    errors.push("Duration must be a number");
  } else {
    const duration = Number(testConfig.duration);
    if (duration < 1 || duration > config.loadTest.maxDuration) {
      errors.push(
        `Duration must be between 1 and ${config.loadTest.maxDuration} seconds`
      );
    }
  }

  // Validate connections
  if (
    testConfig.connections === undefined ||
    testConfig.connections === null ||
    testConfig.connections === ""
  ) {
    errors.push("Connections is required");
  } else if (
    typeof testConfig.connections !== "number" &&
    isNaN(Number(testConfig.connections))
  ) {
    errors.push("Connections must be a number");
  } else {
    const connections = Number(testConfig.connections);
    if (connections < 1 || connections > config.loadTest.maxConnections) {
      errors.push(
        `Connections must be between 1 and ${config.loadTest.maxConnections}`
      );
    }
  }

  // Validate rps (optional)
  if (
    testConfig.rps !== undefined &&
    testConfig.rps !== null &&
    testConfig.rps !== ""
  ) {
    if (typeof testConfig.rps !== "number" && isNaN(Number(testConfig.rps))) {
      errors.push("RPS must be a number");
    } else {
      const rps = Number(testConfig.rps);
      if (rps < 1 || rps > config.loadTest.maxRPS) {
        errors.push(`RPS must be between 1 and ${config.loadTest.maxRPS}`);
      }
    }
  }

  // Validate timeout (optional)
  if (
    testConfig.timeout !== undefined &&
    testConfig.timeout !== null &&
    testConfig.timeout !== ""
  ) {
    if (
      typeof testConfig.timeout !== "number" &&
      isNaN(Number(testConfig.timeout))
    ) {
      errors.push("Timeout must be a number");
    } else {
      const timeout = Number(testConfig.timeout);
      if (timeout < 1 || timeout > config.loadTest.maxTimeout) {
        errors.push(
          `Timeout must be between 1 and ${config.loadTest.maxTimeout} seconds`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create test record
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} endpointId - Endpoint ID
 * @param {Object} config - Test configuration
 * @returns {Promise<Object>} - Created test
 */
async function createTest(prisma, endpointId, config) {
  return await prisma.test.create({
    data: {
      endpointId: parseInt(endpointId),
      duration: parseInt(config.duration),
      connections: parseInt(config.connections),
      rps: config.rps ? parseInt(config.rps) : null,
      timeout: config.timeout ? parseInt(config.timeout) : 300,
      status: "pending",
    },
  });
}

/**
 * Execute load test
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} testId - Test ID
 * @returns {Promise<void>}
 */
async function executeTest(prisma, testId) {
  let timeoutHandle = null;

  try {
    // Update status to running
    await updateTestStatus(prisma, testId, "running");

    // Get test and endpoint details
    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
      include: { endpoint: true },
    });

    if (!test) {
      throw new NotFoundError("Test");
    }

    // Prepare autocannon options
    const options = {
      url: test.endpoint.url,
      method: test.endpoint.method,
      duration: test.duration,
      connections: test.connections,
    };

    // Add optional parameters
    if (test.rps) {
      options.amount = test.rps * test.duration;
    }

    // Add headers if provided
    if (test.endpoint.headers) {
      try {
        options.headers = JSON.parse(test.endpoint.headers);
      } catch (e) {
        console.error("Error parsing headers:", e);
        throw new Error("Invalid headers format: " + e.message);
      }
    }

    // Add body if provided
    if (test.endpoint.body) {
      try {
        options.body = test.endpoint.body;
      } catch (e) {
        console.error("Error setting body:", e);
        throw new Error("Invalid body format: " + e.message);
      }
    }

    // Create timeout promise
    const timeoutSeconds = test.timeout || config.loadTest.maxTimeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(
          new TimeoutError(`Test exceeded timeout of ${timeoutSeconds} seconds`)
        );
      }, timeoutSeconds * 1000);
    });

    // Run the test with timeout
    const testPromise = new Promise((resolve, reject) => {
      const instance = autocannon(options, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });

      // Store the instance for potential cancellation
      runningTests.set(testId, { instance, startTime: new Date() });

      // Handle autocannon errors
      instance.on("error", (err) => {
        console.error("Autocannon error:", err);
        reject(err);
      });
    });

    // Race between test completion and timeout
    const result = await Promise.race([testPromise, timeoutPromise]);

    // Clear timeout if test completes successfully
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }

    // Remove from running tests
    runningTests.delete(testId);

    // Format and save results
    const formattedResults = formatResults(result);

    await prisma.test.update({
      where: { id: parseInt(testId) },
      data: {
        status: "completed",
        results: JSON.stringify(formattedResults),
        completedAt: new Date(),
      },
    });
  } catch (error) {
    // Don't log if it's a cleanup-related error (test record deleted or db moved during cleanup)
    const isCleanupError =
      error.code === "P2025" || error.code === "SQLITE_READONLY_DBMOVED";
    if (!isCleanupError) {
      console.error("Error executing test:", error);
    }

    // Clear timeout if it exists
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }

    // Remove from running tests
    runningTests.delete(testId);

    // Determine if it was a timeout
    const isTimeout = error.message && error.message.includes("timeout");

    // Update status to failed or timeout
    try {
      await prisma.test.update({
        where: { id: parseInt(testId) },
        data: {
          status: isTimeout ? "timeout" : "failed",
          results: JSON.stringify({
            error: error.message,
            type: isTimeout ? "timeout" : "error",
            timestamp: new Date().toISOString(),
          }),
          completedAt: new Date(),
        },
      });
    } catch (updateError) {
      // Silently fail if record doesn't exist or db was moved (test cleanup in progress)
      const isUpdateCleanupError =
        updateError.code === "P2025" ||
        updateError.code === "SQLITE_READONLY_DBMOVED";
      if (!isUpdateCleanupError) {
        console.error("Failed to update test status:", updateError);
      }
    }
  }
}

/**
 * Get test results
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} testId - Test ID
 * @returns {Promise<Object|null>} - Test with results
 */
async function getTestResults(prisma, testId) {
  const test = await prisma.test.findUnique({
    where: { id: parseInt(testId) },
    include: { endpoint: true },
  });

  if (!test) {
    throw new NotFoundError("Test");
  }

  return test;
}

/**
 * Get all tests
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Array>} - All tests with their endpoints
 */
async function getAllTests(prisma) {
  return await prisma.test.findMany({
    include: { endpoint: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Cancel running test
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} testId - Test ID
 * @returns {Promise<Object>} - Cancellation result
 */
async function cancelTest(prisma, testId) {
  const testIdInt = parseInt(testId);

  // Check if test is running
  const runningTest = runningTests.get(testIdInt);

  if (!runningTest) {
    throw new ValidationError(
      "Test is not currently running or does not exist"
    );
  }

  try {
    // Stop the autocannon instance
    if (
      runningTest.instance &&
      typeof runningTest.instance.stop === "function"
    ) {
      runningTest.instance.stop();
    }

    // Remove from running tests
    runningTests.delete(testIdInt);

    // Update test status to cancelled
    const updatedTest = await prisma.test.update({
      where: { id: testIdInt },
      data: {
        status: "cancelled",
        results: JSON.stringify({
          message: "Test was cancelled by user",
          cancelledAt: new Date().toISOString(),
          runDuration: Math.floor((new Date() - runningTest.startTime) / 1000),
        }),
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Test cancelled successfully",
      test: updatedTest,
    };
  } catch (error) {
    console.error("Error cancelling test:", error);
    throw new Error("Failed to cancel test: " + error.message);
  }
}

/**
 * Update test status
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} testId - Test ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated test
 */
async function updateTestStatus(prisma, testId, status) {
  return await prisma.test.update({
    where: { id: parseInt(testId) },
    data: { status },
  });
}

/**
 * Format autocannon results
 * @param {Object} rawResults - Raw autocannon results
 * @returns {Object} - Formatted results
 */
function formatResults(rawResults) {
  const totalRequests = rawResults.requests.total || 0;
  const errors = rawResults.errors || 0;
  const timeouts = rawResults.timeouts || 0;
  const successfulRequests = totalRequests - errors - timeouts;

  return {
    requests: {
      total: totalRequests,
      average: rawResults.requests.average || 0,
      sent: rawResults.requests.sent || totalRequests,
    },
    latency: {
      min: rawResults.latency.min || 0,
      max: rawResults.latency.max || 0,
      mean: rawResults.latency.mean || 0,
      p50: rawResults.latency.p50 || 0,
      p90: rawResults.latency.p90 || 0,
      p95: rawResults.latency.p95 || 0,
      p99: rawResults.latency.p99 || 0,
    },
    throughput: {
      average: rawResults.throughput.average || 0,
      total: rawResults.throughput.total || 0,
    },
    errors: errors,
    timeouts: timeouts,
    successRate:
      totalRequests > 0
        ? ((successfulRequests / totalRequests) * 100).toFixed(2)
        : 0,
    duration: rawResults.duration || 0,
  };
}

module.exports = {
  validateTestConfig,
  createTest,
  executeTest,
  getTestResults,
  getAllTests,
  cancelTest,
  updateTestStatus,
  formatResults,
};
