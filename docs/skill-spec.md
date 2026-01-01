# Skill Specification

> **Type**: Knowledge (specification)  
> **Purpose**: How to create and structure skill files

---

## Overview

Skills are reusable procedures that agents invoke when specific conditions arise. They capture:

- **When** to use the skill (triggers)
- **How** to perform the procedure (steps)
- **Why** each step matters (embedded judgment)

---

## File Location

```
SKILLS/[skill-name].md          # Project-level skills
.github/skills/[category]/[skill-name]/SKILL.md  # Repository skills
```

Examples:

- `SKILLS/verification.md`
- `SKILLS/checkpoint.md`
- `.github/skills/testing/playwright-verification/SKILL.md`

---

## File Structure

### Frontmatter (Optional but Recommended)

```yaml
---
name: skill-name
description: "What it does AND when to use it"
---
```

**Description is critical**: The description triggers skill usage. Make it comprehensive enough that agents know when to apply the skill.

### Required Sections

```markdown
# Skill Name

> Brief purpose statement

---

## Trigger

When to use this skill. Conditions that should invoke it.

## Input

What information is needed before starting.

## Procedure

Step-by-step process with decision points.

## Output

What the skill produces. Expected format.
```

### Optional Sections

```markdown
## Examples

Input/output pairs showing the skill in action.

## Anti-patterns

Common mistakes to avoid.

## Related Skills

Links to skills that compose with this one.
```

---

## Design Principles

### Description Triggers, Body Instructs

The skill's **description** determines when it's used. The **body** determines how.

Good description:

```yaml
description: "Verify implementation is complete. Use after ANY change, before marking task complete, before saying 'done'."
```

Weak description:

```yaml
description: "Verification skill"
```

### Embed Judgment, Not Just Steps

Skills capture **judgment patterns**, not just procedures.

✅ With judgment:

```markdown
### 1. Functional Verification

**Run it and see it work.**

Not:
- "I added the code"
- "It should work"

But:
- "I ran it and saw [expected output]"
- "The test passed with [result]"

Why: "I added the code" is the #1 false completion signal.
```

❌ Without judgment:

```markdown
### 1. Run tests

Run `npm test`.
```

### Examples Over Instructions

**Show input/output pairs.** Concrete examples teach better than abstract rules.

```markdown
## Examples

### Example: Backend API change

**Situation**: Added new endpoint `/api/users/:id`

**Verification steps**:
1. `npm run lint` — passed
2. `npm run test` — 42 tests passed  
3. `curl localhost:3000/api/users/1` — returned user JSON
4. `curl localhost:3000/api/users/999` — returned 404

**Output**: "Verified: endpoint works for valid ID, returns 404 for invalid"
```

### Compose from Primitives

Complex skills should compose from simpler ones.

```markdown
## Procedure

### 1. Code Quality (see: SKILLS/lint-check.md)
- [ ] Lint passes
- [ ] Types check

### 2. Functional (see: SKILLS/manual-test.md)  
- [ ] Feature works as specified
- [ ] Edge cases handled

### 3. Visual (if UI changes)
- [ ] Dispatch to visual-qa subagent
```

---

## Size Guidelines

| Section | Target Lines | Purpose |
|---------|--------------|---------|
| Trigger | 5-15 | When to use |
| Input | 5-10 | What's needed |
| Procedure | 30-80 | Core steps |
| Examples | 20-40 | Concrete demonstrations |
| **Total** | **60-150** | Focused, single-purpose |

**Principle**: Skills should be loadable alongside agent context and working code. If a skill exceeds 200 lines, split into multiple skills or externalize details to `references/`.

---

## Skill Directory Structure

For complex skills with supporting resources:

```
skill-name/
├── SKILL.md        # Core procedure (required)
├── scripts/        # Executable code
│   └── verify.sh
├── references/     # Detailed documentation
│   └── edge-cases.md
└── assets/         # Templates, files
    └── template.md
```

**Progressive disclosure**: Core in SKILL.md, details in references/. Agents load SKILL.md first, drill into references/ only if needed.

---

## Example: Minimal Skill

```markdown
# Quick Lint Check

> Fast code quality verification

---

## Trigger

Use before committing code or after any file edit.

## Input

- [ ] Files that were modified
- [ ] Project has lint script (`npm run lint` or equivalent)

## Procedure

1. Run lint: `npm run lint`
2. If passes → done
3. If fails → fix issues, re-run
4. Max 3 attempts, then escalate

## Output

"Lint passed" or "Lint failed: [specific errors]"
```

---

## Example: Full Skill

```markdown
---
name: verification
description: "Verify implementation is complete. Use after ANY change, before marking task complete."
---

# Verification

> Trust but verify. Nothing is done until confirmed working.

---

## Trigger

Use this skill:
- After implementing ANY change
- Before marking a task complete
- Before saying "done" to human

## Input

- [ ] What was the expected outcome?
- [ ] How can I observe that it works?
- [ ] What tests exist?
- [ ] What could go wrong?

## Procedure

### 1. Functional Verification

**Run it and see it work.**

Not:
- "I added the code"
- "It should work"

But:
- "I ran it and saw [expected output]"
- "The test passed with [result]"

### 2. Code Quality

- [ ] Lint passes
- [ ] Types check (if typed language)
- [ ] No debug code left

### 3. Tests

- [ ] Existing tests pass
- [ ] New tests for new code

### 4. Document Evidence

```markdown
## Verification
- [x] `npm run lint` — passed
- [x] `npm run test` — 42 tests passed
- [x] Manual: created user, saw dashboard
```

## Output

Verification summary with evidence, or blocker description if failed.

## Anti-patterns

- ❌ Skipping verification "because it's a small change"
- ❌ Claiming done without running the code
- ❌ Infinite retry without escalation

```

---

## Anti-patterns

### ❌ Procedure Without Trigger

If agents don't know WHEN to use a skill, they won't use it.

### ❌ Steps Without Judgment

"Run npm test" is a command, not a skill. Add the WHY and WHEN.

### ❌ Monolithic Skills

A 500-line skill trying to cover everything. Split into composable parts.

### ❌ Abstract Instructions Only

No examples = agents guess at application. Show concrete input/output.

### ❌ No Output Definition

If the skill doesn't define what it produces, agents improvise inconsistently.
