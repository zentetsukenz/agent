---
type: Log
title: Principles change log
description: Chronological log of principles changes
---

# Principles Log

- 2026-07-07 — v0.1 initial content
- 2026-07-14 — Added [architecture-first](architecture-first.md): research-backed decisions and architecture-first ordering, a cross-cutting principle of the SDLC workflow.
- 2026-07-30 — Added [keyless-by-default](keyless-by-default.md): default recommendations must work with no API key/account; API-key tools are opt-in capabilities with a keyless fallback. Generalizes ADR-007; adopted by [ADR-010](../adr/adr-010-keyless-by-default-recommendations.md).
- 2026-08-03 — Added [commit-often](commit-often.md): every green quality gate is a commit point — land verified work in small, reversible increments rather than one end-of-session drop. Adopted by [ADR-016](../adr/adr-016-embedded-review-gate.md), which embeds code-review as a quality gate instead of a standalone skill.
