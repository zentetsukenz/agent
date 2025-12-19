# Verification Checklist

> **Purpose**: Step-by-step process to verify work is actually done. Run through this BEFORE claiming completion.

---

## Pre-Verification Setup

Before checking anything, ensure the app is running:

```fish
cd ~/workspace/agent/load-tester
npm run dev
```

Wait for both to start:
- Backend: "Server running on port 3001"
- Frontend: "Local: http://localhost:5173"

---

## 1. Automated Tests

### Run All Tests

```fish
# Backend tests (must pass with 80%+ coverage)
npm run backend:test

# Frontend tests
npm run frontend:test
```

### Check for Failures
- [ ] All tests pass (no red)
- [ ] Coverage meets threshold (80%+ for backend)
- [ ] No skipped tests that should be running

### If Tests Fail
1. Read the error message carefully
2. Check if it's a test issue or code issue
3. Fix and re-run before proceeding

---

## 2. Terminal Warnings

### While Tests Run, Watch For:
- [ ] No deprecation warnings
- [ ] No security warnings
- [ ] No "experimental" feature warnings
- [ ] No unhandled promise rejections

### Common Warnings to Fix:

**Prisma deprecation:**
```
WARN deprecated: The `url` property in the datasource block is deprecated
```
→ Ensure prisma.config.ts is properly configured

**Node.js deprecation:**
```
DeprecationWarning: ... is deprecated
```
→ Update the deprecated API usage

**Unhandled rejection:**
```
UnhandledPromiseRejectionWarning: ...
```
→ Add try/catch or .catch() handler

---

## 3. Browser Console Check

### Open DevTools (Cmd+Option+I)

Navigate through the app and check Console tab:

- [ ] No red errors
- [ ] No orange warnings (especially React warnings)
- [ ] No failed network requests (check Network tab)

### Common Issues to Fix:

**React warning:**
```
Warning: Each child in a list should have a unique "key" prop
```
→ Add key prop to mapped elements

**React warning:**
```
Warning: Cannot update a component while rendering a different component
```
→ Move state update to useEffect

**Network error:**
```
GET http://localhost:3001/api/... 404 (Not Found)
```
→ Check API route exists and is correct

---

## 4. Manual Testing Checklist

### Happy Path Testing
Test the primary use case end-to-end:

- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] Forms submit successfully
- [ ] Success message/toast appears
- [ ] Data persists (refresh and verify)

### Error Path Testing
Intentionally trigger errors:

- [ ] Invalid form input shows validation message
- [ ] Network error shows user-friendly message (disable backend)
- [ ] Not found shows appropriate message (invalid URL/ID)
- [ ] Empty state shows helpful message (delete all items)

### Loading State Testing
- [ ] Spinner/skeleton shows during data fetch
- [ ] Button disables during form submission
- [ ] No flash of empty content

---

## 5. UI/UX Polish Check

### Visual Consistency
- [ ] Fonts match existing UI
- [ ] Colors use project palette (primary-500, etc.)
- [ ] Spacing is consistent
- [ ] No broken layouts

### Responsiveness
- [ ] Desktop view works (resize browser to 1200px+)
- [ ] Tablet view works (resize to ~768px)
- [ ] Mobile view works (resize to ~375px)

### Accessibility Basics
- [ ] Buttons have visible focus states (tab through)
- [ ] Links are distinguishable
- [ ] Form labels are associated with inputs
- [ ] Error messages are visible (not just red border)

---

## 6. Code Quality Check

### Before Committing

```fish
# Check for linting issues
cd apps/frontend
npm run lint

cd ../backend
# (if lint script exists)
npm run lint
```

### Manual Code Review
- [ ] No `console.log` statements (except intentional logging)
- [ ] No commented-out code blocks
- [ ] No hardcoded test/debug values
- [ ] No TODO comments that should be done
- [ ] Error messages are user-friendly

---

## 7. Final Verification

### Restart Test
Stop everything and restart fresh:

```fish
# Stop all processes (Ctrl+C on dev terminal)

# Restart
npm run dev
```

- [ ] App starts without errors
- [ ] Previously tested functionality still works

### Database State
- [ ] Data persists after restart
- [ ] No orphaned records
- [ ] No corrupted data

---

## Completion Report Template

When claiming work is done, provide this summary:

```markdown
## Work Completed
[Brief description of what was implemented]

## Verification Performed
- [x] Backend tests: PASS (X% coverage)
- [x] Frontend tests: PASS
- [x] No terminal warnings
- [x] No browser console errors
- [x] Manual testing: happy path ✓, error path ✓
- [x] Responsive: desktop ✓, mobile ✓
- [x] Linting: PASS

## Known Issues
[None / List any remaining issues with justification]

## Screenshots/Evidence
[If UI changes, include before/after or key states]
```

---

## Quick Checklist (Copy-Paste)

```markdown
### Verification
- [ ] `npm run backend:test` passes
- [ ] `npm run frontend:test` passes
- [ ] No deprecation/security warnings in terminal
- [ ] No errors in browser console
- [ ] Tested happy path manually
- [ ] Tested error path manually
- [ ] Loading states present
- [ ] Responsive on mobile
- [ ] No console.log in code
- [ ] No commented code
```

---

## When to Skip Steps

**Full verification** (all steps): New features, significant changes

**Quick verification** (tests + console): Bug fixes, small changes

**Never skip**: Running automated tests, checking console for errors
