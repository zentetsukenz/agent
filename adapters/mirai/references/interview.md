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

| Utility agent | Ask | Recommended default |
|---|---|---|
| `explore` | Generate read-only exploration subagent? | Yes |
| `quick` | Generate fast mechanical-edit executor subagent? | Yes |
| `deep` | Generate dedicated hard-problem executor subagent? | Ask — many projects rely on `quick` alone for routine work |
| `verifier` | Generate the verification subagent (extended-thinking; dispatched to check artifacts vs. acceptance criteria; reusable by a future plan-reviewer)? | Yes when Delivery is adopted |
| `writing` | Generate dedicated prose/commit-message/docs subagent? | Ask — **DEFERRED** by default |

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
