/**
 * Endpoints Controller (REST API)
 * HTTP request handlers for endpoint management
 */

const endpointsService = require("./endpoints.service");

/**
 * GET /api/endpoints - Get all endpoints
 */
async function getAllEndpoints(req, res, next) {
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
async function getEndpoint(req, res, next) {
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
async function createEndpoint(req, res, next) {
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
async function updateEndpoint(req, res, next) {
  try {
    const endpoint = await endpointsService.getEndpointById(req.params.id);

    if (!endpoint) {
      return res.status(404).json({
        error: true,
        message: "Endpoint not found",
      });
    }

    const validation = endpointsService.validateEndpointData(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: true,
        message: "Validation failed",
        details: validation.errors,
      });
    }

    const updated = await endpointsService.updateEndpoint(
      req.params.id,
      req.body
    );
    res.json({
      data: updated,
      message: "Endpoint updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/endpoints/:id - Delete endpoint
 */
async function deleteEndpoint(req, res, next) {
  try {
    const endpoint = await endpointsService.getEndpointById(req.params.id);

    if (!endpoint) {
      return res.status(404).json({
        error: true,
        message: "Endpoint not found",
      });
    }

    await endpointsService.deleteEndpoint(req.params.id);
    res.json({ message: "Endpoint deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllEndpoints,
  getEndpoint,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
};
