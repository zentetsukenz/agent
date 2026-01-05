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
 * @openapi
 * /tests:
 *   get:
 *     summary: List all tests
 *     description: Retrieve a list of all load test executions
 *     tags:
 *       - Tests
 *     responses:
 *       200:
 *         description: List of tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Test'
 */
const index = asyncHandler(async (req, res) => {
  const tests = await testsService.getAllTests(prisma);
  res.json({ data: tests });
});

/**
 * @openapi
 * /endpoints/{id}/test:
 *   post:
 *     summary: Execute load test
 *     description: Start a load test on a specific endpoint, optionally using a scenario configuration
 *     tags:
 *       - Tests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Endpoint ID to test
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestInput'
 *     responses:
 *       201:
 *         description: Test started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Test'
 *                 message:
 *                   type: string
 *                   example: Test started successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Endpoint or scenario not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @openapi
 * /tests/{id}:
 *   get:
 *     summary: Get test results
 *     description: Retrieve complete test results including autocannon output and phase results
 *     tags:
 *       - Tests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Test ID
 *     responses:
 *       200:
 *         description: Test results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Test'
 *                     - type: object
 *                       properties:
 *                         results:
 *                           type: object
 *                           nullable: true
 *                           description: Parsed autocannon results
 *                         phaseResults:
 *                           type: array
 *                           nullable: true
 *                           description: Parsed per-phase results for scenario tests
 *       404:
 *         description: Test not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @openapi
 * /tests/{id}/status:
 *   get:
 *     summary: Get test status
 *     description: Poll test execution status for real-time updates (lightweight response for polling)
 *     tags:
 *       - Tests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Test ID
 *     responses:
 *       200:
 *         description: Test status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [pending, running, completed, failed, cancelled]
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       404:
 *         description: Test not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @openapi
 * /tests/{id}/cancel:
 *   delete:
 *     summary: Cancel running test
 *     description: Cancel a test that is currently running or pending
 *     tags:
 *       - Tests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Test ID
 *     responses:
 *       200:
 *         description: Test cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Test'
 *                 message:
 *                   type: string
 *                   example: Test cancelled successfully
 *       400:
 *         description: Test cannot be cancelled (already completed/failed/cancelled)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Test not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
