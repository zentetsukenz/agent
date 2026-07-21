---
type: Environment
title: Mirai (VS Code Agent Harness)
description: Mirai's customization primitives — exact frontmatter, file locations, and official doc links — as the authoritative reference for loom's setup-loom skill
tags: [mirai, vscode, harness, customization, adapter, setup]
timestamp: 2026-07-20T00:00:00Z
---

# Mirai (VS Code Agent Harness)

Mirai is a VS Code-based agent harness — a **superset of Claude Code**. It reads `.mirai/`
first, and falls back to `.agents/` and `.claude/` for the primitives those tools share
(skills, hooks). This page is the authoritative reference the `setup-loom` skill
(see [SKILLS/meta/setup-loom](../../SKILLS/meta/setup-loom/SKILL.md))
consults when generating a bespoke `.mirai/` configuration for a project. It exists so
that skill doesn't have to re-derive Mirai's customization model from scratch every run.

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
- **loom mapping**: a `.mirai/prompts/<x>.prompt.md` IS the "quick" stage combo — a bundle
  of skills-to-invoke plus a preset model. There is no separate bundle-skill layer; the
  prompt file itself is the bundle.

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
handoffs: [...]                         # optional: transitions to other agents
hooks: { PreToolUse: [...] }            # optional: inline hooks, see above
---
```

Tool aliases: `execute` `read` `edit` `search` `agent` `web` `todo`. `tools: []` = none;
omitting the key = defaults.

**loom mapping**: this is where loom's **per-stage agents** (Shaping / Delivery /
Closing) go — each carrying its DEEP-workflow system prompt (from
`workflows/sdlc/<phase>.md`) plus a preset model matched to its role archetype (see
[MAPPING.md](../../adapters/mirai/MAPPING.md)). loom's **utility agents**
(explore, quick, deep, writing, ...) are also plain `.agent.md` files, typically
`disable-model-invocation: false` so other agents can dispatch to them as subagents.

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
content lands, customized per project during setup. The `setup-loom` init skill itself
ships as `disable-model-invocation: true` (mattpocock-shaped: user-invoked only, never
auto-loaded as a subagent) per the locked plan.

## Cross-tool compatibility note

Because Mirai is a superset of Claude Code, `skills` and `hooks` written to `.claude/`
paths are also honored — useful when a project already has a `.claude/` setup and the
`setup-loom` skill should extend rather than duplicate it. Agents, prompts, and file
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
`overview`, `agent-skills`, `custom-agents`, `custom-instructions`, `prompt-files`, `hooks`.

## Related

- [adapters/mirai/MAPPING.md](../../adapters/mirai/MAPPING.md) — loom SKILLS → `.mirai/skills`
  mapping, stage → prompt/agent mapping, model-archetype table.
- [adapters/mirai/STAGES.md](../../adapters/mirai/STAGES.md) — Shaping/Delivery/Closing
  stage groupings and their prompt+agent pairs.
- [SKILLS/meta/setup-loom](../../SKILLS/meta/setup-loom/SKILL.md) — the
  skill that reads this page to generate a project's `.mirai/` configuration.
- [wiki/adr/adr-004-loom-mirai-setup.md](../adr/adr-004-loom-mirai-setup.md) — the ADR
  recording why this 4-layer setup approach was chosen.
</content>
