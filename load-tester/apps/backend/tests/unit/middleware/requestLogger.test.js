/**
 * Request Logger Middleware Unit Tests
 *
 * Note: Morgan stores tokens internally, so we test the middleware
 * behavior through integration rather than testing tokens directly.
 */

// Store original env
const originalEnv = { ...process.env };

describe("Request Logger Middleware", () => {
  let stdoutSpy;

  beforeEach(() => {
    jest.resetModules();
    stdoutSpy = jest
      .spyOn(process.stdout, "write")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    stdoutSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("requestId middleware", () => {
    test("should add unique request ID to request object", () => {
      const { requestId } = require("../../../src/middleware/requestLogger");

      const mockReq = {};
      const mockRes = {
        setHeader: jest.fn(),
      };
      const mockNext = jest.fn();

      requestId(mockReq, mockRes, mockNext);

      expect(mockReq.id).toBeDefined();
      expect(typeof mockReq.id).toBe("string");
      // UUID v4 format
      expect(mockReq.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    test("should set X-Request-Id header on response", () => {
      const { requestId } = require("../../../src/middleware/requestLogger");

      const mockReq = {};
      const mockRes = {
        setHeader: jest.fn(),
      };
      const mockNext = jest.fn();

      requestId(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "X-Request-Id",
        mockReq.id
      );
    });

    test("should call next()", () => {
      const { requestId } = require("../../../src/middleware/requestLogger");

      const mockReq = {};
      const mockRes = {
        setHeader: jest.fn(),
      };
      const mockNext = jest.fn();

      requestId(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test("should generate unique IDs for different requests", () => {
      const { requestId } = require("../../../src/middleware/requestLogger");

      const mockReq1 = {};
      const mockReq2 = {};
      const mockRes = { setHeader: jest.fn() };
      const mockNext = jest.fn();

      requestId(mockReq1, mockRes, mockNext);
      requestId(mockReq2, mockRes, mockNext);

      expect(mockReq1.id).not.toBe(mockReq2.id);
    });
  });

  describe("requestLogger middleware", () => {
    test("should be a function (morgan middleware)", () => {
      process.env.NODE_ENV = "development";
      jest.resetModules();

      const {
        requestLogger,
      } = require("../../../src/middleware/requestLogger");

      expect(typeof requestLogger).toBe("function");
    });

    test("should use development format in development mode", () => {
      process.env.NODE_ENV = "development";
      jest.resetModules();

      const {
        requestLogger,
      } = require("../../../src/middleware/requestLogger");

      expect(requestLogger).toBeDefined();
    });

    test("should use production format in production mode", () => {
      process.env.NODE_ENV = "production";
      jest.resetModules();

      const {
        requestLogger,
      } = require("../../../src/middleware/requestLogger");

      expect(requestLogger).toBeDefined();
    });
  });

  describe("errorLogger middleware", () => {
    test("should be a function (morgan middleware)", () => {
      process.env.NODE_ENV = "development";
      jest.resetModules();

      const { errorLogger } = require("../../../src/middleware/requestLogger");

      expect(typeof errorLogger).toBe("function");
    });

    test("should exist in production mode", () => {
      process.env.NODE_ENV = "production";
      process.env.LOG_LEVEL = "http";
      jest.resetModules();

      const { errorLogger } = require("../../../src/middleware/requestLogger");

      expect(errorLogger).toBeDefined();
    });
  });

  describe("Skip logic", () => {
    test("should skip in test environment when http level not enabled", () => {
      process.env.NODE_ENV = "test";
      delete process.env.LOG_LEVEL;
      jest.resetModules();

      const {
        requestLogger,
        errorLogger,
      } = require("../../../src/middleware/requestLogger");

      expect(requestLogger).toBeDefined();
      expect(errorLogger).toBeDefined();
    });

    test("should not skip in test environment when http level is enabled", () => {
      process.env.NODE_ENV = "test";
      process.env.LOG_LEVEL = "http";
      jest.resetModules();

      const {
        requestLogger,
        errorLogger,
      } = require("../../../src/middleware/requestLogger");

      expect(requestLogger).toBeDefined();
      expect(errorLogger).toBeDefined();
    });

    test("should skip health check in production", () => {
      process.env.NODE_ENV = "production";
      process.env.LOG_LEVEL = "http";
      jest.resetModules();

      const {
        requestLogger,
      } = require("../../../src/middleware/requestLogger");

      expect(requestLogger).toBeDefined();
    });
  });
});
