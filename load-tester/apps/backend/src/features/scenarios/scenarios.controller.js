/**
 * Scenarios Controller
 * HTTP request handlers for scenario management - REST API
 * Validation is handled by middleware - controllers focus on business logic
 */

const scenariosService = require("./scenarios.service");
const asyncHandler = require("../../utils/asyncHandler");
const { getPrismaClient } = require("../../config/database");

const prisma = getPrismaClient();

/**
 * @openapi
 * /scenarios:
 *   get:
 *     summary: List all scenarios
 *     description: Retrieve a list of all load test scenarios
 *     tags:
 *       - Scenarios
 *     responses:
 *       200:
 *         description: List of scenarios retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Scenario'
 */
const index = asyncHandler(async (req, res) => {
  const scenarios = await scenariosService.getAllScenarios(prisma);
  res.json({ data: scenarios });
});

/**
 * @openapi
 * /scenarios/{id}:
 *   get:
 *     summary: Get single scenario
 *     description: Retrieve a specific scenario by ID
 *     tags:
 *       - Scenarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Scenario ID
 *     responses:
 *       200:
 *         description: Scenario retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Scenario'
 *       404:
 *         description: Scenario not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const show = asyncHandler(async (req, res) => {
  const scenario = await scenariosService.getScenarioById(
    prisma,
    req.params.id
  );
  res.json({ data: scenario });
});

/**
 * @openapi
 * /scenarios:
 *   post:
 *     summary: Create new scenario
 *     description: Create a new load test scenario with multi-phase configuration
 *     tags:
 *       - Scenarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScenarioInput'
 *     responses:
 *       201:
 *         description: Scenario created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Scenario'
 *                 message:
 *                   type: string
 *                   example: Scenario created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const create = asyncHandler(async (req, res) => {
  const scenario = await scenariosService.createScenario(prisma, req.body);
  res.status(201).json({
    data: scenario,
    message: "Scenario created successfully",
  });
});

/**
 * @openapi
 * /scenarios/{id}:
 *   put:
 *     summary: Update scenario
 *     description: Update an existing scenario's configuration
 *     tags:
 *       - Scenarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Scenario ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScenarioInput'
 *     responses:
 *       200:
 *         description: Scenario updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Scenario'
 *                 message:
 *                   type: string
 *                   example: Scenario updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Scenario not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const update = asyncHandler(async (req, res) => {
  const scenario = await scenariosService.updateScenario(
    prisma,
    req.params.id,
    req.body
  );
  res.json({
    data: scenario,
    message: "Scenario updated successfully",
  });
});

/**
 * @openapi
 * /scenarios/{id}:
 *   delete:
 *     summary: Delete scenario
 *     description: Delete a scenario (sets scenarioId to null in associated tests)
 *     tags:
 *       - Scenarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Scenario ID
 *     responses:
 *       200:
 *         description: Scenario deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Scenario deleted successfully
 *       404:
 *         description: Scenario not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const destroy = asyncHandler(async (req, res) => {
  await scenariosService.deleteScenario(prisma, req.params.id);
  res.json({ message: "Scenario deleted successfully" });
});

/**
 * @openapi
 * /scenarios/{id}/duplicate:
 *   post:
 *     summary: Duplicate scenario
 *     description: Create a copy of an existing scenario with a new name
 *     tags:
 *       - Scenarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Scenario ID to duplicate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the duplicated scenario
 *                 example: "Copy of Gradual Load Increase"
 *     responses:
 *       201:
 *         description: Scenario duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Scenario'
 *                 message:
 *                   type: string
 *                   example: Scenario duplicated successfully
 *       400:
 *         description: Validation error (missing or invalid name)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Scenario not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const duplicate = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      error: "Validation Error",
      message: "Name is required for duplicated scenario",
    });
  }

  const scenario = await scenariosService.duplicateScenario(
    prisma,
    req.params.id,
    name
  );
  res.status(201).json({
    data: scenario,
    message: "Scenario duplicated successfully",
  });
});

module.exports = {
  index,
  show,
  create,
  update,
  destroy,
  duplicate,
};
