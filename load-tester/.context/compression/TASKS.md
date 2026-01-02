# Response Compression — Implementation Tasks

**Estimated Effort:** 15-20 minutes  
**Task Size:** Small (direct execution)

---

## Research Summary

**Current State Analysis:**

1. **Middleware order in app.js:**
   - `helmet` (security headers)
   - `requestId` + `requestLogger` (request tracking)
   - `express.json` + `express.urlencoded` (body parsers)
   - `cors` (cross-origin)
   - `apiLimiter` (rate limiting)
   - Routes
   - Error handlers

2. **Dependencies:** No `compression` package installed

3. **Compression fits:** After `helmet`, before `requestId/requestLogger`

---

## Tasks

### 1. [ ] Install compression package

- **Files:** `apps/backend/package.json`
- **Command:** `npm install compression --workspace=apps/backend`
- **Verify:** Package appears in dependencies
- **Size:** Small

### 2. [ ] Add compression middleware to app.js

- **Files:** `apps/backend/src/app.js`
- **Changes:**
  - Add `require('compression')` import
  - Add `app.use(compression({ threshold: 1024 }))` after helmet, before requestId
- **Verify:** No syntax errors, app starts
- **Size:** Small

### 3. [ ] Verify compression working

- **Commands:**
  1. Start the server
  2. `curl -H "Accept-Encoding: gzip" -I http://localhost:3000/api/endpoints` — should show `Content-Encoding: gzip`
  3. Compare response sizes with/without compression
- **Verify:** Header present, size reduced
- **Size:** Small

### 4. [ ] Run existing tests

- **Command:** `npm test --workspace=apps/backend`
- **Verify:** All tests pass (compression should be transparent)
- **Size:** Small

---

## Placement Decision

**Recommended position:** After `helmet`, before `requestId`

```javascript
// Security headers - Helmet.js
app.use(helmet({...}));

// Response compression
app.use(compression({ threshold: 1024 }));

// Request ID and logging
app.use(requestId);
```

**Rationale:**

- Compression should happen early so all responses benefit
- After security headers (helmet should set headers first)
- Before logging (don't want to log compressed content issues)

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaks existing tests | Low | compression is transparent to tests |
| Performance overhead | Very Low | Level 6 is balanced; threshold skips small responses |
| Content-Type filtering | Low | Default filter handles JSON/text properly |

---

## Status

- [ ] Task 1: Install package
- [ ] Task 2: Add middleware
- [ ] Task 3: Verify compression
- [ ] Task 4: Run tests
