---
type: Log
title: ADR change log
description: Chronological log of ADR changes
---

# ADR Log

- 2026-07-07 — v0.1 initial ADR-001 (adapter pattern) proposed
- 2026-07-14 — ADR-002 (workflows are prose-first adapter seeds) accepted
- 2026-07-14 — ADR-003 (architecture-first ordering) accepted
- 2026-07-20 — ADR-004 (loom setup approach for the Mirai harness) accepted; setup skill, 4-layer model, two-tier stage delivery, per-agent model matching
- 2026-07-21 — ADR-005 (harness-agnostic setup entrypoint + universal setup contract) accepted; reframes ADR-004 as the first adapter; setup/update run via SETUP.md read remotely, no command surface
- 2026-07-24 — ADR-006 (capability-based role discipline) accepted; roles are scoped capability sets, enforced by withholding (no-`edit` as a forcing function); generic capabilities the adapter maps to harness tool names and tolerates deviation
- 2026-07-24 — ADR-007 (optional documentation-lookup capability) accepted; tool-agnostic `docs-lookup`, off by default, interview-gated (Context7/MCP = current impl)
- 2026-07-24 — ADR-008 (Delivery dispatchers delegate execution and verification) accepted; Delivery splits into Planner + Orchestrator dispatchers; execution → `quick`/`deep`, verification → the reusable `verifier` utility; retires the single `delivery.agent.md`
