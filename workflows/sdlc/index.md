---
type: Index
title: SDLC Workflow
description: A prose-first Software Development Life Cycle workflow — six ordered phases grouped into three ownership stages, with shift-left verification, documentation, architecture-first, and commit-often discipline baked into every phase
---

# SDLC Workflow

An ordered orchestration seed for the Software Development Life Cycle. An adapter's
interpreting agent reads this workflow — plus the referenced skills and wiki — and
compiles a concrete harness (agents, skills, commands) for a target tool. Nothing here
is a hardcoded contract; everything is prose the agent interprets against the target
environment's actual capabilities. See [workflows](../index.md) for the prose-first
principle.

## The six phases

Work flows through six ordered phases, each mapping to a loom lifecycle bucket. The
`meta` bucket is **not** a phase — it is an always-available toolbox any phase may draw on.

```text
Discovery ─▶ Design ─▶ Planning ─▶ Implementation ─▶ Verification ─▶ Preservation
    │          │           │              │                │              │
    └──────────┴───────────┴──────────────┴────────────────┴──────────────┘
          shift-left · documentation · architecture-first · commit-often
                       (cross-cutting, woven into every phase)
```

| # | Phase | Bucket | Intent |
|---|---|---|---|
| 1 | [Discovery](discovery.md) | `discovery/` | Understand the problem space and constraints before committing to a solution. |
| 2 | [Design](design.md) | `design/` | Shape the solution — domain model, interfaces, architecture — into design artifacts before decomposing it. |
| 3 | [Planning](planning.md) | `planning/` | Decompose a shaped solution into a risk-ordered, right-sized, executable plan. |
| 4 | [Implementation](implementation.md) | `implementation/` | Execute the plan into working, tested, documented changes — one right-sized task at a time. |
| 5 | [Verification](verification.md) | `verification/` | Confirm the *whole* delivered change satisfies the success criteria — via evidence, not assertion. |
| 6 | [Preservation](preservation.md) | `preservation/` | Capture learnings, curate knowledge, hand off, and feed improvements back into the framework. |

## The three stages (ownership overlay)

The six phases group into three **stages** that mark the real handoff seams — the points
where ownership changes hands. Stages are an orchestration overlay: they carry no gates of
their own (each phase keeps its own gates and DNA); they name *who* owns the work and *what
artifact* crosses each seam.

```text
┌─ SHAPING ──────────┐   ┌─ DELIVERY ─────────────────────────────────┐   ┌─ CLOSING ────┐
│ Discovery ▶ Design │──▶│ Planning ▶ Implementation ▶ Verification    │──▶│ Preservation │
└────────────────────┘   └─────────────────────────────────────────────┘   └──────────────┘
   shaping owner            delivery team                                     the org learns
   → milestone + design docs   → shipped, verified change                     → durable knowledge
```

| Stage | Phases | Owner (illustrative) | Seam artifact |
|---|---|---|---|
| **Shaping** | Discovery, Design | Product owner / designer / lead | A milestone with design docs (domain model, interfaces, ADRs). |
| **Delivery** | Planning, Implementation, Verification | Delivery team | A shipped, verified change proven against the success criteria. |
| **Closing** | Preservation | The organisation | Durable, curated knowledge fed back into the framework. |

Stages express the workflow's real-life narrative — a shaping owner researches and designs a
solution, hands a milestone to a team that plans, builds, and verifies it, and the org
preserves what was learned. The **Verification** phase stays a *named* phase inside Delivery,
never an unnamed step: the evidence gate is not allowed to erode into "we shipped it."

### Seam artifacts cross the stage boundaries

The two stage seams are where ownership changes hands, so they are also where context must not
drop. Each seam is governed by the [Seam Artifact Protocol](../../wiki/patterns/seam-artifact-protocol.md):
the producing stage's **exit gate** writes a namespaced **seam artifact** to a **ledger** and
registers it in a manifest; the receiving stage's **entry gate** discovers and loads it. This is
**mandatory at the two stage seams** (Shaping → Delivery, Delivery → Closing) and advisory within
a stage. It is what makes the multi-agent workflow real: a planner in a fresh session can be told
"plan the `<milestone>` findings" and locate everything Shaping produced, without any conversation
carried over. See [ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md).

## Phase policy anatomy

Every phase file states its policy across the same six dimensions, so an interpreting
agent can scan each phase uniformly:

