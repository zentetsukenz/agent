/**
 * Endpoints Controller
 * HTTP request handlers for endpoint management - REST API
 */

const endpointsService = require("./endpoints.service");

/**
 * GET /api/endpoints - List all endpoints
 */
async function index(req, res, next) {
  try {
    const endpoints = await endpointsService.getAllEndpoints();
    res.json({ data: endpoints });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/endpoints/:id - Get single endpoint
 */
async function show(req, res, next) {
  try {
    const endpoint = await endpointsService.getEndpointById(req.params.id);
    if (!endpoint) {
      return res.status(404).json({
        error: true,
        message: "Endpoint not found",
      });
    }
    res.json({ data: endpoint });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/endpoints - Create new endpoint
 */
async function create(req, res, next) {
  try {
    const validation = endpointsService.validateEndpointData(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: true,
        message: "Validation failed",
        details: validation.errors,
      });
    }

    const endpoint = await endpointsService.createEndpoint(req.body);
    res.status(201).json({
      data: endpoint,
      message: "Endpoint created successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/endpoints/:id - Update endpoint
 */
async function update(req, res, next) {
  try {
    const validation = endpointsService.validateEndpointData(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: true,
        message: "Validation failed",
        details: validation.errors,
      });
    }

    const endpoint = await endpointsService.updateEndpoint(
      req.params.id,
      req.body
    );
    res.json({
      data: endpoint,
      message: "Endpoint updated successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: true,
        message: "Endpoint not found",
      });
    }
    next(error);
  }
}

/**
 * DELETE /api/endpoints/:id - Delete endpoint
 */
async function destroy(req, res, next) {
  try {
    await endpointsService.deleteEndpoint(req.params.id);
    res.json({ message: "Endpoint deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: true,
        message: "Endpoint not found",
      });
    }
    next(error);
  }
}

module.exports = {
  index,
  show,
  create,
  update,
  destroy,
};
