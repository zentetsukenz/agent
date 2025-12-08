/**
 * Tests Controller (REST API)
 * HTTP request handlers for load test execution
 */

const testsService = require("./tests.service");
const endpointsService = require("../endpoints/endpoints.service");

/**
 * POST /api/endpoints/:id/test - Execute load test
 */
async function executeTest(req, res, next) {
  try {
    const endpoint = await endpointsService.getEndpointById(req.params.id);

    if (!endpoint) {
      return res.status(404).json({
        error: true,
        message: "Endpoint not found",
      });
    }

    const validation = testsService.validateTestConfig(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: true,
        message: "Validation failed",
        details: validation.errors,
      });
    }

    // Create test record
    const test = await testsService.createTest(req.params.id, req.body);

    // Execute test asynchronously
    testsService.executeTest(test.id).catch((error) => {
      console.error("Test execution error:", error);
    });

    res.status(201).json({
      data: test,
      message: "Load test started",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tests/:id - Get test results
 */
async function getTestResults(req, res, next) {
  try {
    const test = await testsService.getTestResults(req.params.id);

    if (!test) {
      return res.status(404).json({
        error: true,
        message: "Test not found",
      });
    }

    // Parse results if available
    let parsedResults = null;
    if (test.results) {
      try {
        parsedResults = JSON.parse(test.results);
      } catch (e) {
        console.error("Error parsing results:", e);
      }
    }

    res.json({
      data: {
        ...test,
        results: parsedResults,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tests/:id/status - Get test status (for polling)
 */
async function getTestStatus(req, res, next) {
  try {
    const test = await testsService.getTestResults(req.params.id);

    if (!test) {
      return res.status(404).json({
        error: true,
        message: "Test not found",
      });
    }

    res.json({
      data: {
        id: test.id,
        status: test.status,
        completedAt: test.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  executeTest,
  getTestResults,
  getTestStatus,
};
