# Generic interview questions

> Part of the shared adapter-contract core — see [index.md](index.md). These are the
> **harness-agnostic** interview questions (setup contract step 2), walked one at a time,
> always leading with the recommended default, waiting for feedback before continuing. Skip
> a table entirely if Explore already answered it unambiguously from the filesystem.
>
> An adapter **references** these questions and adds only its **harness-specific resolution
> steps** (e.g. resolving a generic capability to a concrete tool name — that belongs in the
> adapter's [`capability→tool` port](PORTS.md), not here). Classification authority: seam
> ticket [#4](https://github.com/zentetsukenz/agent/issues/4) ("the questions are
> harness-agnostic; §4c tool-name resolution is specific").

## 1. Scope — which stages/skills does this project need?

Recommended default: **all three stages, full skill roster** — pruning is cheap to do
later via `update`, but a project that skips a stage now may not realize it needed it
until mid-task.

| Question | Recommended default | Signal to deviate |
|---|---|---|
| Does this project need the Shaping stage (Discovery+Design)? | Yes | Project is a tiny script/one-off with no design surface |
| Does this project need the Delivery stage (Planning+Implementation+Verification)? | Yes | Never skip — this is where code changes happen |
| Does this project need the Closing stage (Preservation)? | Yes | Project has no wiki/knowledge-base culture and explicitly doesn't want one |
| Any individual `SKILLS/<bucket>/<slug>` to exclude? | None | A skill's domain clearly doesn't apply (e.g. `frontend-runtime-debugging` on a backend-only repo, `server-operations` on a library with no dev server) |

## 2. Delivery tiers — prompts, agents, or both, per stage?

Recommended default: **both** — the prompt is the cheap quick-combo path, the agent is the
deep-workflow path; users pick per-invocation, so having both costs nothing but setup time.

| Question | Recommended default | Signal to deviate |
|---|---|---|
| Generate the stage prompt (quick combo)? | Yes, for every adopted stage | User says they always want deep workflow, never quick |
| Generate the stage deep agent(s)? | Yes, for every adopted stage | User says they never want the deep path (rare) |

**Delivery deep tier is a split** ([ADR-008](../wiki/adr/adr-008-delivery-dispatchers.md)):
the deep tier for Delivery is **two dispatcher agents** — a Planner (plan-author, no
`edit`/`delegate`) and an Orchestrator (dispatches, no `edit`) — plus the `verifier`
utility. Confirm the user wants the split; the only "signal to deviate" is a project that
never plans/dispatches (rare — then a single edit-capable agent, but warn this reintroduces
the "won't delegate" failure). Execution is dispatched to the `quick`/`deep` utilities;
there is no edit-capable Delivery *stage* agent.

## 3. Model matching

Recommended default: ask for the user's available model list directly (no reliable
auto-detect yet), then map onto the three archetypes (see
[primitives.md](primitives.md#the-model-archetypes)):

| Archetype | Ask | Recommended default if user has no preference |
|---|---|---|
| Communicator | "Which model for interviews/planning/writing (Shaping stage, `planner`, `writing` utility)?" | Best available Claude-family model, fallback to best available general model |
| Deep Specialist | "Which model for hard architecture/debugging and routing (`orchestrator`, `deep` utility)?" | Best available GPT-family or Opus-class model, fallback to Communicator's pick |
| Extended-thinking | "Which long-context/extended-thinking model for the `verifier` (deep completeness checks against the plan)?" | Best available extended-thinking model, fallback to the Deep Specialist pick |
| Utility | "Which model for cheap/fast exploration and mechanical work (`explore`/`quick`, Closing prompt tier)?" | Cheapest/fastest available model, fallback to Communicator's pick |

Always write the result as a **fallback array**, not a single string — even a one-item
array — so a future model deprecation doesn't silently break the config. Confirm the exact
model-name strings against what the harness actually offers; don't guess a string that
might not match. *Where* an archetype resolves to a concrete model is harness-specific (the
[`archetype→model` port](PORTS.md)).

## 4. Utility agents

Recommended default: generate `explore` and `quick` (cheap, broadly useful) and `verifier`
(when Delivery is adopted — the Orchestrator dispatches to it); ask explicitly before
generating `deep` or `writing`.

**Not asked — the [invocation surface](../wiki/glossary/index.md#invocation-surface) is
derived, not chosen** ([ADR-012](../wiki/adr/adr-012-invocation-surface.md)). Every utility
generated here is `dispatched`; every stage agent is `front-door`. This follows from the
role kind, so there is no interview question for it — the adapter fills the harness's
invocation flags from the [`primitive→file` manifest port](PORTS.md).

| Utility agent | Ask | Recommended default |
|---|---|---|
| `explore` | Generate read-only exploration subagent? | Yes |
| `quick` | Generate fast mechanical-edit executor subagent? | Yes |
| `deep` | Generate dedicated hard-problem executor subagent? | Ask — many projects rely on `quick` alone for routine work |
| `verifier` | Generate the verification subagent (extended-thinking; dispatched to check artifacts vs. acceptance criteria; reusable by a future plan-reviewer)? | Yes when Delivery is adopted |
| `writing` | Generate dedicated prose/commit-message/docs subagent? | Ask — **DEFERRED** by default |

### Domain-specialized utilities

Scoped by problem *domain*, not intelligence tier
([ADR-009](../wiki/adr/adr-009-frontend-domain-utility.md)). Offer only when the project
*has* that domain — detect a frontend from the project (a `vite`/`next`/`svelte`/`astro`
config, a `src/components` tree, a browser-facing `package.json`). Skip both for a
backend-only repo.

| Utility agent | Ask | Recommended default |
|---|---|---|
| `frontend` | Project has a frontend — generate the frontend dev + runtime-debugging subagent (wires `frontend-runtime-debugging` + support skills; `edit`-capable; delegates pixel-looking to `visual-qa`)? | Yes when a frontend is detected |
| `visual-qa` | Generate the isolated, vision-capable visual-verification subagent (screenshots → text-only findings; `edit`-free)? | Yes when a frontend is detected — **required** if `frontend` is generated |

If `frontend` is generated, `visual-qa` **must** be too — `frontend` delegates all
pixel-looking to it, so without `visual-qa` the isolation seam breaks. Pin `visual-qa` to a
**vision-capable** model (confirm with the user; a non-vision model silently "sees"
nothing).

## 4b. Documentation-lookup capability (`docs-lookup`)

Optional, **off by default** ([ADR-007](../wiki/adr/adr-007-docs-lookup-capability.md)).
Ask once; if yes, wire the `docs-lookup` capability into the roles that benefit. This is
the canonical instance of the [keyless-by-default](../wiki/principles/keyless-by-default.md)
principle ([ADR-010](../wiki/adr/adr-010-keyless-by-default-recommendations.md)).

| Question | Recommended default | If yes |
|---|---|---|
| Want up-to-date external documentation lookup (e.g. Context7 via MCP)? | No (opt-in) | Wire `docs-lookup` into Shaping, the `planner`, and the `deep` utility. Confirm the exact server/tool name against the harness's tool list; note that server *config* lives outside the agent file — treat its path/format as verify-later. |

Which roles get it: Shaping and the `planner` (design/plan against current docs) and the
`deep` utility (hard implementation). **Not** the Orchestrator (it dispatches, it doesn't
research) and **not** the Verifier (it checks against acceptance criteria, not docs).

## 4d. Handoff / communication protocol

Configures the [Seam Artifact Protocol](../wiki/patterns/seam-artifact-protocol.md) for
this project — how context crosses the stage seams. Always asked (handoff is part of the
SDLC process), but the *substrate* and *namespace* are the user's choice, revisable via a
later `update`. **Where** the substrate physically lives and **how** the obligation wires
between agents is harness-specific (the [`seam-obligation→wiring` port](PORTS.md)); the
questions themselves are generic.

| Question | Recommended default | Signal to deviate |
|---|---|---|
| Where should the seam-artifact **ledger** live? | **Both** — durable artifacts in a committed folder + a lightweight manifest pointer in harness memory (if the harness has one) for fast agent discovery | Team wants zero new committed files → memory only; team has no cross-conversation-memory culture / wants everything in PRs → committed folder only; harness has no memory tool → committed folder only |
| **Ledger root** path? | Committed: `.loom/handoffs/` (+ a memory root if the harness has memory) | Project already namespaces tooling under a different dir (e.g. `.tooling/`) — match it |
| **Namespace** convention within the ledger? | `<stage>/<milestone-slug>/*.md` (human-readable slug, not a timestamp) | User prefers sequential `handoff-NNN/` or timestamped — allow, but warn it loses milestone grouping |
| Which docs does each stage emit at its seam? | Shaping → `findings.md`, `domain-model.md` (or link), `design-decisions.md` · Delivery → `verified-change.md` · Closing → `knowledge.md` | Project has extra stage-specific artifacts (e.g. a `test-plan.md`) — add them |
| Generate the **communication protocol document**? | Yes — as an on-demand (not always-on) instruction so it never burns context | Never skip — it is the shared contract every participating agent references |

The interview writes the chosen substrate, root, namespace, and per-stage doc set into the
generated communication protocol document, and seeds an empty ledger **manifest** at
`<ledger-root>/index.md`. On `update`, changing the substrate migrates existing artifacts
(or, if that is unsafe, surfaces them and asks) rather than silently orphaning them.

## 4e. Quality baseline — lint, code-quality, security, coverage

Selects this project's [quality baseline](../wiki/patterns/quality-baseline.md) — the standing
floor the [quality gate](../workflows/sdlc/implementation.md#quality-gates) re-checks at every
slice and the [Verification](../workflows/sdlc/verification.md) final gate runs across the whole
delivery ([ADR-017](../wiki/adr/adr-017-quality-baseline.md)). Always asked (quality is part of
the SDLC process); the tools and floors are the user's choice, revisable via a later `update`.

**Explore first — recommend from the detected stack.** Read the project's package/build config
(`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, any existing lint/coverage/CI config)
*before* asking, and lead each aspect with the tool the project already uses, else the
keyless-first default for its stack. Recommendations are **keyless-first**
([keyless-by-default](../wiki/principles/keyless-by-default.md)): the default tool per aspect
runs locally with no API key/account. Hosted platforms (SonarCloud, Snyk, Codecov, …) are
offered *only* as opt-in examples if the team already uses one — never a default. Resolving a
generic aspect to a concrete tool command reuses the [`capability→tool` port](PORTS.md) discipline
("discover/confirm, don't guess") — there is **no new port**.

| Aspect | Ask (lead with the detected/recommended tool) | Keyless-first default by stack |
|---|---|---|
| **lint** | "Which linter should the gate run?" | JS/TS `eslint` · Python `ruff` · Go `go vet`+`gofmt` · Rust `clippy`+`fmt` |
| **code-quality** | "Which complexity/duplication check should the gate run?" | `eslint` complexity rules / `jscpd` · Python `radon`/`ruff` complexity · Go `gocyclo` · Rust `clippy` pedantic |
| **security** | "Which SAST / dependency-audit should the gate run?" | `npm audit`/`osv-scanner`/`semgrep` · `pip-audit`/`bandit` · `govulncheck` · `cargo audit` |
| **coverage** | "Which coverage tool should the gate run, and to what floor?" | `vitest`/`jest`/`c8` · `pytest --cov` · `go test -cover` · `cargo tarpaulin` |

For each aspect also settle:

| Question | Recommended default | Signal to deviate |
|---|---|---|
| Floor for this aspect? | **Ratchet / no-regression** — capture the current level; a gate fails if it drops below it (finding count for lint/quality/security, % for coverage) | Team wants a hard number → add an absolute target; the gate then enforces `max(ratchet, target)` |
| No keyless tool exists for this aspect on this stack? | Record the aspect as `none` **with a stated reason** | Team already pays for a hosted tool and opts in → record it, noting the key/account it needs |
| Where is the baseline recorded? | **Prefer the project's own committed tool config/scripts** (single source of truth, CI-consumable) — record only a pointer to the run command | No committed config exists → write a provenance-marked **Quality baseline** section in the project-context file (fallback) |

Adding a *new* committed config file needs explicit confirmation (setup changes no application
code, CI, or runtime config on its own); the project-context fallback is what lets the baseline
be recorded without touching project tooling. The chosen aspects, commands, and floors are
written into whichever home wins the precedence above, and referenced by the gate — not restated
per task. On `update`, re-measure the ratchet floor and reconcile it upward if the project's
current level improved (the floor only climbs).

## 4f. Macro project-management (optional)

Optional, **off by default** ([ADR-018](../wiki/adr/adr-018-macro-project-management.md)). Enables
macro-scale project management *above* single SDLC runs — [wayfinder](../SKILLS/planning/wayfinder/SKILL.md)'s
opt-in [macro mode](../SKILLS/planning/wayfinder/SKILL.md#macro-mode-dispatching-into-sdlc-runs):
charting effort as nested maps and dispatching buildable leaves *down* into SDLC runs across the
[altitude seam](../wiki/glossary/index.md#altitude-seam). Ask once; skip the rest of this section
if the project only ever runs one SDLC effort at a time.

This **extends §4d** — macro state lives on its own substrate at the macro
[altitude](../wiki/glossary/index.md#altitude), distinct from the micro (memory) ledger §4d
configured. Resolving the chosen tool's concrete operations reuses the [`capability→tool`
port](PORTS.md) discipline ("discover/confirm, don't guess") — there is **no new port**.

| Question | Recommended default | Signal to deviate |
|---|---|---|
| Run macro project-management for this project? | No (opt-in) | Effort spans many SDLC runs / more than one agent session can hold — a product, a migration, a roadmap |
| Which **substrate** is the macro **single source of truth**? | A **networked store** — a tracker/board (e.g. GitHub Issues+Projects) so many agents (and a possibly-unattended [resident agent](../wiki/glossary/index.md#resident-agent)) see the same state | Solo/offline effort with no distribution need → a committed folder or a local-markdown tracker is allowed, but it won't distribute across servers |
| Does the chosen tool **fit** loom's macro protocol? | Gauge and confirm before writing: it must express **map-as-index**, **linked (not embedded) artifacts**, and the **two label vocabularies** (`wayfinder:*` down, `sdlc:*` up) | Tool can't express native blocking/labels → fall back to the [Issue Tracker](../wiki/environments/issue-tracker.md) body conventions, and warn the frontier won't render natively |
| **Provision** the two label vocabularies on the tracker? | Yes — create `wayfinder:{research,prototype,grilling,task}` and `sdlc:{in-progress,done,needs-recharter,needs-clarification}` labels | Tracker uses a different label scheme the project already runs — map onto it and record the mapping |

The interview writes the macro source of truth, the fit assessment, and the label scheme into the
**macro section** of the [communication protocol document](../wiki/patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant)
(§4d's document, extended), guarded by the **one-source-of-truth invariant**: exactly one
registered tracker for macro state; a second, unregistered one (a stray `TODO.md`, an off-board
list) is a violation whatever substrate was chosen. Choosing the substrate — and convincing loom it
works — is the user's responsibility; loom's job is to gauge the fit and record it.

> The **resident daemon** that runs macro mode unattended (watching the board 24/7, e.g. a
> Hermes-style agent) is a **harness [adapter](../wiki/glossary/index.md#adapter) concern**, not a
> generic setup question ([ADR-018](../wiki/adr/adr-018-macro-project-management.md), keeping
> [ADR-005](../wiki/adr/adr-005-harness-agnostic-setup.md)'s harness-agnostic stance). This section
> configures the *protocol*; a human, a cron job, or a daemon may each run it.

## Project-context / instruction file

Not really a question — a filesystem check: the project's always-on context file (build/test
commands, directory structure, conventions) is edited if it exists, or created (in the
harness's convention) if it doesn't. **Which file name and where** is harness-specific (the
adapter resolves it); the *content* — per-project context, **not** workflow steering — is
generic. Workflow discipline lives in each stage agent's body, not this file (ADR-002).

## Existing agent config from other tools

| Question | Recommended default | Signal to deviate |
|---|---|---|
| Project already has agent config from another tool (`.claude/`, `.agents/`, etc.) | Leave it alone; add loom config alongside it | User wants everything consolidated — then ask before moving/deleting anything, never move silently |

## Related

- [index.md](index.md) — the setup contract these questions serve (step 2).
- [primitives.md](primitives.md) — the rosters/archetypes these questions prune and tailor.
- [PORTS.md](PORTS.md) — the harness-specific resolution steps an adapter adds on top of these questions.
- [quality-baseline](../wiki/patterns/quality-baseline.md) / [ADR-017](../wiki/adr/adr-017-quality-baseline.md) — the baseline §4e selects.
