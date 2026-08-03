# Changelog

All notable changes to this framework are documented here.

## [Unreleased] — 2026-08-03

### Added

- **Quality baseline** — a per-project quality floor across four aspects (lint, code-quality, security, coverage), chosen during setup from keyless-first tools and re-checked at every quality gate so quality can't silently drop between gates and get caught too late. Implements `wiki/adr/adr-017-quality-baseline.md`.
  - `wiki/patterns/quality-baseline.md` — the pattern: four aspects, keyless-first selection, ratchet (no-regression) floor by default with optional absolute target, single source of truth (project committed config preferred; provenance-marked project-context section as fallback), enforced at the existing gate's Verify step
  - `wiki/adr/adr-017-quality-baseline.md` — the decision (no new primitive, no fifth adapter port; tool selection reuses `capability→tool`, the record is project context)
  - Glossary terms **Quality baseline** and **Quality aspect**

### Changed

- `contract/interview.md` — new **§4e Quality baseline** interview section (stack-driven, keyless-first, ratchet default, single-source-of-truth precedence)
- `contract/primitives.md` — records the baseline home (committed config preferred, project-context fallback) as project context, not a new primitive
- `contract/discipline.md` — new generic invariant-check group (baseline recorded, one home, keyless-or-`none`, no CI/runtime edits)
- `workflows/sdlc/{implementation,planning,verification,index}.md` — the gate's Verify step now runs the baseline per slice; Planning names each gate's aspects; Verification runs the full baseline over the whole delivery; the workflow overview lists the quality-baseline cross-cutting concern
- `adapters/{mirai,opencode}/setup.md` + `references/interview.md` — interview enumerations now include the quality-baseline question (adapters add only the reference; no new port)

## [Unreleased] — 2026-07-31

### Added

