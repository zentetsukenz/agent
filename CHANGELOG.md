# Changelog

All notable changes to this framework are documented here.

## [Unreleased] — 2026-08-17

### Changed

- **Reachable artifact substrate for HITL ticket outputs** — implements `wiki/adr/adr-022-reachable-artifact-substrate.md`. Closes a dropped-baton seam at the macro altitude where a HITL ticket's output was linked from a place a dispatched cross-harness SDLC run couldn't reach:
  - **Diagnosis:** three sibling wayfinder ticket types persisted output three ways — `research` → a reachable branch, `grilling` → a local-only `.loom/`/memory path (dead-end link), `prototype` → nowhere formal. The human workaround (push to a temp branch) was the missing protocol, hand-rolled.
  - **The artifact home is the networked substrate class's *second instrument*** (ADR-018 added the class; it now has **board = macro state** + **artifact ref = bulky content**) — an **orphan branch per effort** `loom-artifacts/<map-slug>` on the git host (disconnected history so it never tangles a rebase/merge of `main`), fetched by URL on demand and never in a working tree. Rejected committing the on-disk `.loom/` folder (clone conflicts, SDLC-session pollution) and a brand-new 4th class (unearned).
  - **Uniform PRODUCE sub-step, no ticket-type branching** — folded into `SKILLS/planning/wayfinder/SKILL.md`'s existing *"record the resolution"* step: persist any artifact via `persist`, link the URL; no-op when nothing was produced, so no `if ticket.type` in Shaping/Orchestrator. Reuses the `stage-handoff` PRODUCE contract by reference — **no new skill, no fifth port**. Ticket-types + macro down-translation notes updated (leaf's linked artifacts travel as reachable URLs; the run fetches on demand).
  - **Reachability invariant** added to `wiki/patterns/seam-artifact-protocol.md`'s macro section, beside one-source-of-truth: *a linked artifact's link MUST resolve to a substrate every participant of that altitude can reach; a local-only link (`.loom/…`, memory) is a violation.* Substrate table notes the two networked instruments.
  - `SKILLS/implementation/prototype/SKILL.md` "When done" — when resolving a tracker ticket, publish the kept answer/output to the artifact ref and link the URL (via wayfinder's PRODUCE step, not prototype-specific logic).
  - **Glossary** — new **Artifact ref** term; **Substrate** notes the two networked instruments (`wiki/glossary/index.md`).
  - **Adapters** — `adapters/mirai/MAPPING.md` §7 and `adapters/hermes/references/macro-pm.md` gain the artifact-ref `persist` target for the macro altitude (Hermes is where it's most load-bearing: cross-harness). SDLC line stays untouched and board-oblivious.
  - Registered in `wiki/adr/{index,log}.md`, `wiki/patterns/log.md`, `wiki/glossary` (Artifact ref), root `log.md`.
- **Shaping is a read-only research orchestrator** — implements `wiki/adr/adr-021-shaping-research-orchestrator.md`. Closes a leaky seam and lands the cost win:
  - `contract/primitives.md` — the Shaping capability set **gains `delegate`** (keeps `edit` withheld; `persist` scoped to the ledger), so Shaping is a **read-only Dispatcher** that routes recon/research reading to the cheap `explore` Utility tier and spikes to `quick`/`deep` — the expensive Communicator context stays lean. Mirrors [Arbor](https://arxiv.org/abs/2606.11926)'s Coordinator/Executor split. Quick stance + spike hatch updated (prior-art-before-spike).
  - `adapters/mirai/STAGES.md`, `adapters/opencode/STAGES.md` — render the `delegate` grant and note Shaping is the one stage agent that is **both `front-door` and Dispatcher** (invocation surface is orthogonal to `delegate`).
  - **OpenCode `explore` cost gap fixed** — `adapters/opencode/{STAGES,MAPPING}.md` + `references/verify.md` now **always emit `.opencode/agents/explore.md` with the Utility `model:`** rather than reusing the bare built-in on OpenCode's default model (which silently forfeited cheap-tier dispatch). Mirai already emitted its `explore` agent.
  - **Arbor mechanisms folded in minimally** — `SKILLS/discovery/research/SKILL.md` and `grill-with-docs/SKILL.md` gain "return **distilled evidence, not raw context**"; the spike hatch gains prior-art-before-spike. Idea-Tree backpropagation + budget steering deferred.
  - Glossary **Dispatcher** sharpened (Shaping is a second, read-only dispatcher; being a Dispatcher is orthogonal to invocation surface); `wiki/glossary/log.md`, `wiki/adr/{index,log}.md` registered.
- **OMO model-tiering layer dropped from the OpenCode adapter** — amends `wiki/adr/adr-014-loom-opencode-setup.md` (via ADR-021). loom already expresses per-role tiering via inline `model:` on each agent/command, so the opt-in OMO overlay was a second way to do the same thing. **Deleted** `adapters/opencode/references/omo.md`; removed the OMO opt-in interview question, the write-format OMO section + placeholder notes, the verify OMO branch, and the OMO mentions in `setup.md`, `MAPPING.md §5`, `wiki/environments/opencode.md`, `SPEC.md`, and `SETUP.md`. `archetype→model` is now inline `model:` only.
- **Glossary — system-scoped QA vocabulary** — added **Standing regression suite** and **`qa:regression-failed` (regression origin)**, and rewrote **Verification Culture** to carry the iron law (was the pre-loom "verify before done" phrasing). Registered in `wiki/glossary/log.md`.
- **System-scoped QA protocol wiring** (completes ADR-020's deferred follow-up) — wove the QA feedback loop into the macro altitude. `SKILLS/planning/wayfinder/SKILL.md` macro mode gains a **coverage-in-the-destination** subsection (user-facing efforts' destinations require passing e2e guards; conditional on the behavioral-artifact test; no new gate) and **a third origin** subsection (`qa:regression-failed` — a CI-posted event, neither `wayfinder:*` down nor `sdlc:*` up, handled AFK by **seeding a fresh terminating root map** whose destination is "restore green"; seed-not-chart). `workflows/macro-pm/index.md` gains a **System-scoped QA** section and lists the third origin in the two-vocabulary gist. **Label decision recorded in ADR-020:** a dedicated `qa:regression-failed` label (not a reused `wayfinder:grilling`), because the event is a distinct origin whose job is to authorize the AFK map-seed.
- **QA skills slimmed + re-wired** (part of the system-scoped QA rework, ADR-020) — `SKILLS/verification/verification-before-completion/SKILL.md` slimmed from a ~400-line kitchen-sink to the evidence-gathering **procedure** only (delegates the iron law to the `verification-culture` principle, gap-analysis to `derive-e2e-coverage`, and resolves concrete commands from the project's quality baseline instead of hardcoded `npm`/`pnpm`/`fish`). `visual-verification` kept and cross-linked as the executor for `visual`-dimension scenarios. Re-wired `SKILLS/verification/index.md`, `workflows/sdlc/verification.md`, and `contract/primitives.md` (skill roster). Skill count holds at 37; `scripts/validate.sh` passes.
- **Shaping deepening — de-duplicate the grilling discipline and path resolution.** Two shallow copies were collapsed across the Discovery↔Design seam (link, don't embed), mirroring the upstream `mattpocock/skills` split of `grill-with-docs` into a composer over `grilling` + `domain-modeling`:
  - `SKILLS/discovery/grill-with-docs/SKILL.md` — rewritten. Adopts the **round/frontier decision-tree walk** (map the plan as a design tree; ask the whole *frontier* — decisions whose prerequisites are settled — in numbered rounds with recommended answers; recompute each round; facts are the agent's job via sub-agents, never blocking the round) replacing the old "ask one question at a time" rule; standardises the `❓ Q# … ➡️ recommended` format; cross-links the same **frontier** notion `planning/wayfinder` uses. Its capture discipline now **references** `design/domain-model` instead of re-embedding the full Challenge/Sharpen/Cross-ref/Update/ADR block.
  - `wiki/environments/domain-docs.md` — **new** canonical environment page owning glossary/ADR **path resolution** and single/multi-context **file structure**, extracted from the three duplicated preambles (mirrors the Issue Tracker environment pattern).
  - `SKILLS/design/domain-model/SKILL.md` and `SKILLS/design/improve-codebase-architecture/SKILL.md` — their copy-pasted "Path flexibility" and file-structure blocks replaced with a one-line pointer to Domain Docs.
  - `wiki/environments/index.md`, `wiki/environments/log.md` — Domain Docs registered.

- **System-scoped QA rework** — lifts QA from a change-scoped afterthought to a system-scoped concern over macro-PM, with **no new workflow**. Implements `wiki/adr/adr-020-system-scoped-qa.md`.
  - **New skill** `SKILLS/verification/derive-e2e-coverage/SKILL.md` — the one genuinely-new judgment: given a shipped feature's **user-perspective success criteria** (read from closed `sdlc:done` leaves), decide **which e2e scenarios must guard it**, emitting scenario specs (schema harvested from the retired qa-witness) as **buildable leaves**. Coverage is folded into the effort map's **destination** (no new gate primitive); **conditional** on the behavioral-artifact test; authored 1:1 per feature but accreting into one standing regression suite whose operation is a macro-PM/CI concern.
  - **Verification iron law promoted to a principle** — `wiki/principles/verification-culture.md` rewritten to carry the iron law ("no completion claim without fresh verification evidence"), gate function, evidence-over-assertion, and rationalization table, **harness-agnostic** (names *evidence*, never `npm`). Peer to commit-often/architecture-first (precedent ADR-016).

### Removed

- **`SKILLS/verification/qa-witness-protocol/`** — pre-loom debris (`team_create`/`team_send_message`, Prometheus/Sisyphus, `.sisyphus/` vocabulary that never existed in loom). Its durable scenario schema was harvested into `derive-e2e-coverage` before deletion; e2e execution now lives in CI.

## [Unreleased] — 2026-08-14

### Added

- **Macro-PM as a first-class reactive-lifecycle workflow** — `workflows/macro-pm/index.md`, the orchestration seed for macro-scale project management. Where SDLC is a **terminating** lifecycle (a straight pipeline that ends), macro-PM is a **reactive** lifecycle: a resident agent **recursively walks a growing tree** of wayfinder decision tickets across a whole **forest** of efforts on one source of truth, dispatching buildable leaves down into SDLC runs and looping forever. `workflows/index.md` broadened to two lifecycle **kinds** (terminating | reactive).
- **Harness archetypes** — `wiki/patterns/harness-archetypes.md`: the descriptive taxonomy separating **per-invocation** harnesses (Mirai, OpenCode — compile the terminating SDLC) from **resident** harnesses (Hermes — compiles the reactive macro-PM), with a second axis of headless-dispatchability.
- **Hermes adapter** — loom's third harness adapter (`adapters/hermes/`), for the Nous Research Hermes agent, and its **first resident-archetype** adapter. It is **thin-macro**: it renders exactly one profile — the resident `wayfinder-macro` agent — that compiles the macro-PM lifecycle and **dispatches SDLC runs down into a separate per-invocation harness** (the *micro dispatch target*). It renders **no** SDLC stage or utility agents. Implements the shared setup contract (`contract/`), references — never restates — the core (`wiki/adr/adr-013-shared-adapter-contract-core.md`), and binds the macro-PM protocol (`wiki/adr/adr-018-macro-project-management.md`) rather than changing it.
  - `adapters/hermes/setup.md` — the thin-macro adapter entrypoint (renders the resident agent; dispatches SDLC out via prose, never a hardcoded command)
  - `adapters/hermes/MAPPING.md` — the four port answers: macro skills→`SKILL.md`, the single resident agent→a **profile**, `archetype→model` as `model.default` + `fallback_providers[]`, `capability→tool` with the **withhold** = grant `file` but disable `write_file`+`patch`, and the **two altitude-scoped substrates** (a networked tracker over MCP for the macro board; a **shared, on-disk, gitignored** directory for the micro ledger — never Hermes memory). §2–§3 record the *absence* of SDLC stage/utility profiles.
  - `adapters/hermes/STAGES.md` — a stub documenting that Hermes renders no stage/utility roster (it lives in the dispatch target)
  - `adapters/hermes/references/{capabilities,write-format,verify,interview,macro-pm}.md` — the resident-agent port detail; `macro-pm.md` is the genuinely-new part (resident daemon = profile + `gateway` + `cron`, the altitude-seam translator, the *micro dispatch target*, §4f label provisioning, one-source-of-truth enforcement, memory = continuity only)
  - `adapters/hermes/assets/templates/*` — profile `config.yaml`/`SOUL.md` (retargeted to the resident agent), `AGENTS.md`, and handoff protocol templates
  - `wiki/environments/hermes.md` — the authoritative Hermes primitive reference (profiles, toolsets, memory, cron/gateway, kanban, MCP)
  - `wiki/adr/adr-019-loom-hermes-setup.md` — the setup approach (resident thin-macro, prose-only dispatch, shared-on-disk gitignored ledger; folds the ADR-018 amendment)

### Changed

- `SETUP.md` — Hermes added to the harness table (Step 0)
- `SPEC.md` — new **Hermes delivery conformance** section (reconciled to the thin-macro shape)
- `scripts/validate.sh` — `validate_hermes_config` (skill `name`==folder + non-empty description, profile `config.yaml` YAML validity, non-empty `SOUL.md`) + counter/summary
- `wiki/environments/index.md` — Hermes environment listed
- `wiki/adr/adr-018-macro-project-management.md` — amendment banner: macro-PM is a peer **reactive-lifecycle workflow**, not a peer phase-pipeline (folded into ADR-019)
- `wiki/adr/adr-014-loom-opencode-setup.md` — **Option A** amendment: the micro ledger is **gitignored by default** (ephemeral coordination, not version-controlled)
- `wiki/patterns/seam-artifact-protocol.md` — substrate table + altitude-scoped section: on-disk ledger is gitignored-by-default and is the only substrate that crosses a harness boundary (memory cannot)

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
