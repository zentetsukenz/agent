# Frontend API Versioning - File Changes Only

**Agent**: frontend-dev  
**Estimated effort**: 5 minutes  
**Scope**: Code changes ONLY (no server operations, no verification)

---

## Task

Update frontend API base URL to include `/api/v1` suffix.

**What you do**: Make file change  
**What you DON'T do**: Start servers, run tests, verify anything

---

## Context to Load

1. #file:load-tester/apps/frontend/src/services/api.js — API client configuration

---

## File Changes Required

### Update apps/frontend/src/services/api.js

**Change line 3:**

```javascript
// Before
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// After
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
```

**That's it.** Just add `/api/v1` suffix to the default URL.

---

## Success Criteria (File Changes Only)

- [ ] API_BASE_URL updated in api.js

---

## What You DON'T Do

❌ **Do NOT start/stop servers**  
❌ **Do NOT run tests** (team-lead will run)  
❌ **Do NOT do browser verification**  
❌ **Do NOT claim anything is "verified" or "working"**

---

## Return Format

```markdown
## File Changes Complete

**Files modified:** 1 file

**Summary:**
- apps/frontend/src/services/api.js
  - Updated API_BASE_URL from "http://localhost:3001" to "http://localhost:3001/api/v1"

**Ready for team-lead verification:** Yes

**Issues encountered:** [none or describe]
```
