# API Versioning - Verification Plan (Team-Lead Only)

**Owner**: team-lead  
**Purpose**: Comprehensive verification after subagent file changes  
**DO NOT share with subagents** — This is team-lead's control plan

---

## Overview

After backend-api and frontend-dev complete their file changes, team-lead runs all verification procedures to ensure quality.

---

## Phase 1: Backend Verification

**Trigger**: After backend-api completes BACKEND_TASK.md

### Step 1: Automated Tests

```fish
cd ~/workspace/agent/load-tester && npm run backend:test
```

**Success criteria:**

- [ ] All tests pass (0 failures)
- [ ] Coverage ≥80%
- [ ] No test warnings
- [ ] New versioning tests included and passing

**If tests fail:**

- Review backend-api's changes
- Check test file path updates
- Verify v1Router implementation
- Fix issues or re-dispatch to backend-api

---

### Step 2: Manual API Verification

**Start backend:**

```fish
cd ~/workspace/agent/load-tester && npm run backend
# isBackground: true, save terminal ID
```

**Wait for startup:**

```fish
sleep 5
```

**Test v1 endpoints:**

```fish
curl -s http://localhost:3001/api/v1/endpoints | jq .
# Expected: 200 OK with {data: [...]}
```

**Test redirect:**

```fish
curl -I http://localhost:3001/api/endpoints 2>&1 | grep -E "HTTP|Location"
# Expected: HTTP/1.1 301 Moved Permanently
#           Location: /api/v1/endpoints
```

**Test query string preservation:**

```fish
curl -I "http://localhost:3001/api/endpoints?page=1&limit=10" 2>&1 | grep Location
# Expected: Location: /api/v1/endpoints?page=1&limit=10
```

**Test health endpoint (unversioned):**

```fish
curl -s http://localhost:3001/api/health | jq .
# Expected: 200 OK with {"status":"ok","timestamp":"..."}
```

**Test health no redirect:**

```fish
curl -I http://localhost:3001/api/health 2>&1 | grep HTTP
# Expected: HTTP/1.1 200 OK (NOT 301)
```

**Stop backend:**

```fish
lsof -i :3001 -t | xargs kill -9
```

**Checklist:**

- [ ] `/api/v1/endpoints` returns 200 OK
- [ ] `/api/endpoints` returns 301 redirect
- [ ] Redirect Location header correct
- [ ] Query strings preserved
- [ ] `/api/health` returns 200 (no redirect)
- [ ] Health response format correct

**If any fail:** Fix issues or re-dispatch to backend-api

---

## Phase 2: Frontend Verification

**Trigger**: After frontend-dev completes FRONTEND_TASK.md AND Phase 1 passes

### Step 1: Automated Tests

```fish
cd ~/workspace/agent/load-tester && npm run frontend:test
```

**Success criteria:**

- [ ] All tests pass (0 failures)
- [ ] No test warnings
- [ ] No console errors during test run

**If tests fail:**

- Review frontend-dev's changes
- Check API_BASE_URL value
- Fix issues or re-dispatch to frontend-dev

---

### Step 2: Integration E2E Testing

**Start both servers:**

```fish
cd ~/workspace/agent/load-tester && npm run dev
# isBackground: true, save terminal ID
```

**Wait for startup:**

```fish
sleep 10
```

**Verify servers running:**

```fish
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:3001/api/health
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:5173
# Expected: Backend: 200, Frontend: 200
```

**Browser testing checklist:**

- [ ] Open <http://localhost:5173>
- [ ] Page loads without errors
- [ ] Navigate to Endpoints page
- [ ] Endpoints list displays (if any exist)
- [ ] Create new endpoint (form works)
- [ ] Endpoint appears in list
- [ ] Edit endpoint works
- [ ] Delete endpoint works

**Browser console check (F12 → Console):**

- [ ] No red errors
- [ ] No React warnings
- [ ] No failed network requests

**Network tab verification (F12 → Network):**

