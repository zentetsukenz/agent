---
type: Pattern
title: Harness Archetypes
description: A descriptive taxonomy of the harness classes loom adapters target — who holds the workflow loop, and whether the harness is headless-dispatchable — so each adapter's port answers follow from its archetype instead of being re-derived per adapter.
tags: [harness, adapter, archetype, invocation, dispatch, resident, per-invocation, altitude, loom]
timestamp: 2026-08-13T00:00:00Z
---

# Harness Archetypes

loom ships one [adapter](../glossary/index.md#adapter) per supported
[harness](../glossary/index.md#harness) ([ADR-001](../adr/adr-001-adapter-pattern.md)). Those
adapters look different on the surface — a GUI editor, a terminal CLI, a resident gateway agent —
but the differences that actually change an adapter's **port answers** reduce to **two axes**. This
pattern names them, so an adapter can say *"I am archetype X, therefore my invocation surface and
dispatch role follow"* rather than re-deriving those choices from scratch (as ADR-004 and ADR-014
each did independently).

This is a **descriptive** taxonomy — it names classes that already distinguish shipped adapters. It
does **not** rewrite the [invocation-surface derivation](role-scoped-capabilities.md) of
[ADR-012](../adr/adr-012-invocation-surface.md); it gives that derivation a principled home and
explains why one archetype inverts it.

## The two axes

1. **Who holds the workflow loop?**
   - **Per-invocation** — a *human* starts and steers each session; the harness holds no loop of its
     own between invocations. The SDLC stage agents are things the human enters.
   - **Resident** — the *agent* holds the loop (a scheduler/gateway keeps it live); the human
     interacts conversationally, as a Product Owner talking to a colleague, not as the driver of
     each step.

2. **Is the harness headless-dispatchable?** — can *another* agent invoke it non-interactively
   (a CLI another process can call, `--agent`/`--prompt` style), or is it a human-only surface?

## The archetypes

| Harness | Axis 1 — holds loop | Axis 2 — headless-dispatchable | Consequences (what follows) |
|---|---|---|---|
| **Mirai** | per-invocation (human) | **no** (GUI-only by design) | Stage agents are [`front-door`](../glossary/index.md#invocation-surface); utilities `dispatched`. **Not** a micro dispatch target — a human macro front-door at most. |
| **OpenCode** | per-invocation (human) | **yes** (`opencode --agent=…`) | Stage agents `front-door`; utilities `dispatched`. **A valid micro dispatch target** — a resident harness can drive it. |
| **Hermes** | **resident** (agent) | it *dispatches* (n/a as a target) | Invocation **inverts**: the resident PM agent is the *only* `front-door`; **every SDLC stage agent becomes `dispatched`** — or, under a thin-macro adapter, is not rendered at all and is dispatched to a *per-invocation* harness. |

Two confirmed members on the per-invocation side (Mirai + OpenCode) differ **only** on axis 2 —
which is why axis 2 is load-bearing, not speculative: it is the exact difference between "a human
tool" and "a tool a resident agent can drive."

## Why the axes matter

- **Axis 2 decides dispatch targets.** A [resident](../glossary/index.md#resident-agent) harness at
  the macro [altitude](../glossary/index.md#altitude) dispatches SDLC runs *into* a
  headless-dispatchable harness at the micro altitude (the [altitude seam](../glossary/index.md#altitude-seam)
  realized as a **cross-harness** boundary). Only a `dispatch-target: yes` harness can receive that
  dispatch. Mirai cannot; OpenCode can.
- **Axis 1 decides invocation surface.** Per-invocation harnesses keep ADR-012's derivation as-is
  (stage agents `front-door`). A resident harness inverts it: the loop-holder is the sole front
  door, and stage agents drop to `dispatched`. The inversion is a **port answer**, not a change to
  the derivation rule — recorded per adapter (e.g. [ADR-019](../adr/adr-019-loom-hermes-setup.md)),
  and only worth generalizing into the core if a *second* resident harness needs the same shape
  ("one adapter = a hypothetical seam, two = a real one", see [deep-modules](deep-modules.md)).
- **Cross-harness dispatch constrains the substrate.** When the altitude seam crosses a harness
  boundary, the micro [ledger](../glossary/index.md#ledger) must be a **shared, on-disk**
  [substrate](../glossary/index.md#substrate) both harnesses can read — harness memory is private to
  one harness and cannot carry the baton across the boundary. See the
  [seam-artifact protocol](seam-artifact-protocol.md#substrate-is-also-altitude-scoped).

## Why this is a deep module

Applying the [deletion test](deep-modules.md): delete this pattern and the classification scatters
back into each adapter's `setup.md` and each setup ADR, which re-derive "am I a dispatch target? is
my stage agent front-door?" independently — the drift ADR-004/ADR-014 already showed. Naming the two
axes **concentrates** that decision in one place the adapters and setup ADRs point at.

## Related

- [ADR-012](../adr/adr-012-invocation-surface.md) — the invocation-surface derivation this pattern gives a home to (and that Hermes inverts).
- [ADR-019](../adr/adr-019-loom-hermes-setup.md) — the resident (Hermes) archetype, where the inversion is recorded as a port answer.
- [ADR-018](../adr/adr-018-macro-project-management.md) — the macro/micro altitude split and cross-harness dispatch this taxonomy serves.
- [seam-artifact-protocol](seam-artifact-protocol.md) — altitude-scoped substrate and the shared-on-disk constraint for cross-harness dispatch.
- [role-scoped-capabilities](role-scoped-capabilities.md) — capabilities + invocation surface, the facets an archetype resolves.
- [adapters](../../SETUP.md) — the harness table each archetype member registers in.
