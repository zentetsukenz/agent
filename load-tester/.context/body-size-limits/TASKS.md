# Body Size Limits - Implementation Tasks

**Status:** Ready to Implement  
**Estimated:** 20 minutes  
**Risk:** Low (additive change, non-breaking)

---

## Tasks

### 1. [ ] Update apps/backend/src/app.js body parsers

- **Files:** `apps/backend/src/app.js`
- **Change:** Add `limit: '10kb'` to both `express.json()` and `express.urlencoded()`
- **Verify:** Unit test with oversized payload returns 413
- **Size:** Small (~1% context)

### 2. [ ] Add integration test for body size limit

- **Files:** `apps/backend/tests/integration/endpoints.test.js`
- **Change:** Add test case for 413 response when payload exceeds limit
- **Verify:** Test passes, confirms 413 behavior
- **Size:** Small (~2% context)

### 3. [ ] Manual verification via curl

- **Command:** Test with 20KB payload against running server
- **Verify:** Receives 413 Payload Too Large response
- **Size:** Small

---

## Implementation Details

### Code Changes

**apps/backend/src/app.js (lines 43-44):**

```javascript
// Before
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// After
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

### Test Code

```javascript
describe("Body Size Limits", () => {
  test("should return 413 when JSON body exceeds limit", async () => {
    const oversizedPayload = {
      name: "x".repeat(15000), // ~15KB, exceeds 10KB limit
      url: "https://example.com",
      method: "GET",
    };

    const response = await request(app)
      .post("/api/endpoints")
      .send(oversizedPayload)
      .expect(413);

    expect(response.body.error).toBeDefined();
  });
});
```

---

## Verification Checklist

- [ ] `express.json({ limit: '10kb' })` in apps/backend/src/app.js
- [ ] `express.urlencoded({ extended: true, limit: '10kb' })` in apps/backend/src/app.js
- [ ] Same limits in src/app.js (if still in use)
- [ ] Integration test passes for 413 response
- [ ] Existing tests still pass (normal payloads unaffected)
- [ ] Manual curl test returns 413 for oversized payload

---

## Rollback

ues arise, simply remove the `limit` option to restore Express defaults:

```javascript
app.use(express.json()); // Reverts to 100KB default
```

---

## Dependencies

- None (Express body-parser limit option is built-in)

## Notes

- Express body-parser automatically returns 413 when limit exceeded
- The existing error handler will format the response consistently
- 10KB is generous for this API's typical payloads (endpoint ~500B, test config ~1KB)
