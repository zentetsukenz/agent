/**
 * Express Application Setup - REST API
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const endpointsController = require("./features/endpoints/endpoints.controller");
const testsController = require("./features/tests/tests.controller");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoints API routes
app.get("/api/endpoints", endpointsController.index);
app.get("/api/endpoints/:id", endpointsController.show);
app.post("/api/endpoints", endpointsController.create);
app.put("/api/endpoints/:id", endpointsController.update);
app.delete("/api/endpoints/:id", endpointsController.destroy);

// Tests API routes
app.post("/api/endpoints/:id/test", testsController.execute);
app.get("/api/tests/:id", testsController.show);
app.get("/api/tests/:id/status", testsController.status);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
