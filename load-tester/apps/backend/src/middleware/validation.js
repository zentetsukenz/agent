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
    .withMessage("Name must be between 1 and 255 characters"),

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
 */
const validateTestConfig = [
  body("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isInt({ min: 1, max: config.loadTest.maxDuration })
    .withMessage(
      `Duration must be between 1 and ${config.loadTest.maxDuration} seconds`
    )
    .toInt(),

  body("connections")
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

module.exports = {
  validateEndpoint,
  validateTestConfig,
  validateId,
  handleValidationErrors,
};
