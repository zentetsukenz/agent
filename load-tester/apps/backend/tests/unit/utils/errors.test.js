/**
 * Custom Error Classes Unit Tests
 */
const {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  TimeoutError,
  InternalError,
} = require("../../../src/utils/errors");

describe("Custom Error Classes", () => {
  describe("AppError (Base Class)", () => {
    test("should create error with message and default status code", () => {
      const error = new AppError("Something went wrong");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Something went wrong");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe("AppError");
    });

    test("should create error with custom status code", () => {
      const error = new AppError("Custom error", 418);

      expect(error.statusCode).toBe(418);
    });

    test("should create error with non-operational flag", () => {
      const error = new AppError("Critical error", 500, false);

      expect(error.isOperational).toBe(false);
    });

    test("should have proper stack trace", () => {
      const error = new AppError("Test error");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("AppError");
    });
  });

  describe("ValidationError (400)", () => {
    test("should create 400 error with message", () => {
      const error = new ValidationError("Invalid input");

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("ValidationError");
    });

    test("should include validation details", () => {
      const details = ["Field 'name' is required", "Email format is invalid"];
      const error = new ValidationError("Validation failed", details);

      expect(error.details).toEqual(details);
    });

    test("should have null details by default", () => {
      const error = new ValidationError("Invalid");

      expect(error.details).toBeNull();
    });
  });

  describe("NotFoundError (404)", () => {
    test("should create 404 error with default message", () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe("NotFoundError");
    });

    test("should create 404 error with custom resource name", () => {
      const error = new NotFoundError("User");

      expect(error.message).toBe("User not found");
    });

    test("should create 404 error with custom message", () => {
      const error = new NotFoundError("Endpoint");

      expect(error.message).toBe("Endpoint not found");
    });
  });

  describe("ConflictError (409)", () => {
    test("should create 409 error with default message", () => {
      const error = new ConflictError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.message).toBe("Resource already exists");
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe("ConflictError");
    });

    test("should create 409 error with custom message", () => {
      const error = new ConflictError("Email already registered");

      expect(error.message).toBe("Email already registered");
    });
  });

  describe("UnauthorizedError (401)", () => {
    test("should create 401 error with default message", () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toBe("Authentication required");
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe("UnauthorizedError");
    });

    test("should create 401 error with custom message", () => {
      const error = new UnauthorizedError("Invalid token");

      expect(error.message).toBe("Invalid token");
    });
  });

  describe("ForbiddenError (403)", () => {
    test("should create 403 error with default message", () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.message).toBe("Access forbidden");
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe("ForbiddenError");
    });

    test("should create 403 error with custom message", () => {
      const error = new ForbiddenError("Admin access required");

      expect(error.message).toBe("Admin access required");
    });
  });

  describe("TimeoutError (408)", () => {
    test("should create 408 error with default message", () => {
      const error = new TimeoutError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.message).toBe("Operation timed out");
      expect(error.statusCode).toBe(408);
      expect(error.name).toBe("TimeoutError");
    });

    test("should create 408 error with custom message", () => {
      const error = new TimeoutError("Request took too long");

      expect(error.message).toBe("Request took too long");
    });
  });

  describe("InternalError (500)", () => {
    test("should create 500 error with default message", () => {
      const error = new InternalError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(InternalError);
      expect(error.message).toBe("Internal server error");
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe("InternalError");
    });

    test("should create 500 error with custom message", () => {
      const error = new InternalError("Database connection failed");

      expect(error.message).toBe("Database connection failed");
    });

    test("should be marked as non-operational", () => {
      const error = new InternalError();

      expect(error.isOperational).toBe(false);
    });
  });

  describe("Error inheritance chain", () => {
    test("all errors should be instances of Error", () => {
      const errors = [
        new AppError("test"),
        new ValidationError("test"),
        new NotFoundError("test"),
        new ConflictError("test"),
        new UnauthorizedError("test"),
        new ForbiddenError("test"),
        new TimeoutError("test"),
        new InternalError("test"),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(Error);
      });
    });

    test("all custom errors should be instances of AppError", () => {
      const errors = [
        new ValidationError("test"),
        new NotFoundError("test"),
        new ConflictError("test"),
        new UnauthorizedError("test"),
        new ForbiddenError("test"),
        new TimeoutError("test"),
        new InternalError("test"),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(AppError);
      });
    });
  });

  describe("Error throwing and catching", () => {
    test("should be catchable as Error", () => {
      expect(() => {
        throw new ValidationError("test");
      }).toThrow(Error);
    });

    test("should be catchable as AppError", () => {
      expect(() => {
        throw new NotFoundError("User");
      }).toThrow(AppError);
    });

    test("should be catchable by specific type", () => {
      expect(() => {
        throw new ConflictError();
      }).toThrow(ConflictError);
    });
  });
});
