---
type: Environment
title: Mirai (VS Code Agent Harness)
description: Mirai's customization primitives — exact frontmatter, file locations, and official doc links — as the authoritative reference for loom's Mirai adapter setup instruction
tags: [mirai, vscode, harness, customization, adapter, setup]
timestamp: 2026-07-20T00:00:00Z
---

# Mirai (VS Code Agent Harness)

Mirai is a VS Code-based agent harness — a **superset of Claude Code**. It reads `.mirai/`
first, and falls back to `.agents/` and `.claude/` for the primitives those tools share
(skills, hooks). This page is the authoritative reference the Mirai adapter's setup
instruction (see [adapters/mirai/setup.md](../../adapters/mirai/setup.md))
consults when generating a bespoke `.mirai/` configuration for a project. It exists so
that instruction doesn't have to re-derive Mirai's customization model from scratch every run.

Source of truth: the bundled `agent-customization` skill shipped with Mirai
(`.../extensions/copilot/assets/prompts/skills/agent-customization/`) plus the official
docs at `https://code.visualstudio.com/docs/copilot/customization/<page>`.

## The six primitives

| # | Primitive | File(s) | Location | When to use |
|---|---|---|---|---|
| 1 | Agent instructions | `mirai-instructions.md` **or** `AGENTS.md` (pick ONE) | `.mirai/` or repo root | Always-on, project-wide conventions |
| 2 | File instructions | `*.instructions.md` | `.mirai/instructions/` | Applies to specific files (`applyTo` glob) or on-demand (`description`) |
| 3 | Prompts | `*.prompt.md` | `.mirai/prompts/` | Single focused task, parameterized, quick-combo path |
| 4 | Hooks | `*.json` (or inline in an agent's `hooks:`) | `.mirai/hooks/` (also `.claude/settings.json`) | Deterministic shell enforcement at lifecycle events |
| 5 | Custom agents | `*.agent.md` | `.mirai/agents/` | Multi-stage workflow, context isolation, per-role tool/model restrictions |
| 6 | Skills | `SKILL.md` in a named folder | `.mirai/skills/<name>/` (or `.agents/skills/<name>/`, `.claude/skills/<name>/`) | On-demand workflow with bundled scripts/references/assets |

User-level equivalents (instructions/prompts/agents, **not** skills) live under
`{{VSCODE_USER_PROMPTS_FOLDER}}/` and roam with the user's synced settings — loom's setup
skill only ever writes to the **workspace** tier (`.mirai/`).

## 1. Agent instructions

- Exactly one of `.mirai/mirai-instructions.md` **or** root `AGENTS.md` — never both.
- No required frontmatter; plain Markdown, always injected into every request.
- Template sections: Code Style, Architecture, Build and Test, Conventions. Link to
  detailed docs (`See docs/TESTING.md`) rather than embedding them.
- **loom mapping**: this is where the project's per-project context/conventions live —
  distinct from loom's own workflow steering, which lives in stage `.agent.md` bodies.

## 2. File instructions

```yaml
---
description: "<required, keyword-rich, 'Use when...' pattern>"
name: "Instruction Name"   # optional
applyTo: "**/*.ts"         # optional glob or array of globs
---
```

- `applyTo: "**"` loads on every request and burns context — avoid unless the instruction
  truly is universal.
- Two discovery modes: **on-demand** (via `description`, task-based) and **explicit**
  (via `applyTo`, file-based).

## 3. Prompts

```yaml
---
description: "<recommended>"
name: "Prompt Name"                 # optional
argument-hint: "Task..."            # optional
agent: "agent"                      # ask | agent | plan | <custom agent name>
model: "GPT-5 (copilot)"            # string, or fallback array
tools: [search, web]                # optional
---
```

- Model fallback array: `['GPT-5 (copilot)', 'Claude Sonnet 4.5 (copilot)']` — first
  available model wins.
- The `agent:` field names a **base agent** the prompt runs in: a built-in (`ask` | `agent`
  | `plan`) or a custom agent name. `plan` is read-only — an inherent no-edit mode.
- **loom mapping**: a `.mirai/prompts/<x>.prompt.md` IS the "quick" stage combo — a bundle
  of skills-to-invoke plus a preset model. There is no separate bundle-skill layer; the
  prompt file itself is the bundle. loom sets `agent:` to a **base agent per stage** —
  `plan` for read-only Shaping (so the quick path inherits the harness's no-edit guarantee),
  `agent` otherwise — plus a one-line **stance** in the body as the portable backstop, per
  [ADR-006](../adr/adr-006-capability-based-roles.md). The prompt does **not** bind to the
  custom deep stage agent (they stay decoupled).

## 4. Hooks

- Standalone: `.mirai/hooks/*.json` (JSON, `{"hooks": {"<Event>": [{"type": "command", ...}]}}`).
  Also honored: `.claude/settings.json` / `.claude/settings.local.json` (uncommitted).
- Inline: an `.agent.md`'s `hooks:` frontmatter key, scoped to that agent only.
- Events: `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PreCompact`,
  `SubagentStart`, `SubagentStop`, `Stop`.
- Command object fields: `type` (must be `command`), `command`, platform overrides
  (`windows`/`linux`/`osx`), `cwd`, `env`, `timeout`.
- `PreToolUse` controls permission via `hookSpecificOutput.permissionDecision`
  (`allow` | `ask` | `deny`); exit code `2` = blocking error.
- Use hooks only where behavior must be *guaranteed* — instructions/skills/agents are
  guidance (non-deterministic), hooks are enforcement.

## 5. Custom agents

```yaml
---
description: "<required — trigger phrases for the agent picker AND subagent discovery>"
name: "Agent Name"                      # optional, defaults to filename
tools: [search, web]                    # optional: aliases, MCP (<server>/*), extension tools
model: "Claude Sonnet 4.5 (copilot)"    # optional; string or fallback array
argument-hint: "Task..."                # optional
agents: [agent1, agent2]                # optional: restrict allowed subagents (omit = all, [] = none)
user-invocable: true                    # optional, default true
disable-model-invocation: false         # optional, default false
handoffs:                               # optional: transitions to other agents — each entry is an OBJECT
  - label: "Plan this milestone"        #   required: human-readable button/menu label
    agent: planner                      #   required: the target agent's name
    prompt: "Plan the discovered findings for this milestone."  # required: the prompt handed to the target
    send: false                         #   optional (default false): true = auto-send the prompt, false = pre-fill for the user
hooks: { PreToolUse: [...] }            # optional: inline hooks, see above
---
```

Tool aliases: `execute` `read` `edit` `search` `agent` `web` `todo`. `tools: []` = none;
omitting the key = defaults.

**`handoffs` schema (load-bearing):** `handoffs` is an **array of objects**, *not* a bare
array of agent-name strings. Each entry **must** have `label`, `agent`, and `prompt`; `send`
is optional (defaults `false`). Writing `handoffs: [planner]` fails validation with
*"Each handoff in the 'handoffs' attribute must be an object with 'label', 'agent', 'prompt'
and optional 'send'."*

**loom mapping**: this is where loom's **per-role agents** go — each carrying its
DEEP-workflow system prompt (from `workflows/sdlc/<phase>.md`), a preset model, and a
**role-scoped capability set** written into `tools:`
([ADR-006](../adr/adr-006-capability-based-roles.md)). The withheld capabilities are
load-bearing: a role with no `edit` cannot write code. Shaping is one agent; **Delivery is
two dispatcher agents** — `planner` and `orchestrator`, neither holding `edit`
([ADR-008](../adr/adr-008-delivery-dispatchers.md)); Closing is one agent. loom's **utility
agents** (explore, quick, deep, **verifier**, writing, frontend, visual-qa) are also plain
`.agent.md` files. The generic-capability → `tools:` mapping is in
[MAPPING.md §6](../../adapters/mirai/MAPPING.md#6-capability--mirai-tool-mapping) and
[references/capabilities.md](../../adapters/mirai/references/capabilities.md).

The `user-invocable` / `disable-model-invocation` pair encodes loom's
[invocation surface](../glossary/index.md#invocation-surface) facet
([ADR-012](../adr/adr-012-invocation-surface.md)) — a role's *second* scoped facet alongside
its capability set (*who may start it*, not just *what it may do*). loom uses exactly two of
the four flag combinations:

| loom invocation surface | `user-invocable` | `disable-model-invocation` | Assigned to |
|---|---|---|---|
| **`front-door`** | `true` | `true` | the stage agents (`shaping`, `planner`, `orchestrator`, `closing`) — a human enters from the picker, or a `handoffs:` transition crosses in; no peer silently pulls it in as a subagent |
| **`dispatched`** | `false` | `false` | the utility roster (`explore`, `quick`, `deep`, `verifier`, `writing`, `frontend`, `visual-qa`) — hidden from the picker, reachable only when a dispatcher delegates |

Setting `disable-model-invocation: true` on a `front-door` stage agent does **not** block its
`handoffs:` targets — handoffs are keyed on agent name, a separate transition mechanism from
subagent invocation. The two unused combinations (startable by nobody; human-only-and-
undispatchable) name no loom role. The surface is derived from the role kind at setup, not
asked — see [write-format.md](../../adapters/mirai/references/write-format.md#role-invocation-surface).

Note the tool aliases are exactly `execute` `read` `edit` `search` `agent` `web` `todo`.
loom's `persist` (memory) and `interview` (ask-user) capabilities are **specific tool
names** (e.g. `vscode/memory`, `vscode/askQuestions`), **not** aliases — discover/confirm
them against the harness tool list rather than hardcoding. loom's `docs-lookup` capability
maps to an MCP `<server>/*` tool (below).

## 6. Skills

```yaml
---
name: skill-name                         # required, must match folder name, kebab-case, <=64 chars
description: '<what + when, <=1024 chars>'
argument-hint: 'Optional hint'           # optional
user-invocable: true                     # optional, default true — show as slash command
disable-model-invocation: false          # optional, default false — allow automatic loading
---
```

Slash-command / auto-load matrix:

| `user-invocable` | `disable-model-invocation` | Slash command | Auto-loaded |
|---|---|---|---|
| default (true) | default (false) | Yes | Yes |
| `false` | default | No | Yes |
| default | `true` | Yes | No |
| `false` | `true` | No | No |

**loom mapping**: `.mirai/skills/<name>/` is where loom's existing `SKILLS/<bucket>/<slug>/`
content lands, customized per project during setup. The Mirai adapter's setup instruction
([adapters/mirai/setup.md](../../adapters/mirai/setup.md)) is read and followed by an
agent (it is not itself a `.mirai/skills/` entry).

## MCP servers (for the `docs-lookup` capability)

MCP servers are not one of the six primitives — they are an external **tool source**. An
agent uses one by listing its glob in `tools:` (e.g. `"context7/*"`); the server itself is
**configured outside** the `.agent.md`, per the official MCP docs. loom uses MCP only to
implement the optional `docs-lookup` capability
([ADR-007](../adr/adr-007-docs-lookup-capability.md)):

- **In the agent file:** add `"<server>/*"` to `tools:` — confirm the exact server name
  against the user's tool list.
- **Server config:** lives in Mirai's MCP configuration (see the official `mcp` doc page);
  treat its exact path/format as **verify-later** — do not invent it. If the server isn't
  configured, the `tools:` entry simply won't resolve until the user sets it up.

## Cross-tool compatibility note

Because Mirai is a superset of Claude Code, `skills` and `hooks` written to `.claude/`
paths are also honored — useful when a project already has a `.claude/` setup and the
Mirai adapter setup instruction should extend rather than duplicate it. Agents, prompts, and file
instructions have **no** Claude Code equivalent path and only ever live under `.mirai/`.

## Common pitfalls (carried from the source skill)

- **Description is the discovery surface.** If trigger phrases aren't IN the
  `description`, the primitive won't be found. Use "Use when..." with concrete keywords.
- **Silent YAML failures.** Unescaped colons, tabs, or a skill `name` that doesn't match
  its folder name fail silently. Quote descriptions containing colons.
- **`applyTo: "**"` burns context** — prefer specific globs.
- **Using both `AGENTS.md` and `mirai-instructions.md`** — pick one.

## Official docs

`https://code.visualstudio.com/docs/copilot/customization/<page>` where `<page>` is one of:
`overview`, `agent-skills`, `custom-agents`, `custom-instructions`, `prompt-files`, `hooks`,
`mcp`.

## Related

- [adapters/mirai/MAPPING.md](../../adapters/mirai/MAPPING.md) — loom SKILLS → `.mirai/skills`
  mapping, stage → prompt/agent mapping, model-archetype table.
- [adapters/mirai/STAGES.md](../../adapters/mirai/STAGES.md) — Shaping/Delivery/Closing
  stage groupings, role capability sets, and their prompt+agent pairs.
- [adapters/mirai/references/capabilities.md](../../adapters/mirai/references/capabilities.md)
  — generic capability → Mirai tool mapping and docs-lookup/MCP wiring.
- [adapters/mirai/setup.md](../../adapters/mirai/setup.md) — the adapter setup instruction
  that reads this page to generate a project's `.mirai/` configuration.
- [wiki/adr/adr-004-loom-mirai-setup.md](../adr/adr-004-loom-mirai-setup.md) — the ADR
  recording why this 4-layer setup approach was chosen.
- [wiki/adr/adr-006-capability-based-roles.md](../adr/adr-006-capability-based-roles.md) —
  capability-based role discipline (the `tools:` capability sets).
- [wiki/adr/adr-007-docs-lookup-capability.md](../adr/adr-007-docs-lookup-capability.md) —
  the optional `docs-lookup` capability (MCP).
- [wiki/adr/adr-008-delivery-dispatchers.md](../adr/adr-008-delivery-dispatchers.md) — the
  Delivery dispatcher split.
- [wiki/adr/adr-012-invocation-surface.md](../adr/adr-012-invocation-surface.md) — the
  invocation-surface facet the `user-invocable`/`disable-model-invocation` pair encodes.
- [wiki/patterns/role-scoped-capabilities.md](../patterns/role-scoped-capabilities.md) — the
  underlying pattern.
</content>
