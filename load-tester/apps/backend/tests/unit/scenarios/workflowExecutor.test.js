/**
 * Workflow Executor Tests
 */

const {
  executeStep,
  executeStepsWithErrorHandling,
  executeSetup,
  executeTeardown,
  executeWorkflow,
  extractCookiesFromHeaders,
  buildAutocannonOptions,
  ERROR_HANDLING,
} = require("../../../src/features/scenarios/workflowExecutor");

// Mock axios
jest.mock("axios", () => {
  return jest.fn();
});
const axios = require("axios");

// Mock logger
jest.mock("../../../src/utils/logger", () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("workflowExecutor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("extractCookiesFromHeaders", () => {
    it("should extract single cookie from Set-Cookie header", () => {
      const headers = { "set-cookie": ["session=abc123; Path=/; HttpOnly"] };
      const result = extractCookiesFromHeaders(headers);
      expect(result).toEqual({ session: "abc123" });
    });

    it("should extract multiple cookies", () => {
      const headers = {
        "set-cookie": [
          "session=abc123; Path=/",
          "token=xyz789; Path=/; Secure",
        ],
      };
      const result = extractCookiesFromHeaders(headers);
      expect(result).toEqual({ session: "abc123", token: "xyz789" });
    });

    it("should handle single cookie string", () => {
      const headers = { "set-cookie": "session=abc123; Path=/" };
      const result = extractCookiesFromHeaders(headers);
      expect(result).toEqual({ session: "abc123" });
    });

    it("should return empty object if no Set-Cookie header", () => {
      const result = extractCookiesFromHeaders({ "content-type": "application/json" });
      expect(result).toEqual({});
    });

    it("should handle cookie values with equals sign", () => {
      const headers = { "set-cookie": ["data=a=b=c; Path=/"] };
      const result = extractCookiesFromHeaders(headers);
      expect(result).toEqual({ data: "a=b=c" });
    });
  });

  describe("executeStep", () => {
    it("should execute a GET request", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: { id: 123 },
        headers: {},
      });

      const step = {
        name: "Get User",
        method: "GET",
        path: "https://api.example.com/users/1",
      };

      const result = await executeStep(step, {});

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.body).toEqual({ id: 123 });
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "https://api.example.com/users/1",
        })
      );
    });

    it("should execute a POST request with body", async () => {
      axios.mockResolvedValueOnce({
        status: 201,
        statusText: "Created",
        data: { id: 456, name: "Test" },
        headers: {},
      });

      const step = {
        name: "Create User",
        method: "POST",
        path: "https://api.example.com/users",
        body: '{"name": "Test"}',
      };

      const result = await executeStep(step, {});

      expect(result.success).toBe(true);
      expect(result.status).toBe(201);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          data: { name: "Test" },
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should interpolate variables in URL", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: {},
        headers: {},
      });

      const step = {
        name: "Get Book",
        method: "GET",
        path: "https://api.example.com/books/{{bookId}}",
      };

      await executeStep(step, { bookId: "abc123" });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://api.example.com/books/abc123",
        })
      );
    });

    it("should interpolate variables in body", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: {},
        headers: {},
      });

      const step = {
        name: "Create Transaction",
        method: "POST",
        path: "https://api.example.com/transactions",
        body: '{"bookUid": "{{bookUid}}", "amount": {{amount}}}',
      };

      await executeStep(step, { bookUid: "book-123", amount: 100 });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { bookUid: "book-123", amount: 100 },
        })
      );
    });

    it("should include cookies in request", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: {},
        headers: {},
      });

      const step = {
        name: "Protected Request",
        method: "GET",
        path: "https://api.example.com/protected",
      };

      await executeStep(step, {}, { cookies: { session: "abc123", token: "xyz" } });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Cookie: "session=abc123; token=xyz",
          }),
        })
      );
    });

    it("should extract variables from response", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: { uid: "extracted-uid", data: { name: "Test" } },
        headers: { "x-request-id": "req-123" },
      });

      const step = {
        name: "Get with Extract",
        method: "GET",
        path: "https://api.example.com/resource",
        extractors: [
          { name: "resourceUid", source: "body", path: "uid" },
          { name: "requestId", source: "header", path: "x-request-id" },
        ],
      };

      const result = await executeStep(step, {});

      expect(result.extractedVars).toEqual({
        resourceUid: "extracted-uid",
        requestId: "req-123",
      });
    });

    it("should extract cookies from response", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: {},
        headers: { "set-cookie": ["session=new-session; Path=/"] },
      });

      const step = {
        name: "Login",
        method: "POST",
        path: "https://api.example.com/login",
      };

      const result = await executeStep(step, {});

      expect(result.cookies).toEqual({ session: "new-session" });
    });

    it("should return success=false for error status codes", async () => {
      axios.mockResolvedValueOnce({
        status: 404,
        statusText: "Not Found",
        data: { error: "Resource not found" },
        headers: {},
      });

      const step = {
        name: "Get Missing",
        method: "GET",
        path: "https://api.example.com/missing",
      };

      const result = await executeStep(step, {});

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
    });
  });

  describe("executeStepsWithErrorHandling", () => {
    it("should execute all steps successfully", async () => {
      axios
        .mockResolvedValueOnce({ status: 200, statusText: "OK", data: { id: 1 }, headers: {} })
        .mockResolvedValueOnce({ status: 200, statusText: "OK", data: { id: 2 }, headers: {} });

      const steps = [
        { name: "Step 1", method: "GET", path: "https://api.example.com/1" },
        { name: "Step 2", method: "GET", path: "https://api.example.com/2" },
      ];

      const result = await executeStepsWithErrorHandling(steps, {}, { phaseName: "Test" });

      expect(result.results).toHaveLength(2);
      expect(result.hasErrors).toBe(false);
    });

    it("should accumulate context across steps", async () => {
      axios
        .mockResolvedValueOnce({ status: 200, statusText: "OK", data: { uid: "first" }, headers: {} })
        .mockResolvedValueOnce({ status: 200, statusText: "OK", data: { uid: "second" }, headers: {} });

      const steps = [
        {
          name: "Step 1",
          method: "GET",
          path: "https://api.example.com/1",
          extractors: [{ name: "firstUid", source: "body", path: "uid" }],
        },
        {
          name: "Step 2",
          method: "GET",
          path: "https://api.example.com/2",
          extractors: [{ name: "secondUid", source: "body", path: "uid" }],
        },
      ];

      const result = await executeStepsWithErrorHandling(steps, {}, { phaseName: "Test" });

      expect(result.context).toEqual({ firstUid: "first", secondUid: "second" });
    });

    it("should abort on error when errorHandling is abort", async () => {
      axios.mockResolvedValueOnce({ status: 500, statusText: "Error", data: {}, headers: {} });

      const steps = [
        { name: "Step 1", method: "GET", path: "https://api.example.com/1" },
        { name: "Step 2", method: "GET", path: "https://api.example.com/2" },
      ];

      await expect(
        executeStepsWithErrorHandling(steps, {}, { errorHandling: ERROR_HANDLING.ABORT, phaseName: "Test" })
      ).rejects.toThrow();
    });

    it("should continue on error when errorHandling is ignore", async () => {
      axios
        .mockResolvedValueOnce({ status: 500, statusText: "Error", data: {}, headers: {} })
        .mockResolvedValueOnce({ status: 200, statusText: "OK", data: {}, headers: {} });

      const steps = [
        { name: "Step 1", method: "GET", path: "https://api.example.com/1" },
        { name: "Step 2", method: "GET", path: "https://api.example.com/2" },
      ];

      const result = await executeStepsWithErrorHandling(steps, {}, {
        errorHandling: ERROR_HANDLING.IGNORE,
        phaseName: "Test",
      });

      expect(result.results).toHaveLength(2);
      expect(result.hasErrors).toBe(true);
      expect(result.results[0].success).toBe(false);
      expect(result.results[1].success).toBe(true);
    });

    it("should retry on error when errorHandling is retry", async () => {
      axios
        .mockResolvedValueOnce({ status: 500, statusText: "Error", data: {}, headers: {} })
        .mockResolvedValueOnce({ status: 500, statusText: "Error", data: {}, headers: {} })
        .mockResolvedValueOnce({ status: 200, statusText: "OK", data: {}, headers: {} });

      const steps = [{ name: "Step 1", method: "GET", path: "https://api.example.com/1" }];

      const result = await executeStepsWithErrorHandling(steps, {}, {
        errorHandling: ERROR_HANDLING.RETRY,
        retryCount: 3,
        phaseName: "Test",
      });

      expect(axios).toHaveBeenCalledTimes(3);
      expect(result.results[0].success).toBe(true);
      expect(result.hasErrors).toBe(false);
    });

    it("should fail after exhausting all retry attempts", async () => {
      // All attempts fail
      axios
        .mockResolvedValueOnce({ status: 500, statusText: "Error", data: {}, headers: {} })
        .mockResolvedValueOnce({ status: 500, statusText: "Error", data: {}, headers: {} })
        .mockResolvedValueOnce({ status: 500, statusText: "Error", data: {}, headers: {} });

      const steps = [{ name: "Step 1", method: "GET", path: "https://api.example.com/1" }];

      const result = await executeStepsWithErrorHandling(steps, {}, {
        errorHandling: ERROR_HANDLING.RETRY,
        retryCount: 3,
        phaseName: "Test",
      });

      // All 3 retries attempted
      expect(axios).toHaveBeenCalledTimes(3);
      // Final result should show failure
      expect(result.results[0].success).toBe(false);
      expect(result.hasErrors).toBe(true);
      expect(result.results[0].error).toContain("500");
    });

    it("should handle network error with abort mode", async () => {
      axios.mockRejectedValueOnce(new Error("Network Error"));

      const steps = [
        { name: "Step 1", method: "GET", path: "https://api.example.com/1" },
      ];

      await expect(
        executeStepsWithErrorHandling(steps, {}, {
          errorHandling: ERROR_HANDLING.ABORT,
          phaseName: "Test",
        })
      ).rejects.toThrow("Network Error");
    });

    it("should handle network error with ignore mode", async () => {
      axios
        .mockRejectedValueOnce(new Error("Connection refused"))
        .mockResolvedValueOnce({ status: 200, statusText: "OK", data: {}, headers: {} });

      const steps = [
        { name: "Step 1", method: "GET", path: "https://api.example.com/1" },
        { name: "Step 2", method: "GET", path: "https://api.example.com/2" },
      ];

      const result = await executeStepsWithErrorHandling(steps, {}, {
        errorHandling: ERROR_HANDLING.IGNORE,
        phaseName: "Test",
      });

      expect(result.results).toHaveLength(2);
      expect(result.hasErrors).toBe(true);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toBe("Connection refused");
      expect(result.results[1].success).toBe(true);
    });

    it("should handle network error with retry mode and eventually succeed", async () => {
      axios
        .mockRejectedValueOnce(new Error("Timeout"))
        .mockResolvedValueOnce({ status: 200, statusText: "OK", data: { result: "ok" }, headers: {} });

      const steps = [{ name: "Step 1", method: "GET", path: "https://api.example.com/1" }];

      const result = await executeStepsWithErrorHandling(steps, {}, {
        errorHandling: ERROR_HANDLING.RETRY,
        retryCount: 2,
        phaseName: "Test",
      });

      expect(axios).toHaveBeenCalledTimes(2);
      expect(result.results[0].success).toBe(true);
      expect(result.hasErrors).toBe(false);
    });

    it("should fail after exhausting network error retries", async () => {
      axios
        .mockRejectedValueOnce(new Error("Network Error"))
        .mockRejectedValueOnce(new Error("Network Error"));

      const steps = [{ name: "Step 1", method: "GET", path: "https://api.example.com/1" }];

      const result = await executeStepsWithErrorHandling(steps, {}, {
        errorHandling: ERROR_HANDLING.RETRY,
        retryCount: 2,
        phaseName: "Test",
      });

      expect(axios).toHaveBeenCalledTimes(2);
      expect(result.results[0].success).toBe(false);
      expect(result.hasErrors).toBe(true);
      expect(result.results[0].error).toBe("Network Error");
    });
  });

  describe("executeSetup", () => {
    it("should return empty context for empty setup", async () => {
      const result = await executeSetup([]);
      expect(result.context).toEqual({});
      expect(result.cookies).toEqual({});
    });

    it("should execute setup steps and return context", async () => {
      axios
        .mockResolvedValueOnce({
          status: 201,
          statusText: "Created",
          data: { uid: "book-123" },
          headers: {},
        })
        .mockResolvedValueOnce({
          status: 201,
          statusText: "Created",
          data: { uid: "account-456" },
          headers: {},
        });

      const setupSteps = [
        {
          name: "Create Book",
          method: "POST",
          path: "https://api.example.com/books",
          body: '{"name": "Test Book"}',
          extractors: [{ name: "bookUid", source: "body", path: "uid" }],
        },
        {
          name: "Create Account",
          method: "POST",
          path: "https://api.example.com/accounts",
          body: '{"bookUid": "{{bookUid}}"}',
          extractors: [{ name: "accountUid", source: "body", path: "uid" }],
        },
      ];

      const result = await executeSetup(setupSteps);

      expect(result.context).toEqual({
        bookUid: "book-123",
        accountUid: "account-456",
      });
    });
  });

  describe("executeTeardown", () => {
    it("should return empty results for empty teardown", async () => {
      const result = await executeTeardown([], {});
      expect(result.results).toEqual([]);
    });

    it("should execute teardown with context", async () => {
      axios.mockResolvedValueOnce({
        status: 204,
        statusText: "No Content",
        data: null,
        headers: {},
      });

      const teardownSteps = [
        {
          name: "Delete Book",
          method: "DELETE",
          path: "https://api.example.com/books/{{bookUid}}",
        },
      ];

      const result = await executeTeardown(teardownSteps, { bookUid: "book-123" });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "DELETE",
          url: "https://api.example.com/books/book-123",
        })
      );
      expect(result.results).toHaveLength(1);
    });
  });

  describe("buildAutocannonOptions", () => {
    it("should build simple options without workflow", () => {
      const endpoint = {
        url: "https://api.example.com/test",
        method: "GET",
        headers: '{"Authorization": "Bearer token"}',
      };

      const result = buildAutocannonOptions(endpoint, {}, []);

      expect(result).toEqual({
        url: "https://api.example.com/test",
        method: "GET",
        headers: { Authorization: "Bearer token" },
      });
    });

    it("should build options with workflow steps", () => {
      const endpoint = {
        url: "https://api.example.com",
        method: "GET",
      };

      const workflowSteps = [
        {
          name: "Create Transaction",
          method: "POST",
          path: "https://api.example.com/transactions",
          body: '{"amount": {{amount}}}',
          runOnce: false,
        },
      ];

      const context = { amount: 100 };

      const result = buildAutocannonOptions(endpoint, context, workflowSteps);

      expect(result.requests).toBeDefined();
      expect(result.requests[0].method).toBe("POST");
      expect(result.requests[0].body).toBe('{"amount":100}');
    });

    it("should filter out runOnce steps", () => {
      const endpoint = { url: "https://api.example.com", method: "GET" };

      const workflowSteps = [
        { name: "Setup", method: "POST", path: "/setup", runOnce: true },
        { name: "Load", method: "POST", path: "/load", runOnce: false },
        { name: "Another Load", method: "GET", path: "/data", runOnce: false },
      ];

      const result = buildAutocannonOptions(endpoint, {}, workflowSteps);

      // Should only include non-runOnce steps
      expect(result.requests).toHaveLength(2);
      expect(result.requests[0].path).toBe("/load");
      expect(result.requests[1].path).toBe("/data");
    });

    it("should interpolate context in workflow steps", () => {
      const endpoint = { url: "https://api.example.com", method: "GET" };

      const workflowSteps = [
        {
          name: "Create",
          method: "POST",
          path: "/books/{{bookId}}/transactions",
          body: '{"accountId": "{{accountId}}"}',
          runOnce: false,
        },
      ];

      const context = { bookId: "b123", accountId: "a456" };

      const result = buildAutocannonOptions(endpoint, context, workflowSteps);

      expect(result.requests[0].path).toBe("/books/b123/transactions");
      expect(result.requests[0].body).toBe('{"accountId":"a456"}');
    });
  });

  describe("executeStep - additional edge cases", () => {
    it("should handle headers as object", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: { success: true },
        headers: {},
      });

      const step = {
        name: "With Object Headers",
        method: "GET",
        path: "https://api.example.com/data",
        headers: { "X-Custom": "value", Authorization: "Bearer {{token}}" },
      };

      const result = await executeStep(step, { token: "abc123" });

      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Custom": "value",
            Authorization: "Bearer abc123",
          }),
        })
      );
    });

    it("should handle body as object (not string)", async () => {
      axios.mockResolvedValueOnce({
        status: 201,
        statusText: "Created",
        data: { id: 1 },
        headers: {},
      });

      const step = {
        name: "Object Body",
        method: "POST",
        path: "https://api.example.com/data",
        body: { name: "{{name}}", value: 42 },
      };

      const result = await executeStep(step, { name: "test" });

      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { name: "test", value: 42 },
        })
      );
    });

    it("should handle body that is not valid JSON", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: "OK",
        headers: {},
      });

      const step = {
        name: "Plain Text Body",
        method: "POST",
        path: "https://api.example.com/data",
        body: "plain text not JSON",
      };

      const result = await executeStep(step, {});

      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: "plain text not JSON",
        })
      );
    });

    it("should skip Content-Type if already set", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: {},
        headers: {},
      });

      const step = {
        name: "With Content-Type",
        method: "POST",
        path: "https://api.example.com/data",
        headers: '{"Content-Type": "text/xml"}',
        body: '{"data": "value"}',
      };

      const result = await executeStep(step, {});

      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "text/xml",
          }),
        })
      );
    });

    it("should skip Content-Type if content-type (lowercase) is set", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: {},
        headers: {},
      });

      const step = {
        name: "With lowercase content-type",
        method: "POST",
        path: "https://api.example.com/data",
        headers: '{"content-type": "application/xml"}',
        body: '{"data": "value"}',
      };

      const result = await executeStep(step, {});

      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "content-type": "application/xml",
          }),
        })
      );
    });
  });

  describe("executeWorkflow", () => {
    it("should execute workflow with empty phases", async () => {
      const scenario = {
        setup: JSON.stringify([]),
        workflow: JSON.stringify([]),
        teardown: JSON.stringify([]),
        setupErrorHandling: ERROR_HANDLING.ABORT,
        teardownErrorHandling: ERROR_HANDLING.IGNORE,
      };

      const result = await executeWorkflow(scenario);

      expect(result.status).toBe("ready");
      expect(result.sharedContext).toBeDefined();
      expect(result.setupResults).toEqual([]);
    });

    it("should execute setup and return shared context", async () => {
      axios.mockResolvedValueOnce({
        status: 201,
        statusText: "Created",
        data: { id: "setup-123" },
        headers: {},
      });

      const scenario = {
        setup: JSON.stringify([
          {
            name: "Setup",
            method: "POST",
            path: "https://api.example.com/setup",
            extractors: [{ name: "setupId", source: "body", path: "id" }],
          },
        ]),
        workflow: JSON.stringify([]),
        teardown: JSON.stringify([]),
        setupErrorHandling: ERROR_HANDLING.ABORT,
        teardownErrorHandling: ERROR_HANDLING.IGNORE,
      };

      const result = await executeWorkflow(scenario);

      expect(result.status).toBe("ready");
      expect(result.sharedContext.setupId).toBe("setup-123");
      expect(result.setupResults).toHaveLength(1);
    });

    it("should return failed status when setup fails with abort mode", async () => {
      axios.mockResolvedValueOnce({
        status: 500,
        statusText: "Internal Server Error",
        data: {},
        headers: {},
      });

      const scenario = {
        setup: JSON.stringify([
          {
            name: "Failing Setup",
            method: "POST",
            path: "https://api.example.com/setup",
          },
        ]),
        workflow: JSON.stringify([]),
        teardown: JSON.stringify([]),
        setupErrorHandling: ERROR_HANDLING.ABORT,
        teardownErrorHandling: ERROR_HANDLING.IGNORE,
      };

      const result = await executeWorkflow(scenario);

      expect(result.status).toBe("failed");
      expect(result.error).toContain("Setup failed");
    });

    it("should handle setup with object types (not JSON strings)", async () => {
      axios.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: { result: "ok" },
        headers: {},
      });

      const scenario = {
        setup: [
          {
            name: "Object Setup",
            method: "GET",
            path: "https://api.example.com/check",
          },
        ],
        workflow: [],
        teardown: [],
        setupErrorHandling: ERROR_HANDLING.ABORT,
        teardownErrorHandling: ERROR_HANDLING.IGNORE,
      };

      const result = await executeWorkflow(scenario);

      expect(result.status).toBe("ready");
      expect(result.setupResults).toHaveLength(1);
    });

    it("should return workflowHandler when workflow steps defined", async () => {
      const scenario = {
        setup: JSON.stringify([]),
        workflow: JSON.stringify([
          {
            name: "Load Step",
            method: "GET",
            path: "https://api.example.com/data",
            runOnce: false,
          },
        ]),
        teardown: JSON.stringify([]),
        setupErrorHandling: ERROR_HANDLING.ABORT,
        teardownErrorHandling: ERROR_HANDLING.IGNORE,
      };

      const result = await executeWorkflow(scenario);

      expect(result.status).toBe("ready");
      expect(result.workflowHandler).toBeDefined();
      expect(typeof result.workflowHandler).toBe("function");
    });

    it("should provide runTeardown function", async () => {
      axios.mockResolvedValueOnce({
        status: 204,
        statusText: "No Content",
        data: null,
        headers: {},
      });

      const scenario = {
        setup: JSON.stringify([]),
        workflow: JSON.stringify([]),
        teardown: JSON.stringify([
          {
            name: "Cleanup",
            method: "DELETE",
            path: "https://api.example.com/cleanup",
          },
        ]),
        setupErrorHandling: ERROR_HANDLING.ABORT,
        teardownErrorHandling: ERROR_HANDLING.IGNORE,
      };

      const result = await executeWorkflow(scenario);

      expect(result.runTeardown).toBeDefined();
      expect(typeof result.runTeardown).toBe("function");

      // Call teardown
      await result.runTeardown();

      // Verify teardown was called
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "DELETE",
          url: "https://api.example.com/cleanup",
        })
      );
    });

    it("should handle teardown error gracefully", async () => {
      axios.mockRejectedValueOnce(new Error("Teardown network error"));

      const scenario = {
        setup: JSON.stringify([]),
        workflow: JSON.stringify([]),
        teardown: JSON.stringify([
          {
            name: "Failing Cleanup",
            method: "DELETE",
            path: "https://api.example.com/cleanup",
          },
        ]),
        setupErrorHandling: ERROR_HANDLING.ABORT,
        teardownErrorHandling: ERROR_HANDLING.ABORT, // Should still not throw
      };

      const result = await executeWorkflow(scenario);

      // Teardown should be available
      const teardownResult = await result.runTeardown();

      // Should capture error but not throw
      expect(teardownResult.error).toContain("Teardown network error");
    });

    it("should return hasWorkflow flag correctly", async () => {
      const scenarioWithWorkflow = {
        setup: JSON.stringify([]),
        workflow: JSON.stringify([{ name: "Step", method: "GET", path: "/api" }]),
        teardown: JSON.stringify([]),
        setupErrorHandling: ERROR_HANDLING.ABORT,
        teardownErrorHandling: ERROR_HANDLING.IGNORE,
      };

      const result = await executeWorkflow(scenarioWithWorkflow);
      expect(result.hasWorkflow).toBe(true);

      const scenarioWithoutWorkflow = {
        setup: JSON.stringify([]),
        workflow: JSON.stringify([]),
        teardown: JSON.stringify([]),
        setupErrorHandling: ERROR_HANDLING.ABORT,
        teardownErrorHandling: ERROR_HANDLING.IGNORE,
      };

      const result2 = await executeWorkflow(scenarioWithoutWorkflow);
      expect(result2.hasWorkflow).toBe(false);
    });
  });
});
