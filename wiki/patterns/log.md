---
type: Log
title: Patterns change log
description: Chronological log of patterns changes
---

# Patterns Log

- 2026-07-07 — v0.1 initial content
- 2026-07-24 — Added **Role-Scoped Capabilities** — a role is its scoped capability set;
  enforcement is by withholding capabilities (no-`edit` as a forcing function), with
  generic capability names the adapter maps to harness tool names. Grounds ADR-006/008.
- 2026-07-27 — Added **Browser Capture Substrate** — the shared drive/discover/isolate
  contract that `visual-verification` (pixels lens) and `frontend-runtime-debugging`
  (runtime lens) both specialize, so the browser-drive knowledge lives in one module
  instead of drifting across two skills. Grounds ADR-009.
- 2026-07-30 — Added **Seam Artifact Protocol** — one deep contract (namespaced ledger +
  manifest; produce@exit, discover@entry) consolidating the three shallow context-movers
  (`handoff`, `session-bootstrap`, `dispatch-context`) so context survives the stage seams.
  Mandatory at the two stage seams; substrate is a per-project setup choice. Grounds ADR-011.
- 2026-07-31 — Extended **Role-Scoped Capabilities** with the **invocation surface** facet —
  a second axis scoped the same way capabilities are: who may *start* a role (human picker vs.
  subagent dispatch). Names `front-door` (stage agents) and `dispatched` (utilities);
  orthogonal to the dispatcher/utility split; adapter maps each to the harness flag pair.
  Adds a forward-pointer to autopilot (handoff `send:true`). Grounds ADR-012.
- 2026-08-03 — Added **Quality Baseline** — a per-project four-aspect quality floor (lint,
  code-quality, security, coverage) chosen at setup from keyless-first tools, recorded as a
  single source of truth (project committed config preferred, project-context file fallback),
  and re-checked at every [quality gate](../../workflows/sdlc/implementation.md#quality-gates)'s
  Verify step on a ratchet (no-regression) floor so quality can never silently drop between
  gates. Gives the ADR-016 gate a standing floor. Grounds ADR-017.
