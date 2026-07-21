---
type: Log
title: loom framework change log
description: Chronological log of framework-level events
---
# Framework Log

- 2026-07-07 — v0.1.0 content-only framework skeleton initialized
- 2026-07-16 — Added `wayfinder` (planning) and `research` (discovery) skills, ported from mattpocock/skills; added `wiki/environments/issue-tracker.md` to close the dangling tracker references in `to-prd`, `to-issues`, and `triage`
- 2026-07-20 — Implemented the loom→Mirai setup approach (ADR-004): `wiki/environments/mirai.md`, `adapters/mirai/{MAPPING,STAGES}.md`, the `setup-loom` skill (`SKILLS/meta/setup-loom/`), `commands/setup-loom.md` + `commands/update-loom.md`, root `SETUP.md` entrypoint, and `.mirai/` frontmatter checks added to `scripts/validate.sh`
