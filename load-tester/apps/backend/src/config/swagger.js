/**
 * Swagger/OpenAPI Configuration
 * Generates OpenAPI 3.0 specification from JSDoc comments in controllers
 */

const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Load Tester API",
      version: "1.0.0",
      description:
        "REST API for managing HTTP endpoints, executing load tests, and creating test scenarios",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "API v1",
      },
    ],
    components: {
      schemas: {
        Endpoint: {
          type: "object",
          required: ["id", "name", "url", "method", "createdAt", "updatedAt"],
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier",
              example: 1,
            },
            name: {
              type: "string",
              description: "Human-readable name for the endpoint",
              example: "User API",
              minLength: 1,
              maxLength: 255,
            },
            url: {
              type: "string",
              format: "uri",
              description: "Full URL to test",
              example: "https://api.example.com/users",
            },
            method: {
              type: "string",
              enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
              description: "HTTP method",
              example: "GET",
            },
            headers: {
              type: "string",
              nullable: true,
              description: "Optional JSON string of request headers",
              example: '{"Authorization":"Bearer token"}',
            },
            body: {
              type: "string",
              nullable: true,
              description: "Optional JSON string for request body",
              example: '{"key":"value"}',
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp of creation",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp of last update",
            },
          },
        },
        EndpointInput: {
          type: "object",
          required: ["name", "url", "method"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              example: "User API",
            },
            url: {
              type: "string",
              format: "uri",
              example: "https://api.example.com/users",
            },
            method: {
              type: "string",
              enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
              example: "GET",
            },
            headers: {
              type: "string",
              nullable: true,
              example: '{"Authorization":"Bearer token"}',
            },
            body: {
              type: "string",
              nullable: true,
              example: '{"key":"value"}',
            },
          },
        },
        Test: {
          type: "object",
          required: [
            "id",
            "endpointId",
            "duration",
            "connections",
            "timeout",
            "status",
            "createdAt",
          ],
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier",
              example: 1,
            },
            endpointId: {
              type: "integer",
              description: "Foreign key to Endpoint",
              example: 1,
            },
            scenarioId: {
              type: "integer",
              nullable: true,
              description: "Optional foreign key to Scenario",
              example: null,
            },
            duration: {
              type: "integer",
              description: "Test duration in seconds",
              example: 60,
              minimum: 1,
              maximum: 3600,
            },
            connections: {
              type: "integer",
              description: "Number of concurrent connections",
              example: 100,
              minimum: 1,
              maximum: 10000,
            },
            rps: {
              type: "integer",
              nullable: true,
              description: "Optional requests per second limit",
              example: 1000,
              minimum: 1,
              maximum: 100000,
            },
            timeout: {
              type: "integer",
              description: "Request timeout in seconds",
              example: 300,
              default: 300,
              minimum: 1,
              maximum: 3600,
            },
            status: {
              type: "string",
              enum: ["pending", "running", "completed", "failed", "cancelled"],
              description: "Current test status",
              example: "completed",
            },
            results: {
              type: "string",
              nullable: true,
              description: "JSON string with autocannon results",
            },
            phaseResults: {
              type: "string",
              nullable: true,
              description:
                "JSON string with per-phase results (for scenario tests)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when test was created",
            },
            completedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Timestamp when test finished",
            },
          },
        },
        TestInput: {
          type: "object",
          required: ["duration", "connections"],
          properties: {
            duration: {
              type: "integer",
              minimum: 1,
              maximum: 3600,
              example: 60,
              description: "Test duration in seconds",
            },
            connections: {
              type: "integer",
              minimum: 1,
              maximum: 10000,
              example: 100,
              description: "Number of concurrent connections",
            },
            rps: {
              type: "integer",
              minimum: 1,
              maximum: 100000,
              example: 1000,
              description: "Optional requests per second limit",
            },
            timeout: {
              type: "integer",
              minimum: 1,
              maximum: 3600,
              example: 300,
              description: "Request timeout in seconds (default: 300)",
            },
            scenarioId: {
              type: "integer",
              description:
                "Optional scenario ID to execute test with scenario configuration",
              example: 1,
            },
          },
        },
        Scenario: {
          type: "object",
          required: ["id", "name", "mode", "phases"],
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier",
              example: 1,
            },
            name: {
              type: "string",
              description: "Unique scenario name",
              example: "Gradual Load Increase",
            },
            description: {
              type: "string",
              nullable: true,
              description: "Optional scenario description",
              example: "Ramp up to 500 connections over 2 minutes",
            },
            mode: {
              type: "string",
              enum: ["simple", "workflow"],
              description:
                "Scenario mode: simple (single endpoint) or workflow (multi-step)",
              example: "simple",
              default: "simple",
            },
            endpointId: {
              type: "integer",
              nullable: true,
              description: "Foreign key to Endpoint (for simple mode)",
              example: 1,
            },
            setup: {
              type: "string",
              nullable: true,
              description: "JSON array of setup steps (workflow mode)",
            },
            workflow: {
              type: "string",
              nullable: true,
              description: "JSON array of workflow steps (workflow mode)",
            },
            teardown: {
              type: "string",
              nullable: true,
              description: "JSON array of teardown steps (workflow mode)",
            },
            phases: {
              type: "string",
              description:
                "JSON array of Phase objects: [{type, duration, connections, rps?}]",
              example:
                '[{"type":"rampUp","duration":30,"startConnections":10,"connections":100}]',
            },
            setupErrorHandling: {
              type: "string",
              enum: ["abort", "ignore"],
              description: "How to handle setup step failures",
              example: "abort",
              default: "abort",
            },
            teardownErrorHandling: {
              type: "string",
              enum: ["abort", "ignore"],
              description: "How to handle teardown step failures",
              example: "ignore",
              default: "ignore",
            },
            isTemplate: {
              type: "boolean",
              description: "If true, scenario is read-only template",
              example: false,
              default: false,
            },
          },
        },
        ScenarioInput: {
          type: "object",
          required: ["name", "phases"],
          properties: {
            name: {
              type: "string",
              example: "Gradual Load Increase",
            },
            description: {
              type: "string",
              example: "Ramp up to 500 connections over 2 minutes",
            },
            mode: {
              type: "string",
              enum: ["simple", "workflow"],
              example: "simple",
            },
            endpointId: {
              type: "integer",
              example: 1,
            },
            setup: {
              type: "string",
              description: "JSON array of setup steps",
            },
            workflow: {
              type: "string",
              description: "JSON array of workflow steps",
            },
            teardown: {
              type: "string",
              description: "JSON array of teardown steps",
            },
            phases: {
              type: "string",
              example:
                '[{"type":"rampUp","duration":30,"startConnections":10,"connections":100}]',
            },
            setupErrorHandling: {
              type: "string",
              enum: ["abort", "ignore"],
              example: "abort",
            },
            teardownErrorHandling: {
              type: "string",
              enum: ["abort", "ignore"],
              example: "ignore",
            },
            isTemplate: {
              type: "boolean",
              example: false,
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Human-readable error message",
              example: "Validation failed",
            },
            code: {
              type: "string",
              description: "Machine-readable error code",
              example: "VALIDATION_ERROR",
            },
            details: {
              type: "object",
              description: "Additional error details",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              description: "Response data",
            },
            message: {
              type: "string",
              description: "Success message",
              example: "Operation completed successfully",
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../features/**/*.controller.js")],
};

module.exports = swaggerJsdoc(options);
