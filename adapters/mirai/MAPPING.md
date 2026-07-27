# loom → Mirai Mapping

> Adapter content for the Mirai harness. See [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md)
> for why this mapping exists and [wiki/environments/mirai.md](../../wiki/environments/mirai.md)
> for Mirai's customization primitives. This file is the concrete lookup table the
> Mirai adapter's setup instruction (see [setup.md](setup.md))
> consults when generating a project's `.mirai/` configuration. See
> [STAGES.md](STAGES.md) for the Shaping/Delivery/Closing stage groupings this table feeds.

## 1. SKILLS/ → `.mirai/skills/`

Every loom skill a project adopts is copied (and lightly tailored during the setup
interview) from `SKILLS/<bucket>/<slug>/SKILL.md` to `.mirai/skills/<slug>/SKILL.md`,
preserving any `references/`, `scripts/`, or `assets/` subdirectories one level deep.

| loom source | `.mirai/skills/` target | Notes |
|---|---|---|
| `SKILLS/<bucket>/<slug>/SKILL.md` | `.mirai/skills/<slug>/SKILL.md` | `name` in frontmatter must equal `<slug>` (Mirai requirement) — unchanged by the copy since loom already enforces this. |
| `SKILLS/<bucket>/<slug>/references/*` | `.mirai/skills/<slug>/references/*` | Copied as-is. |
| `SKILLS/<bucket>/<slug>/scripts/*` | `.mirai/skills/<slug>/scripts/*` | Copied as-is. |
| `SKILLS/meta/*` (core primitives) | `.mirai/skills/<slug>/` | Model-invoked cores (see SPEC.md's wrapper/core split) copy alongside any wrapper skill that references them, so relative links resolve. |

**Tailoring during setup**: the interview may prune skills irrelevant to the project
(e.g. `frontend-runtime-debugging` for a backend-only repo), and may adjust a skill's
`description` to reference the project's actual tools/paths (e.g. its issue tracker or
test command) — never its core procedure.

**The setup instruction itself is not copied.** `adapters/mirai/setup.md` stays a
loom-repo-only authoring instruction; it is what *writes* `.mirai/`, not content that
ships inside it.

## 2. Stages → prompts (combo) + agents (deep)

The SDLC's six phases (see [workflows/sdlc/index.md](../../workflows/sdlc/index.md)) group
into three stages. Each stage gets a **quick prompt** tier and a **deep agent** tier — the
user picks per invocation:

| Stage | Phases | Prompt (quick combo) | Deep agent(s) |
|---|---|---|---|
| Shaping | Discovery, Design | `.mirai/prompts/shape.prompt.md` | `.mirai/agents/shaping.agent.md` |
| Delivery | Planning, Implementation, Verification | `.mirai/prompts/deliver.prompt.md` | `.mirai/agents/planner.agent.md` + `.mirai/agents/orchestrator.agent.md` (dispatchers); verification dispatched to the `verifier` utility |
| Closing | Preservation | `.mirai/prompts/close.prompt.md` | `.mirai/agents/closing.agent.md` |

- A **prompt** (`.mirai/prompts/<stage>.prompt.md`) is a preset bundle whose body references
  the specific skills to invoke for the quick path. Its `agent:` field names a **base
  agent** (a Mirai built-in — `Plan` for read-only Shaping, `agent` otherwise), **not** the
  custom deep stage agent: the prompt stays decoupled from the deep agent, and read-only
  stages inherit the harness's no-edit guarantee from `Plan` mode
  ([ADR-006](../../wiki/adr/adr-006-capability-based-roles.md)). A short in-body **stance**
  line is the portable backstop. It IS the bundle — no separate bundle-skill layer exists.
- A **deep agent** (`.mirai/agents/<role>.agent.md`) carries the corresponding
  `workflows/sdlc/<phase>.md` DEEP workflow prose, a preset `model:` (fallback array), and
  a **role-scoped capability set** ([ADR-006](../../wiki/adr/adr-006-capability-based-roles.md))
  — the withheld capabilities are load-bearing.
