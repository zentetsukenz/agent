# API Versioning - Orchestration Plan (Team-Lead)

**Owner**: team-lead  
**Total effort**: ~2 hours  
**Strategy**: Subagents do file changes ONLY, team-lead does ALL verification

---

## Key Principle

**Separation of Concerns:**

- **Subagents**: File changes only (no server ops, no testing)
- **Team-lead**: All server operations and verification

---

## Task Breakdown

### Task 1: Backend File Changes

**Agent**: backend-api  
**Context**: BACKEND_TASK.md  
**Duration**: 45 minutes  
**Scope**: Code changes only

**Subagent does:**

- ✅ Refactor app.js (create v1Router)
- ✅ Update 7 test files
- ✅ Add versioning tests

**Subagent does NOT:**

- ❌ Start/stop servers
- ❌ Run tests
- ❌ Verify anything

---

### Task 2: Backend Verification

**Owner**: team-lead  
**Context**: VERIFICATION_PLAN.md Phase 1  
**Duration**: 15 minutes

**Team-lead does:**

- Run `npm run backend:test`
- Check coverage ≥80%
- Manual curl verification
- Document results

---

### Task 3: Frontend File Changes

**Agent**: frontend-dev  
**Context**: FRONTEND_TASK.md  
**Duration**: 5 minutes  
**Scope**: Code changes only

**Subagent does:**

- ✅ Update API_BASE_URL

**Subagent does NOT:**

- ❌ Start/stop servers
- ❌ Run tests
- ❌ Verify anything

---

### Task 4: Frontend Verification

**Owner**: team-lead  
**Context**: VERIFICATION_PLAN.md Phase 2  
**Duration**: 10 minutes

**Team-lead does:**

- Run `npm run frontend:test`
- Start both servers
- Browser E2E testing
- Network tab inspection

---

### Task 5: Documentation Update

**Agent**: backend-api or team-lead  
**Context**: DOCUMENTATION_TASK.md  
**Duration**: 10 minutes

**Updates:**

- api-reference.md paths
- Versioning strategy section

---

### Task 6: Final Verification

**Owner**: team-lead  
**Duration**: 20 minutes

**Team-lead does:**

- Final quality checklist
- Integration testing
- Documentation accuracy check

---

## Execution Workflow

```
1. [TEAM-LEAD] Stop any running servers
   ↓
2. [DISPATCH] backend-api → BACKEND_TASK.md
   ↓
3. [WAIT] For backend-api to complete file changes
   ↓
4. [TEAM-LEAD] Backend Verification (VERIFICATION_PLAN Phase 1)
   - npm run backend:test
   - Manual curl tests
   - Document results
   ↓
5. [DECISION] Tests pass?
   - YES → Continue
   - NO → Fix or re-dispatch backend-api
   ↓
6. [DISPATCH] frontend-dev → FRONTEND_TASK.md
   ↓
7. [WAIT] For frontend-dev to complete file changes
   ↓
8. [TEAM-LEAD] Frontend Verification (VERIFICATION_PLAN Phase 2)
   - npm run frontend:test
   - Start servers
   - Browser E2E
   - Network tab check
   ↓
9. [DECISION] E2E works?
   - YES → Continue
   - NO → Fix or re-dispatch frontend-dev
   ↓
10. [DISPATCH/SELF] Documentation update (DOCUMENTATION_TASK.md)
    ↓
11. [TEAM-LEAD] Final quality checklist
    ↓
12. [DONE] Feature complete
```

---

## Delegation Templates

### Backend Dispatch

```markdown
**Task**: Refactor backend for /api/v1 versioning - FILE CHANGES ONLY

**Context to load:**
- #file:load-tester/.context/api-versioning/BACKEND_TASK.md

**Critical instructions:**
- DO: Make file changes (app.js + 7 test files)
- DO NOT: Start servers, run tests, or verify
- Return: Summary of file changes made (~300 tokens)

**Success criteria:**
- v1Router created and routes moved
- Redirect middleware added
- All test files updated
- Versioning tests added
```

### Frontend Dispatch

```markdown
**Task**: Update frontend API base URL - FILE CHANGES ONLY

**Context to load:**
- #file:load-tester/.context/api-versioning/FRONTEND_TASK.md

**Critical instructions:**
- DO: Update API_BASE_URL in api.js
- DO NOT: Start servers, run tests, or verify
- Return: Summary of file change (~100 tokens)

**Success criteria:**
- API_BASE_URL includes /api/v1 suffix
```

---

## Team-Lead Verification Responsibilities

**After backend file changes:**

1. Run backend tests
2. Verify coverage
3. Manual API testing with curl
4. Document results
5. Decision: proceed or re-dispatch

**After frontend file changes:**

1. Run frontend tests
2. Start servers (background)
3. Browser testing
4. Network tab inspection
5. Stop servers
6. Decision: proceed or re-dispatch

**Final checks:**

1. Integration E2E
2. Quality checklist
3. Documentation accuracy
4. No regressions

---

## Success Criteria (Overall)

### Code Quality

- [ ] No linting errors
- [ ] All tests pass (backend + frontend)
- [ ] Coverage ≥80% backend

### Functional

- [ ] `/api/v1/endpoints` works (200)
- [ ] `/api/endpoints` redirects (301)
- [ ] `/api/health` unversioned (200)
- [ ] Query strings preserved
- [ ] Frontend uses `/api/v1`
- [ ] All CRUD operations work E2E

### Documentation

- [ ] api-reference.md updated
- [ ] Paths accurate
- [ ] Versioning strategy documented

---

## Timeline

| Task | Owner | Duration |
|------|-------|----------|
| 1. Backend file changes | backend-api | 45 min |
| 2. Backend verification | team-lead | 15 min |
| 3. Frontend file changes | frontend-dev | 5 min |
| 4. Frontend verification | team-lead | 10 min |
| 5. Documentation | backend-api/team-lead | 10 min |
| 6. Final verification | team-lead | 20 min |
| **Total** | | **~2 hours** |

---

## Key Benefits of This Approach

✅ **Clear boundaries**: No confusion about who does what  
✅ **Quality control**: Team-lead verifies everything  
✅ **Context purity**: Subagents focus only on code  
✅ **Sequential verification**: Catch issues early  
✅ **Server control**: Only team-lead manages servers  

---

## Notes

- Subagents never touch servers or run tests
- Team-lead controls all verification and quality gates
- Each phase must pass before proceeding
- Documentation updated after implementation verified
- See VERIFICATION_PLAN.md for detailed verification procedures
