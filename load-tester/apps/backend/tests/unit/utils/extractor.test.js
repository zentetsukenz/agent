/**
 * Extractor Utility Tests
 */

const {
  extractFromBody,
  extractFromBodySync,
  extractFromHeader,
  extractFromCookie,
  applyExtractors,
} = require("../../../src/utils/extractor");

describe("extractor utility", () => {
  describe("extractFromBody (async with JSONata)", () => {
    it("should extract simple property", async () => {
      const result = await extractFromBody({ uid: "abc123" }, "uid");
      expect(result).toBe("abc123");
    });

    it("should extract nested property", async () => {
      const result = await extractFromBody({ data: { user: { id: 42 } } }, "data.user.id");
      expect(result).toBe(42);
    });

    it("should extract array element", async () => {
      const result = await extractFromBody({ items: ["a", "b", "c"] }, "items[1]");
      expect(result).toBe("b");
    });

    it("should extract from array of objects", async () => {
      const result = await extractFromBody(
        { users: [{ name: "Alice" }, { name: "Bob" }] },
        "users[0].name"
      );
      expect(result).toBe("Alice");
    });

    it("should handle JSON string body", async () => {
      const result = await extractFromBody('{"id": 123}', "id");
      expect(result).toBe(123);
    });

    it("should return undefined for missing path", async () => {
      const result = await extractFromBody({ a: 1 }, "b");
      expect(result).toBeUndefined();
    });

    it("should return undefined for null body", async () => {
      const result = await extractFromBody(null, "a");
      expect(result).toBeUndefined();
    });

    it("should return undefined for null path", async () => {
      const result = await extractFromBody({ a: 1 }, null);
      expect(result).toBeUndefined();
    });

    it("should handle complex JSONata expressions", async () => {
      const data = { orders: [{ total: 10 }, { total: 20 }, { total: 30 }] };
      const result = await extractFromBody(data, "$sum(orders.total)");
      expect(result).toBe(60);
    });

    it("should return undefined for invalid JSON string", async () => {
      const result = await extractFromBody("not json", "a");
      expect(result).toBeUndefined();
    });
  });

  describe("extractFromBodySync", () => {
    it("should extract simple property", () => {
      const result = extractFromBodySync({ uid: "abc123" }, "uid");
      expect(result).toBe("abc123");
    });

    it("should extract nested property", () => {
      const result = extractFromBodySync({ data: { id: 42 } }, "data.id");
      expect(result).toBe(42);
    });

    it("should extract array element with bracket notation", () => {
      const result = extractFromBodySync({ items: ["a", "b", "c"] }, "items[1]");
      expect(result).toBe("b");
    });

    it("should handle JSON string body", () => {
      const result = extractFromBodySync('{"id": 123}', "id");
      expect(result).toBe(123);
    });

    it("should return undefined for missing path", () => {
      const result = extractFromBodySync({ a: 1 }, "b");
      expect(result).toBeUndefined();
    });

    it("should return undefined for null body", () => {
      const result = extractFromBodySync(null, "a");
      expect(result).toBeUndefined();
    });

    it("should return undefined for invalid JSON string", () => {
      const result = extractFromBodySync("invalid-json{", "a");
      expect(result).toBeUndefined();
    });
  });

  describe("extractFromHeader", () => {
    it("should extract header value", () => {
      const headers = { "Content-Type": "application/json", "X-Request-Id": "abc123" };
      expect(extractFromHeader(headers, "X-Request-Id")).toBe("abc123");
    });

    it("should be case-insensitive", () => {
      const headers = { "Content-Type": "application/json" };
      expect(extractFromHeader(headers, "content-type")).toBe("application/json");
      expect(extractFromHeader(headers, "CONTENT-TYPE")).toBe("application/json");
    });

    it("should return undefined for missing header", () => {
      const headers = { "Content-Type": "application/json" };
      expect(extractFromHeader(headers, "X-Missing")).toBeUndefined();
    });

    it("should return undefined for null headers", () => {
      expect(extractFromHeader(null, "X-Header")).toBeUndefined();
    });

    it("should return undefined for null header name", () => {
      expect(extractFromHeader({ a: 1 }, null)).toBeUndefined();
    });
  });

  describe("extractFromCookie", () => {
    it("should extract from cookie string", () => {
      const result = extractFromCookie("session=abc123; Path=/; HttpOnly", "session");
      expect(result).toBe("abc123");
    });

    it("should extract from array of cookies", () => {
      const cookies = [
        "session=abc123; Path=/",
        "token=xyz789; Path=/; Secure",
      ];
      expect(extractFromCookie(cookies, "token")).toBe("xyz789");
    });

    it("should extract from cookies object", () => {
      const cookies = { session: "abc123", token: "xyz789" };
      expect(extractFromCookie(cookies, "session")).toBe("abc123");
    });

    it("should handle cookie values with equals sign", () => {
      const result = extractFromCookie("data=a=b=c; Path=/", "data");
      expect(result).toBe("a=b=c");
    });

    it("should return undefined for missing cookie", () => {
      expect(extractFromCookie("session=abc; Path=/", "token")).toBeUndefined();
    });

    it("should return undefined for null cookies", () => {
      expect(extractFromCookie(null, "session")).toBeUndefined();
    });

    it("should return undefined for null cookie name", () => {
      expect(extractFromCookie("session=abc", null)).toBeUndefined();
    });
  });

  describe("applyExtractors", () => {
    it("should extract from body", async () => {
      const response = {
        body: { uid: "abc123", data: { name: "Test" } },
        headers: {},
      };
      const extractors = [
        { name: "bookUid", source: "body", path: "uid" },
        { name: "bookName", source: "body", path: "data.name" },
      ];

      const result = await applyExtractors(response, extractors);
      expect(result).toEqual({ bookUid: "abc123", bookName: "Test" });
    });

    it("should extract from headers", async () => {
      const response = {
        body: {},
        headers: { "x-request-id": "req-456" },
      };
      const extractors = [{ name: "requestId", source: "header", path: "x-request-id" }];

      const result = await applyExtractors(response, extractors);
      expect(result).toEqual({ requestId: "req-456" });
    });

    it("should extract from cookies", async () => {
      const response = {
        body: {},
        headers: { "set-cookie": ["session=abc123; Path=/"] },
      };
      const extractors = [{ name: "sessionId", source: "cookie", path: "session" }];

      const result = await applyExtractors(response, extractors);
      expect(result).toEqual({ sessionId: "abc123" });
    });

    it("should handle mixed sources", async () => {
      const response = {
        body: { id: 123 },
        headers: { "x-token": "token123", "set-cookie": ["sid=session456"] },
      };
      const extractors = [
        { name: "userId", source: "body", path: "id" },
        { name: "authToken", source: "header", path: "x-token" },
        { name: "sessionId", source: "cookie", path: "sid" },
      ];

      const result = await applyExtractors(response, extractors);
      expect(result).toEqual({
        userId: 123,
        authToken: "token123",
        sessionId: "session456",
      });
    });

    it("should skip undefined values", async () => {
      const response = { body: { a: 1 }, headers: {} };
      const extractors = [
        { name: "found", source: "body", path: "a" },
        { name: "notFound", source: "body", path: "b" },
      ];

      const result = await applyExtractors(response, extractors);
      expect(result).toEqual({ found: 1 });
      expect(result.notFound).toBeUndefined();
    });

    it("should skip extractors without name", async () => {
      const response = { body: { a: 1 }, headers: {} };
      const extractors = [
        { source: "body", path: "a" }, // missing name
        { name: "b", source: "body", path: "a" },
      ];

      const result = await applyExtractors(response, extractors);
      expect(result).toEqual({ b: 1 });
    });

    it("should return empty object for empty extractors", async () => {
      const result = await applyExtractors({ body: {}, headers: {} }, []);
      expect(result).toEqual({});
    });

    it("should return empty object for null extractors", async () => {
      const result = await applyExtractors({ body: {}, headers: {} }, null);
      expect(result).toEqual({});
    });

    it("should handle unknown source gracefully", async () => {
      const response = { body: { a: 1 }, headers: {} };
      const extractors = [{ name: "test", source: "unknown", path: "a" }];

      const result = await applyExtractors(response, extractors);
      expect(result).toEqual({});
    });
  });
});
