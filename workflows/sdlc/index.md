---
type: Index
title: SDLC Workflow
description: A prose-first Software Development Life Cycle workflow — five ordered phases with shift-left verification, documentation, and architecture-first discipline baked into every phase
---

# SDLC Workflow

An ordered orchestration seed for the Software Development Life Cycle. An adapter's
interpreting agent reads this workflow — plus the referenced skills and wiki — and
compiles a concrete harness (agents, skills, commands) for a target tool. Nothing here
is a hardcoded contract; everything is prose the agent interprets against the target
environment's actual capabilities. See [workflows](../index.md) for the prose-first
principle.

## The five phases

Work flows through five ordered phases, each mapping to a loom lifecycle bucket. The
`meta` bucket is **not** a phase — it is an always-available toolbox any phase may draw on.

```text
Discovery ──▶ Planning ──▶ Implementation ──▶ Verification ──▶ Preservation
    │            │               │                  │               │
    └────────────┴───────────────┴──────────────────┴───────────────┘
                  shift-left · documentation · architecture-first
                       (cross-cutting, woven into every phase)
```

| # | Phase | Bucket | Intent |
|---|---|---|---|
| 1 | [Discovery](discovery.md) | `discovery/` | Understand the problem space and constraints before committing to a solution. |
| 2 | [Planning](planning.md) | `planning/` | Turn an understood problem into a decomposed, risk-ordered, executable plan. |
| 3 | [Implementation](implementation.md) | `implementation/` | Execute the plan into working, tested, documented changes — one right-sized task at a time. |
| 4 | [Verification](verification.md) | `verification/` | Confirm the *whole* delivered change satisfies the success criteria — via evidence, not assertion. |
| 5 | [Preservation](preservation.md) | `preservation/` | Capture learnings, curate knowledge, hand off, and feed improvements back into the framework. |

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

Three concerns are woven into *every* phase, not deferred to a single late phase:

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
  MARK DONE` execution loop lives in [implementation.md](implementation.md).

## Related

- [workflows index](../index.md) — what a workflow is and the prose-first principle
- [adr-002-workflow-as-adapter-seed](../../wiki/adr/adr-002-workflow-as-adapter-seed.md) — why the workflow is a prose seed
- [adr-003-architecture-first-ordering](../../wiki/adr/adr-003-architecture-first-ordering.md) — why architecture changes land first
- [SKILLS](../../SKILLS/) — the lifecycle-bucketed skills the phases reference
</content>
