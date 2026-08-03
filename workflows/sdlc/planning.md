---
type: Pattern
title: SDLC — Planning Phase
description: Policy governing how the Planning phase performs — decompose an understood problem into a risk-ordered, right-sized, architecture-first executable plan
---

# Planning Phase

> **Bucket:** `planning/` · **Position:** 3 of 6 · **Stage:** Delivery · **Follows:** [Design](design.md) · **Precedes:** [Implementation](implementation.md)

## 1. Intent

Turn a *shaped solution* into a decomposed, risk-ordered, executable plan whose tasks
are self-contained and individually dispatchable. Design decided the solution's shape;
Planning shards that shape into work.

## 2. Gates

**Entry gate**

- Design's exit artifacts exist: a named solution shape, interface designs, a current
  domain model, and any identified architecture-upgrade prerequisite.
- Transitively, Discovery's success criteria and constraints (Design carried them forward).
- **The Shaping seam artifact has been discovered** — this is the Delivery side of the
  Shaping → Delivery handoff (see below).

## Stage seam — DISCOVER (Shaping → Delivery)

Planning is the **first phase of the Delivery stage**, so its entry is where Delivery *receives*
the baton. Per the [Seam Artifact Protocol](../../wiki/patterns/seam-artifact-protocol.md), before
decomposing anything the Planner **discovers** the Shaping seam artifact rather than assuming it
is in the conversation:

- Read the ledger manifest (`<ledger-root>/index.md`), find the latest `ready-for-delivery` row
  for the milestone, and load `shaping/<milestone>/` (findings, domain model, design decisions).
- Use [session-bootstrap](../../SKILLS/discovery/session-bootstrap/SKILL.md) (the DISCOVER
  adapter) and the project's [communication protocol document](../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document).

This makes "start planning on the already-created research findings" a one-line instruction: the
Planner locates and loads the Shaping output itself, in a fresh session, with no context carried
over from the shaping agent.

**Exit gate**

- Work is decomposed into right-sized tasks with explicit dependencies.
- Each task carries its own verification/acceptance criteria.
- High-risk items are sequenced first.
- The **Architecture Gate** (below) is satisfied.
- The **Review-gate cadence** (below) is defined — slice boundaries are marked as quality gates.
- The **Output-Plan Policy** (below) is met.

## 3. Recommended skills

1. [task-sizing](../../SKILLS/planning/task-sizing/SKILL.md) — gauge size and break work down (the gatekeeper for the Output-Plan Policy).
2. [triage](../../SKILLS/planning/triage/SKILL.md) — order by risk and priority.
3. [to-tickets](../../SKILLS/planning/to-tickets/SKILL.md) — break the plan into tracer-bullet tickets with blocking edges. Pair with [to-spec](../../SKILLS/planning/to-spec/SKILL.md) when the conversation needs synthesising into a spec first.
4. [dispatch-context](../../SKILLS/planning/dispatch-context/SKILL.md) — prepare delegation bundles for sub-agents.
5. [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) — chart huge, multi-session work as a map of decision tickets, resolved one at a time.

Solution-shaping skills — [domain-model](../../SKILLS/design/domain-model/SKILL.md), [design-an-interface](../../SKILLS/design/design-an-interface/SKILL.md), [improve-codebase-architecture](../../SKILLS/design/improve-codebase-architecture/SKILL.md) — belong to [Design](design.md). Planning *consumes* their artifacts; if a design gap surfaces mid-plan (an interface that was never shaped, a term missing from the glossary), loop back to Design rather than improvising the shape inside a task.

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

Planning **must** cite a high-level domain model so each sub-task knows which part of
the system it touches and understands the big picture. This model is a **Design artifact** —
provide a **link** to it. If it does not exist, that is a Design gap: loop back to
[Design](design.md) and use [domain-model](../../SKILLS/design/domain-model/SKILL.md) to
create one, rather than inventing the model inside the plan.

