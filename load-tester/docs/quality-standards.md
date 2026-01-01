# Load-Tester Quality Standards

**Purpose**: Define what "done" means. Work is NOT done until ALL criteria are met.

---

## Definition of Done

### ✅ Functional Completeness

- [ ] Feature works as specified
- [ ] Edge cases handled (empty states, errors, loading)
- [ ] Data validation on both client and server
- [ ] API returns appropriate status codes (200, 400, 404, etc.)

### ✅ Code Quality

- [ ] No linting errors (`npm run lint` passes)
- [ ] No TypeScript/type errors
- [ ] No console warnings in browser
- [ ] No deprecation warnings in terminal
- [ ] Tests pass with required coverage (80%+ for backend)
- [ ] No `console.log` left in production code
- [ ] No commented-out code blocks
- [ ] No hardcoded test data

### ✅ UI/UX Polish (Frontend Tasks)

- [ ] Loading states shown during async operations
- [ ] Error messages are user-friendly (not technical jargon)
- [ ] Success feedback provided (toast notifications)
- [ ] Responsive layout (works on mobile)
- [ ] Consistent styling with existing UI
- [ ] Empty states have helpful messages
- [ ] Forms have proper validation feedback

### ✅ Self-Verification

- [ ] Actually tested in browser (not just assumed working)
- [ ] Verified on happy path AND error paths
- [ ] Checked browser console for errors/warnings
- [ ] Checked terminal for errors/warnings
- [ ] Read actual files to verify edits succeeded

---

## Communication Standards

### When to Ask vs. Proceed

**ASK when**:

- Requirements are ambiguous
- Multiple valid approaches exist with significant trade-offs
- Work would take more than ~30 minutes and direction is unclear
- Deleting or significantly restructuring existing code
- Adding new dependencies

**PROCEED when**:

- Requirements are clear
- Following established patterns in the codebase
- Implementing standard CRUD operations
- Fixing bugs with obvious solutions
- Adding tests for existing code

---

## Reporting Completion

When claiming work is done, explicitly confirm:

```markdown
✅ Completed: [specific deliverable]

✅ Verification checklist:
- [ ] Functional completeness (feature works, edge cases handled)
- [ ] Code quality (no lint errors, no warnings)
- [ ] UI/UX polish (loading states, error messages, empty states)
- [ ] Self-verification (tested in browser, checked console)

✅ How I verified: [specific actions taken]

✅ Warnings/Issues: [none / list any blockers]
```

---

## Graceful Failure Protocol

If standards criteria cannot be met, explicitly report:

```markdown
⚠️ Cannot meet full standards. Here's the situation:

**Completed criteria**:
- [x] Feature functional
- [x] Tests passing

**Blocked criteria**:
- [ ] Mobile responsive - Blocked because: [specific reason]
- [ ] Loading states - Blocked because: [specific reason]

**Recommendation**: [proceed with partial / wait for resolution / need guidance]
```

**Never** deliver substandard work silently. Explain what's blocked and why.

---

## Knowledge Contribution

When you discover important project information NOT in documentation:

```markdown
📝 **Suggested documentation addition:**

**File**: load-tester/docs/[appropriate-file].md
**Section**: [e.g., "Common Issues" or "Patterns"]

**Content**:
> [Your discovery here]

**Reason**: [Why this would help future sessions]
```

---

## Verification Is Reading, Not Assuming

**DO**: Read actual file to verify changes were applied

```fish
# After editing, verify the change exists
grep -A5 "function myNewFunction" apps/backend/src/features/endpoints/endpoints.service.js
```

**DON'T**: Assume edit tool succeeded without checking

---

## Anti-Patterns to Avoid

### ❌ "It works on my machine"

Always verify in actual running application, not just in tests.

### ❌ "The test passes"

Tests can pass while UX is broken. Manual verification required.

### ❌ "I'll fix the warning later"

Warnings become tech debt. Fix them now or document why they can't be fixed.

### ❌ "Functionally complete"

Functional ≠ Done. Polish and UX matter.

### ❌ Claiming done without checking

Run verification checklist. Every time.

### ❌ Assuming edits succeeded

Read files after editing. Tool failures happen.

---

## Quality Bar Summary

This project aims for **production-ready quality**, not prototype quality.

| Aspect | Prototype | Production (Our Standard) |
|--------|-----------|---------------------------|
| Error handling | Crashes or shows error | Graceful recovery, helpful message |
| Loading states | None / janky | Smooth, consistent feedback |
| Empty states | Blank page | Helpful guidance |
| Validation | Server-side only | Client + server, real-time feedback |
| Mobile | Broken | Responsive |
| Warnings | "Fix later" | Fixed or documented |
| Testing | Manual only | Automated + manual verification |

---

## Progress Updates

For work taking more than a few minutes:

1. **Before starting**: Share what you're about to do
2. **During work**: Share progress at natural checkpoints
3. **After completion**: Share what you completed and any issues found

---

## Standards Application by Task Type

### Backend Tasks

- Focus on: Functional completeness, code quality, error handling
- Verify: API returns correct status codes, database integrity

### Frontend Tasks

- Focus on: Functional completeness, code quality, UI/UX polish
- Verify: Loading states, error messages, responsive design, browser console

### Full-Stack Tasks

- Focus on: All of the above
- Verify: End-to-end flow works, integration points solid

### Testing Tasks

- Focus on: Code quality, coverage requirements
- Verify: Tests pass, coverage meets 80%+ (backend)

---

**Before claiming ANY work is done, review this checklist.**

**Last Updated**: January 1, 2026
