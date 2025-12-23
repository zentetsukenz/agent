/**
 * Tests Controller
 * HTTP request handlers for load test execution - REST API
 * Validation is handled by middleware - controllers focus on business logic
 */

const testsService = require("./tests.service");
const scenariosService = require("../scenarios/scenarios.service");
const asyncHandler = require("../../utils/asyncHandler");
const logger = require("../../utils/logger");
const { getPrismaClient } = require("../../config/database");
const { ValidationError } = require("../../utils/errors");

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
 * Supports both regular tests and scenario-based tests
 * Validation and rate limiting handled by middleware
 */
const execute = asyncHandler(async (req, res) => {
  const endpointId = req.params.id;
  const { scenarioId } = req.body;

  // If scenarioId is provided, execute with scenario
  if (scenarioId) {
    // Get the scenario
    const scenario = await scenariosService.getScenarioById(prisma, scenarioId);

    if (!scenario) {
      throw new ValidationError("Scenario not found");
    }

    // Create test with scenario reference
    const test = await testsService.createTestWithScenario(
      prisma,
      endpointId,
      scenarioId,
      scenario
    );

    // Execute test asynchronously with scenario
    testsService.executeTestWithScenario(prisma, test.id).catch((err) => {
      logger.error("Scenario test execution error", { error: err.message });
    });

    res.status(201).json({
      data: test,
      message: "Scenario test started successfully",
    });
    return;
  }

  // Regular test (no scenario)
  const test = await testsService.createTest(prisma, endpointId, req.body);

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
    phaseResults: test.phaseResults ? JSON.parse(test.phaseResults) : null,
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
