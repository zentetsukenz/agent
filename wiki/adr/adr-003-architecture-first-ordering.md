---
type: ADR
title: Architecture and constitutional changes land before dependent code
status: Accepted
timestamp: 2026-07-14T00:00:00Z
tags: [architecture, sequencing, research, sdlc, loom]
---

# ADR-003: Architecture-First Ordering

## Context

In complex work, plans frequently depend on an architectural change (a new seam, a
refactor, a module boundary) or a constitutional change (a project-wide rule, a testing
requirement). A common failure mode is writing feature code *first* and retrofitting the
architecture *after* — the code encodes assumptions that the eventual structure
contradicts, forcing expensive rework. A second failure mode is making structural
decisions on **unknowns**, without research or a spike to back them.

The [SDLC workflow](../../workflows/sdlc/index.md) needed an explicit rule so complex work
is sequenced correctly, while trivial fixes are not burdened with process.

## Decision

Adopt **Architecture-First & Research-Backed** as a cross-cutting principle (see
[architecture-first](../principles/architecture-first.md)) with three mandates:

1. **Research-backed decisions.** Every *unknown* must be backed by research or a throwaway
   spike before it drives a decision.
2. **Architecture-first ordering.** Plans must cite the relevant System Design Architecture
   documents / ADRs. Any architecture upgrade or constitutional update is sequenced as the
   **first, blocking task(s)** and lands **before** any code that depends on it — never
   retrofitted after.
3. **Complexity-scaled.** The mandates bind only for genuinely complex/architectural work.
   The trigger is the Planning sizing scorecard's *uncertainty* dimension combined with
   architectural blast radius. Trivial, localized, low-blast-radius fixes are exempt.

## Enforcement

- **Planning** — the Architecture Gate: cite ADRs, require research for unknowns, sequence
  structural changes first.
- **Implementation** — the **Orchestrator** refuses to dispatch a code task whose
  prerequisite architecture/constitution change has not yet landed (the `ORIENT` phase's
  prerequisite check).
- **Preservation** — new/updated ADRs and constitutional changes are captured and
  cross-linked.

## Alternatives considered

- **Retrofit architecture after code.** The status-quo failure mode; rejected for the
  rework cost.
- **Always require an ADR for every change.** Too heavy; punishes trivial fixes. Rejected
  in favor of the complexity-scaled trigger.

## Consequences

- Dependent code becomes straightforward because the structure it assumes already exists.
- Decisions are traceable to their backing evidence.
- Complex work incurs an up-front sequencing cost (architecture task first), accepted as
  cheaper than retrofitting.
- Requires the Orchestrator to track architecture prerequisites as hard gates.

## Related

- [architecture-first](../principles/architecture-first.md) — the principle this records.
- [ADR-002](adr-002-workflow-as-adapter-seed.md) — the workflow that enforces this.
- [rpi](../principles/rpi.md) — the research-before-implementation discipline it extends.
</content>
