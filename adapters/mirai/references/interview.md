# Interview decision tables

Walked in order by [setup.md](../setup.md) step 2, via
[grill-with-docs](../../../SKILLS/discovery/grill-with-docs/SKILL.md) — one question at a time,
always leading with the recommended default, waiting for feedback before continuing.
Skip a table entirely if Explore already answered it unambiguously from the filesystem.

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

Recommended default: **both** — the prompt is the cheap quick-combo path, the agent is
the deep-workflow path; users pick per-invocation, so having both costs nothing but setup
time.

| Question | Recommended default | Signal to deviate |
|---|---|---|
| Generate the stage prompt (quick combo)? | Yes, for every adopted stage | User says they always want deep workflow, never quick |
| Generate the stage deep agent(s)? | Yes, for every adopted stage | User says they never want the deep path (rare) |

**Delivery deep tier is a split** ([ADR-008](../../../wiki/adr/adr-008-delivery-dispatchers.md)):
the deep tier for Delivery is **two dispatcher agents** — `planner.agent.md` (plan-author,
no `edit`/`delegate`) and `orchestrator.agent.md` (dispatches, no `edit`) — plus the
`verifier` utility. Confirm the user wants the split; the only "signal to deviate" is a
project that never plans/dispatches (rare — then a single edit-capable agent, but warn this
reintroduces the "won't delegate" failure). Execution is dispatched to the `quick`/`deep`
utilities; there is no edit-capable Delivery *stage* agent.

## 3. Model matching

Recommended default: ask for the user's available model list directly (no reliable
auto-detect yet — see the Open item in
[MAPPING.md](../MAPPING.md)), then map:

| Archetype | Ask | Recommended default if user has no preference |
|---|---|---|
| Communicator | "Which model do you want for interviews/planning/writing (Shaping stage, `planner`, `writing` utility)?" | Best available Claude-family model, fallback to best available general model |
| Deep Specialist | "Which model for hard architecture/debugging and routing (`orchestrator`, `deep` utility)?" | Best available GPT-family or Opus-class model, fallback to Communicator's pick |
| Extended-thinking | "Which long-context/extended-thinking model for the `verifier` (deep completeness checks against the plan)?" | Best available extended-thinking model (GPT-5.x-sol-class intent), fallback to the Deep Specialist pick |
| Utility | "Which model for cheap/fast exploration and mechanical work (`explore`/`quick`, Closing prompt tier)?" | Cheapest/fastest available model, fallback to Communicator's pick |

Always write the result as a **fallback array**, not a single string — even a one-item
array — so a future model deprecation doesn't silently break the config. Confirm the exact
model-name strings against what the user's Mirai model picker actually shows; don't guess
a string that might not match.

## 4. Utility agents

Recommended default: generate `explore` and `quick` (cheap, broadly useful) and `verifier`
(when Delivery is adopted — the Orchestrator dispatches to it); ask explicitly before
generating `deep` or `writing`.

