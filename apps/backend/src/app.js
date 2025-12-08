/**
 * Express Application Setup (REST API)
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const endpointsController = require("./features/endpoints/endpoints.controller");
const testsController = require("./features/tests/tests.controller");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes

// Endpoints routes
app.get("/api/endpoints", endpointsController.getAllEndpoints);
app.get("/api/endpoints/:id", endpointsController.getEndpoint);
app.post("/api/endpoints", endpointsController.createEndpoint);
app.put("/api/endpoints/:id", endpointsController.updateEndpoint);
app.delete("/api/endpoints/:id", endpointsController.deleteEndpoint);

// Tests routes
app.post("/api/endpoints/:id/test", testsController.executeTest);
app.get("/api/tests/:id", testsController.getTestResults);
app.get("/api/tests/:id/status", testsController.getTestStatus);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

module.exports = app;
