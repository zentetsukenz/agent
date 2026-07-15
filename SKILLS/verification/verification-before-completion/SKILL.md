---
name: verification-before-completion
description: Require fresh evidence before any completion, success, or positive work-state claim. Merge of verification checklist, iron-law completion gate, and adversarial verify-task phases for functional, structural, test, UI, console, regression, gap, and failure verification.
---

# Verification Before Completion

> **Strategy**: Trust but verify  
> **Purpose**: Confirm work is actually done before claiming done

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**The Golden Rule:**

> "If not sure, verify. If can't verify, ask. Never claim 'done' when it's not."

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## Trigger

Use this skill:

- After implementing ANY change
- Before marking a task complete
- Before saying "done" to human
- Before ANY variation of success/completion claims
- Before ANY expression of satisfaction
- Before ANY positive statement about work state
- Before committing, PR creation, moving to next task, or trusting an agent report
- When user says "verify task", "QA this", "check my work", or "validate completion"

Rule applies to exact phrases, paraphrases and synonyms, implications of success, and ANY communication suggesting completion/correctness.

## Input

For the change made:

- [ ] What was the expected outcome?
- [ ] How can I observe that it works?
- [ ] What tests exist?
- [ ] What could go wrong?
- [ ] What command proves this claim?
- [ ] What are the success criteria, line-by-line?

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Procedure

### Phase 0: Pre-conditions

Ensure the application is running before checking anything.

Source environment-specific server coordinates when present. Never hardcode ports if `.qa-witness.env` or project docs provide them.

```bash
set -a; source .qa-witness.env; set +a
BASE_URL="${HOST}:${PORT}"
```

Legacy health-check pattern:

```fish
# Check servers are accessible
curl -s http://localhost:3001/api/health  # Backend
curl -s http://localhost:5173 | head -5    # Frontend
```

If not running, use server-operations first. Not met → ask human. **Never skip.**

### Phase 1: Functional Verification

**Run it and see it work.**

Not:

- "I added the code"
- "It should work"
- "The syntax looks right"

But:

- "I ran it and saw [expected output]"
- "The test passed with [result]"
- "The UI shows [expected state]"

### Phase 2: Structural Verification

```fish
npm run lint
```

Project-specific examples:

```bash
pnpm --filter <affected> typecheck 2>&1 | tail -20
pnpm --filter <affected> lint 2>&1 | tail -20
```

- [ ] Linting passes
- [ ] Types check (if TypeScript)
- [ ] No debug code left (console.log, debugger, TODO)
- [ ] Code follows project patterns

Fail = stop immediately.

### Phase 3: Automated Tests

```fish
# Run all tests
npm run test

# Or project-specific
npm run backend:test   # Backend with coverage
npm run frontend:test  # Frontend tests
```

Targeted first, then broader:

```bash
pnpm --filter <affected> test <file> 2>&1 | tail -30
```

Check for:

- [ ] All tests pass (no red)
- [ ] Coverage meets threshold (if applicable)
- [ ] No skipped tests that should be running

#### Terminal Warnings

While tests run, watch for:

- [ ] No deprecation warnings
- [ ] No security warnings
- [ ] No unhandled promise rejections

Regression tests (TDD Red-Green):

```
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

### Phase 4: Success Criteria (adversarial)

Implementation is guilty until proven innocent. Find what's broken, missed, or fragile.

1. Re-read plan → Create checklist → Verify each → Report gaps or completion
2. Stated criteria = minimum, not maximum
3. Attack: what input/state breaks this?
4. Score confidence: pass ≠ correct

When criterion requires "logic handles X":

1. Read the specific function
2. Verify branches exist for the case
3. Check error handling present
4. Rate confidence: does the logic _actually_ handle it, or just _appear_ to?

### Phase 5: Manual Testing

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

#### Boundary Probing

Test at the edges of valid input:

| Boundary      | What to try                                |
| ------------- | ------------------------------------------ |
| Empty         | `""`, `[]`, `{}`, `null`, `undefined`      |
| Max length    | String at limit, array at limit            |
| Negative      | `-1`, negative amounts, negative indices   |
| Zero          | `0`, empty collections, zero-length        |
| Overflow      | Integer overflow, huge payloads            |
| Special chars | `<script>`, `'`, `"`, `\n`, unicode, emoji |

