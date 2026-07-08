---
type: Principle
title: Research → Plan → Implement (RPI)
description: Disciplined workflow for complex tasks
tags: [workflow, methodology, execution]
timestamp: 2026-01-07T00:00:00Z
---

# Research → Plan → Implement (RPI)

Disciplined workflow for complex tasks. Three phases, each with clear gates.

## Phase 1: Research

**Goal**: Understand the problem space. Gather facts, not opinions.

**Activities**:
- Explore codebase structure (codegraph, not grep)
- Read existing patterns and conventions
- Check for prior art (similar features, related code)
- Identify constraints (performance, compatibility, security)
- List unknowns and assumptions

**Gate**: Can you answer "what are we building?" and "why does it matter?"

**Tools**:
- `codegraph_explore` — understand architecture
- `ctx_batch_execute` — parallel information gathering
- `ctx_fetch_and_index` — external docs
- `ctx_search` — query indexed knowledge

**Anti-patterns**:
- Skipping research because "I know this already"
- Gathering opinions instead of facts
- Researching implementation details before understanding the problem

---

## Phase 2: Plan

**Goal**: Design the solution. Write it down before coding.

**Activities**:
- Break work into atomic steps (each step: one file, one function, one concept)
- Identify dependencies (what must happen first)
- List decision points (where judgment is needed)
- Estimate effort (rough, not precise)
- Identify risks (what could go wrong)

**Gate**: Can you hand this plan to someone else and they execute it without asking questions?

**Format**:
```markdown
## Step 1: [Atomic task]
- What: [One sentence]
- Why: [Why this step matters]
- How: [Specific actions]
- Verify: [How to know it worked]

## Step 2: [Next atomic task]
...
```

**Anti-patterns**:
- Plans that are too vague ("implement auth")
- Plans that are too detailed (implementation pseudocode)
- Plans that don't account for unknowns
- Plans that skip verification steps

---

## Phase 3: Implement

**Goal**: Execute the plan. One step at a time.

**Activities**:
- Mark step as "in progress"
- Execute the step exactly as planned
- Verify it worked (run tests, check output, etc.)
- Mark step as "completed"
- Move to next step

**Gate**: Every step verified before moving on.

**Tools**:
- `task_create` / `task_update` — track progress
- `lsp_diagnostics` — catch errors early
- Tests — verify behavior
- Manual verification — see it work

**Anti-patterns**:
- Skipping verification ("I'm sure it works")
- Changing the plan mid-execution
- Batching multiple steps before verifying
- Claiming done without testing

---

## When to Use RPI

- **Complex tasks** (5+ steps, multiple files, architecture decisions)
- **Ambiguous scope** ("make it better", "figure out what to build")
- **High-risk work** (security, data integrity, breaking changes)
- **Collaborative work** (need to hand off to someone else)

## When RPI is Overkill

- **Simple fixes** (one-line bug fix, obvious refactor)
- **Routine tasks** (add a field, update a test)
- **Familiar patterns** (you've done this exact thing 10 times)

Even then, a 30-second mental RPI beats no planning.

---

## See Also

- `mem:verification-culture` — Verify before claiming done
- `mem:context-first` — Manage context deliberately