**Not asked — the [invocation surface](../../../wiki/glossary/index.md#invocation-surface) is
derived, not chosen** ([ADR-012](../../../wiki/adr/adr-012-invocation-surface.md)). Every utility
generated here is `dispatched` (`user-invocable:false`, `disable-model-invocation:false`), and
every stage agent is `front-door` (`user-invocable:true`, `disable-model-invocation:true`). This
follows from the role kind, so there is no interview question for it — the setup step fills the
`{{ROLE_INVOCATION_SURFACE}}` placeholder from the table in
[write-format.md](write-format.md#role-invocation-surface).

| Utility agent | Ask | Recommended default |
|---|---|---|
| `explore` | Generate read-only exploration subagent? | Yes |
| `quick` | Generate fast mechanical-edit executor subagent? | Yes |
| `deep` | Generate dedicated hard-problem executor subagent? | Ask — many projects rely on `quick` alone for routine work |
| `verifier` | Generate the verification subagent (extended-thinking; dispatched to check artifacts vs. acceptance criteria; reusable by a future plan-reviewer)? | Yes when Delivery is adopted |
| `writing` | Generate dedicated prose/commit-message/docs subagent? | Ask — **DEFERRED** by default |

### Domain-specialized utilities

Scoped by problem *domain*, not intelligence tier
([ADR-009](../../../wiki/adr/adr-009-frontend-domain-utility.md)). Offer only when the project
*has* that domain — detect a frontend from the project (a `vite`/`next`/`svelte`/`astro` config,
a `src/components` tree, a browser-facing `package.json`). Skip both for a backend-only repo.

| Utility agent | Ask | Recommended default |
|---|---|---|
| `frontend` | Project has a frontend — generate the frontend dev + runtime-debugging subagent (wires `frontend-runtime-debugging` + support skills; `edit`-capable; delegates pixel-looking to `visual-qa`)? | Yes when a frontend is detected |
| `visual-qa` | Generate the isolated, vision-capable visual-verification subagent (screenshots → text-only findings; `edit`-free)? | Yes when a frontend is detected — **required** if `frontend` is generated (it is `frontend`'s pixel-isolation seam) |

If `frontend` is generated, `visual-qa` **must** be too — `frontend` delegates all pixel-looking
to it, so without `visual-qa` the isolation seam breaks. Pin `visual-qa` to a **vision-capable**
model (confirm with the user; a non-vision model silently "sees" nothing).

## 4b. Documentation-lookup capability (`docs-lookup`)

Optional, **off by default** ([ADR-007](../../../wiki/adr/adr-007-docs-lookup-capability.md)).
Ask once; if yes, wire the `docs-lookup` capability into the roles that benefit.

| Question | Recommended default | If yes |
|---|---|---|
| Want up-to-date external documentation lookup (e.g. Context7 via MCP)? | No (opt-in) | Wire `docs-lookup` into Shaping, the `planner`, and the `deep` utility. Confirm the MCP server/tool name against the user's tool list; note that server *config* lives outside the agent file (see [capabilities.md](capabilities.md)) — treat its path/format as verify-later. |

## 4c. Capability tool-name resolution

Not a preference — a resolution step. loom names capabilities generically; the adapter maps
them via [capabilities.md](capabilities.md). Most map to stable aliases; two do **not** and
must be confirmed against the user's actual tool list rather than guessed:

| Capability | Ask (only if not discoverable) | Note |
|---|---|---|
| `persist` (memory) | "What is your memory tool's exact name?" | e.g. `vscode/memory` — harness/version-specific; override the default if it differs |
| `interview` (ask-user) | "What is your ask-the-user tool's exact name?" | e.g. `vscode/askQuestions` — same caution |

## 4d. Handoff / communication protocol

Configures the [Seam Artifact Protocol](../../../wiki/patterns/seam-artifact-protocol.md) for this
project — how context crosses the stage seams. Always asked (handoff is part of the SDLC process),
but the *substrate* and *namespace* are the user's choice, revisable via a later `update`.

| Question | Recommended default | Signal to deviate |
|---|---|---|
| Where should the seam-artifact **ledger** live? | **Both** — durable artifacts in a committed `.loom/handoffs/` folder + a lightweight manifest pointer in Mirai repo memory (`/memories/repo/loom/`) for fast agent discovery | Team wants zero new committed files → memory only; team has no cross-conversation-memory culture / wants everything in PRs → committed folder only |
| **Ledger root** path? | Committed: `.loom/handoffs/` · Memory: `/memories/repo/loom/handoffs/` | Project already namespaces tooling under a different dir (e.g. `.tooling/`) — match it |
| **Namespace** convention within the ledger? | `<stage>/<milestone-slug>/*.md` (human-readable slug, not a timestamp) | User prefers sequential `handoff-NNN/` or timestamped — allow, but warn it loses milestone grouping |
| Which docs does each stage emit at its seam? | Shaping → `findings.md`, `domain-model.md` (or link), `design-decisions.md` · Delivery → `verified-change.md` · Closing → `knowledge.md` | Project has extra stage-specific artifacts (e.g. a `test-plan.md`) — add them |
| Generate the **communication protocol document**? | Yes — as a description-triggered file instruction `.mirai/instructions/handoff.instructions.md` (on-demand, so it never burns context via `applyTo:"**"`) | Never skip — it is the shared contract every participating agent references |

The interview writes the chosen substrate, root, namespace, and per-stage doc set into the
generated communication protocol document (see
[write-format.md](write-format.md#communication-protocol-document) and the
[handoff-protocol template](../assets/templates/handoff.instructions.md.template)), and seeds an
empty ledger **manifest** at `<ledger-root>/index.md`. On `update`, changing the substrate migrates
existing artifacts (or, if that is unsafe, surfaces them and asks) rather than silently orphaning them.

## 5. AGENTS.md vs `mirai-instructions.md`

Not really a question — a filesystem check with one exception:

- If root `AGENTS.md` exists → edit it. Never create `.mirai/mirai-instructions.md`.
- Else if `.mirai/mirai-instructions.md` exists → edit it. Never create root `AGENTS.md`.
- Else → **ask** which the user prefers (default recommendation: root `AGENTS.md` — it's
  the open, cross-editor standard and the one loom itself uses).

## 6. Existing `.claude/`/`.agents/` content

| Question | Recommended default | Signal to deviate |
|---|---|---|
| Project already has `.claude/skills/` or `.agents/skills/` content | Leave it alone; add loom skills to `.mirai/skills/` alongside it (Mirai reads all three) | User wants everything consolidated under `.mirai/` — then ask before moving/deleting anything, never move silently |
| Project already has `.claude/settings.json` hooks | Leave as-is; only add new hooks under `.mirai/hooks/` if the interview calls for new deterministic enforcement | User wants hooks consolidated — same caution as above |

</content>