### Phase 6: Visual Verification (if UI changes)

- [ ] UI matches expectation
- [ ] Responsive behavior correct
- [ ] No visual regressions

**For thorough visual verification → dispatch to an isolated capture mechanism** (e.g. the
`visual-qa` subagent) so screenshot bytes never enter this context.

See [visual-verification](../visual-verification/SKILL.md).

### Phase 7: Frontend Runtime Check (if frontend)

If runtime errors suspected:

- [ ] No red errors in the console
- [ ] No framework warnings (keys, hydration, deprecations)
- [ ] No failed network requests

**For debugging → [frontend-runtime-debugging](../../implementation/frontend-runtime-debugging/SKILL.md)** — classify the symptom, capture structured evidence, apply per-class fixes.

### Phase 8: Integration, E2E, and Regression

- [ ] Works with rest of system
- [ ] No regressions in related features
- [ ] Database migrations applied (if any)

Run existing Playwright specs when task touches:

- UI components (forms, modals, tables)
- User flows (CRUD, state transitions)
- Navigation/routing changes
- API endpoints consumed by frontend

Regression = full test suite on affected packages. Catch collateral damage.

### Phase 9: Gap Analysis

Missing e2e for UI/core flows → report gap + assertions. Missing unit tests → flag. Flaky tests → document.

Rate each verified criterion:

| Score      | Meaning                                          | When to use                                                                |
| ---------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| **HIGH**   | Proven correct via automated test + logic review | Test passes AND logic is sound                                             |
| **MEDIUM** | Passes checks but has caveats                    | Test passes but edge cases unclear, or logic review shows potential issues |
| **LOW**    | Cannot fully verify                              | No test exists, or verification is indirect/circumstantial                 |

A task with any LOW-confidence criteria should flag it in the report even if "passing."

### Phase 10: Document Evidence

Record what you verified:

```markdown
## Verification

- [x] `npm run lint` — passed
- [x] `npm run test` — 42 tests passed
- [x] Manual test: created user, logged in, saw dashboard
- [x] Edge case: empty state shows correct message
```

Large outputs stay out of context:

- Always `| tail -N` / `| head -N` / `grep <pattern>`
- Never dump full output into context
- Save large outputs: `command 2>&1 > <project-root>/.omo/evidence/<task>/output.log`

## Common Failures

| Claim                 | Requires                        | Not Sufficient                 |
| --------------------- | ------------------------------- | ------------------------------ |
| Tests pass            | Test command output: 0 failures | Previous run, "should pass"    |
| Linter clean          | Linter output: 0 errors         | Partial check, extrapolation   |
| Build succeeds        | Build command: exit 0           | Linter passing, logs look good |
| Bug fixed             | Test original symptom: passes   | Code changed, assumed fixed    |
| Regression test works | Red-green cycle verified        | Test passes once               |
| Agent completed       | VCS diff shows changes          | Agent reports "success"        |
| Requirements met      | Line-by-line checklist          | Tests passing                  |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse                                  | Reality                |
| --------------------------------------- | ---------------------- |
| "Should work now"                       | RUN the verification   |
| "I'm confident"                         | Confidence ≠ evidence  |
| "Just this once"                        | No exceptions          |
| "Linter passed"                         | Linter ≠ compiler      |
| "Agent said success"                    | Verify independently   |
| "I'm tired"                             | Exhaustion ≠ excuse    |
| "Partial check is enough"               | Partial proves nothing |
| "Different words so rule doesn't apply" | Spirit over letter     |

## Failure Protocol

ANY phase fails → **STOP** → produce failure handoff. Don't waste context on later phases.

```
Attempt 1: Try the obvious fix
    ↓
Attempt 2: Step back, try different approach
    ↓
Attempt 3: Escalate to human
```

