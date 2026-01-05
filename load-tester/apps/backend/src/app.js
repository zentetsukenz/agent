/**
 * Express Application Setup - REST API
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
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

// Response compression
app.use(compression({ threshold: 1024 }));

// Request ID and logging
app.use(requestId); // Add unique ID to each request
app.use(requestLogger); // Log all requests

// Middleware - Body parsers with size limits for DoS protection
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// CORS configuration
app.use(cors(config.cors));

// Security middleware
app.use("/api", apiLimiter); // Rate limit all API routes first

// Routes

// Create v1 router
const v1Router = express.Router();

// Endpoints API routes
v1Router.get("/endpoints", endpointsController.index);
v1Router.get("/endpoints/:id", validateId, endpointsController.show);
v1Router.post("/endpoints", validateEndpoint, endpointsController.create);
v1Router.put(
  "/endpoints/:id",
  validateId,
  validateEndpoint,
  endpointsController.update
);
v1Router.delete("/endpoints/:id", validateId, endpointsController.destroy);

// Tests API routes
v1Router.get("/tests", testsController.index);
v1Router.post(
  "/endpoints/:id/test",
  validateId,
  validateTestConfig,
  loadTestLimiter,
  testsController.execute
);
v1Router.get("/tests/:id", validateId, testsController.show);
v1Router.get("/tests/:id/status", validateId, testsController.status);
v1Router.delete("/tests/:id/cancel", validateId, testsController.cancel);

// Scenarios API routes
v1Router.get("/scenarios", scenariosController.index);
v1Router.get("/scenarios/:id", validateId, scenariosController.show);
v1Router.post("/scenarios", validateScenario, scenariosController.create);
v1Router.put(
  "/scenarios/:id",
  validateId,
  validateScenarioUpdate,
  scenariosController.update
);
v1Router.delete("/scenarios/:id", validateId, scenariosController.destroy);
v1Router.post(
  "/scenarios/:id/duplicate",
  validateId,
  scenariosController.duplicate
);

// Mount v1 router
app.use("/api/v1", v1Router);

// Swagger documentation (development only or with ENABLE_SWAGGER env var)
if (config.isDevelopment || process.env.ENABLE_SWAGGER === "true") {
  const swaggerUi = require("swagger-ui-express");
  const swaggerSpec = require("./config/swagger");

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Load Tester API Documentation",
    })
  );

  // Raw OpenAPI spec in JSON format
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(swaggerSpec);
  });
}

// Redirect /api/* to /api/v1/* (except health)
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  const queryString = req.url.includes("?")
    ? req.url.substring(req.url.indexOf("?"))
    : "";
  res.redirect(301, `/api/v1${req.path}${queryString}`);
});

// Health check (unversioned)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Error logging (logs requests with errors)
app.use(errorLogger);

// Global error handling middleware
app.use(errorHandler);

module.exports = app;