## Architecture Gate (mandatory for complex work)

Per [architecture-first](../../wiki/principles/architecture-first.md):

- The plan **must cite** the relevant System Design Architecture documents / ADRs
  (`wiki/adr/`) — including any produced during [Design](design.md).
- If any decision rests on an **unknown**, require research or a spike (from
  [Discovery](discovery.md)) *before* the decision drives the plan.
- If [Design](design.md) identified an **architecture upgrade or constitutional update**,
  sequence it as the **first, blocking task(s)** — it lands *before* any code that depends
  on it, never retrofitted after.
- **Complexity-scaled:** this gate binds for genuinely complex/architectural work. Trivial
  localized fixes (e.g. a one-function bugfix) are exempt — the sizing scorecard's
  *uncertainty* dimension plus architectural blast radius is the trigger.

## Review-gate cadence

The plan **designs in the quality gates** the Orchestrator will enforce during
[Implementation](implementation.md#quality-gates) — it does not leave review and committing to
improvisation. A **quality gate** is a slice boundary where verified work is **reviewed on two
axes (Standards + Spec) and committed** before the next slice starts, per
[commit-often](../../wiki/principles/commit-often.md).

Where the gates go:

- **One gate per tracer-bullet boundary.** Each vertical slice from
  [to-tickets](../../SKILLS/planning/to-tickets/SKILL.md) is independently demoable, so each is a
  natural gate: verify → review → commit, then the next slice begins from that committed point.
- **Mark them in the plan.** The dependency graph (Pass 4) already identifies slice boundaries;
  the plan annotates which are gates and states each gate's review focus (which acceptance
  criteria the Spec axis checks, which modules the Standards axis scrutinises) **and which
  [quality-baseline](../../wiki/patterns/quality-baseline.md) aspects (lint, code-quality,
  security, coverage) that gate's Verify step must run** — so baseline enforcement is designed
  into the cadence, not improvised ([ADR-017](../../wiki/adr/adr-017-quality-baseline.md)).
- **Scale with size.** Trivial single-slice work has **one gate at the end**. Multi-slice work
  gates at **every** slice boundary — never a single end-of-plan review over an unreviewable
  pile. The heavier the blast radius, the tighter the cadence.
- **The final gate is Verification.** The last gate coincides with the
  [Verification](verification.md) exit, whose commit the Delivery seam artifact references.

This makes review a *planned checkpoint* like the Architecture Gate above — not an optional
skill an agent might forget to invoke.

## 5. Shift-left obligation

- Every task carries its acceptance/verification criteria **with it** — verification is
  planned per-task, not deferred.
- Tasks are written against the **interface designs Design produced**, so contracts are
  fixed before code depends on them. Planning does not invent new interface shapes — a
  missing contract is a Design gap to loop back on.
- **Documentation is planned explicitly:** the plan must incorporate documentation tasks
  (not an afterthought).

## 6. Artifacts

- A **link** to the high-level domain model and interface designs produced in [Design](design.md).
- A risk-ordered set of right-sized tasks, each with acceptance criteria and explicit
  dependencies.
- Dispatch-ready context bundles.
- A dependency graph identifying critical-path and parallel-safe tasks, with **quality gates
  marked** at the slice boundaries where work is reviewed and committed.

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

- [Design](design.md) — supplies the solution shape, interface designs, domain model, and any architecture prerequisite this phase decomposes.
- [Discovery](discovery.md) — the ultimate source of success criteria and constraints (carried forward through Design).
- [Implementation](implementation.md) — consumes the task documents and executes the review-gate cadence produced here.
- [architecture-first](../../wiki/principles/architecture-first.md) — the principle behind the Architecture Gate.
- [commit-often](../../wiki/principles/commit-often.md) — the principle behind the review-gate cadence.
- [quality-baseline](../../wiki/patterns/quality-baseline.md) — the four-aspect floor each gate's Verify step runs; the cadence names which aspects per gate.
</content>