- [ ] Filter: XHR
- [ ] See requests to `/api/v1/endpoints`
- [ ] See requests to `/api/v1/scenarios`, etc.
- [ ] All requests return 200 OK (successful)
- [ ] Request URLs show `http://localhost:3001/api/v1/*`

**Stop servers:**

```fish
lsof -i :3001 -t | xargs kill -9
lsof -i :5173 -t | xargs kill -9
```

**Checklist:**

- [ ] Frontend loads successfully
- [ ] All CRUD operations work
- [ ] No console errors
- [ ] Network requests use `/api/v1` prefix
- [ ] No regression in existing features

**If any fail:**

- Check browser console for specific errors
- Verify API_BASE_URL in api.js
- Ensure backend routes correctly implemented
- Fix issues or re-dispatch to appropriate agent

---

## Phase 3: Documentation Verification

**Trigger**: After DOCUMENTATION_TASK.md completed

### Check api-reference.md

```fish
cat ~/workspace/agent/load-tester/docs/api-reference.md | grep -E "/api|Base URL|Versioning"
```

**Checklist:**

- [ ] Base URL section shows `/api/v1`
- [ ] All endpoint paths updated to `/api/v1/*`
- [ ] `/api/health` remains unversioned
- [ ] Versioning strategy section exists
- [ ] Backwards compatibility mentioned
- [ ] No markdown syntax errors

**Manual review:**

- [ ] Read through entire document
- [ ] Verify accuracy of all paths
- [ ] Check examples match implementation
- [ ] Ensure clarity and completeness

---

## Final Quality Checklist

### Code Quality

- [ ] No linting errors: `npm run lint` (if exists)
- [ ] No compiler warnings
- [ ] Code follows project patterns
- [ ] No debug code (console.log, debugger)

### Test Coverage

- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] Backend coverage ≥80%
- [ ] New versioning tests added

### Functional Verification

- [ ] API endpoints work at `/api/v1/*`
- [ ] Redirect works: `/api/*` → `/api/v1/*`
- [ ] Health endpoint unversioned: `/api/health`
- [ ] Query strings preserved in redirects
- [ ] Frontend makes requests to `/api/v1/*`
- [ ] All CRUD operations work E2E

### Integration

- [ ] No console errors (browser)
- [ ] No terminal warnings (server)
- [ ] No regressions in existing features
- [ ] Network requests correct in DevTools

### Documentation

- [ ] api-reference.md updated
- [ ] All paths accurate
- [ ] Versioning strategy documented
- [ ] Examples correct

---

## Verification Summary Template

After all phases complete:

```markdown
## API Versioning - Verification Complete ✅

**Backend verification:**
- [X] All tests pass ([X]/[Y] tests, [Z]% coverage)
- [X] Manual API tests pass
- [X] v1 routes work
- [X] Redirect works
- [X] Health endpoint unversioned

**Frontend verification:**
- [X] All tests pass ([X]/[Y] tests)
- [X] E2E tests pass
- [X] Network requests use /api/v1
- [X] No console errors

**Documentation:**
- [X] api-reference.md updated
- [X] All paths accurate

**Quality checklist:** All items passed

**Ready for:** Production / Next task
```

---

## Troubleshooting

### Backend tests fail

1. Check test file path updates (7 files)
2. Verify v1Router mounting in app.js
3. Check redirect middleware logic
4. Review error messages for specifics

### Redirect not working

1. Verify middleware order in app.js
2. Check path matching logic
3. Test with curl -v for headers
4. Ensure health exception works

### Frontend can't reach API

1. Check API_BASE_URL in api.js
2. Verify backend is running on 3001
3. Check browser Network tab for actual URLs
4. Look for CORS errors in console

### E2E features broken

1. Check console for specific errors
2. Verify request URLs in Network tab
3. Test backend endpoints directly with curl
4. Check for data format mismatches

---

## Notes

- Always verify in sequence (backend → frontend → integration)
- Don't skip manual verification steps
- Use browser DevTools extensively for debugging
- Document any issues found for future reference
- Stop servers between verification phases to ensure clean state
