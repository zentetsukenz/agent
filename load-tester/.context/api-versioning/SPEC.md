# API Versioning

**Priority**: 🟡 Important  
**Effort**: 2 hours  
**Standard**: REST API Best Practices  
**Status**: ✅ **COMPLETE**

---

## Objective

Add API versioning via URL prefix (`/api/v1/`) to enable future breaking changes without disrupting existing clients.

## Implementation Status

✅ **Backend**: Complete

- v1Router created and mounted at `/api/v1`
- All 14 routes moved to v1Router
- Redirect middleware implemented (`/api/*` → `/api/v1/*`)
- Health endpoint remains unversioned at `/api/health`
- Query string preservation in redirects

✅ **Tests**: Complete

- All 7 integration test files updated to `/api/v1` paths
- New API Versioning test suite added (4 tests)
- All existing tests passing with new paths

✅ **Frontend**: Complete

- API_BASE_URL updated to `http://localhost:3001/api/v1`
- All requests now use versioned endpoints

✅ **Documentation**: Complete

- api-reference.md updated with `/api/v1` paths
- Versioning strategy section added
- Version support policy documented
- Future migration path documented

---

## Current State

```javascript
// apps/backend/src/app.js
app.get("/api/endpoints", ...);
app.get("/api/tests", ...);
app.get("/api/scenarios", ...);
```

No versioning. Breaking changes would affect all clients.

---

## Implementation Options

### Option A: URL Prefix (Recommended)

```
/api/v1/endpoints
/api/v1/tests
/api/v1/scenarios
```

**Pros**: Clear, cacheable, easy to route  
**Cons**: URL pollution

### Option B: Header-Based

```
Accept: application/vnd.loadtester.v1+json
```

**Pros**: Clean URLs  
**Cons**: Harder to test, not cacheable by URL

### Option C: Query Parameter

```
/api/endpoints?version=1
```

**Pros**: Easy to add  
**Cons**: Optional, easy to forget

---

## Recommended: URL Prefix

### Target Files

- `apps/backend/src/app.js`
- `apps/frontend/src/services/api.js`

### Backend Changes

```javascript
// Create router for v1
const v1Router = express.Router();

// Move all routes to v1
v1Router.get("/endpoints", endpointsController.index);
v1Router.get("/endpoints/:id", validateId, endpointsController.show);
// ... all other routes

// Mount at /api/v1
app.use("/api/v1", apiLimiter, v1Router);

// Redirect /api to /api/v1 for backwards compatibility
app.use("/api", (req, res, next) => {
  if (req.path === '/health') return next(); // Keep health at /api/health
  res.redirect(301, `/api/v1${req.path}`);
});
```

### Frontend Changes

```javascript
// services/api.js
const API_BASE = '/api/v1';

export const endpoints = {
  getAll: () => fetch(`${API_BASE}/endpoints`),
  // ...
};
```

---

## Success Criteria

- [x] All routes available at `/api/v1/*`
- [x] `/api/*` redirects to `/api/v1/*`
- [x] `/api/health` remains unversioned
- [x] Frontend uses `/api/v1` base URL
- [x] All tests updated and passing
- [x] Documentation updated

## Implementation Summary

### Files Modified

**Backend (1 file)**:

- `apps/backend/src/app.js` — v1Router implementation + redirect middleware

**Frontend (1 file)**:

- `apps/frontend/src/services/api.js` — API_BASE_URL updated

**Tests (7 files)**:

- `tests/integration/endpoints.test.js` — Paths + versioning tests
- `tests/integration/tests.test.js` — Path updates
- `tests/integration/scenarios.test.js` — Path updates
- `tests/integration/validation.test.js` — Path updates
- `tests/integration/sanitization.test.js` — Path updates
- `tests/integration/scenarioExecution.test.js` — Path updates  
- `tests/integration/workflowExecution.test.js` — Path updates

**Documentation (1 file)**:

- `docs/api-reference.md` — All paths + versioning strategy

**Total**: 10 files modified

---

## Verification

```bash
# v1 routes work
curl http://localhost:3000/api/v1/endpoints

# Legacy routes redirect
curl -L http://localhost:3000/api/endpoints
# Should redirect to /api/v1/endpoints

# Health unversioned
curl http://localhost:3000/api/health
```

---

## Future Versioning

When v2 needed:

1. Create v2Router with new routes
2. Mount at `/api/v2`
3. Keep v1 for deprecation period
4. Add deprecation headers to v1

---

## References

- [API Versioning Best Practices](https://www.freecodecamp.org/news/how-to-version-a-rest-api/)
- [Stripe API Versioning](https://stripe.com/docs/api/versioning)