When verification fails, don't just report "FAILED." Investigate like an elite QE.

### Failure Forensics

1. **Isolate** — narrow down the failure to the smallest scope.
2. **Minimize** — strip to the smallest reproduction. Record the exact command.
3. **Classify** — compilation error, test assertion, runtime error, timeout, flaky, environment.
4. **Root Cause (brief)** — best hypothesis, supporting evidence, what to check first.
5. **Impact Assessment** — blocker, minor issue, edge case, or unrelated/pre-existing.

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

### Verification Failure Handoff Template

```markdown
# Verification Failure: <Task Name>

**Status**: ❌ FAILED at Phase <N>: <phase name>

## Summary

<1-2 sentences: what's broken>

## Reproduction

<exact command to see the failure>

## Evidence

<truncated output — just the relevant error, 10-20 lines max>

## Analysis

- **Root cause hypothesis**: <your best guess>
- **Confidence**: HIGH/MEDIUM/LOW
- **Impact**: blocker / minor / edge-case

## Context for Fix

- Files involved: <list with brief reason>
- Related code: <key functions/modules>
- What was verified before failure: <phases that passed>

## Suggested Fix Direction

1. <Most likely fix>
2. <Alternative approach>
3. <What to check if above don't work>

## Re-verification Command

<exact command to confirm fix works>
```

**Never:**

- Infinite retry loops
- Skip verification
- Claim "done" without verification
- Hide failures
- Write code fixes while acting as read-only QE

## Output

- Verified, working code
- Evidence of verification
- Confident "done" status

### Completion Report Template

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

### Verification Report Template

```markdown
# Verification Report: <Task Name>

**Status**: ✅ ALL PHASES PASSED

## Phase Results

| Phase               | Status                     | Duration |
| ------------------- | -------------------------- | -------- |
| 0. Pre-conditions   | ✅                         | -        |
| 1. Structural       | ✅                         | <time>   |
| 2. Unit/Integration | ✅                         | <time>   |
| 3. Success Criteria | ✅                         | <time>   |
| 4. E2E              | ✅ / ⏭️ N/A                | <time>   |
| 5. Regression       | ✅                         | <time>   |
| 6. Exploratory      | ✅ / ⏭️ skipped (low-risk) | <time>   |

## Success Criteria Verification

| #   | Criterion     | Method   | Confidence   | Result |
| --- | ------------- | -------- | ------------ | ------ |
| 1   | <description> | <method> | HIGH/MED/LOW | ✅     |

## Gap Analysis

- (or "No significant gaps identified")

## Confidence Summary

- Overall confidence: HIGH/MEDIUM/LOW
- Caveats: <anything suspicious even though passing>
```

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

## Verification Dimensions

| Dimension            | How to Verify                                   | When Required                          |
| -------------------- | ----------------------------------------------- | -------------------------------------- |
| **Functional**       | Run it, see it work                             | Always                                 |
| **Structural**       | Lint, type check                                | Always                                 |
| **Test**             | Run test suite                                  | When tests exist                       |
| **Visual**           | Isolated capture mechanism (visual-qa subagent) | UI changes                             |
| **Frontend runtime** | frontend-runtime-debugging skill                | Console/network/rendering/state errors |
| **Performance**      | Load test, profiling                            | When relevant                          |

## Anti-patterns

- ❌ "It should work" (verify, don't assume)
- ❌ "Tests are written" (run them!)
- ❌ "I think I fixed it" (confirm the fix)
- ❌ Skipping edge cases
- ❌ Not checking for regressions
- ❌ Claiming done to move on faster
- ❌ Skipping verification "because it's a small change"

## Related Skills

- [visual-verification](../visual-verification/SKILL.md) — Frontend UI/UX verification via an isolated capture mechanism
- [frontend-runtime-debugging](../../implementation/frontend-runtime-debugging/SKILL.md) — Debug frontend runtime failures
- [qa-witness-protocol](../qa-witness-protocol/SKILL.md) — Behavioral QA witness workflow
- [server-operations](../../implementation/server-operations/SKILL.md) — Start/verify servers before checking
