# Changelog

All notable changes to this framework are documented here.

## [Unreleased] — 2026-07-20

### Added

- **loom → Mirai setup** — first concrete, working delivery target ahead of the general v2 adapter. See `wiki/adr/adr-004-loom-mirai-setup.md`.
  - `wiki/environments/mirai.md` — Mirai's six customization primitives (agent instructions, file instructions, prompts, hooks, custom agents, skills), exact frontmatter, locations, and official doc links
  - `wiki/adr/adr-004-loom-mirai-setup.md` — ADR recording the setup-skill delivery mechanism, 4-layer architecture (AGENTS.md / per-stage agents / granular skills / stage-combo prompts), two-tier stage delivery, and per-agent model matching
  - `adapters/mirai/MAPPING.md` — SKILLS→`.mirai/skills` mapping, stage→prompt/agent mapping, model-archetype table (Communicator / Deep Specialist / Utility)
  - `adapters/mirai/STAGES.md` — Shaping/Delivery/Closing stage groupings, skill rosters, workflow-prose sourcing
  - `SKILLS/meta/setup-loom/` — the agent-executable `init`/`update` setup skill (mattpocock-shaped, `disable-model-invocation: true`), with `references/` (interview decision tables, write-format/idempotency rules, verify checklist) and `assets/templates/` (stage agent/prompt/AGENTS.md skeletons)
  - `commands/setup-loom.md`, `commands/update-loom.md` — guided command wrappers for the two modes
  - Root `SETUP.md` — thin "paste this to your agent" bootstrap entrypoint
  - `scripts/validate.sh` extended to check `.mirai/` frontmatter when present: skill `name`-matches-folder (Mirai-specific), required `description`s on skills/agents/prompts/instructions, valid JSON hooks, and the AGENTS.md-XOR-mirai-instructions.md rule
  - `SPEC.md` — new "Mirai delivery conformance" section documenting the subset the validator enforces
- **`design/` lifecycle bucket** (7th bucket) — shapes the solution before Planning decomposes it. Houses `codebase-design`, `domain-model`, `design-an-interface`, and `improve-codebase-architecture`
- **`codebase-design` skill** — extracted the shared deep-module vocabulary (module, interface, seam, adapter, leverage, locality), principles (deletion test, "interface is the test surface"), and a new "designing for testability" section out of `improve-codebase-architecture` so other design skills can reference one source (mirrors upstream mattpocock/skills split)
- **SDLC Design phase** — six ordered phases now (Discovery → Design → Planning → …), plus a three-stage ownership overlay (Shaping / Delivery / Closing) naming the real handoff seams without adding gates
- `wayfinder` planning skill — chart huge, multi-session work as a shared map of decision tickets on the issue tracker, resolving them one at a time (ported from mattpocock/skills, adapted to loom's skill vocabulary)

### Changed

- `improve-codebase-architecture` slimmed to reference `codebase-design` for vocabulary; added "scope before you scan — YAGNI" git-log hot-spot scoping to its Explore step; moved from `discovery/` to `design/`
- `domain-model` and `design-an-interface` moved from `planning/` to `design/`
- Renamed "design tree" → "decision tree" in `grill-me`, `grill-with-docs`, and `domain-model` to avoid collision with the new Design phase
- Planning phase now *consumes* Design's artifacts (domain model, interface designs) and loops back on a design gap rather than shaping inside a task
- `research` discovery skill — lightweight, single-question fact-finding via a background subagent against primary sources (ported from mattpocock/skills); distinct from the comparative `research-recommend`
- `wiki/environments/issue-tracker.md` — the issue-tracker abstraction, local-markdown default, and Wayfinding operations that `to-prd`, `to-issues`, `triage`, and `wayfinder` now resolve against
- `commands/wayfinder.md` — slash command wrapper for charting or working through a wayfinder map

### Fixed

- `to-prd`, `to-issues`, `triage` no longer reference the nonexistent `/setup-matt-pocock-skills` command — they resolve the tracker via the new environment doc instead
- Stray `</content>` tag at the end of `SKILLS/index.md`

## [0.1.0] — 2026-07-07

### Added

- Initial content-only framework skeleton
- Root directory structure (skills/, wiki/, agents/, commands/, docs/, adapters/, scripts/)
- SPEC.md conformance rules (agentskills.io + OKF v0.1)
