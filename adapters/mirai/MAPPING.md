# loom → Mirai Mapping

> Adapter content for the Mirai harness. See [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md)
> for why this mapping exists and [wiki/environments/mirai.md](../../wiki/environments/mirai.md)
> for Mirai's customization primitives. This file is the concrete lookup table the
> `setup-loom` skill (see [SKILLS/meta/setup-loom](../../SKILLS/meta/setup-loom/SKILL.md))
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

**Setup skill itself is not copied.** `setup-loom` stays a loom-repo-only authoring tool;
it is what *writes* `.mirai/`, not content that ships inside it.

## 2. Stages → prompts (combo) + agents (deep)

The SDLC's six phases (see [workflows/sdlc/index.md](../../workflows/sdlc/index.md)) group
into three stages. Each stage gets **two** delivery tiers — the user picks per invocation:

| Stage | Phases | Prompt (quick combo) | Agent (deep workflow) |
|---|---|---|---|
| Shaping | Discovery, Design | `.mirai/prompts/shape.prompt.md` | `.mirai/agents/shaping.agent.md` |
| Delivery | Planning, Implementation, Verification | `.mirai/prompts/deliver.prompt.md` | `.mirai/agents/delivery.agent.md` |
| Closing | Preservation | `.mirai/prompts/close.prompt.md` | `.mirai/agents/closing.agent.md` |

- A **prompt** (`.mirai/prompts/<stage>.prompt.md`) is a preset bundle: `agent:` field
  names the stage's tools/model combo, body references the specific skills to invoke
  in order for the quick path. It IS the bundle — no separate bundle-skill layer exists.
- An **agent** (`.mirai/agents/<stage>.agent.md`) carries the corresponding
  `workflows/sdlc/<phase>.md` DEEP workflow prose in its system prompt (concatenated
  across the stage's phases), plus a preset `model:` (with fallback array) matched to the
  stage's role archetype (below).
- See [STAGES.md](STAGES.md) for the exact skill roster and workflow-prose sourcing per
  stage.

## 3. Utility agents (à la OMO)

Independent of the three SDLC stages, `setup-loom` offers a small utility-agent roster —
plain `.mirai/agents/*.agent.md` files any stage agent or the user can dispatch to as
subagents:

| Utility agent | Purpose | Archetype |
|---|---|---|
| `explore.agent.md` | Read-only codebase exploration and Q&A (mirrors loom's own `Explore` subagent) | Utility |
| `quick.agent.md` | Fast, cheap mechanical edits (formatting, small fixes, boilerplate) | Utility |
| `deep.agent.md` | Hard architectural/debugging problems needing a strong reasoning model | Deep Specialist |
| `writing.agent.md` | Prose — commit messages, PR descriptions, docs, release notes | Communicator |

These are optional; the setup interview asks which of them the project wants generated.

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
| **Communicator** | Interviews, planning, writing, sociable lead/orchestrate | Shaping stage (both tiers), `writing` utility agent, `setup-loom` itself | `['Claude Sonnet 4.5 (copilot)', 'GPT-5 (copilot)']` |
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

## Related

- [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) — the decision this mapping implements.
- [wiki/environments/mirai.md](../../wiki/environments/mirai.md) — Mirai primitive reference.
- [STAGES.md](STAGES.md) — stage groupings, skill rosters, workflow-prose sourcing.
- [SKILLS/meta/setup-loom](../../SKILLS/meta/setup-loom/SKILL.md) — the
  skill that reads this file.
</content>
