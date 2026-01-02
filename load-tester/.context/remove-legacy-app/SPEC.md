# Remove Legacy App

**Priority**: 🟡 Important (Tech Debt)  
**Effort**: 1 hour  
**Type**: Cleanup / Tech Debt

---

## Objective

Remove the legacy `src/` application that was replaced by the monorepo structure (`apps/backend/` and `apps/frontend/`).

---

## Current State

The project has **two Express applications**:

1. **Legacy app** (`src/`) — EJS-based server-rendered UI
2. **Current app** (`apps/backend/`) — REST API for React frontend

The legacy app appears to be from an earlier architecture before migrating to a React frontend + REST API backend.

### Legacy Files to Remove

```
load-tester/
├── src/
│   ├── app.js              # Legacy Express app
│   ├── server.js           # Legacy server entry
│   ├── features/
│   │   ├── endpoints/      # Legacy controllers
│   │   └── tests/          # Legacy controllers
│   ├── public/
│   │   └── css/style.css   # Legacy styles
│   └── views/
│       ├── layout.ejs      # EJS templates
│       ├── index.ejs
│       ├── error.ejs
│       ├── endpoints/
│       └── test/
├── tests/                   # Legacy tests (if any)
│   ├── setup.js
│   ├── integration/
│   └── unit/
└── prisma/                  # Duplicate schema (check if redundant)
    └── schema.prisma
```

---

## Analysis Required

Before removal, verify:

1. **No active usage** — Is `src/app.js` referenced anywhere?
2. **No unique functionality** — Any features not in `apps/backend/`?
3. **Test coverage** — Are legacy tests still needed or duplicated?
4. **Prisma schema** — Is root `prisma/` needed or is `apps/backend/prisma/` the source of truth?
5. **Package.json scripts** — Any scripts pointing to legacy `src/`?

---

## Implementation

### Phase 1: Verify No Dependencies

```bash
# Check for references to src/app.js or src/server.js
grep -r "src/app" --include="*.js" --include="*.json" .
grep -r "src/server" --include="*.js" --include="*.json" .

# Check package.json scripts
cat package.json | jq '.scripts'
```

### Phase 2: Remove Legacy Files

```bash
# Remove legacy source
rm -rf src/

# Remove legacy tests (if duplicated in apps/backend/tests/)
rm -rf tests/

# Remove duplicate prisma (if apps/backend/prisma/ is source of truth)
rm -rf prisma/
```

### Phase 3: Update Configuration

- Update root `package.json` to remove legacy scripts
- Update any CI/CD references
- Update documentation if it references legacy structure

---

## Success Criteria

- [ ] No references to `src/` remain in codebase
- [ ] `apps/backend/` is the sole backend
- [ ] All tests pass after removal
- [ ] No broken imports or scripts
- [ ] Documentation updated

---

## Risks

- **Low**: Legacy app may have unique test cases worth preserving
- **Low**: Some documentation may reference old structure

---

## Notes

- This is tech debt cleanup, not a functional change
- The monorepo structure (`apps/`) is the current architecture
- Removing dead code improves maintainability and reduces confusion
