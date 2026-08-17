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
- 2026-08-13 — Added **Harness Archetypes** — a descriptive taxonomy of the harness classes loom
  adapters target, on two axes: *who holds the workflow loop* (per-invocation vs resident) and
  *headless-dispatchable* (can another agent invoke it non-interactively). Classifies Mirai
  (per-invocation, not a target), OpenCode (per-invocation, a valid micro dispatch target), and
  Hermes (resident; invocation inverts). Gives ADR-012's invocation-surface derivation a home and
  explains why the resident archetype inverts it (a port answer, not a rule rewrite). Grounds
  ADR-019; serves ADR-018's cross-harness dispatch.
- 2026-08-12 — Extended **Seam Artifact Protocol** for the macro altitude (ADR-018): added a
  third **substrate class** (networked/external store) alongside memory and committed folder,
  because neither existing option fits macro PM (memory doesn't distribute; a committed folder
  pollutes the code tree); made substrate **altitude-scoped** (macro = networked store, micro =
  memory, joined only by the altitude-seam translator re-using this same PRODUCE/DISCOVER
  contract); and grew the **communication protocol document** with an altitude-aware macro
  section naming the single source of truth plus a **substrate-agnostic one-source-of-truth
  invariant** (a second unregistered tracker is the violation, not the substrate choice).
- 2026-08-17 — Extended **Seam Artifact Protocol** again (ADR-022): the networked substrate class
  now has **two instruments** — the **tracker/board** (macro state) and an **artifact ref** (bulky
  HITL content: a `grilling` design doc, a `prototype`'s output, `research` findings) as an orphan
  branch `loom-artifacts/<map-slug>` on the git host, fetched by URL on demand and never in a
  working tree. Added a **reachability invariant** beside one-source-of-truth: *a linked artifact's
  link MUST resolve to a substrate every participant of that altitude can reach; a local-only link
  (`.loom/…`, memory) is a violation* — closing the dropped-baton seam where a HITL ticket's output
  was linked from a place a dispatched cross-harness run couldn't follow. Publishing is a uniform
  PRODUCE sub-step in wayfinder's resolution (reusing `stage-handoff` by reference; no new skill, no
  new port). Grounds ADR-022.