- **Shared adapter-contract core** — the generic half of the setup contract now lives once in a new top-level `contract/` directory; adapters reference it and supply only their four harness-specific port obligations. Implements `wiki/adr/adr-013-shared-adapter-contract-core.md` (Design B: prose obligations over template packs; reference, never restate). Resolves [#9](https://github.com/zentetsukenz/agent/issues/9).
  - `contract/index.md` — the five-step setup contract, `init`/`update` semantics, universal safety rules
  - `contract/primitives.md` — the six loom primitives + generic content: stage groupings, per-stage skill rosters, capability-set-per-role, model archetypes, the communication-protocol obligation
  - `contract/interview.md` — the harness-agnostic interview questions (Scope, tiers, model matching, utility agents, docs-lookup, handoff)
  - `contract/discipline.md` — provenance/idempotency discipline + the generic invariant-checks the verify step inherits
  - `contract/PORTS.md` — the four port obligations (`capability→tool`, `archetype→model`, `seam-obligation→wiring`, `primitive→file` manifest) as prose (no schema/DSL)

### Changed

- **`adapters/mirai/` refactored to reference the core** — generic content deleted from the adapter and sourced from `contract/`; only Mirai's four port answers + the harness manifest remain. `setup.md` is now a thin orchestrator (211→128 lines); `STAGES.md` (284→107) and `references/interview.md` (153→55) keep only Mirai render bindings; `references/verify.md` split into generic invariant-checks (core) + Mirai format-checks (local); `MAPPING.md`, `write-format.md`, `capabilities.md` reframed as port answers that link — never restate — the generic content
- `SETUP.md` — Step 2 now points at `contract/` for the generic contract body + the four port obligations
- `SPEC.md` "Setup contract conformance" — adds the four-port + reference-not-restate conformance rule
- `index.md` — registers the `contract/` directory
- `scripts/validate.sh` — link-checks the new `contract/` tree

## [Unreleased] — 2026-07-30

### Added

- **Keyless-by-default recommendations** — default recommendations must work with no API key or account; tools that need one are opt-in capabilities with a keyless fallback. Generalizes ADR-007 (docs-lookup) to every external tool.
  - `wiki/principles/keyless-by-default.md` — the principle: name the capability not the tool, keep API-key tools opt-in, degrade gracefully; keyless-local tools (Playwright/Chrome DevTools) may stay defaults
  - `wiki/adr/adr-010-keyless-by-default-recommendations.md` — the decision generalizing ADR-007

### Changed

- `SKILLS/discovery/research-recommend/SKILL.md` — Phases 3 & 5 now describe **capabilities** (web search, code-example search, library-docs lookup) with concrete tools (Exa, a GitHub code-search MCP, Context7) as *examples if available*, plus explicit graceful degradation when a capability isn't configured — no longer requires API-key tools
- `docs/researcher-agent-design.md` §4.4 — "Required tools" reframed as required **capabilities** (`web`, `read`/`search`) with `docs-lookup` opt-in; example agent `tools:` array uses `web` instead of a hardcoded `web-search/*` glob
- `wiki/adr/adr-007-docs-lookup-capability.md`, `adapters/mirai/references/capabilities.md` — cross-linked to the new principle/ADR-010

## [Unreleased] — 2026-07-24

### Added

- **Role-scoped capabilities** — a harness-agnostic loom pattern: an agent's role is the scoped set of capabilities it is granted, and enforcement comes from *withholding* capabilities (a role with no `edit` cannot write code), not from prose. See `wiki/patterns/role-scoped-capabilities.md`.
  - `wiki/adr/adr-006-capability-based-roles.md` — capability-based role discipline; generic capability names the adapter maps to harness tool names and tolerates deviation; no-`edit` as a forcing function; per-stage quick base agent (`plan` for read-only Shaping) + stance line
  - `wiki/adr/adr-007-docs-lookup-capability.md` — optional, tool-agnostic `docs-lookup` capability (Context7/MCP is the current impl), off by default and interview-gated
  - `wiki/adr/adr-008-delivery-dispatchers.md` — Delivery splits into Planner + Orchestrator dispatchers (neither holds `edit`); execution dispatched to the `quick`/`deep` utilities and verification to a reusable `verifier` utility; retires the single `delivery.agent.md`
  - Glossary: **Capability**, **Role**, **Dispatcher**, **Utility (dispatched) agent**; sharpened **Agent** and **Orchestrator**
  - `adapters/mirai/references/capabilities.md` — generic capability → Mirai tool mapping and docs-lookup/MCP wiring
  - `adapters/mirai/MAPPING.md` §6 — the capability → Mirai tool mapping table

### Changed

- Mirai adapter now generates **role-scoped** agents: the shared agent template (`assets/templates/stage.agent.md.template` → renamed `role.agent.md.template`) is parameterised by `{{ROLE_TOOLS}}`/`{{ROLE_MODEL}}` instead of a hardcoded tool set; Shaping drops `edit` and gains `persist`/`interview`; Delivery emits `planner.agent.md` + `orchestrator.agent.md` (dispatchers) plus a `verifier.agent.md` utility
- Quick prompts (`stage.prompt.md.template`) now set a per-stage **base agent** (`plan` for Shaping, `agent` otherwise) and carry an in-body **stance** line — fixes `shaping-quick` running in the generic agent and jumping to code
- `adapters/mirai/STAGES.md` — per-role capability rows, quick base-agent/stance, Delivery dispatcher split, Verifier in the utility roster
- `adapters/mirai/setup.md`, `references/interview.md`, `references/write-format.md`, `references/verify.md` — capability-to-tool resolution (discover/confirm harness-specific names), docs-lookup and Delivery-split interview tables, an `update` frontmatter-reconcile rule (frontmatter lives above the provenance marker), a `delivery.agent.md`→dispatchers migration note, and capability checks
- `wiki/environments/mirai.md` — prompt base-agent mapping, role-capability `tools:` mapping, `persist`/`interview` are specific tool names (not aliases), and an MCP-for-`docs-lookup` subsection

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
