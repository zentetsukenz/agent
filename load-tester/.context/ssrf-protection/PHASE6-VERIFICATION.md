# Phase 6: End-to-End Verification

**Objective**: Verify complete SSRF protection implementation works as expected

**Estimated time**: 15 minutes

---

## Prerequisites

All previous phases must be complete:

- ✅ Phase 1: Config added
- ✅ Phase 2: Validation functions implemented
- ✅ Phase 3: Integration tests added
- ✅ Phase 4: Unit tests added
- ✅ Phase 5: Documentation updated

---

## Verification Checklist

### 1. Test Suite Verification

```fish
cd ~/workspace/agent/load-tester/apps/backend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Check specific SSRF tests
npm test -- --testNamePattern="SSRF"
```

**Expected**:

- [ ] All tests pass (0 failures)
- [ ] Coverage at or above 80%
- [ ] No warnings in test output
- [ ] SSRF-specific tests all green

---

### 2. Lint & Code Quality

```fish
cd ~/workspace/agent/load-tester/apps/backend

# Run linter
npm run lint

# Check for syntax errors
node -c src/config/index.js
node -c src/features/endpoints/endpoints.service.js
```

**Expected**:

- [ ] No lint errors
- [ ] No syntax errors
- [ ] No warnings about unused variables

---

### 3. Manual API Testing

**Start the server first**:

```fish
cd ~/workspace/agent/load-tester
npm run dev
```

**Test 1: Block metadata endpoint**

```fish
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AWS Metadata Attack",
    "url": "http://169.254.169.254/latest/meta-data",
    "method": "GET"
  }' | jq
```

**Expected response**:

```json
{
  "error": true,
  "message": "...[contains 'metadata' or 'security' or 'blocked']..."
}
```

**Test 2: Block localhost**

```fish
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Localhost",
    "url": "http://localhost:8080/admin",
    "method": "GET"
  }' | jq
```

**Expected**: `400 Bad Request` with error about blocked host

**Test 3: Allow public domain**

```fish
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Public API",
    "url": "https://api.github.com/users",
    "method": "GET"
  }' | jq
```

**Expected**: `201 Created` with success message

**Test 4: Allow public IP**

```fish
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Google DNS",
    "url": "http://8.8.8.8:80",
    "method": "GET"
  }' | jq
```

**Expected**: `201 Created`

**Test 5: Private IP behavior (depends on env)**

```fish
# In development, private IPs might be allowed
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Private IP",
    "url": "http://192.168.1.1/api",
    "method": "GET"
  }' | jq
```

**Expected**: Depends on `BLOCK_PRIVATE_IPS` setting

- If false (dev): `201 Created`
- If true (prod): `400 Bad Request`

---

### 4. Browser Console Verification

**Open frontend**: <http://localhost:5173>

**Check browser console**:

```fish
# Should have no errors or warnings
# Test creating endpoint via UI with blocked URL
```

**Expected**:

- [ ] No console errors
- [ ] No console warnings
- [ ] Error messages display properly in UI

---

### 5. Configuration Verification

```fish
# Test config loads correctly
cd ~/workspace/agent/load-tester/apps/backend

node -e "
const config = require('./src/config/index.js');
console.log('SSRF Config:');
console.log('  blockPrivateIPs:', config.ssrf.blockPrivateIPs);
console.log('  blockedHosts:', config.ssrf.blockedHosts.length, 'hosts');
console.log('  allowlist:', config.ssrf.allowlist);
console.log('');
console.log('Environment:', config.env);
"
```

**Expected output**:

```
SSRF Config:
  blockPrivateIPs: false (or true in production)
  blockedHosts: 8 hosts
  allowlist: []

Environment: development
```

---

### 6. Documentation Verification

```fish
# Check docs exist and are readable
cat ~/workspace/agent/load-tester/.env.example | grep SSRF
cat ~/workspace/agent/load-tester/docs/environment.md | grep -A 10 "SSRF"
```

**Expected**:

- [ ] SSRF vars documented in .env.example
- [ ] Environment.md has SSRF section
- [ ] Backend README mentions security config

---

### 7. Edge Cases

**Test malformed URLs still rejected**:

```fish
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bad URL",
    "url": "not a url",
    "method": "GET"
  }' | jq
```

**Expected**: `400 Bad Request` with URL validation error

**Test non-HTTP protocols still rejected**:

```fish
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FTP",
    "url": "ftp://example.com/file",
    "method": "GET"
  }' | jq
```

**Expected**: `400 Bad Request` with protocol error

---

## Success Criteria (from SPEC)

- [x] Cloud metadata endpoints blocked (169.254.169.254) ✓
- [x] Private IPs blocked in production (configurable) ✓
- [x] Allowlist for legitimate internal targets ✓
- [x] Clear error messages for blocked URLs ✓
- [x] Development mode allows all (for local testing) ✓
- [x] Tests cover SSRF scenarios ✓

---

## Quality Standards Checklist

### ✅ Functional Completeness

- [ ] Feature works as specified
- [ ] Edge cases handled (malformed URLs, invalid protocols)
- [ ] Data validation on server
- [ ] API returns appropriate status codes (201, 400)

### ✅ Code Quality

- [ ] No linting errors
- [ ] No console warnings in browser
- [ ] No deprecation warnings in terminal
- [ ] Tests pass with 80%+ coverage
- [ ] No console.log left in production code
- [ ] No commented-out code blocks

### ✅ Self-Verification

- [ ] Actually tested via API calls
- [ ] Verified on happy path AND error paths
- [ ] Checked browser console for errors/warnings
- [ ] Checked terminal for errors/warnings
- [ ] Read actual files to verify edits succeeded

---

## Completion Report Template

After all verification passes:

```markdown
✅ SSRF Protection Implementation Complete

**Functional verification**:
- ✓ Metadata endpoints blocked (tested via curl)
- ✓ Localhost variants blocked
- ✓ Private IP blocking configurable
- ✓ Public domains/IPs allowed
- ✓ Error messages clear and actionable

**Code quality**:
- ✓ All tests pass (X/X)
- ✓ Coverage: X% (target: 80%+)
- ✓ No lint errors
- ✓ No console warnings

**Documentation**:
- ✓ .env.example updated
- ✓ Backend README updated
- ✓ environment.md updated

**Manual testing results**:
- ✓ AWS metadata (169.254.169.254): Blocked ✓
- ✓ GCP metadata: Blocked ✓
- ✓ Localhost: Blocked ✓
- ✓ Public domain: Allowed ✓
- ✓ Public IP: Allowed ✓

**No blockers or warnings**
```

---

## If Issues Found

1. **Tests failing**: Go back to Phase 3/4, fix tests
2. **Lint errors**: Fix code style issues
3. **API blocking wrong things**: Review Phase 2 validation logic
4. **Config not loading**: Review Phase 1 configuration
5. **Docs unclear**: Update Phase 5 documentation

---

## Final Checklist

- [ ] All automated tests pass
- [ ] Manual API testing successful
- [ ] Browser console clean
- [ ] Configuration loads correctly
- [ ] Documentation complete and accurate
- [ ] Edge cases handled
- [ ] No regressions in existing functionality
- [ ] Coverage at or above 80%

**When all items checked** → Feature is DONE ✅

---

## Reference

- Spec: `load-tester/.context/ssrf-protection/SPEC.md`
- Verification skill: `SKILLS/verification.md`
- Quality standards: `load-tester/docs/quality-standards.md`
