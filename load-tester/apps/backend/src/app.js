/**
 * Express Application Setup - REST API
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { apiLimiter, loadTestLimiter } = require("./middleware/rateLimiter");
const {
  validateEndpoint,
  validateTestConfig,
  validateId,
  validateScenario,
  validateScenarioUpdate,
} = require("./middleware/validation");
const {
  requestId,
  requestLogger,
  errorLogger,
} = require("./middleware/requestLogger");

const endpointsController = require("./features/endpoints/endpoints.controller");
const testsController = require("./features/tests/tests.controller");
const scenariosController = require("./features/scenarios/scenarios.controller");

const app = express();

// Security headers - Helmet.js
app.use(
  helmet({
    contentSecurityPolicy: config.isDevelopment ? false : undefined,
    crossOriginEmbedderPolicy: false, // Allow loading resources from different origins
  })
);

// Request ID and logging
app.use(requestId); // Add unique ID to each request
app.use(requestLogger); // Log all requests

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors(config.cors));

// Security middleware
app.use("/api", apiLimiter); // Rate limit all API routes first

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoints API routes
app.get("/api/endpoints", endpointsController.index);
app.get("/api/endpoints/:id", validateId, endpointsController.show);
app.post("/api/endpoints", validateEndpoint, endpointsController.create);
app.put(
  "/api/endpoints/:id",
  validateId,
  validateEndpoint,
  endpointsController.update
);
app.delete("/api/endpoints/:id", validateId, endpointsController.destroy);

// Tests API routes
app.get("/api/tests", testsController.index);
app.post(
  "/api/endpoints/:id/test",
  validateId,
  validateTestConfig,
  loadTestLimiter,
  testsController.execute
);
app.get("/api/tests/:id", validateId, testsController.show);
app.get("/api/tests/:id/status", validateId, testsController.status);
app.delete("/api/tests/:id/cancel", validateId, testsController.cancel);

// Scenarios API routes
app.get("/api/scenarios", scenariosController.index);
app.get("/api/scenarios/:id", validateId, scenariosController.show);
app.post("/api/scenarios", validateScenario, scenariosController.create);
app.put(
  "/api/scenarios/:id",
  validateId,
  validateScenarioUpdate,
  scenariosController.update
);
app.delete("/api/scenarios/:id", validateId, scenariosController.destroy);
app.post("/api/scenarios/:id/duplicate", validateId, scenariosController.duplicate);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Error logging (logs requests with errors)
app.use(errorLogger);

// Global error handling middleware
app.use(errorHandler);

module.exports = app;
