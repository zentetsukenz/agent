/**
 * Tests Service
 * Business logic for load test execution
 */

const { PrismaClient } = require('@prisma/client');
const autocannon = require('autocannon');

const prisma = new PrismaClient();

/**
 * Validate test configuration
 * @param {Object} config - Test configuration
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateTestConfig(config) {
  const errors = [];

  // Validate duration
  if (config.duration === undefined || config.duration === null || config.duration === '') {
    errors.push('Duration is required');
  } else if (typeof config.duration !== 'number' && isNaN(Number(config.duration))) {
    errors.push('Duration must be a number');
  } else {
    const duration = Number(config.duration);
    if (duration < 1 || duration > 300) {
      errors.push('Duration must be between 1 and 300 seconds');
    }
  }

  // Validate connections
  if (config.connections === undefined || config.connections === null || config.connections === '') {
    errors.push('Connections is required');
  } else if (typeof config.connections !== 'number' && isNaN(Number(config.connections))) {
    errors.push('Connections must be a number');
  } else {
    const connections = Number(config.connections);
    if (connections < 1 || connections > 1000) {
      errors.push('Connections must be between 1 and 1000');
    }
  }

  // Validate rps (optional)
  if (config.rps !== undefined && config.rps !== null && config.rps !== '') {
    if (typeof config.rps !== 'number' && isNaN(Number(config.rps))) {
      errors.push('RPS must be a number');
    } else {
      const rps = Number(config.rps);
      if (rps < 1 || rps > 100000) {
        errors.push('RPS must be between 1 and 100000');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create test record
 * @param {number} endpointId - Endpoint ID
 * @param {Object} config - Test configuration
 * @returns {Promise<Object>} - Created test
 */
async function createTest(endpointId, config) {
  return await prisma.test.create({
    data: {
      endpointId: parseInt(endpointId),
      duration: parseInt(config.duration),
      connections: parseInt(config.connections),
      rps: config.rps ? parseInt(config.rps) : null,
      status: 'pending'
    }
  });
}

/**
 * Execute load test
 * @param {number} testId - Test ID
 * @returns {Promise<void>}
 */
async function executeTest(testId) {
  try {
    // Update status to running
    await updateTestStatus(testId, 'running');

    // Get test and endpoint details
    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
      include: { endpoint: true }
    });

    if (!test) {
      throw new Error('Test not found');
    }

    // Prepare autocannon options
    const options = {
      url: test.endpoint.url,
      method: test.endpoint.method,
      duration: test.duration,
      connections: test.connections
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
        console.error('Error parsing headers:', e);
      }
    }

    // Add body if provided
    if (test.endpoint.body) {
      try {
        options.body = test.endpoint.body;
      } catch (e) {
        console.error('Error setting body:', e);
      }
    }

    // Run the test
    const result = await new Promise((resolve, reject) => {
      autocannon(options, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Format and save results
    const formattedResults = formatResults(result);

    await prisma.test.update({
      where: { id: parseInt(testId) },
      data: {
        status: 'completed',
        results: JSON.stringify(formattedResults),
        completedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error executing test:', error);

    // Update status to failed
    await prisma.test.update({
      where: { id: parseInt(testId) },
      data: {
        status: 'failed',
        results: JSON.stringify({ error: error.message }),
        completedAt: new Date()
      }
    });
  }
}

/**
 * Get test results
 * @param {number} testId - Test ID
 * @returns {Promise<Object|null>} - Test with results
 */
async function getTestResults(testId) {
  return await prisma.test.findUnique({
    where: { id: parseInt(testId) },
    include: { endpoint: true }
  });
}

/**
 * Update test status
 * @param {number} testId - Test ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated test
 */
async function updateTestStatus(testId, status) {
  return await prisma.test.update({
    where: { id: parseInt(testId) },
    data: { status }
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
      sent: rawResults.requests.sent || totalRequests
    },
    latency: {
      min: rawResults.latency.min || 0,
      max: rawResults.latency.max || 0,
      mean: rawResults.latency.mean || 0,
      p50: rawResults.latency.p50 || 0,
      p90: rawResults.latency.p90 || 0,
      p95: rawResults.latency.p95 || 0,
      p99: rawResults.latency.p99 || 0
    },
    throughput: {
      average: rawResults.throughput.average || 0,
      total: rawResults.throughput.total || 0
    },
    errors: errors,
    timeouts: timeouts,
    successRate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : 0,
    duration: rawResults.duration || 0
  };
}

module.exports = {
  validateTestConfig,
  createTest,
  executeTest,
  getTestResults,
  updateTestStatus,
  formatResults
};
