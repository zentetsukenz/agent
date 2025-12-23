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
 * GET /api/scenarios - List all scenarios
 */
const index = asyncHandler(async (req, res) => {
  const scenarios = await scenariosService.getAllScenarios(prisma);
  res.json({ data: scenarios });
});

/**
 * GET /api/scenarios/:id - Get single scenario
 */
const show = asyncHandler(async (req, res) => {
  const scenario = await scenariosService.getScenarioById(prisma, req.params.id);
  res.json({ data: scenario });
});

/**
 * POST /api/scenarios - Create new scenario
 * Validation handled by middleware
 */
const create = asyncHandler(async (req, res) => {
  const scenario = await scenariosService.createScenario(prisma, req.body);
  res.status(201).json({
    data: scenario,
    message: "Scenario created successfully",
  });
});

/**
 * PUT /api/scenarios/:id - Update scenario
 * Validation handled by middleware
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
 * DELETE /api/scenarios/:id - Delete scenario
 */
const destroy = asyncHandler(async (req, res) => {
  await scenariosService.deleteScenario(prisma, req.params.id);
  res.json({ message: "Scenario deleted successfully" });
});

/**
 * POST /api/scenarios/:id/duplicate - Duplicate scenario
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