- **Delivery is split** into a Planner and an Orchestrator (dispatchers, no `edit`) per
  [ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md); execution goes to the
  `quick`/`deep` utilities and verification to the `verifier` utility. The old single
  `delivery.agent.md` is retired.
- See [STAGES.md](STAGES.md) for the exact skill roster, capability set, and workflow-prose
  sourcing per role.

## 3. Utility agents (à la OMO)

Independent of the three SDLC stages, the setup instruction offers a small utility-agent
roster — plain `.mirai/agents/*.agent.md` files that a [Dispatcher](../../wiki/glossary/index.md#dispatcher)
(the Orchestrator, a future plan-reviewer) or the user can dispatch to as subagents. This is
the **dispatched** tier of [role-scoped-capabilities](../../wiki/patterns/role-scoped-capabilities.md):

| Utility agent | Purpose | Archetype | Capabilities |
|---|---|---|---|
| `explore.agent.md` | Read-only codebase exploration and Q&A (mirrors loom's own `Explore` subagent) | Utility | `read`, `search` |
| `quick.agent.md` | Fast, cheap mechanical edits — executor (formatting, small fixes, boilerplate) | Utility | `read`, `edit`, `search`, `shell`, `tasks` |
| `deep.agent.md` | Hard architectural/debugging problems — executor, strong reasoning model | Deep Specialist | `read`, `edit`, `search`, `shell`, `delegate`, `persist`, `tasks` (+ `docs-lookup` if opted) |
| `verifier.agent.md` | Verify an artifact against its acceptance criteria; return evidence, don't fix | Deep Specialist (extended-thinking) | `read`, `search`, `shell`, `persist` — **no `edit`** |
| `writing.agent.md` | Prose — commit messages, PR descriptions, docs, release notes | Communicator | `read`, `edit`, `search` — **DEFERRED** |

The **Verifier** ([ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md)) is a utility,
not a Delivery stage agent, so multiple dispatchers can reuse it (Orchestrator → verify a
change; future plan-reviewer → verify a plan). These are optional; the setup interview asks
which the project wants generated (Verifier defaults to Yes when Delivery is adopted).

### Domain-specialized utilities

The roster above is differentiated by **intelligence tier**. A
[domain-specialized utility](../../wiki/glossary/index.md#domain-specialized-utility)
([ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md)) is instead scoped to a
**problem domain** and wires that domain's skill cluster. These are offered only when the
project has that domain (the setup interview gates them — e.g. skip both for a backend-only
repo):

| Utility agent | Purpose | Archetype | Capabilities |
|---|---|---|---|
| `frontend.agent.md` | Frontend development + runtime debugging; delegates pixel-looking to `visual-qa` | Deep Specialist | `read`, `edit`, `search`, `shell`, `delegate`, `persist`, `tasks` (+ `docs-lookup` if opted) |
| `visual-qa.agent.md` | Isolated, vision-capable visual verification — captures screenshots, returns text-only findings | Deep Specialist (vision) | `read`, `search`, `shell` — **no `edit`** (verifies, doesn't fix) |

The two form the frontend isolation seam ([ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md)):
`frontend` (`edit`-capable, dev + runtime debug) *delegates* pixel-looking to `visual-qa`
(`edit`-free, vision-capable) so screenshot bytes never enter the edit-capable context. Source
agents: [agents/frontend.md](../../agents/frontend.md), [agents/visual-qa.md](../../agents/visual-qa.md).
The shared browser-drive knowledge both wire lives in
[wiki/patterns/browser-capture.md](../../wiki/patterns/browser-capture.md).

## 4. AGENTS.md role

Root `AGENTS.md` (or `.mirai/mirai-instructions.md` — pick one, see
[wiki/environments/mirai.md](../../wiki/environments/mirai.md)) is **per-project context**,
not workflow steering: build/test commands, directory structure, naming conventions,
links to deeper docs. It is written at `init` and kept current by `update`. It is
explicitly NOT where the SDLC workflow discipline lives — that lives in each stage
`.agent.md`'s body, consistent with [ADR-002](../../wiki/adr/adr-002-workflow-as-adapter-seed.md)'s
prose-first stance (steering is emergent from prompts, not a schema).

## 5. Model-archetype table

Borrowed framing from OMO's "models are developers" (assign a model matching an agent's
*working style*), expressed directly in each generated file's `model:` field (string or
fallback array) rather than a separate config, since Mirai has no central model-routing
config.

| Archetype | Working style | Assigned to | Example fallback array |
|---|---|---|---|
| **Communicator** | Interviews, planning, writing, sociable lead/orchestrate | Shaping stage (both tiers), `writing` utility agent, the setup instruction itself | `['Claude Sonnet 4.5 (copilot)', 'GPT-5 (copilot)']` |
| **Deep Specialist** | Architecture, hard debugging, high-stakes correctness | Delivery agent tier (deep), `deep` utility agent, `architect-review`-flavored prompts | `['GPT-5 (copilot)', 'Claude Opus (copilot)']` |
| **Utility** | Cheap/fast, mechanical, high-volume, low-risk | `explore`/`quick` utility agents, Closing stage prompt tier, exploratory subagent dispatch | `['GPT-5 mini (copilot)', 'Claude Haiku (copilot)']` |

The setup interview collects the user's **actual available model list** (optionally
auto-detected — see the Verify-Later note below) and maps it onto these three archetypes,
writing the resulting `model:` string/array into each generated `.agent.md`/`.prompt.md`.
Exact model-name strings are project/subscription-specific; treat the fallback arrays
above as *illustrative*, not literal defaults to hardcode.

**Open item** (carried from the locked plan, not yet resolved): whether Mirai exposes a
programmatic way to enumerate currently available models (VS Code LM API, or a `mirai`/
`code` CLI command) for auto-detect. Until resolved, the interview asks the user directly.

## 6. Capability → Mirai tool mapping

loom names agent [capabilities](../../wiki/patterns/role-scoped-capabilities.md) generically
([ADR-006](../../wiki/adr/adr-006-capability-based-roles.md)); this table maps each to its
Mirai tool. The setup step writes the mapped names into each agent's `tools:` array. The
adapter **tolerates deviation** — where a mapped name is harness-/version-specific, it is
discovered or confirmed against the user's actual tool list at setup, never hardcoded blind
(same discipline as model-name strings). Full detail:
[references/capabilities.md](references/capabilities.md).

| Capability | Mirai tool | Kind | Notes |
|---|---|---|---|
| `read` | `read` | alias | stable |
| `edit` | `edit` | alias | stable |
| `shell` | `execute` | alias | stable |
| `delegate` | `agent` | alias | dispatch subagents |
| `web` | `web` | alias | stable |
| `tasks` | `todo` | alias | stable |
| `persist` | e.g. `vscode/memory` | specific tool | **discover/confirm at setup** — not an alias |
| `interview` | e.g. `vscode/askQuestions` | specific tool | **discover/confirm at setup** — not an alias |
| `docs-lookup` | MCP `<server>/*` (e.g. `context7/*`) | MCP server | **opt-in** ([ADR-007](../../wiki/adr/adr-007-docs-lookup-capability.md)); server config lives outside the agent file |

## Related

- [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) — the base setup approach this mapping implements.
- [ADR-006](../../wiki/adr/adr-006-capability-based-roles.md) — capability-based role discipline (§6 above).
- [ADR-007](../../wiki/adr/adr-007-docs-lookup-capability.md) — the optional `docs-lookup` capability.
- [ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md) — the Delivery dispatcher split (§2, §3).
- [ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md) — the `frontend` + `visual-qa` domain-specialized utilities (§3).
- [wiki/environments/mirai.md](../../wiki/environments/mirai.md) — Mirai primitive reference.
- [references/capabilities.md](references/capabilities.md) — full capability→tool mapping and docs-lookup wiring.
- [STAGES.md](STAGES.md) — stage groupings, skill rosters, capability sets, workflow-prose sourcing.
- [setup.md](setup.md) — the Mirai adapter setup instruction that reads this file.
</content>
