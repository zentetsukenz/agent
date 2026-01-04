# Backend API Versioning - File Changes Only

**Agent**: backend-api  
**Estimated effort**: 45 minutes  
**Scope**: Code changes ONLY (no server operations, no verification)

---

## Task

Refactor Express app.js and integration tests to use `/api/v1` URL prefix.

**What you do**: Make file changes  
**What you DON'T do**: Start servers, run tests, verify anything

---

## Context to Load

1. #file:load-tester/docs/backend-patterns.md — Express routing patterns
2. #file:load-tester/apps/backend/src/app.js — Current route structure

**Test files to update** (7 files):

- #file:load-tester/apps/backend/tests/integration/endpoints.test.js
- #file:load-tester/apps/backend/tests/integration/tests.test.js
- #file:load-tester/apps/backend/tests/integration/scenarios.test.js
- #file:load-tester/apps/backend/tests/integration/validation.test.js
- #file:load-tester/apps/backend/tests/integration/sanitization.test.js
- #file:load-tester/apps/backend/tests/integration/scenarioExecution.test.js
- #file:load-tester/apps/backend/tests/integration/workflowExecution.test.js

---

## File Changes Required

### 1. Refactor apps/backend/src/app.js

**Location**: After middleware setup (after `app.use("/api", apiLimiter);`), before route definitions

**Create v1 router and move all routes:**

```javascript
// Create v1 router
const v1Router = express.Router();

// Move all endpoint routes to v1Router
v1Router.get("/endpoints", endpointsController.index);
v1Router.get("/endpoints/:id", validateId, endpointsController.show);
v1Router.post("/endpoints", validateEndpoint, endpointsController.create);
v1Router.put("/endpoints/:id", validateId, validateEndpoint, endpointsController.update);
v1Router.delete("/endpoints/:id", validateId, endpointsController.destroy);

// Move all test routes to v1Router
v1Router.get("/tests", testsController.index);
v1Router.post("/endpoints/:id/test", validateId, validateTestConfig, loadTestLimiter, testsController.execute);
v1Router.get("/tests/:id", validateId, testsController.show);
v1Router.get("/tests/:id/status", validateId, testsController.status);
v1Router.delete("/tests/:id/cancel", validateId, testsController.cancel);

// Move all scenario routes to v1Router
v1Router.get("/scenarios", scenariosController.index);
v1Router.get("/scenarios/:id", validateId, scenariosController.show);
v1Router.post("/scenarios", validateScenario, scenariosController.create);
v1Router.put("/scenarios/:id", validateId, validateScenarioUpdate, scenariosController.update);
v1Router.delete("/scenarios/:id", validateId, scenariosController.destroy);
v1Router.post("/scenarios/:id/duplicate", validateId, scenariosController.duplicate);

// Mount v1 router
app.use("/api/v1", v1Router);

// Redirect /api/* to /api/v1/* (except health)
app.use("/api", (req, res, next) => {
  if (req.path === '/health') return next();
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(301, `/api/v1${req.path}${queryString}`);
});

// Keep health check at /api/health (unversioned)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

**Important**:

- Remove the old route definitions (they're now in v1Router)
- Keep `/api/health` unversioned (monitoring best practice)
- Redirect must preserve query strings
- Use 301 (permanent redirect)

---

### 2. Update Integration Test Files (All 7 Files)

**Strategy**: Update all test paths from `/api/` to `/api/v1/`

**Pattern**:

```javascript
// Before
await request(app).get("/api/endpoints").expect(200);

// After
await request(app).get("/api/v1/endpoints").expect(200);
```

**Apply to all test methods**: `.get()`, `.post()`, `.put()`, `.delete()`, etc.

**Special cases**:

- `/api/health` should remain unversioned in existing tests
- Update ALL occurrences in ALL 7 test files

---

### 3. Add Versioning Tests

**File**: apps/backend/tests/integration/endpoints.test.js

**Add new describe block** at the end of the file (before closing):

```javascript
describe("API Versioning", () => {
  test("should work with /api/v1 prefix", async () => {
    const response = await request(app).get("/api/v1/endpoints").expect(200);
    expect(response.body).toHaveProperty("data");
  });

  test("should redirect /api/* to /api/v1/*", async () => {
    const response = await request(app)
      .get("/api/endpoints")
      .expect(301);
    expect(response.headers.location).toBe("/api/v1/endpoints");
  });

  test("should preserve query strings in redirect", async () => {
    const response = await request(app)
      .get("/api/endpoints?page=1&limit=10")
      .expect(301);
    expect(response.headers.location).toBe("/api/v1/endpoints?page=1&limit=10");
  });

  test("should not redirect /api/health", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(response.body).toHaveProperty("status", "ok");
  });
});
```

---

## Success Criteria (File Changes Only)

- [ ] v1Router created in app.js
- [ ] All routes moved from `app.get("/api/...` to `v1Router.get("/...`
- [ ] v1Router mounted at `/api/v1`
- [ ] Redirect middleware added
- [ ] Health endpoint remains at `/api/health`
- [ ] All 7 test files updated (every `/api/` → `/api/v1/`)
- [ ] New versioning tests added to endpoints.test.js

---

## What You DON'T Do

❌ **Do NOT start/stop servers**  
❌ **Do NOT run tests** (team-lead will run)  
❌ **Do NOT do manual curl verification**  
❌ **Do NOT claim anything is "verified" or "working"**  

---

## Return Format

```markdown
## File Changes Complete

**Files modified:** 8 files

**Summary:**
1. apps/backend/src/app.js
   - Created v1Router
   - Moved 14 routes to v1Router
   - Added redirect middleware
   - Kept /api/health unversioned

2. tests/integration/endpoints.test.js
   - Updated [X] paths to /api/v1
   - Added 4 versioning tests

3. tests/integration/tests.test.js
   - Updated [X] paths to /api/v1

4. tests/integration/scenarios.test.js
   - Updated [X] paths to /api/v1

5. tests/integration/validation.test.js
   - Updated [X] paths to /api/v1

6. tests/integration/sanitization.test.js
   - Updated [X] paths to /api/v1

7. tests/integration/scenarioExecution.test.js
   - Updated [X] paths to /api/v1

8. tests/integration/workflowExecution.test.js
   - Updated [X] paths to /api/v1

**Ready for team-lead verification:** Yes

**Issues encountered:** [none or describe any problems]
```

---

## Implementation Tips

- Use multi_replace_string_in_file for efficiency when updating test files
- Be careful with query strings in redirect middleware
- Keep exact middleware order in app.js
- Preserve all validation middleware on routes
- Don't modify controller/service files
