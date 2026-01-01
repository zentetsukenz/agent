# Verification

> **Strategy**: Trust but verify  
> **Purpose**: Confirm work is actually done before claiming done

---

## Trigger

Use this skill:

- After implementing ANY change
- Before marking a task complete
- Before saying "done" to human

**The Golden Rule:**
> "If not sure, verify. If can't verify, ask. Never claim 'done' when it's not."

---

## Input

For the change made:

- [ ] What was the expected outcome?
- [ ] How can I observe that it works?
- [ ] What tests exist?
- [ ] What could go wrong?

---

## Procedure

### 1. Pre-Verification Setup

Ensure the application is running before checking anything:

```fish
# Check servers are accessible
curl -s http://localhost:3001/api/health  # Backend
curl -s http://localhost:5173 | head -5    # Frontend
```

If not running, use [server-operations.md](server-operations.md) first.

### 2. Functional Verification

**Run it and see it work.**

Not:

- "I added the code"
- "It should work"
- "The syntax looks right"

But:

- "I ran it and saw [expected output]"
- "The test passed with [result]"
- "The UI shows [expected state]"

### 3. Automated Tests

```fish
# Run all tests
npm run test

# Or project-specific
npm run backend:test   # Backend with coverage
npm run frontend:test  # Frontend tests
```

Check for:

- [ ] All tests pass (no red)
- [ ] Coverage meets threshold (if applicable)
- [ ] No skipped tests that should be running

### 4. Terminal Warnings

While tests run, watch for:

- [ ] No deprecation warnings
- [ ] No security warnings
- [ ] No unhandled promise rejections

### 5. Code Quality

```fish
npm run lint
```

- [ ] Linting passes
- [ ] Types check (if TypeScript)
- [ ] No debug code left (console.log, debugger, TODO)
- [ ] Code follows project patterns

### 6. Manual Testing

#### Happy Path

- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] Forms submit successfully
- [ ] Success feedback appears
- [ ] Data persists (refresh and verify)

#### Error Path

- [ ] Invalid input shows validation message
- [ ] Network error shows user-friendly message
- [ ] Not found shows appropriate message
- [ ] Empty state shows helpful message

#### Loading States

- [ ] Spinner/skeleton shows during fetch
- [ ] Button disables during submission
- [ ] No flash of empty content

### 7. Visual Verification (if UI changes)

- [ ] UI matches expectation
- [ ] Responsive behavior correct
- [ ] No visual regressions

**For thorough visual verification → dispatch to `visual-qa` subagent**

See [visual-verification.md](visual-verification.md)

### 8. Browser Console Check (if frontend)

If runtime errors suspected:

- [ ] No red errors in console
- [ ] No React warnings
- [ ] No failed network requests

**For debugging → dispatch to `browser-console-debugger` subagent**

See [browser-console-debugging.md](browser-console-debugging.md)

### 9. Integration Check

- [ ] Works with rest of system
- [ ] No regressions in related features
- [ ] Database migrations applied (if any)

### 10. Document Evidence

Record what you verified:

```markdown
## Verification
- [x] `npm run lint` — passed
- [x] `npm run test` — 42 tests passed
- [x] Manual test: created user, logged in, saw dashboard
- [x] Edge case: empty state shows correct message
```

---

## Output

- Verified, working code
- Evidence of verification
- Confident "done" status

---

## Completion Report Template

```markdown
✅ Task complete and verified

**What was done:**
[Brief description]

**Verification:**
- [Evidence 1]
- [Evidence 2]

**Files changed:**
- [file1](path1)
- [file2](path2)
```

---

## Failure Protocol

When verification fails:

```
Attempt 1: Try the obvious fix
    ↓
Attempt 2: Step back, try different approach
    ↓
Attempt 3: Escalate to human
```

### Escalation Template

```markdown
🚨 BLOCKED: [Task description]

**What was tried:**
1. [Approach 1]: [Why it failed]
2. [Approach 2]: [Why it failed]
3. [Approach 3]: [Why it failed]

**What help is needed:**
[Specific question or guidance needed]
```

**Never:**

- Infinite retry loops
- Skip verification
- Claim "done" without verification
- Hide failures

---

## Quick Checklist

```
Before saying "done":

□ Did I run it?
□ Did I see the expected result?
□ Do tests pass?
□ Did I check for regressions?
□ Can I show evidence?

If any answer is "no" → not done yet
```

---

## Verification Dimensions

| Dimension | How to Verify | When Required |
|-----------|---------------|---------------|
| **Functional** | Run it, see it work | Always |
| **Structural** | Lint, type check | Always |
| **Test** | Run test suite | When tests exist |
| **Visual** | visual-qa subagent | UI changes |
| **Console** | browser-console-debugger | Runtime errors |
| **Performance** | Load test, profiling | When relevant |

---

## Anti-patterns

- ❌ "It should work" (verify, don't assume)
- ❌ "Tests are written" (run them!)
- ❌ "I think I fixed it" (confirm the fix)
- ❌ Skipping edge cases
- ❌ Not checking for regressions
- ❌ Claiming done to move on faster
- ❌ Skipping verification "because it's a small change"

---

## Related Skills

- [checkpoint.md](checkpoint.md) — Checkpoint after verified completion
- [task-sizing.md](task-sizing.md) — Large verification → dispatch
- [visual-verification.md](visual-verification.md) — UI verification via subagent
- [browser-console-debugging.md](browser-console-debugging.md) — Debug frontend errors
- [server-operations.md](server-operations.md) — Ensure servers are running
