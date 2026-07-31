---
type: Log
title: Environments change log
description: Chronological log of environments changes
---

# Environments Log

- 2026-07-07 — v0.1 initial content
- 2026-07-16 — Added Issue Tracker (local-markdown default + Wayfinding operations); backs the new `wayfinder` skill and closes the dangling tracker references in `to-prd`, `to-issues`, `triage`
- 2026-07-20 — Added Mirai (six customization primitives, exact frontmatter, locations); foundation reference for the loom-Mirai `setup-loom` skill
- 2026-07-31 — Expanded Mirai §5 (Custom agents) with the **invocation surface** mapping (ADR-012): the `user-invocable`/`disable-model-invocation` pair encodes the `front-door` (stage agents) vs. `dispatched` (utilities) facet; documents that `disable-model-invocation:true` does not suppress `handoffs:` targets; adds the ADR-012 cross-link
- 2026-07-31 — Added OpenCode (primary/subagent agents, commands, skills, `permission:`-based tool control, `AGENTS.md`/`instructions:` context, the two GAPs — no memory tool, no description-triggered instructions — and the opt-in OMO model-tiering layer); foundation reference for the loom-OpenCode adapter (`adapters/opencode/setup.md`, ADR-014)
