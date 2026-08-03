---
name: task-sizing
description: Score task complexity across 5 dimensions to determine size category and dispatch strategy. Estimates context-window budget consumption. Provides split heuristics for oversized tasks. Use when sizing a task, deciding dispatch vs direct, decomposing plans, or when user says "size this", "how big is this task", "should I dispatch".
---

# Task Sizing

**Principle:** Assess before acting. Never start work without knowing cost.

## Procedure

### 1. Decompose the Request

Identify: Feature / Fix / Research / Refactor? List discrete operations needed.

### 2. Score Dimensions

| Dimension       | Low (1)      | Medium (2)    | High (3)    |
| --------------- | ------------ | ------------- | ----------- |
| Files to read   | 1-2          | 3-5           | 6+          |
| Files to write  | 1            | 2-3           | 4+          |
| Code volume     | <50 lines    | 50-200 lines  | 200+ lines  |
| Commands to run | 0-1          | 2-4           | 5+          |
| Uncertainty     | Well-defined | Some unknowns | Exploratory |

**Optional modifier — Integration surface (+0 to +3):**

| +0 | Single package/module |
| +1 | 2 packages, same layer |
| +2 | Cross-layer (frontend + backend) |
| +3 | Cross-service + shared packages |

> Modifier informs dispatch strategy but does NOT count toward threshold comparison.

### 3. Categorize

| Base Score (5 dims) | Size   | Action                                   |
| ------------------- | ------ | ---------------------------------------- |
| 1-3                 | Small  | Direct (or dispatch if context precious) |
| 4-8                 | Medium | Dispatch preferred                       |
| 9+                  | Large  | Must dispatch / must split               |

**Threshold contract:** `start-task` splits when score > 8.

### 4. Estimate Context Budget

| Size   | Estimated context consumption |
| ------ | ----------------------------- |
| Small  | ~1-5%                         |
| Medium | ~5-20%                        |
| Large  | >20%                          |

Formula (rough): `(files_read × 2%) + (files_write × 3%) + (commands × 1%)` — cap estimates at empirical ranges above.

### 5. Assess Confidence

| Level  | Criteria                                 |
| ------ | ---------------------------------------- |
| High   | All dimensions certain, no unknowns      |
| Medium | 1-2 dimensions estimated                 |
| Low    | Uncertainty = 3 OR ≥2 dimensions guessed |

Low confidence → re-assess after scout/research phase.

## Output Format

Emit structured YAML block followed by human summary:

```yaml
sizing:
  dimensions:
    files_read: 2
    files_write: 1
    code_volume: 1
    commands: 2
    uncertainty: 1
  integration_modifier: 0
  base_score: 7
  size: Medium
  context_budget: ~8%
  confidence: High
  action: dispatch
  split: null
```

Then one-line summary: `Medium (7) — dispatch preferred, ~8% context`

## Split Heuristics

When score > 8, recommend split strategy:

| Pattern            | When to use                                        | How to split                        |
| ------------------ | -------------------------------------------------- | ----------------------------------- |
| **By layer**       | Cross-layer work (frontend + backend + DB)         | One task per layer                  |
| **By file group**  | Many files, same operation type                    | Batch into 2-4 file groups          |
| **By operation**   | Mixed CRUD (create schema, write logic, add tests) | One task per operation phase        |
| **By uncertainty** | Part well-defined, part exploratory                | Research task → Implementation task |
| **By dependency**  | Independent subtasks exist                         | Parallelize independent parts       |

Split until each sub-task scores ≤ 8. Prefer splits that maximize parallelism.

## Meta-Level Exception

Work on agent infrastructure (`<project-root>/.omo/skills/`, `<project-root>/.omo/plans/`, ADRs, conventions) → bias **direct** regardless of score. This is orchestrator's core responsibility. Still size for awareness but override dispatch recommendation.

## Example

**Request:** "Add retry logic to BigQuery client with exponential backoff"

| Dimension       | Assessment                                     | Score |
| --------------- | ---------------------------------------------- | ----- |
| Files to read   | client, config, types, existing retry patterns | 2     |
| Files to write  | client, tests, types                           | 2     |
| Code volume     | ~120 lines impl + ~80 lines test               | 2     |
| Commands to run | typecheck, test, lint                          | 2     |
| Uncertainty     | Pattern exists in codebase                     | 1     |
| **Base total**  |                                                | **9** |
| Integration     | Single package                                 | +0    |