1. **Intent** — the phase's goal in one line.
2. **Entry / Exit gates** — what must be true to start and to finish (shift-left checkpoints).
3. **Recommended skills** — referenced by *intent/capability*, not rigid binding. A phase
   may reference a skill from any bucket (e.g. Discovery uses `implementation/prototype`
   as a throwaway spike). Reference by intent, not ownership.
4. **Agent-effort policy** — how to split labor by task difficulty.
5. **Shift-left obligation** — the quality/verification/documentation work the phase owes
   even though it is not the Verification or Preservation phase.
6. **Artifacts / outputs** — what the phase produces that the next phase consumes.

## Cross-cutting principles

Four concerns are woven into *every* phase, not deferred to a single late phase:

- **Shift-left verification** — verification obligations start in Discovery (testable
  success criteria) and accrue through every phase. The Verification *phase* confirms the
  whole; it does not invent new criteria.
- **Documentation** — documentation is written *as you go* in each phase and **consolidated**
  in Preservation. In the agentic era this is non-negotiable: agents rely on durable docs to
  reconstruct context. Uses [edit-article](../../SKILLS/meta/edit-article/SKILL.md).
- **Architecture-first / research-backed** — see
  [architecture-first](../../wiki/principles/architecture-first.md). Every *unknown* must be
  backed by research or a spike; any architecture or constitutional change lands **first**,
  as a blocking prerequisite, before dependent code. Complexity-scaled: trivial localized
  fixes are exempt.
- **Commit often** — see [commit-often](../../wiki/principles/commit-often.md). Every green
  [quality gate](implementation.md#quality-gates) (Verify → Review → Commit) is a commit
  point; Planning sequences the gates as a [review-gate cadence](planning.md#review-gate-cadence)
  and the Orchestrator holds each gate before advancing, so Delivery lands as small,
  reversible, individually-reviewed commits — never one end-of-session drop.
- **Quality baseline** — see [quality-baseline](../../wiki/patterns/quality-baseline.md). Each
  gate's Verify step re-checks a per-project floor across four aspects (lint, code-quality,
  security, coverage), chosen at setup from keyless-first tools; a metric that drops below its
  floor fails the gate, so quality can never silently erode between gates and get caught too
  late. The Verification phase runs the full baseline over the whole delivery.

## The Orchestrator role

The workflow names one agent role explicitly: the **Orchestrator**. It runs the
Implementation loop, gauges each task's size, and **dispatches to the correct
implementation-agent class** (high / mid / low intelligence) to maximize the chance of a
successful implementation. It does not rely on a small agent self-assessing its own
capability ("you don't know what you don't know"). The Orchestrator also enforces the
architecture-prerequisite gate — it will not dispatch a code task whose prerequisite
architecture or constitution change has not yet landed.

## Operational DNA

Two playbooks form the operational core of the middle phases:

- **Planning DNA** — the 6-pass decomposition protocol and the 5-dimension sizing
  scorecard live in [planning.md](planning.md). They operationalize the ~80/20
  plan-output policy: a plan is well-formed only when ~80% of its tasks are
  small-agent-executable.
- **Implementation DNA** — the `ORIENT → SCOUT → IMPLEMENT (vertical-slice TDD) → VERIFY →
  REVIEW, COMMIT, MARK DONE` execution loop lives in [implementation.md](implementation.md);
  its last phase runs the [quality gate](implementation.md#quality-gates) (Verify → Review →
  Commit).

## Related

- [workflows index](../index.md) — what a workflow is and the prose-first principle
- [adr-002-workflow-as-adapter-seed](../../wiki/adr/adr-002-workflow-as-adapter-seed.md) — why the workflow is a prose seed
- [adr-003-architecture-first-ordering](../../wiki/adr/adr-003-architecture-first-ordering.md) — why architecture changes land first
- [adr-016-embedded-review-gate](../../wiki/adr/adr-016-embedded-review-gate.md) — why code-review is an embedded quality gate + commit-often, not a standalone skill
- [adr-017-quality-baseline](../../wiki/adr/adr-017-quality-baseline.md) — why a per-project quality floor is chosen at setup and enforced at every gate
- [quality-baseline](../../wiki/patterns/quality-baseline.md) — the four-aspect floor the gates enforce
- [seam-artifact-protocol](../../wiki/patterns/seam-artifact-protocol.md) — how context crosses the stage seams
- [adr-011-seam-artifact-protocol](../../wiki/adr/adr-011-seam-artifact-protocol.md) — the decision behind the stage-seam handoff
- [SKILLS](../../SKILLS/) — the lifecycle-bucketed skills the phases reference
</content>
