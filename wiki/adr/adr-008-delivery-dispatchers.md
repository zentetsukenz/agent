---
type: ADR
title: Delivery dispatchers delegate execution and verification to the utility tier
status: Accepted
timestamp: 2026-07-24T00:00:00Z
tags: [agent, role, delivery, orchestrator, planner, verifier, dispatch, sdlc, mirai, loom]
---

# ADR-008: Delivery Dispatchers Delegate Execution and Verification

## Context

The Mirai adapter (see [ADR-004](adr-004-loom-mirai-setup.md)) generated a **single**
`delivery` stage agent carrying the whole Planning + Implementation + Verification workflow,
with `edit` granted. In testing it did what a do-everything agent with `edit` always does:
it wrote the code itself instead of decomposing and dispatching. The "make it delegate"
prose had no teeth.

This collapses distinctions loom's own SDLC prose already draws:

- [Planning phase](../../workflows/sdlc/planning.md) separates **sizing/decomposition**
  (high-judgment) from **writing up the plan** (mechanical), and sets an Output-Plan Policy
  (≈80% of tasks delegatable).
- [Implementation phase](../../workflows/sdlc/implementation.md) names **"The Orchestrator"**
  as a role distinct from the executor: *"the Orchestrator — not the executing agent — owns
  task routing … a big task must never land on a small coding agent."*
- [Verification](../../workflows/sdlc/verification.md) is a *named, un-skippable* gate — "the
  evidence gate is not allowed to erode into 'we shipped it.'"

One agent with `edit` erases all three seams.

## Decision

Split the Delivery stage into **dispatchers**, and delegate execution *and* verification to
the **utility tier**, enforced by [capability grants](adr-006-capability-based-roles.md):

- **Planner** (Planning) — reads Design + findings, decomposes into a risk-ordered,
  right-sized execution plan. Capabilities: `read`, `search`, `shell` (read-only
  investigation), `persist`, `interview`, `docs-lookup`, `tasks`. **No `edit`, no
  `delegate`** — a pure plan-author. A need to research is a loop back to Shaping, not a
  dispatch.
- **Orchestrator** (Implementation) — reads the plan and dispatches tasks (parallel /
  sequential) to the utility tier, gauging size and enforcing the architecture-prerequisite
  gate. Capabilities: `read`, `search`, `delegate`, `persist`, `tasks`. **No `edit`** — the
  forcing function that makes it dispatch rather than implement.
- **Execution and verification are dispatched, not done in-stage.** The Orchestrator hands
  code tasks to existing **utility** executors (`quick`, `deep`) and verification to a new
  **Verifier** utility.
- **Verifier** — a reusable [utility (dispatched) agent](../glossary/index.md#utility-dispatched-agent)
  running an extended-thinking model. It checks an artifact against its acceptance criteria
  and returns evidence; it does **not** hold `edit` (it verifies, it doesn't fix — defects
  route back). It is a *utility*, not a Delivery stage agent, because more than one
  dispatcher uses it: the Orchestrator dispatches it to verify a change today, and a future
  plan-reviewer will dispatch it to verify a *plan*. Two consumers = a real seam (see
  [deep-modules](../patterns/deep-modules.md)). Keeping verification a distinct dispatched
  role also preserves it as a named gate rather than a step the Orchestrator can quietly
  skip.

## Considered options

| Option | Verdict |
|---|---|
| **Single `delivery` agent** (status quo, has `edit`) | Rejected — never delegates; blurs plan/build/verify. |
| **Planner + Orchestrator, Orchestrator verifies inline** | Rejected — verification stops being a named gate and can erode into self-certification. |
| **Planner + Orchestrator (dispatchers) + Verifier utility** | **Chosen** — each seam is a distinct role; execution and verification are dispatched; the Verifier is reusable across dispatchers. |

## Consequences

- Delivery generates **two** dispatcher agents (Planner, Orchestrator) instead of one
  `delivery` agent; the old `delivery.agent.md` is retired (an `update` migration replaces
  it).
- The **Verifier** joins the utility roster alongside `explore` / `quick` / `deep`; a
  future plan-reviewer can dispatch it without new plumbing.
- The Orchestrator cannot ship code by itself — it must dispatch — which is the intended
  behaviour and the fix for "it won't delegate."
- Slightly more agents and handoffs; accepted as the cost of keeping the plan/build/verify
  seams real.

## Related

- [ADR-006](adr-006-capability-based-roles.md) — the capability discipline that enforces the split (no-`edit` on dispatchers/verifier).
- [workflows/sdlc/implementation.md](../../workflows/sdlc/implementation.md) — the pre-existing "Orchestrator" role this surfaces.
- [workflows/sdlc/planning.md](../../workflows/sdlc/planning.md) — the pre-existing plan-author / sizing split.
- [wiki/patterns/role-scoped-capabilities.md](../patterns/role-scoped-capabilities.md) — dispatcher vs. utility.
- [adapters/mirai/STAGES.md](../../adapters/mirai/STAGES.md) — the concrete Delivery role roster.
