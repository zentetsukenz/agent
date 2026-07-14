---
type: Pattern
title: SDLC — Planning Phase
description: Policy governing how the Planning phase performs — decompose an understood problem into a risk-ordered, right-sized, architecture-first executable plan
---

# Planning Phase

> **Bucket:** `planning/` · **Position:** 2 of 5 · **Follows:** [Discovery](discovery.md) · **Precedes:** [Implementation](implementation.md)

## 1. Intent

Turn an understood problem into a decomposed, risk-ordered, executable plan whose tasks
are self-contained and individually dispatchable.

## 2. Gates

**Entry gate**
- Discovery's exit artifacts exist: problem, constraints, and testable success criteria.

**Exit gate**
- Work is decomposed into right-sized tasks with explicit dependencies.
- Each task carries its own verification/acceptance criteria.
- High-risk items are sequenced first.
- The **Architecture Gate** (below) is satisfied.
- The **Output-Plan Policy** (below) is met.

## 3. Recommended skills

1. [improve-codebase-architecture](../../SKILLS/discovery/improve-codebase-architecture/SKILL.md) — referenced cross-bucket; **mandatory for architectural work** to confirm whether an ADR/architecture change is required.
2. [domain-model](../../SKILLS/planning/domain-model/SKILL.md) — establish the canonical language and high-level model.
3. [design-an-interface](../../SKILLS/planning/design-an-interface/SKILL.md) — design contracts / UX so they can be validated early.
4. [task-sizing](../../SKILLS/planning/task-sizing/SKILL.md) — gauge size and break work down (the gatekeeper for the Output-Plan Policy).
5. [triage](../../SKILLS/planning/triage/SKILL.md) — order by risk and priority.
6. [to-issues](../../SKILLS/planning/to-issues/SKILL.md) — emit discrete, zero-question task documents.
7. [dispatch-context](../../SKILLS/planning/dispatch-context/SKILL.md) — prepare delegation bundles for sub-agents.

## 4. Agent-effort policy

- **Sizing and breaking down = high-judgment → higher-intelligence agent.** Proper
  decomposition is the crux; `task-sizing` is central here.
- **Writing up the plan = mechanical → small agent.** Once decomposition decisions are made,
  producing the task documents is delegable.

## Output-Plan Policy

A plan is well-formed only when **~80% of its resulting tasks are delegatable to a small
agent to execute**, with the remaining ~20% flagged as needing a higher-intelligence
agent. `task-sizing` is the gatekeeper: it ensures tasks are sized and split so the plan
meets this shape. This is a constraint on the *plan output*, not merely an effort split.

## High-level Domain Model (mandatory)

Planning **must** provide a high-level domain model so each sub-task knows which part of
the system it touches and understands the big picture. Provide a **link** to an existing
domain-model document. **If none exists, create a proper one as part of project
initialization.** Use [domain-model](../../SKILLS/planning/domain-model/SKILL.md).

## Architecture Gate (mandatory for complex work)

Per [architecture-first](../../wiki/principles/architecture-first.md):

- The plan **must cite** the relevant System Design Architecture documents / ADRs
  (`wiki/adr/`).
- If any decision rests on an **unknown**, require research or a spike (from
  [Discovery](discovery.md)) *before* the decision drives the plan.
- If an **architecture upgrade or constitutional update** is needed, sequence it as the
  **first, blocking task(s)** — it lands *before* any code that depends on it, never
  retrofitted after.
- **Complexity-scaled:** this gate binds for genuinely complex/architectural work. Trivial
  localized fixes (e.g. a one-function bugfix) are exempt — the sizing scorecard's
  *uncertainty* dimension plus architectural blast radius is the trigger.

## 5. Shift-left obligation

- Every task carries its acceptance/verification criteria **with it** — verification is
  planned per-task, not deferred.
- Interface/contract design happens now, so it can be validated early.
- **Documentation is planned explicitly:** the plan must incorporate documentation tasks
  (not an afterthought).

## 6. Artifacts

- A linked/created high-level domain model (glossary update as needed).
- Interface designs.
- A risk-ordered set of right-sized tasks, each with acceptance criteria and explicit
  dependencies.
- Dispatch-ready context bundles.
- A dependency graph identifying critical-path and parallel-safe tasks.

---

## Operational DNA — task decomposition

Execute these six passes sequentially. Halt if the plan cannot pass the validation gate.

### Pass 1 — Comprehension

Read the plan/problem end-to-end. Extract goal (one sentence), scope, constraints
(non-negotiables), and implied knowledge. Hold these as invariants for all later passes.

### Pass 2 — Validation Gate

Grill the plan: does every task have a single clear objective? Are success criteria
measurable (a runnable command, not "works correctly")? Are dependencies explicit? Any
dangling references? Any scope beyond what the plan claims? **If any check fails → STOP
and output the gaps. Do not decompose.**

### Pass 3 — Decomposition & Sizing

Score each logical unit of work across five dimensions:

| Dimension | 1 (Low) | 2 (Medium) | 3 (High) |
|---|---|---|---|
| Files to read | 1–2 | 3–5 | 6+ |
| Files to write | 1 | 2–3 | 4+ |
| Code volume | <50 lines | 50–200 lines | 200+ lines |
| Commands to run | 0–1 | 2–4 | 5+ |
| Uncertainty | Well-defined | Some unknowns | Exploratory |

Sum → base score (5–15). **Score ≤ 8 → keep as a single task. Score > 8 → must split**
(by layer, by operation phase, by uncertainty, or by dependency) until every sub-task
scores ≤ 8. The *uncertainty* dimension also triggers the Architecture Gate.

### Pass 4 — Dependency Graph & Parallelism

Identify which tasks produce outputs others consume. Mark critical-path tasks and
parallel-safe pairs. For parallel tasks with soft dependencies, define **interface
contracts** so both can proceed independently.

### Pass 5 — Task Document Generation

Produce a self-contained document per task: objective, why/context, prerequisites,
dependency-graph position, exemplars (real files), context to load, files to modify,
steps, guardrails, decision authority + escape hatches, and verification commands. Every
field filled — no "TBD".

### Pass 6 — Self-Critique

Review every document against the **Zero-Question Test**: could a competent agent execute
this without asking anything? Also check exemplar, guardrail, verification, authority, and
context tests. Fix inline; never output a document that fails.

## Related

- [Discovery](discovery.md) — supplies the success criteria and architecture findings.
- [Implementation](implementation.md) — consumes the task documents produced here.
- [architecture-first](../../wiki/principles/architecture-first.md) — the principle behind the Architecture Gate.
</content>
