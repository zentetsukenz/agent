---
type: Log
title: loom framework change log
description: Chronological log of framework-level events
---
# Framework Log

- 2026-07-07 — v0.1.0 content-only framework skeleton initialized
- 2026-07-16 — Added `wayfinder` (planning) and `research` (discovery) skills, ported from mattpocock/skills; added `wiki/environments/issue-tracker.md` to close the dangling tracker references in `to-prd`, `to-issues`, and `triage`
- 2026-07-20 — Implemented the loom→Mirai setup approach (ADR-004): `wiki/environments/mirai.md`, `adapters/mirai/{MAPPING,STAGES}.md`, the `setup-loom` skill (`SKILLS/meta/setup-loom/`), `commands/setup-loom.md` + `commands/update-loom.md`, root `SETUP.md` entrypoint, and `.mirai/` frontmatter checks added to `scripts/validate.sh`
- 2026-07-21 — Made setup harness-agnostic (ADR-005): reframed `SETUP.md` as the harness-agnostic entrypoint running a universal setup contract, with Mirai as the first adapter (ADR-004); baked **Harness**, **Adapter**, **Setup contract** into the glossary; added a "Setup contract conformance" section to `SPEC.md`; removed `commands/{setup-loom,update-loom}.md` — `init`/`update` now run by an agent reading `SETUP.md` (no command, no clone); de-leaked Mirai-specific wording from `README.md`, `index.md`, and `SKILLS/meta/index.md`
- 2026-07-21 — Consolidated the Mirai adapter: moved the setup procedure from `SKILLS/meta/setup-loom-mirai/` into the adapter as `adapters/mirai/setup.md` (+ `references/`, `assets/templates/`), dropping its skill frontmatter — it is an adapter instruction an agent reads, not a loom skill or command. Repointed all references; extended `scripts/validate.sh` to link-check `agent/adapters`
- 2026-07-31 — Built the loom→OpenCode adapter (ADR-014), loom's **second** adapter and the first written against the shared `contract/` core (reference-never-restate): `wiki/environments/opencode.md`, the `adapters/opencode/` tree (`setup.md`, `MAPPING.md`, `STAGES.md`, `references/{capabilities,write-format,verify,interview,omo}.md`, `assets/templates/*`), `wiki/adr/adr-014-loom-opencode-setup.md`, the SETUP.md harness-table row, the SPEC "OpenCode delivery conformance" section, and `validate_opencode_config` in `scripts/validate.sh`. Answers the four ports for OpenCode: capability→`permission:` (`deny` = withhold; native `question` tool for interview), archetype→inline `model:` **or** opt-in `omo.json`, seam→committed `.loom/handoffs/` ledger (no memory tool / no `handoffs:` primitive), primitive→file manifest (`mode:primary`/`subagent`, `plan`/`build` base agents). OMO strictly opt-in
