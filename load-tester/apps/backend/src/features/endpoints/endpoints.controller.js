/**
 * Endpoints Controller
 * HTTP request handlers for endpoint management - REST API
 * Validation is handled by middleware - controllers focus on business logic
 */

const endpointsService = require("./endpoints.service");
const asyncHandler = require("../../utils/asyncHandler");
const { getPrismaClient } = require("../../config/database");

const prisma = getPrismaClient();

/**
 * GET /api/endpoints - List all endpoints
 */
const index = asyncHandler(async (req, res) => {
  const endpoints = await endpointsService.getAllEndpoints(prisma);
  res.json({ data: endpoints });
});

/**
 * GET /api/endpoints/:id - Get single endpoint
 */
const show = asyncHandler(async (req, res) => {
  const endpoint = await endpointsService.getEndpointById(
    prisma,
    req.params.id
  );
  res.json({ data: endpoint });
});

/**
 * POST /api/endpoints - Create new endpoint
 * Validation handled by middleware
 */
const create = asyncHandler(async (req, res) => {
  const endpoint = await endpointsService.createEndpoint(prisma, req.body);
  res.status(201).json({
    data: endpoint,
    message: "Endpoint created successfully",
  });
});

/**
 * PUT /api/endpoints/:id - Update endpoint
 * Validation handled by middleware
 */
const update = asyncHandler(async (req, res) => {
  const endpoint = await endpointsService.updateEndpoint(
    prisma,
    req.params.id,
    req.body
  );
  res.json({
    data: endpoint,
    message: "Endpoint updated successfully",
  });
});

/**
 * DELETE /api/endpoints/:id - Delete endpoint
 */
const destroy = asyncHandler(async (req, res) => {
  await endpointsService.deleteEndpoint(prisma, req.params.id);
  res.json({ message: "Endpoint deleted successfully" });
});

module.exports = {
  index,
  show,
  create,
  update,
  destroy,
};
