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
