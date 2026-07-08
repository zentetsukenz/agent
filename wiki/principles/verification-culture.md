---
type: Principle
title: Verification Culture
description: Verify before claiming done
tags: [quality, discipline, verification]
timestamp: 2026-01-07T00:00:00Z
---

# Verification Culture

Claiming work is complete without verification is dishonesty, not efficiency.

## Core Principle

**"I added the code" is not done. "I ran it and saw expected output" is done.**

Verification is not optional. It's the difference between "I think it works" and "I know it works."

## Levels of Verification

### Level 1: Syntax & Type Checking

**What**: Code compiles, no type errors, linter passes.

**How**:
```bash
lsp_diagnostics(filePath: "src/")
npm run lint
npm run type-check
```

**Gate**: Zero errors. Warnings are OK if intentional.

### Level 2: Unit Tests

**What**: Individual functions behave correctly.

**How**:
```bash
npm test -- --testPathPattern="auth.test.ts"
```

**Gate**: All tests pass. New code has tests.

### Level 3: Integration Tests

**What**: Components work together correctly.

**How**:
```bash
npm run test:integration
```

**Gate**: All tests pass. Happy path + error paths.

### Level 4: Manual Verification

**What**: You actually use the feature.

**How**:
- Start dev server
- Perform the action
- See expected output
- Check database/logs
- Try error cases

**Gate**: Works as described. No surprises.

### Level 5: Regression Testing

**What**: You didn't break anything else.

**How**:
```bash
npm test  # Full suite
npm run build  # Full build
```

**Gate**: All tests pass. Build succeeds.

---

## Verification Checklist

Before marking work "done":

- [ ] Code compiles / no type errors
- [ ] Linter passes
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual verification done (you used it)
- [ ] Full test suite passes
- [ ] Build succeeds
- [ ] No console.log or debug code left
- [ ] Error cases tested
- [ ] Documentation updated

---

## Common Shortcuts (Don't Take Them)

| Shortcut | Why It Fails |
|----------|-------------|
| "Tests pass locally" | Different environment, different result |
| "I reviewed the code" | Code review ≠ verification |
| "It compiled" | Compiles ≠ works |
| "I tested the happy path" | Error cases matter more |
| "I'll test it later" | Later never comes |

---

## Verification Patterns

### Pattern: Test-Driven Development

1. Write test (red)
2. Write code (green)
3. Refactor (refactor)
4. Verify full suite passes

### Pattern: Manual Verification Script

```bash
#!/bin/bash
set -e

echo "1. Type check..."
npm run type-check

echo "2. Lint..."
npm run lint

echo "3. Unit tests..."
npm test

echo "4. Integration tests..."
npm run test:integration

echo "5. Build..."
npm run build

echo "✓ All verifications passed"
```

### Pattern: Staged Rollout

1. Verify locally
2. Verify in staging
3. Verify in production (canary)
4. Full rollout

---

## When Verification Fails

If verification catches a bug:

1. **Don't hide it** — Report it
2. **Don't skip it** — Fix it
3. **Don't blame the test** — The test is right; the code is wrong
4. **Add a test** — Prevent regression

---

## See Also

- `mem:rpi` — Research → Plan → Implement workflow
- `mem:wisdom` — "Verify before claiming done"
