/**
 * Tests Controller
 * HTTP request handlers for load test execution - REST API
 * Validation is handled by middleware - controllers focus on business logic
 */

const testsService = require("./tests.service");
const asyncHandler = require("../../utils/asyncHandler");
const logger = require("../../utils/logger");
const { getPrismaClient } = require("../../config/database");

const prisma = getPrismaClient();

/**
 * GET /api/tests - Get all tests
 */
const index = asyncHandler(async (req, res) => {
  const tests = await testsService.getAllTests(prisma);
  res.json({ data: tests });
});

/**
 * POST /api/endpoints/:id/test - Execute load test
 * Validation and rate limiting handled by middleware
 */
const execute = asyncHandler(async (req, res) => {
  const test = await testsService.createTest(prisma, req.params.id, req.body);

  // Execute test asynchronously
  testsService.executeTest(prisma, test.id).catch((err) => {
    logger.error("Test execution error", { error: err.message });
  });

  res.status(201).json({
    data: test,
    message: "Test started successfully",
  });
});

/**
 * GET /api/tests/:id - Get test results
 */
const show = asyncHandler(async (req, res) => {
  const test = await testsService.getTestResults(prisma, req.params.id);

  // Parse results if they exist
  const data = {
    ...test,
    results: test.results ? JSON.parse(test.results) : null,
  };

  res.json({ data });
});

/**
 * GET /api/tests/:id/status - Get test status (for polling)
 */
const status = asyncHandler(async (req, res) => {
  const test = await testsService.getTestResults(prisma, req.params.id);

  res.json({
    data: {
      id: test.id,
      status: test.status,
      completedAt: test.completedAt,
    },
  });
});

/**
 * DELETE /api/tests/:id/cancel - Cancel running test
 */
const cancel = asyncHandler(async (req, res) => {
  const result = await testsService.cancelTest(prisma, req.params.id);
  res.json({
    data: result.test,
    message: result.message,
  });
});

module.exports = {
  index,
  execute,
  show,
  status,
  cancel,
};
