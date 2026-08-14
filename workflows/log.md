---
type: Log
title: Workflows log
description: Chronological record of significant changes to workflows
---

# Workflows Log

## 2026-08-14

- Broadened `workflows/` from "lifecycles" to **two lifecycle kinds** — **terminating** (an
  ordered phase pipeline, rendered by a per-invocation harness; SDLC) and **reactive** (a
  continuous tick loop over a source of truth, rendered by a resident harness; macro-PM). Both
  remain single-lifecycle prose seeds; they differ in shape, not kind.
- Added the [macro-pm](macro-pm/index.md) workflow — the reactive lifecycle *above* SDLC. A
  resident agent charts many efforts as nested [wayfinder](../SKILLS/planning/wayfinder/SKILL.md)
  maps on a single source of truth and dispatches buildable leaves down into SDLC runs via the
  [altitude seam](../wiki/glossary/index.md#altitude-seam), looping forever. Gathers the previously
  scattered macro-PM prose (tick loop, reactive state machine, two-vocabulary seam, mechanical
  routing, cross-cutting invariants) into one seed the resident (Hermes) adapter compiles.
  References wayfinder macro mode and ADR-018 rather than duplicating them. Grounds ADR-019.

## 2026-07-16

- Added a **Design phase** (`design/` bucket) between Discovery and Planning — the SDLC
  now has **six** ordered phases. Design shapes the solution (domain model, interfaces,
  deep-module architecture) into artifacts before Planning decomposes it.
- Introduced a **three-stage ownership overlay** — Shaping (Discovery + Design),
  Delivery (Planning + Implementation + Verification), Closing (Preservation) — naming the
  real handoff seams without adding gates. Verification stays a named phase inside Delivery
  so the evidence gate does not erode.
- Moved the solution-shaping skills (`domain-model`, `design-an-interface`,
  `improve-codebase-architecture`) into the new `design/` bucket, and extracted their shared
  deep-module vocabulary into a new [codebase-design](../SKILLS/design/codebase-design/SKILL.md)
  skill. Planning now *consumes* Design's artifacts and loops back on a design gap rather
  than improvising shape inside a task.

## 2026-07-14

- Introduced the `workflows/` top-level directory: prose-first orchestration documents
  that seed adapter-built harnesses.
- Added the [sdlc](sdlc/index.md) workflow — five ordered phases (Discovery → Planning →
  Implementation → Verification → Preservation) with three cross-cutting principles:
  shift-left verification, documentation, and architecture-first / research-backed
  decision-making.
- Named the **Orchestrator** agent role: sizes tasks and dispatches to the correct
  agent class (high/mid/low intelligence), enforcing the ~80/20 plan-output policy and
  the architecture-prerequisite gate.
- Baked the task-decomposition (6-pass + sizing scorecard) and TDD execution
  (ORIENT → SCOUT → IMPLEMENT → VERIFY → MARK DONE) playbooks into the Planning and
  Implementation phase policies.
</content>
