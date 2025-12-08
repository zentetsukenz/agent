/**
 * Tests Controller
 * HTTP request handlers for load test execution - REST API
 */

const testsService = require("./tests.service");

/**
 * POST /api/endpoints/:id/test - Execute load test
 */
async function execute(req, res, next) {
  try {
    const validation = testsService.validateTestConfig(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: true,
        message: "Validation failed",
        details: validation.errors,
      });
    }

    const test = await testsService.createTest(req.params.id, req.body);

    // Execute test asynchronously
    testsService.executeTest(test.id).catch((err) => {
      console.error("Test execution error:", err);
    });

    res.status(201).json({
      data: test,
      message: "Test started successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tests/:id - Get test results
 */
async function show(req, res, next) {
  try {
    const test = await testsService.getTestResults(req.params.id);
    if (!test) {
      return res.status(404).json({
        error: true,
        message: "Test not found",
      });
    }

    // Parse results if they exist
    const data = {
      ...test,
      results: test.results ? JSON.parse(test.results) : null,
    };

    res.json({ data });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tests/:id/status - Get test status (for polling)
 */
async function status(req, res, next) {
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
  execute,
  show,
  status,
};
