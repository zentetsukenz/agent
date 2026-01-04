# API Versioning Documentation - File Changes Only

**Agent**: backend-api (or team-lead)  
**Estimated effort**: 10 minutes  
**Scope**: Documentation changes only

---

## Task

Update API documentation to reflect new `/api/v1` versioning scheme and explain versioning strategy.

---

## File to Update

# file:load-tester/docs/api-reference.md

---

## Changes Required

### 1. Update "Base URL" Section

**Before**:

```markdown
## Base URL

- **Development**: `http://localhost:3001`
- **API Prefix**: `/api`
```

**After**:

```markdown
## Base URL

- **Development**: `http://localhost:3001`
- **API Prefix**: `/api/v1`

**Versioning**: API uses URL prefix versioning (`/api/v1`, `/api/v2`, etc.) to enable future breaking changes without disrupting existing clients.

**Backwards Compatibility**: Unversioned `/api/*` routes redirect to `/api/v1/*` with HTTP 301 status.

**Health Check**: `/api/health` remains unversioned for monitoring tools.
```

### 2. Update All Endpoint Examples

Update every endpoint path from `/api/` to `/api/v1/`:

- `/api/health` → remains `/api/health`
- `/api/endpoints` → `/api/v1/endpoints`
- `/api/endpoints/:id` → `/api/v1/endpoints/:id`
- `/api/tests` → `/api/v1/tests`
- `/api/scenarios` → `/api/v1/scenarios`
- etc.

**Example**:

```markdown
### GET /api/v1/endpoints

**Purpose**: List all endpoints
```

### 3. Add Versioning Strategy Section

Add new section after "Base URL", before "Health Check":

```markdown
---

## Versioning Strategy

### Current Version: v1

All API routes are prefixed with `/api/v1/` to enable future evolution.

### Version Support Policy

- **Latest stable**: v1 (current)
- **Backwards compatibility**: Unversioned `/api/*` routes redirect (301) to `/api/v1/*`
- **Deprecation**: When v2 is released, v1 will remain available with deprecation headers
- **Sunset**: Deprecated versions supported for minimum 6 months after replacement

### Future Breaking Changes

When introducing breaking changes (schema modifications, behavior changes, etc.):

1. Create new version (e.g., `/api/v2`)
2. Add deprecation headers to previous version
3. Maintain both versions during transition
4. Sunset older version after deprecation period

### Health Endpoint Exception

`/api/health` remains unversioned for monitoring tools that expect stable endpoints.

---
```

---

## Success Criteria

- [ ] Base URL section updated to show `/api/v1`
- [ ] All endpoint paths updated (except `/api/health`)
- [ ] Versioning strategy section added
- [ ] Documentation is clear and accurate
- [ ] No broken links or formatting issues

---

## Verification

Read through updated documentation:

- [ ] Paths match actual implementation
- [ ] Versioning explanation is clear
- [ ] Examples are accurate

---

## Return Format

```markdown
## Documentation Update - Complete

**Changes made:**
- load-tester/docs/api-reference.md — Updated all paths to /api/v1, added versioning strategy

**Verification:**
- [X] All paths updated
- [X] Versioning section added
- [X] Documentation clear and accurate

**Issues/Blockers:** [none or list]
```
