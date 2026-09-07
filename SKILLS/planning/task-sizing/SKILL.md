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
| 5-6                 | Small  | Direct (or dispatch if context precious) |
| 7-8                 | Medium | Dispatch preferred                       |
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
  context_budget: ~9%
  confidence: High
  action: dispatch
  split: null
```

Then one-line summary: `Medium (7) — dispatch preferred, ~9% context`

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

Work on agent infrastructure (harness-native skill/agent config, ADRs, conventions) → bias
**direct** regardless of score. This is orchestrator's core responsibility. Still size for
awareness but override dispatch recommendation.

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

## Related Skills

- [dispatch-context](../dispatch-context/SKILL.md) — How to dispatch
- [checkpoint](../../preservation/checkpoint/SKILL.md) — If context is high, journal your trail first
- [stage-handoff](../../preservation/stage-handoff/SKILL.md) — At a stage seam, produce the formal artifact
