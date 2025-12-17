/**
 * Centralized Logger Utility
 *
 * Environment-aware logging with level support.
 * Automatically suppresses logs in test environment for clean test output.
 *
 * Log Levels (in order of severity):
 * - debug: Detailed debugging information (development only)
 * - http:  HTTP request logs (skip in test)
 * - info:  General information about application state
 * - warn:  Warning conditions that should be reviewed
 * - error: Error conditions that need attention
 *
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Server started', { port: 3000 });
 *   logger.error('Database failed', { error: err.message });
 *   logger.http({ method: 'GET', url: '/api/test', status: 200 });
 */

const config = require("../config");

/**
 * Log level hierarchy (lower number = more verbose)
 */
const LOG_LEVELS = {
  debug: 0,
  http: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5,
};

/**
 * Get the current log level from environment
 * In test environment, default to 'silent' unless explicitly set
 */
function getLogLevel() {
  // Allow override via LOG_LEVEL environment variable
  if (process.env.LOG_LEVEL) {
    const level = process.env.LOG_LEVEL.toLowerCase();
    if (LOG_LEVELS[level] !== undefined) {
      return level;
    }
  }

  // Default levels by environment
  if (config.isTest) {
    return "silent"; // Suppress all logs in tests by default
  }

  if (config.isDevelopment) {
    return "debug"; // Show all logs in development
  }

  return "info"; // Production: info and above
}

/**
 * Check if a log level should be output
 * @param {string} level - The level to check
 * @returns {boolean} - Whether to output this level
 */
function shouldLog(level) {
  const currentLevel = getLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * Format log output based on environment
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} data - Additional data
 * @returns {string|object} - Formatted output
 */
function formatLog(level, message, data) {
  const timestamp = new Date().toISOString();

  if (config.isProduction) {
    // JSON format for production (easier to parse)
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...data,
    });
  }

  // Development format with colors and emoji
  const colors = {
    debug: "\x1b[36m", // Cyan
    http: "\x1b[35m", // Magenta
    info: "\x1b[32m", // Green
    warn: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
  };
  const reset = "\x1b[0m";
  const emoji = {
    debug: "🔍",
    http: "🌐",
    info: "ℹ️ ",
    warn: "⚠️ ",
    error: "❌",
  };

  const color = colors[level] || reset;
  const icon = emoji[level] || "";

  let output = `${icon} ${color}[${level.toUpperCase()}]${reset} ${message}`;
  if (data && Object.keys(data).length > 0) {
    output += ` ${JSON.stringify(data)}`;
  }
  return output;
}

/**
 * Core logging function
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
function log(level, message, data = {}) {
  if (!shouldLog(level)) {
    return;
  }

  const output = formatLog(level, message, data);
  const consoleFn =
    level === "error"
      ? console.error
      : level === "warn"
      ? console.warn
      : console.log;

  consoleFn(output);
}

/**
 * Logger interface
 */
const logger = {
  /**
   * Debug level - detailed debugging information
   * Only shown in development
   */
  debug(message, data) {
    log("debug", message, data);
  },

  /**
   * HTTP level - request/response logging
   * Skipped in test environment
   */
  http(message, data) {
    log("http", message, data);
  },

  /**
   * Info level - general operational information
   */
  info(message, data) {
    log("info", message, data);
  },

  /**
   * Warn level - warning conditions
   */
  warn(message, data) {
    log("warn", message, data);
  },

  /**
   * Error level - error conditions
   */
  error(message, data) {
    log("error", message, data);
  },

  /**
   * Check if a specific level would be logged
   * Useful for expensive log data preparation
   */
  isLevelEnabled(level) {
    return shouldLog(level);
  },

  /**
   * Get current log level
   */
  getLevel() {
    return getLogLevel();
  },

  /**
   * Log levels constant for external use
   */
  LOG_LEVELS,
};

module.exports = logger;
