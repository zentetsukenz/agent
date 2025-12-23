/**
 * Validation Middleware
 * Request validation using express-validator
 */

const { body, param, validationResult } = require("express-validator");
const { ValidationError } = require("../utils/errors");
const config = require("../config");

/**
 * Middleware to handle validation results
 * Throws ValidationError if validation fails
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new ValidationError("Validation failed", errorMessages);
  }
  next();
};

/**
 * Validation rules for endpoint creation/update
 */
const validateEndpoint = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be between 1 and 255 characters")
    .escape(), // Sanitize HTML for XSS protection

  body("url")
    .trim()
    .notEmpty()
    .withMessage("URL is required")
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("URL must be valid (http:// or https://)")
    .customSanitizer((value) => value.trim()),

  body("method")
    .optional()
    .isIn(["GET", "POST", "PUT", "DELETE", "PATCH"])
    .withMessage("Method must be one of: GET, POST, PUT, DELETE, PATCH"),

  body("headers")
    .optional()
    .custom((value) => {
      if (!value || value.trim() === "") return true;
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Headers must be a valid JSON object");
        }
        return true;
      } catch (e) {
        throw new Error(`Headers must be valid JSON: ${e.message}`);
      }
    }),

  body("body")
    .optional()
    .custom((value) => {
      if (!value || value.trim() === "") return true;
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        throw new Error(`Body must be valid JSON: ${e.message}`);
      }
    }),

  handleValidationErrors,
];

/**
 * Validation rules for test execution configuration
 * When scenarioId is provided, duration and connections are optional (derived from scenario)
 * When no scenarioId, duration and connections are required
 */
const validateTestConfig = [
  // scenarioId is optional - if provided, we use scenario settings
  body("scenarioId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Scenario ID must be a positive integer")
    .toInt(),

  // Duration is required only if scenarioId is not provided
  body("duration")
    .if((value, { req }) => !req.body.scenarioId)
    .notEmpty()
    .withMessage("Duration is required")
    .isInt({ min: 1, max: config.loadTest.maxDuration })
    .withMessage(
      `Duration must be between 1 and ${config.loadTest.maxDuration} seconds`
    )
    .toInt(),

  // Connections is required only if scenarioId is not provided
  body("connections")
    .if((value, { req }) => !req.body.scenarioId)
    .notEmpty()
    .withMessage("Connections is required")
    .isInt({ min: 1, max: config.loadTest.maxConnections })
    .withMessage(
      `Connections must be between 1 and ${config.loadTest.maxConnections}`
    )
    .toInt(),

  body("rps")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: config.loadTest.maxRPS })
    .withMessage(`RPS must be between 1 and ${config.loadTest.maxRPS}`)
    .toInt(),

  body("timeout")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: config.loadTest.maxTimeout })
    .withMessage(
      `Timeout must be between 1 and ${config.loadTest.maxTimeout} seconds`
    )
    .toInt(),

  handleValidationErrors,
];

/**
 * Validation for ID parameters
 */
const validateId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer")
    .toInt(),

  handleValidationErrors,
];

/**
 * Validation rules for scenario creation/update
 */
const validateScenario = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be between 1 and 255 characters")
    .escape(),

  body("description")
    .optional({ nullable: true })
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),

  body("mode")
    .optional()
    .isIn(["simple", "workflow"])
    .withMessage("Mode must be 'simple' or 'workflow'"),

  body("endpointId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Endpoint ID must be a positive integer"),

  body("phases")
    .isArray({ min: 1 })
    .withMessage("At least one phase is required"),

  body("phases.*.name")
    .trim()
    .notEmpty()
    .withMessage("Phase name is required"),

  body("phases.*.duration")
    .isInt({ min: 1 })
    .withMessage("Phase duration must be a positive integer"),

  body("phases.*.connections")
    .isInt({ min: 0 })
    .withMessage("Phase connections must be a non-negative integer"),

  body("phases.*.type")
    .isIn(["ramp", "constant", "spike"])
    .withMessage("Phase type must be 'ramp', 'constant', or 'spike'"),

  body("phases.*.rps")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Phase RPS must be a non-negative integer"),

  body("setup")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Setup must be an array"),

  body("workflow")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Workflow must be an array"),

  body("teardown")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Teardown must be an array"),

  body("setupErrorHandling")
    .optional()
    .isIn(["abort", "retry", "ignore"])
    .withMessage("setupErrorHandling must be 'abort', 'retry', or 'ignore'"),

  body("setupRetryCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("setupRetryCount must be a non-negative integer"),

  body("teardownErrorHandling")
    .optional()
    .isIn(["abort", "retry", "ignore"])
    .withMessage("teardownErrorHandling must be 'abort', 'retry', or 'ignore'"),

  body("teardownRetryCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("teardownRetryCount must be a non-negative integer"),

  handleValidationErrors,
];

/**
 * Validation rules for scenario update (all fields optional)
 */
const validateScenarioUpdate = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be between 1 and 255 characters")
    .escape(),

  body("description")
    .optional({ nullable: true })
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),

  body("mode")
    .optional()
    .isIn(["simple", "workflow"])
    .withMessage("Mode must be 'simple' or 'workflow'"),

  body("endpointId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Endpoint ID must be a positive integer"),

  body("phases")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Phases must be an array with at least one phase"),

  body("phases.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Phase name is required"),

  body("phases.*.duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Phase duration must be a positive integer"),

  body("phases.*.connections")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Phase connections must be a non-negative integer"),

  body("phases.*.type")
    .optional()
    .isIn(["ramp", "constant", "spike"])
    .withMessage("Phase type must be 'ramp', 'constant', or 'spike'"),

  body("setup")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Setup must be an array"),

  body("workflow")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Workflow must be an array"),

  body("teardown")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Teardown must be an array"),

  body("setupErrorHandling")
    .optional()
    .isIn(["abort", "retry", "ignore"])
    .withMessage("setupErrorHandling must be 'abort', 'retry', or 'ignore'"),

  body("setupRetryCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("setupRetryCount must be a non-negative integer"),

  body("teardownErrorHandling")
    .optional()
    .isIn(["abort", "retry", "ignore"])
    .withMessage("teardownErrorHandling must be 'abort', 'retry', or 'ignore'"),

  body("teardownRetryCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("teardownRetryCount must be a non-negative integer"),

  handleValidationErrors,
];

module.exports = {
  validateEndpoint,
  validateTestConfig,
  validateId,
  validateScenario,
  validateScenarioUpdate,
  handleValidationErrors,
};
