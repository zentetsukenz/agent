---
type: Principle
title: Architecture-First & Research-Backed
description: Every unknown is backed by research or a spike, and any architecture or constitutional change lands before the code that depends on it
tags: [architecture, research, sequencing, adr, sdlc]
timestamp: 2026-07-14T00:00:00Z
---

# Architecture-First & Research-Backed

A cross-cutting principle of the [SDLC workflow](../../workflows/sdlc/index.md), peer to
shift-left verification and documentation. It governs *how* decisions are made and *when*
structural change happens.

## The three mandates

### 1. Research-backed decisions

Every **unknown** must be backed by research or a throwaway spike before it is allowed to
drive a decision. No guessing on complex or architectural work. This connects
[research-recommend](../../SKILLS/discovery/research-recommend/SKILL.md) and Discovery-phase
[prototype](../../SKILLS/implementation/prototype/SKILL.md) spikes to the plan: an unknown
is either resolved with evidence or explicitly flagged, never silently assumed.

### 2. Architecture-first ordering

- Plans **must reference** the relevant System Design Architecture documents / ADRs
  (`wiki/adr/`) and, when architectural, use
  [improve-codebase-architecture](../../SKILLS/discovery/improve-codebase-architecture/SKILL.md).
- Any **architecture upgrade or constitutional update** must be put in place **first** —
  sequenced as the blocking prerequisite task(s) — **before** any code that depends on it.
- It is **never** retrofitted after the code. Code that assumes a structure the codebase
  does not yet have is not allowed to proceed.

### 3. Complexity-scaled

The mandates bind for genuinely **complex or architectural** work — not trivial, localized
changes. A one-function bugfix does not drag in an ADR. The trigger is the Planning
[sizing scorecard](../../workflows/sdlc/planning.md#operational-dna--task-decomposition)'s
*uncertainty* dimension combined with architectural blast radius. Small, well-defined,
low-blast-radius fixes are exempt.

## Where it is enforced

| Phase | Enforcement |
|---|---|
| [Discovery](../../workflows/sdlc/discovery.md) | Research and spikes produce the evidence that backs unknowns. |
| [Planning](../../workflows/sdlc/planning.md) | The **Architecture Gate**: cite ADRs; require research for unknowns; sequence architecture/constitution changes first as blocking tasks. |
| [Implementation](../../workflows/sdlc/implementation.md) | The **Orchestrator** refuses to dispatch a code task whose prerequisite architecture/constitution change has not yet landed. |
| [Preservation](../../workflows/sdlc/preservation.md) | New/updated ADRs and constitutional changes are captured and cross-linked. |

## Why

Retrofitting architecture after code is written is the expensive, error-prone path: the
code encodes assumptions that the eventual structure contradicts, forcing rework. Landing
structure first — and only after the unknowns behind it are researched — makes the
dependent code straightforward and keeps decisions traceable to their evidence.

## Related

- [rpi](rpi.md) — the Research → Plan → Implement discipline this reinforces.
- [verification-culture](verification-culture.md) — the sibling "evidence over assertion" principle.
- [adr-003-architecture-first-ordering](../adr/adr-003-architecture-first-ordering.md) — the decision record for this ordering rule.
</content>
