---
type: Log
title: Glossary change log
description: Chronological log of glossary changes
---

# Glossary Log

- 2026-07-07 — v0.1 initial content
- 2026-07-21 — Added **Harness** and **Setup contract**; sharpened **Adapter** to loom's
  harness-adapter sense (was generic). Bakes the harness-agnostic setup vocabulary that
  `SETUP.md` and `adapters/*` rely on into the domain language.
- 2026-07-24 — Added **Capability**, **Role**, **Dispatcher**, **Utility (dispatched) agent**;
  sharpened **Agent** (now also defined by its capability grant, not domain alone) and
  **Orchestrator** (canonical Dispatcher: `delegate` yes, `edit` no). Establishes the
  role-scoped-capability vocabulary for the new pattern and ADR-006/008.
- 2026-07-27 — Added **Domain-specialized utility** — a Utility (dispatched) agent scoped
  to a problem domain (e.g. frontend) rather than an intelligence tier; wires the domain's
  skill cluster. Names the role kind introduced by the `frontend` agent (ADR-009) and
  closes on the wisdom principle "specialize by problem domain, not technology."
- 2026-07-30 — Added **Stage**, **Seam artifact**, **Ledger**, and **Communication protocol
  document** — the vocabulary for the Seam Artifact Protocol (ADR-011): stages are the
  ownership seams, a seam artifact is the baton, the ledger is its namespaced+manifested
  store, and the communication protocol document is the per-project contract agents reference.
- 2026-07-31 — Added **Invocation surface** — the entry points that may *start* a role
  (human picker vs. subagent dispatch), a facet parallel to the capability set. Names the
  two surfaces `front-door` (stage agents; human/handoff-entered, not subagent-invocable)
  and `dispatched` (the utility roster; subagent-only). Orthogonal to the dispatcher/utility
  split. Establishes the vocabulary for ADR-012.
- 2026-08-12 — Added **Altitude**, **Substrate**, **Altitude seam**, and **Resident agent** —
  the vocabulary for macro project-management (ADR-018): altitude is the macro/micro scale
  split, substrate generalizes "where the ledger lands" to three classes (memory / committed
  folder / networked store) chosen per-project *and* per-altitude, the altitude seam is the
  translator (two-vocabulary label protocol: `wayfinder:*` down, `sdlc:*` up) joining the two,
  and the resident agent is the memory-bearing reactive worker that runs the macro altitude
  over a networked source of truth (board = single source of truth; the daemon is an adapter
  concern).
- 2026-08-17 — Added **Standing regression suite** and **`qa:regression-failed` (regression
  origin)**, and rewrote **Verification Culture** to carry the **iron law** — the vocabulary for
  system-scoped QA (ADR-020): the standing suite is the system-scoped e2e asset that accretes 1:1
  from user-facing efforts and runs in CI; `qa:regression-failed` is the CI-posted *third origin*
  (neither `wayfinder:*` down nor `sdlc:*` up) handled AFK by seeding a fresh terminating
  "restore-green" map; and Verification Culture is now the iron-law principle (evidence before any
  claim, harness-agnostic), the procedural skill being its operationalization.
