/**
 * Error Handler Middleware Unit Tests
 */
const {
  errorHandler,
  notFoundHandler,
  mapPrismaError,
  formatErrorResponse,
} = require("../../../src/middleware/errorHandler");

const {
  AppError,
  ValidationError,
  NotFoundError,
  InternalError,
} = require("../../../src/utils/errors");

const {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} = require("@prisma/client");

// Store original env
const originalEnv = process.env.NODE_ENV;

describe("Error Handler Middleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let loggerSpy;

  beforeEach(() => {
    mockReq = {
      id: "test-request-123",
      method: "GET",
      originalUrl: "/api/test",
      ip: "127.0.0.1",
      get: jest.fn().mockReturnValue("test-user-agent"),
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Mock logger to prevent actual logging during tests
    jest
      .spyOn(require("../../../src/utils/logger"), "error")
      .mockImplementation(() => {});
    jest
      .spyOn(require("../../../src/utils/logger"), "warn")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  describe("mapPrismaError", () => {
    test("should map P2002 (unique constraint) to ValidationError", () => {
      const prismaError = new PrismaClientKnownRequestError(
        "Unique constraint failed",
        {
          code: "P2002",
          meta: { target: ["email"] },
          clientVersion: "5.0.0",
        }
      );

      const mapped = mapPrismaError(prismaError);

      expect(mapped).toBeInstanceOf(ValidationError);
      expect(mapped.message).toContain("email");
      expect(mapped.message).toContain("already exists");
    });

    test("should map P2002 without target to generic message", () => {
      const prismaError = new PrismaClientKnownRequestError(
        "Unique constraint failed",
        {
          code: "P2002",
          meta: {},
          clientVersion: "5.0.0",
        }
      );

      const mapped = mapPrismaError(prismaError);

      expect(mapped).toBeInstanceOf(ValidationError);
      expect(mapped.message).toContain("field");
    });

    test("should map P2025 (record not found) to NotFoundError", () => {
      const prismaError = new PrismaClientKnownRequestError(
        "Record not found",
        {
          code: "P2025",
          clientVersion: "5.0.0",
        }
      );

      const mapped = mapPrismaError(prismaError);

      expect(mapped).toBeInstanceOf(NotFoundError);
    });

    test("should map P2003 (foreign key constraint) to ValidationError", () => {
      const prismaError = new PrismaClientKnownRequestError(
        "Foreign key constraint failed",
        {
          code: "P2003",
          clientVersion: "5.0.0",
        }
      );

      const mapped = mapPrismaError(prismaError);

      expect(mapped).toBeInstanceOf(ValidationError);
      expect(mapped.message).toContain("Invalid reference");
    });

    test("should map P2014 (invalid ID) to ValidationError", () => {
      const prismaError = new PrismaClientKnownRequestError("Invalid ID", {
        code: "P2014",
        clientVersion: "5.0.0",
      });

      const mapped = mapPrismaError(prismaError);

      expect(mapped).toBeInstanceOf(ValidationError);
      expect(mapped.message).toContain("Invalid ID");
    });

    test("should map unknown Prisma error codes to InternalError", () => {
      const prismaError = new PrismaClientKnownRequestError("Unknown error", {
        code: "P9999",
        clientVersion: "5.0.0",
      });

      const mapped = mapPrismaError(prismaError);

      expect(mapped).toBeInstanceOf(InternalError);
      expect(mapped.message).toBe("Database operation failed");
    });

    test("should map PrismaClientValidationError to ValidationError", () => {
      const prismaError = new PrismaClientValidationError("Invalid data", {
        clientVersion: "5.0.0",
      });

      const mapped = mapPrismaError(prismaError);

      expect(mapped).toBeInstanceOf(ValidationError);
      expect(mapped.message).toBe("Invalid data provided");
    });

    test("should return null for non-Prisma errors", () => {
      const regularError = new Error("Regular error");

      const mapped = mapPrismaError(regularError);

      expect(mapped).toBeNull();
    });
  });

  describe("formatErrorResponse", () => {
    test("should format basic error response", () => {
      const error = new AppError("Test error", 400);

      const response = formatErrorResponse(error, "production");

      expect(response).toEqual({
        error: true,
        message: "Test error",
        type: "AppError",
      });
    });

    test("should include validation details when present", () => {
      const error = new ValidationError("Validation failed", [
        "Field is required",
      ]);

      const response = formatErrorResponse(error, "production");

      expect(response.details).toEqual(["Field is required"]);
    });

    test("should include stack trace in development", () => {
      const error = new AppError("Dev error", 500);

      const response = formatErrorResponse(error, "development");

      expect(response.stack).toBeDefined();
    });

    test("should not include stack trace in production", () => {
      const error = new AppError("Prod error", 500);

      const response = formatErrorResponse(error, "production");

      expect(response.stack).toBeUndefined();
    });

    test("should include meta in development when present", () => {
      const error = new AppError("Error with meta", 500);
      error.meta = { field: "test" };

      const response = formatErrorResponse(error, "development");

      expect(response.meta).toEqual({ field: "test" });
    });

    test("should handle error without message", () => {
      const error = new Error();
      error.name = "TestError";

      const response = formatErrorResponse(error, "production");

      expect(response.message).toBe("An error occurred");
    });
  });

  describe("errorHandler middleware", () => {
    test("should handle AppError correctly", () => {
      const error = new ValidationError("Invalid input");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          message: "Invalid input",
          requestId: "test-request-123",
        })
      );
    });

    test("should handle Prisma errors", () => {
      const prismaError = new PrismaClientKnownRequestError(
        "Record not found",
        {
          code: "P2025",
          clientVersion: "5.0.0",
        }
      );

      errorHandler(prismaError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test("should convert unknown errors to InternalError in production", () => {
      process.env.NODE_ENV = "production";
      const unknownError = new Error("Sensitive error details");

      errorHandler(unknownError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "An unexpected error occurred",
        })
      );
    });

    test("should show error message in development", () => {
      process.env.NODE_ENV = "development";
      const unknownError = new Error("Dev error message");

      errorHandler(unknownError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Dev error message",
        })
      );
    });

    test("should include requestId in response", () => {
      const error = new NotFoundError("User");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: "test-request-123",
        })
      );
    });

    test("should handle error without statusCode", () => {
      const error = new Error("No status code");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("notFoundHandler middleware", () => {
    test("should create NotFoundError for undefined routes", () => {
      mockReq.method = "POST";
      mockReq.path = "/api/undefined";

      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const errorArg = mockNext.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(NotFoundError);
      expect(errorArg.message).toContain("POST");
      expect(errorArg.message).toContain("/api/undefined");
    });

    test("should include method and path in error message", () => {
      mockReq.method = "DELETE";
      mockReq.path = "/api/users/123";

      notFoundHandler(mockReq, mockRes, mockNext);

      const errorArg = mockNext.mock.calls[0][0];
      expect(errorArg.message).toBe("Route DELETE /api/users/123 not found");
    });
  });

  describe("Error logging", () => {
    test("should log server errors (500+)", () => {
      const loggerError = require("../../../src/utils/logger").error;
      const error = new InternalError("Server crash");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(loggerError).toHaveBeenCalled();
    });

    test("should log client errors (400+) as warnings", () => {
      const loggerWarn = require("../../../src/utils/logger").warn;
      const error = new ValidationError("Bad input");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(loggerWarn).toHaveBeenCalled();
    });
  });
});
