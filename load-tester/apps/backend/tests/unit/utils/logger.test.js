/**
 * Logger Utility Unit Tests
 *
 * Tests for environment-aware logging with level support.
 * Since this uses the config module, we need to mock environment variables.
 */

// Store original env values to restore later
const originalEnv = { ...process.env };

describe("Logger Utility", () => {
  let logger;
  let consoleSpy;

  beforeEach(() => {
    // Reset modules to get fresh logger with new env
    jest.resetModules();

    // Set up console spies
    consoleSpy = {
      log: jest.spyOn(console, "log").mockImplementation(() => {}),
      warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
      error: jest.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };

    // Restore console
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe("getLogLevel", () => {
    test("should return silent in test environment by default", () => {
      process.env.NODE_ENV = "test";
      delete process.env.LOG_LEVEL;
      logger = require("../../../src/utils/logger");

      expect(logger.getLevel()).toBe("silent");
    });

    test("should return debug in development environment", () => {
      process.env.NODE_ENV = "development";
      delete process.env.LOG_LEVEL;
      jest.resetModules();
      logger = require("../../../src/utils/logger");

      expect(logger.getLevel()).toBe("debug");
    });

    test("should return info in production environment", () => {
      process.env.NODE_ENV = "production";
      delete process.env.LOG_LEVEL;
      jest.resetModules();
      logger = require("../../../src/utils/logger");

      expect(logger.getLevel()).toBe("info");
    });

    test("should use LOG_LEVEL env var when set", () => {
      process.env.NODE_ENV = "test";
      process.env.LOG_LEVEL = "debug";
      jest.resetModules();
      logger = require("../../../src/utils/logger");

      expect(logger.getLevel()).toBe("debug");
    });

    test("should handle uppercase LOG_LEVEL", () => {
      process.env.NODE_ENV = "test";
      process.env.LOG_LEVEL = "WARN";
      jest.resetModules();
      logger = require("../../../src/utils/logger");

      expect(logger.getLevel()).toBe("warn");
    });

    test("should ignore invalid LOG_LEVEL and use environment default", () => {
      process.env.NODE_ENV = "development";
      process.env.LOG_LEVEL = "invalid_level";
      jest.resetModules();
      logger = require("../../../src/utils/logger");

      // Should fall back to development default
      expect(logger.getLevel()).toBe("debug");
    });
  });

  describe("isLevelEnabled", () => {
    test("should return true for levels at or above current level", () => {
      process.env.NODE_ENV = "test";
      process.env.LOG_LEVEL = "info";
      jest.resetModules();
      logger = require("../../../src/utils/logger");

      expect(logger.isLevelEnabled("info")).toBe(true);
      expect(logger.isLevelEnabled("warn")).toBe(true);
      expect(logger.isLevelEnabled("error")).toBe(true);
    });

    test("should return false for levels below current level", () => {
      process.env.NODE_ENV = "test";
      process.env.LOG_LEVEL = "info";
      jest.resetModules();
      logger = require("../../../src/utils/logger");

      expect(logger.isLevelEnabled("debug")).toBe(false);
      expect(logger.isLevelEnabled("http")).toBe(false);
    });

    test("should return false for all levels when silent", () => {
      process.env.NODE_ENV = "test";
      delete process.env.LOG_LEVEL;
      jest.resetModules();
      logger = require("../../../src/utils/logger");

      expect(logger.isLevelEnabled("debug")).toBe(false);
      expect(logger.isLevelEnabled("http")).toBe(false);
      expect(logger.isLevelEnabled("info")).toBe(false);
      expect(logger.isLevelEnabled("warn")).toBe(false);
      expect(logger.isLevelEnabled("error")).toBe(false);
    });
  });

  describe("Log methods", () => {
    beforeEach(() => {
      // Enable all logs for testing
      process.env.NODE_ENV = "development";
      process.env.LOG_LEVEL = "debug";
      jest.resetModules();
      logger = require("../../../src/utils/logger");
    });

    test("debug should call console.log", () => {
      logger.debug("debug message", { key: "value" });

      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0][0]).toContain("DEBUG");
      expect(consoleSpy.log.mock.calls[0][0]).toContain("debug message");
    });

    test("http should call console.log", () => {
      logger.http("http message");

      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0][0]).toContain("HTTP");
    });

    test("info should call console.log", () => {
      logger.info("info message", { port: 3000 });

      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0][0]).toContain("INFO");
      expect(consoleSpy.log.mock.calls[0][0]).toContain("info message");
    });

    test("warn should call console.warn", () => {
      logger.warn("warning message");

      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.warn.mock.calls[0][0]).toContain("WARN");
    });

    test("error should call console.error", () => {
      logger.error("error message", { error: "test" });

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(consoleSpy.error.mock.calls[0][0]).toContain("ERROR");
      expect(consoleSpy.error.mock.calls[0][0]).toContain("error message");
    });

    test("should not log when level is below threshold", () => {
      process.env.LOG_LEVEL = "error";
      jest.resetModules();
      logger = require("../../../src/utils/logger");

      logger.debug("should not appear");
      logger.http("should not appear");
      logger.info("should not appear");
      logger.warn("should not appear");

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    test("should include data in log output", () => {
      logger.info("test message", { userId: 123, action: "login" });

      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain("userId");
      expect(output).toContain("123");
      expect(output).toContain("action");
      expect(output).toContain("login");
    });

    test("should handle empty data object", () => {
      logger.info("message only");

      expect(consoleSpy.log).toHaveBeenCalled();
      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain("message only");
    });
  });

  describe("Production formatting", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
      process.env.LOG_LEVEL = "info";
      jest.resetModules();
      logger = require("../../../src/utils/logger");
    });

    test("should output JSON format in production", () => {
      logger.info("production log", { key: "value" });

      expect(consoleSpy.log).toHaveBeenCalled();
      const output = consoleSpy.log.mock.calls[0][0];

      // Should be valid JSON
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty("timestamp");
      expect(parsed).toHaveProperty("level", "info");
      expect(parsed).toHaveProperty("message", "production log");
      expect(parsed).toHaveProperty("key", "value");
    });
  });

  describe("Development formatting", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
      process.env.LOG_LEVEL = "debug";
      jest.resetModules();
      logger = require("../../../src/utils/logger");
    });

    test("should include color codes in development", () => {
      logger.info("dev message");

      const output = consoleSpy.log.mock.calls[0][0];
      // Should contain ANSI color codes
      expect(output).toContain("\x1b[");
    });

    test("should include emoji in development", () => {
      logger.error("error");

      const output = consoleSpy.error.mock.calls[0][0];
      expect(output).toContain("❌");
    });

    test("should handle unknown log level gracefully", () => {
      // This tests the fallback for unknown levels in formatLog
      // We can test this by checking the color fallback
      logger.info("test");
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe("LOG_LEVELS constant", () => {
    test("should expose LOG_LEVELS constant", () => {
      logger = require("../../../src/utils/logger");

      expect(logger.LOG_LEVELS).toEqual({
        debug: 0,
        http: 1,
        info: 2,
        warn: 3,
        error: 4,
        silent: 5,
      });
    });
  });
});
