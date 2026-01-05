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
 * @openapi
 * /endpoints:
 *   get:
 *     summary: List all endpoints
 *     description: Retrieve a list of all registered HTTP endpoints for load testing
 *     tags:
 *       - Endpoints
 *     responses:
 *       200:
 *         description: List of endpoints retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Endpoint'
 */
const index = asyncHandler(async (req, res) => {
  const endpoints = await endpointsService.getAllEndpoints(prisma);
  res.json({ data: endpoints });
});

/**
 * @openapi
 * /endpoints/{id}:
 *   get:
 *     summary: Get single endpoint
 *     description: Retrieve a specific endpoint by ID
 *     tags:
 *       - Endpoints
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Endpoint ID
 *     responses:
 *       200:
 *         description: Endpoint retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Endpoint'
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const show = asyncHandler(async (req, res) => {
  const endpoint = await endpointsService.getEndpointById(
    prisma,
    req.params.id
  );
  res.json({ data: endpoint });
});

/**
 * @openapi
 * /endpoints:
 *   post:
 *     summary: Create new endpoint
 *     description: Register a new HTTP endpoint for load testing
 *     tags:
 *       - Endpoints
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EndpointInput'
 *     responses:
 *       201:
 *         description: Endpoint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Endpoint'
 *                 message:
 *                   type: string
 *                   example: Endpoint created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Endpoint with same URL and method already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const create = asyncHandler(async (req, res) => {
  const endpoint = await endpointsService.createEndpoint(prisma, req.body);
  res.status(201).json({
    data: endpoint,
    message: "Endpoint created successfully",
  });
});

/**
 * @openapi
 * /endpoints/{id}:
 *   put:
 *     summary: Update endpoint
 *     description: Update an existing endpoint's configuration
 *     tags:
 *       - Endpoints
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Endpoint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EndpointInput'
 *     responses:
 *       200:
 *         description: Endpoint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Endpoint'
 *                 message:
 *                   type: string
 *                   example: Endpoint updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Updated URL and method conflict with another endpoint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @openapi
 * /endpoints/{id}:
 *   delete:
 *     summary: Delete endpoint
 *     description: Delete an endpoint and cascade delete all associated tests
 *     tags:
 *       - Endpoints
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Endpoint ID
 *     responses:
 *       200:
 *         description: Endpoint deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Endpoint deleted successfully
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
