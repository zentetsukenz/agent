---
name: plan-review
description: Adversarial review of implementation plans. Validates assumptions against actual codebase, finds gaps, risks, and incorrect references. Use when user asks to review, critique, or validate a plan file.
---
# Plan Review

## Trigger

User asks to "review plan", "critique plan", "validate plan", or "act as adversarial reviewer."

## Process

### 1. Load the plan

Read the plan file. If it references a PRD, load that too.

### 2. Verify file references

For every file the plan mentions (modify or create):

- Confirm it exists (or parent dir exists for new files)
- Read relevant sections to validate assumptions about current structure
- Check types, interfaces, function signatures match what plan claims

### 3. Verify integration points

For each cross-boundary interaction:

- Type contracts (does the type actually have the field the plan assumes?)
- Import paths (do they resolve?)
- API shapes (does the hook/function return what the plan expects?)
- Framework patterns (does the plan match how the codebase actually uses Formik, Zod, etc.?)

### 4. Check for implicit assumptions

Look for things the plan assumes without stating:

- Database migrations needed?
- API contract changes requiring client regeneration?
- Backward compatibility with existing saved data?
- Missing error paths or edge cases?

### 5. Classify findings

Rate each issue:

- 🔴 **Critical** — Will cause runtime failure, data loss, or blocks implementation
- 🟠 **Significant** — Wrong approach, will require rework mid-implementation
- 🟡 **Minor** — Under-specified but solvable by implementer
- ⚪ **Nit** — Style, naming, or organizational preference

### 6. Deliver verdict

Structure output as:

```
## Verdict: [PASS | PASS WITH CONDITIONS | REVISE | REJECT]

### Critical Issues
[list or "None"]

### Significant Issues  
[list or "None"]

### Minor Issues
[list or "None"]

### What the plan gets right
[acknowledge strengths — be fair, not just destructive]
```

## Principles

- **Verify, don't trust.** Read actual source files. Plans lie; code doesn't.
- **Be ruthless but reasonable.** Flag real problems, not hypothetical ones.
- **Specificity over vagueness.** "Line 42 of X.ts shows Y, but plan assumes Z" > "might not work."
- **Acknowledge strengths.** Good plans deserve credit for what they get right.
- **Don't rewrite the plan.** Point out problems. Let the author fix them.
- **Context-efficient.** Read targeted line ranges, not entire files. Index large outputs.

## Anti-patterns (don't do these)

- Rubber-stamping without reading source files
- Nitpicking style when architecture is wrong
- Rewriting the plan for the user
- Reviewing without loading the referenced PRD
- Giving verdict without checking at least 3 file references from the plan