```yaml
sizing:
  dimensions:
    files_read: 2
    files_write: 2
    code_volume: 2
    commands: 2
    uncertainty: 1
  integration_modifier: 0
  base_score: 9
  size: Large
  context_budget: ~12%
  confidence: High
  action: must-split
  split: by-operation
  split_suggestion:
    - "T1: Implement retry logic in client (score ~5)"
    - "T2: Add tests for retry behavior (score ~4)"
```

`Large (9) — must split → by-operation into impl + tests`

---

## Legacy Heuristics and Quick Reference

# Task Sizing

> **Strategy**: Assessment before action  
> **Purpose**: Decide whether to do directly or dispatch

---

## Trigger

Use this skill:

- Before starting ANY non-trivial task
- When unsure whether to dispatch
- When planning implementation phase

---

## Input

For the task at hand, estimate:

- Number of files to read
- Amount of code to generate
- Number of commands to run
- Whether task is exploratory or well-defined

---

## Procedure

### 1. Ask Sizing Questions

| Question                  | Low Context      | High Context               |
| ------------------------- | ---------------- | -------------------------- |
| How many files to read?   | 1-2              | 5+                         |
| How much code to write?   | <50 lines        | 200+ lines                 |
| How many commands to run? | 1-3              | 10+                        |
| Is it exploratory?        | No, well-defined | Yes, unknown scope         |
| Does it involve media?    | No               | Screenshots, large outputs |

### 2. Apply Heuristics

| Size       | Context Cost | Indicators                                                | Action                |
| ---------- | ------------ | --------------------------------------------------------- | --------------------- |
| **Small**  | ~1-5%        | Single file, quick fix, clarification, config change      | **Do directly**       |
| **Medium** | ~5-20%       | Few files, moderate logic, some research, new feature     | **Consider dispatch** |
| **Large**  | >20%         | Many files, complex logic, deep research, UI verification | **Must dispatch**     |

### 3. Check for Dispatch Triggers

**Always dispatch when:**

- [ ] Task involves screenshots or visual verification → `visual-qa`
- [ ] Task requires reading 5+ files
- [ ] Task involves deep research with many web queries → `Researcher`
- [ ] Task is implementing a large feature (100+ lines)

**Consider dispatch when:**

- [ ] You're already at >40% context
- [ ] Task feels "heavy" or exploratory
- [ ] Multiple unknowns exist

### 4. Make Decision

```
IF task is Small (<5%):
    → Do directly

ELSE IF task is Medium (5-20%):
    → Consider current context level
    → If <40% context: probably do directly
    → If >40% context: probably dispatch

ELSE IF task is Large (>20%):
    → Must dispatch
```

---

## Output

Clear decision:

- **Do directly** — proceed with task
- **Dispatch to [subagent]** — use [dispatch-context](../dispatch-context/SKILL.md)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                    TASK SIZING                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SMALL (<5%)           → Do directly                    │
│  • Single file                                          │
│  • Quick fix                                            │
│  • Config change                                        │
│                                                         │
│  MEDIUM (5-20%)        → Consider dispatch              │
│  • Few files                                            │
│  • Moderate logic                                       │
│  • Some research                                        │
│                                                         │
│  LARGE (>20%)          → Must dispatch                  │
│  • Many files                                           │
│  • Complex logic                                        │
│  • Deep research                                        │
│  • Visual verification                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Current context >40%? Bias toward dispatch.            │
└─────────────────────────────────────────────────────────┘
```

---

## Examples

### Small Task (Do Directly)

> "Fix the typo in the button label"

- 1 file to read
- 1 line to change
- No research needed
- **→ Do directly**

### Medium Task (Consider)

> "Add validation to the form"

- 2-3 files (component, service, tests)
- ~50 lines of code
- Pattern exists in codebase
- **→ Do directly if context <40%, dispatch if >40%**

### Large Task (Must Dispatch)

> "Verify the entire checkout flow looks correct"

- Multiple pages/states
- Screenshots needed
- Visual comparison
- **→ Dispatch to visual-qa**

---

## Anti-patterns

- ❌ Not assessing before starting (jumping in)
- ❌ Doing large tasks directly ("I can handle it")
- ❌ Dispatching trivial tasks (overhead not worth it)
- ❌ Ignoring current context level

---

## Related Skills

- [dispatch-context](../dispatch-context/SKILL.md) — How to dispatch
- [checkpoint](../../preservation/checkpoint/SKILL.md) — If context is high, journal your trail first
- [stage-handoff](../../preservation/stage-handoff/SKILL.md) — At a stage seam, produce the formal artifact
