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

### 1. Functional Verification

**Run it and see it work.**

Not:

- "I added the code"
- "It should work"
- "The syntax looks right"

But:

- "I ran it and saw [expected output]"
- "The test passed with [result]"
- "The UI shows [expected state]"

### 2. Run Through Checklist

#### Code Quality

- [ ] Linting passes (`npm run lint` or equivalent)
- [ ] Types check (if TypeScript/typed language)
- [ ] No debug code left behind (console.log, debugger, TODO)
- [ ] Code follows project patterns

#### Functionality

- [ ] Feature works as specified
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Happy path confirmed

#### Tests

- [ ] Existing tests still pass
- [ ] New tests added for new code
- [ ] Test coverage maintained or improved

#### Visual (if UI changes)

- [ ] UI matches expectation
- [ ] Responsive behavior correct
- [ ] No visual regressions
- [ ] **Consider dispatching to visual-qa**

#### Integration

- [ ] Works with rest of system
- [ ] No regressions in related features
- [ ] Database migrations applied (if any)

### 3. Document Evidence

Record what you verified:

```markdown
## Verification
- [x] `npm run lint` — passed
- [x] `npm run test` — 42 tests passed
- [x] Manual test: created user, logged in, saw dashboard
- [x] Edge case: empty state shows correct message
```

### 4. Report Completion

Only after verification passes:

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

## Output

- Verified, working code
- Evidence of verification
- Confident "done" status

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

**Suggested next steps:**
[What human might do to unblock]
```

**Never:**

- Infinite retry loops
- Skip verification
- Claim "done" without verification
- Hide failures

---

## Verification Dimensions

| Dimension | How to Verify | When Required |
|-----------|---------------|---------------|
| **Functional** | Run it, see it work | Always |
| **Structural** | Lint, type check | Always |
| **Test** | Run test suite | When tests exist |
| **Visual** | Screenshot + analysis | UI changes |
| **Performance** | Load test, profiling | When relevant |
| **Security** | Review for vulnerabilities | When handling auth/data |

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

## Anti-patterns

- ❌ "It should work" (verify, don't assume)
- ❌ "Tests are written" (run them!)
- ❌ "I think I fixed it" (confirm the fix)
- ❌ Skipping edge cases
- ❌ Not checking for regressions
- ❌ Claiming done to move on faster

---

## Related Skills

- [checkpoint.md](checkpoint.md) — Checkpoint after verified completion
- [task-sizing.md](task-sizing.md) — Large verification → dispatch to visual-qa
