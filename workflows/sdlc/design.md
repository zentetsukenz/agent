---
type: Pattern
title: SDLC — Design Phase
description: Policy governing how the Design phase performs — shape the solution (domain model, interfaces, deep-module architecture) into design artifacts before decomposing it into tasks
---

# Design Phase

> **Bucket:** `design/` · **Position:** 2 of 6 · **Stage:** Shaping · **Follows:** [Discovery](discovery.md) · **Precedes:** [Planning](planning.md)

## 1. Intent

Shape the *solution* — its domain model, module interfaces, and architecture — into
durable **design artifacts**, before Planning shards it into dispatchable tasks. Discovery
decided *what problem* and *whether* to solve it; Design decides *what shape* the solution
takes.

This is the **Shaping** stage's second half: the same owner who ran Discovery (a product
owner, designer, or lead) carries an understood problem into a designed solution. The stage
output — a milestone with design docs — is what a later planner picks up to decompose.

## 2. Gates

**Entry gate**

- Discovery's exit artifacts exist: problem, constraints, and testable success criteria.
- The riskiest assumptions have been burned down (research or spike).

**Exit gate**

- The solution has a **named shape**: the modules/seams it introduces or changes, and the
  interfaces at those seams, are described — not yet decomposed into tasks.
- The **domain model is current**: new terms are in the glossary, contradictions resolved.
- **Load-bearing decisions are recorded as ADRs** — decisions that are hard to reverse,
  surprising without context, and the result of a real trade-off.
- Any needed **architecture upgrade is identified and sequenced first** (feeds Planning's
  Architecture Gate) — never retrofitted after dependent code.
- Interfaces are designed well enough to be validated early, but no task breakdown yet.
- **The Shaping seam artifact is produced and registered** — this is the
  Shaping → Delivery handoff (see below).

## Stage seam — PRODUCE (Shaping → Delivery)

Design is the **last phase of the Shaping stage**, so its exit is a real ownership handoff.
Per the [Seam Artifact Protocol](../../wiki/patterns/seam-artifact-protocol.md), the exit gate
is not satisfied until the **seam artifact** is written to the ledger and registered in the
manifest — this is mandatory at the stage seam (not merely advisory):

- Write `shaping/<milestone>/` to the ledger: **findings** (Discovery's evidence-backed
  unknowns), the **domain model** (or a link to where it lives), and the **design decisions**
  (interfaces + ADR references). Reference PRDs/ADRs/commits by path — don't re-embed them.
- Register a row in the ledger manifest with status `ready-for-delivery`.
- Use [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md) (the PRODUCE adapter) to write it,
  and follow the project's [communication protocol document](../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document).

This is what lets a planner in a fresh session simply be told "plan the `<milestone>` findings"
and discover everything Shaping produced — the workflow's core multi-agent guarantee.

## 3. Recommended skills

Referenced by intent — an interpreting agent maps these onto the target environment.

1. [codebase-design](../../SKILLS/design/codebase-design/SKILL.md) — the shared deep-module vocabulary (module, interface, seam, adapter, leverage, locality) every design decision speaks in.
2. [domain-model](../../SKILLS/design/domain-model/SKILL.md) — build and sharpen the ubiquitous language; record ADRs as decisions crystallise.
3. [design-an-interface](../../SKILLS/design/design-an-interface/SKILL.md) — design it twice: generate radically different interfaces for a module, then compare on depth.
4. [improve-codebase-architecture](../../SKILLS/design/improve-codebase-architecture/SKILL.md) — for changes to an existing codebase, surface deepening opportunities against the domain language and ADRs, then grill the chosen candidate.

## 4. Agent-effort policy

- **High-judgment → higher-intelligence agent:** naming seams, choosing interface shape,
  deciding what warrants an ADR, judging whether an architecture change is required.
- **Delegable → small agent:** generating candidate interface designs in parallel (each
  sub-agent under a fixed constraint), collecting exemplars, drafting ADR/glossary entries
  from settled decisions.

## 5. Shift-left obligation

- **Design to the success criteria, not past them (YAGNI).** Shape only what the understood
  problem needs. Weight design attention toward the parts of the system that will actually
  change.
- **Interfaces are designed here so they can be validated early** — contracts exist before
  Planning depends on them.
- **The documentation trail thickens:** design artifacts (domain model, interface designs,
  ADRs) are written *now*, as decisions land, not reconstructed later.
- **Architecture-first:** if the solution needs a structural change, that change is named
  here and sequenced as Planning's first blocking task — per
  [architecture-first](../../wiki/principles/architecture-first.md).

## 6. Artifacts

- A named solution shape: modules/seams introduced or changed, with their interfaces.
- Interface designs (from *design it twice*), with the chosen shape and its rationale.
- A current domain model / glossary.
- ADRs for load-bearing decisions.
- An identified architecture-upgrade prerequisite (if any), ready for Planning to sequence.

## Notes

- **Complexity-scaled:** a trivial localized change (one-function bugfix) can pass straight
  through Design — the shape is self-evident. The phase binds for genuinely new solutions or
  architectural work, the same trigger as the Planning Architecture Gate.
- **Autonomy:** as in Discovery, human grilling is not mandatory every time. When the shape
  is obvious from the success criteria, the agent may proceed — but the exit gate still holds.
- Design feeds [Planning](planning.md): its interface designs become the contracts tasks are
  written against, and its identified architecture change drives Planning's Architecture Gate.

## Related

- [Discovery](discovery.md) — supplies the problem, constraints, and success criteria this phase shapes a solution for.
- [Planning](planning.md) — consumes the design artifacts and decomposes them into tasks.
- [architecture-first](../../wiki/principles/architecture-first.md) — the principle behind sequencing structural changes first.
