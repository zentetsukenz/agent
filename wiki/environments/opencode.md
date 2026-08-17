---
type: Environment
title: OpenCode (Terminal Agent Harness)
description: OpenCode's customization primitives — exact frontmatter, config format, file locations, and official doc links — as the authoritative reference for loom's OpenCode adapter setup instruction
tags: [opencode, terminal, harness, customization, adapter, setup]
timestamp: 2026-07-31T00:00:00Z
---

# OpenCode (Terminal Agent Harness)

OpenCode is a terminal/TUI agent harness (opencode.ai). Like Mirai it reads `AGENTS.md`
natively and offers a `.claude/`-compatible layer, but its customization model is its own:
agents, commands, and skills live under `.opencode/` (or `~/.config/opencode/`), and
behavior is driven by a single `opencode.json` plus per-primitive Markdown files. This page
is the authoritative reference the OpenCode adapter's setup instruction (see
[adapters/opencode/setup.md](../../adapters/opencode/setup.md)) consults when generating a
bespoke `.opencode/` configuration for a project, so that instruction doesn't have to
re-derive OpenCode's model from scratch every run.

Source of truth: the official docs at `https://opencode.ai/docs/<page>` (`agents`,
`commands`, `skills`, `rules`, `permissions`, `config`, `mcp`).

## The primitives loom renders into

| # | Primitive | File(s) | Location | When to use |
|---|---|---|---|---|
| 1 | Project context (rules) | `AGENTS.md` (native) · `instructions:` array in `opencode.json` | repo root · `~/.config/opencode/AGENTS.md` (global) | Always-on, project-wide conventions |
| 2 | Primary agents | `<name>.md` (or `agent` block in `opencode.json`) | `.opencode/agents/` · `~/.config/opencode/agents/` | A human-selectable, `Tab`-cyclable workflow entry point (deep stage agent) |
| 3 | Subagents | `<name>.md` (`mode: subagent`) | `.opencode/agents/` | A picker-hidden specialist a primary agent invokes (`@mention`) — loom's utilities |
| 4 | Commands | `<name>.md` | `.opencode/commands/` · `~/.config/opencode/commands/` | A `/name` quick-combo prompt with a preset agent + model |
| 5 | Skills | `SKILL.md` in a named folder | `.opencode/skills/<name>/` (or `.claude/skills/<name>/`, `.agents/skills/<name>/`) | On-demand workflow with bundled scripts/references/assets |
| 6 | Permissions | `permission:` in `opencode.json` or agent frontmatter | global + per-agent | Gate/withhold a tool for a role (loom's capability grants) |

There is **no description-triggered per-file instruction** primitive (Mirai's
`.instructions.md`); OpenCode instructions are either always-on (`AGENTS.md` /
`instructions:`) or on-demand only as a skill or a referenced file. This is a **GAP** the
loom adapter renders around (see the [seam wiring](#the-communication-protocol-document-gap)).

## 1. Project context (`AGENTS.md` + `instructions:`)

- Project root `AGENTS.md` — always injected, project-scoped. Global equivalent at
  `~/.config/opencode/AGENTS.md`. `CLAUDE.md` is read as a compat fallback when no
  `AGENTS.md` exists.
- Precedence: local files (traversing up: `AGENTS.md`, then `CLAUDE.md`) then the global
  file; the first match in each category wins, and all matching files are combined.
- `opencode.json` `instructions: [...]` lists extra rule files (globs, or remote `https://`
  URLs fetched with a 5s timeout) that are **combined with** `AGENTS.md` — the mechanism
  loom uses to point at its on-demand handoff protocol file.
- **loom mapping**: `AGENTS.md` holds the project's per-project context/conventions —
  distinct from loom's workflow steering, which lives in the primary/subagent bodies.

## 2 & 3. Agents (primary agents + subagents)

Agents are Markdown files (the filename becomes the agent name) or entries in
`opencode.json`'s `agent` block. loom writes **Markdown** files.

```yaml
---
description: "<required — 'Use when…' triggers for @mention discovery>"
mode: primary            # primary (Tab-selectable) | subagent (dispatched, @mention-only)
model: anthropic/claude-sonnet-4-20250514   # optional; format provider/model-id
temperature: 0.2         # optional
steps: 20                # optional; max agentic iterations (legacy: maxSteps, deprecated)
prompt: "{file:./prompts/x.txt}"   # optional; external system-prompt file
permission:              # per-agent tool gating — see §6
  edit: deny
  bash: allow
---
System prompt body (Markdown) — loom writes the role's deep workflow here.
```

- **`tools:` is deprecated** — prefer `permission:` for tool control (`tools: { write: false }`
  still works as a legacy alias for `permission: { "*": deny }`-style gating, but new configs
  use `permission:`).
- Two agent **types**: `mode: primary` (the main assistants; cycle with `Tab` or `@mention`)
  and `mode: subagent` (specialists a primary invokes or a human `@mention`s).
- **Built-in primary agents:** `build` (all tools enabled — the general read/write mode) and
  `plan` (restricted: `edit` and `bash` default to `ask`/`deny` — a **read-only analogue** of
  Mirai's `plan` base). **Built-in subagents:** `general` (full tool access except `todo`),
  `explore` (fast read-only codebase recon), `scout` (read-only external-docs/dependency
  research). Hidden system agents: `compaction`, `title`, `summary`.
- **loom mapping**: loom's **stage agents** are `mode: primary` (`front-door`); loom's
  **utility roster** are `mode: subagent` (`dispatched`). The generic-capability → `permission:`
  mapping is in [MAPPING.md §6](../../adapters/opencode/MAPPING.md#6-capability--opencode-tool-mapping)
  and [references/capabilities.md](../../adapters/opencode/references/capabilities.md).

### Invocation surface → `mode`

The `mode` field encodes loom's [invocation surface](../glossary/index.md#invocation-surface)
facet ([ADR-012](../adr/adr-012-invocation-surface.md)) — a role's *second* scoped facet
alongside its capability set:

| loom invocation surface | `mode` | Assigned to |
|---|---|---|
| **`front-door`** | `primary` | the stage agents (`shaping`, `planner`, `orchestrator`, `closing`) — a human `Tab`-selects them; no peer silently pulls one in |
| **`dispatched`** | `subagent` | the utility roster (`explore`, `quick`, `deep`, `verifier`, `writing`, `frontend`, `visual-qa`) — hidden from the cycle, reached only via `@mention`/delegation |

Derived from the role kind at setup, not asked — see
[write-format.md](../../adapters/opencode/references/write-format.md#role-invocation-surface).

## 4. Commands

```yaml
---
description: "<shown in the TUI>"      # recommended
agent: build                           # base agent the command runs in (build | plan | <custom>)
model: anthropic/claude-sonnet-4       # optional
subtask: false                         # optional; run as an isolated subtask
---
Template body — becomes the prompt. Placeholders: $ARGUMENTS, $1/$2/…, !`shell cmd`, @file.
```

- The filename becomes the command name (`test.md` → `/test`). Custom commands sit alongside
  built-ins (`/init`, `/undo`, `/share`, …).
- **loom mapping**: a `.opencode/commands/<stage>.md` **is** the "quick" stage combo — a
  bundle of skills-to-invoke plus a preset model. loom sets `agent:` to a **base agent per
  stage** — `plan` for read-only Shaping (inheriting the harness's no-edit guarantee), `build`
  otherwise — plus a one-line **stance** in the body as the portable backstop
  ([ADR-006](../adr/adr-006-capability-based-roles.md)). The command does **not** re-embed the
  deep stage agent's workflow prose (they stay decoupled).

## 5. Skills

```yaml
---
name: skill-name          # required, MUST match the folder name (kebab-case)
description: '<what + when, 1–1024 chars>'
---
```

- One folder per skill: `.opencode/skills/<name>/SKILL.md`. Also loaded from
  `.claude/skills/<name>/` and `.agents/skills/<name>/` (and the `~/.config/opencode/`,
  `~/.claude/`, `~/.agents/` global equivalents). **Unknown frontmatter fields are ignored**
  — so loom's skills (which may carry `argument-hint`, `user-invocable`,
  `disable-model-invocation`) copy in **verbatim** and OpenCode simply ignores the extras.
- `SKILL.md` must be spelled in all caps; `name` must be unique across all locations.
- **loom mapping**: `.opencode/skills/<name>/` is where loom's existing `SKILLS/<bucket>/<slug>/`
  content lands, copied one level deep (`references/`/`scripts/`/`assets/`) and lightly
  tailored during setup. The setup instruction itself is read and followed by an agent — it is
  not a `.opencode/skills/` entry.

## 6. Permissions (loom's capability withhold mechanism)

```jsonc
// opencode.json (global) or agent frontmatter (per-role override)
"permission": {
  "edit": "deny",          // withhold: gates write, edit, apply_patch
  "bash": "ask",
  "webfetch": "deny"
}
```

- Each key is `"allow" | "ask" | "deny"`, or (for `read`, `edit`, `glob`, `grep`, `list`,
  `bash`, `task`, `external_directory`, `lsp`, `skill`) an object of glob/pattern → action.
- Permission keys and the tools they gate: `read`→read; `edit`→write/edit/apply_patch;
  `glob`→glob; `grep`→grep; `list`→list; `bash`→bash; `task`→task; `todowrite`→todowrite/todoread;
  `webfetch`→webfetch; `websearch`→websearch; `lsp`→lsp; `skill`→skill; `question`→question;
  `external_directory`→file access outside the worktree; `doom_loop`→recovery prompts.
- Keys are matched as **wildcard patterns** against tool names, so the same syntax gates
  built-ins, custom tools, and MCP tools (`"mymcp_*": "deny"`).
- **loom withhold mechanism**: a role *denied* a capability sets that permission key to
  `"deny"` (e.g. a Shaping/Planner/Orchestrator/Verifier agent gets `permission: { edit: deny }`).
  The withheld capability is load-bearing — a role with `edit: deny` cannot write code. This is
  OpenCode's answer to the [`capability→tool` port](../../contract/PORTS.md#port-1--capabilitytool);
  full mapping in [references/capabilities.md](../../adapters/opencode/references/capabilities.md).

## The communication-protocol document (GAP)

OpenCode has **no `handoffs:` primitive** and **no harness memory tool**. loom renders the
[seam-artifact protocol](../patterns/seam-artifact-protocol.md) obligation
([ADR-011](../adr/adr-011-seam-artifact-protocol.md)) around both gaps:

- **`persist` substrate** → a **committed `.loom/handoffs/` folder** (repo-visible, survives
  sessions), with a manifest at `.loom/handoffs/index.md`.
- **Handoff transition** → the producing primary agent writes the seam artifact + manifest row
  at its exit gate; the human then selects the next primary agent (`Tab`), which **discovers**
  the ledger at its entry gate. A pointer to the protocol file is added to `opencode.json`'s
  `instructions:` array (and referenced from `AGENTS.md`) so every agent knows where the ledger
  lives. This is OpenCode's answer to the
  [`seam-obligation→wiring` port](../../contract/PORTS.md#port-3--seam-obligationwiring); detail
  in [MAPPING.md §7](../../adapters/opencode/MAPPING.md#7-communication-protocol-document--loomhandoffs).

## MCP servers (for the `docs-lookup` capability)

MCP servers are an external **tool source**, gated by the `permission:` wildcard (e.g.
`"context7_*": "allow"`) and configured in `opencode.json`'s `mcp` block (see the official
`mcp` doc). loom uses MCP only for the optional `docs-lookup` capability
([ADR-007](../adr/adr-007-docs-lookup-capability.md)) — off by default
([ADR-010](../adr/adr-010-keyless-by-default-recommendations.md)); the built-in `scout`
subagent covers dependency-source research without any MCP setup.

## Model tiering — inline `model:` per agent

loom renders the [`archetype→model` port](../../contract/PORTS.md#port-2--archetypemodel) as an
inline `model:` field (in `provider/model-id` format) on each generated agent/command. Because
every role carries its own archetype-matched model, per-role tiering is already expressed
directly — loom needs no external model-tiering overlay
([ADR-014](../adr/adr-014-loom-opencode-setup.md)).

## Cross-tool compatibility note

OpenCode reads `.claude/skills/` and `.agents/skills/` in addition to `.opencode/skills/`, and
`CLAUDE.md` as an `AGENTS.md` fallback — useful when a project already has a `.claude/` setup
and the adapter should extend rather than duplicate it. Agents and commands only live under
`.opencode/`.

## Common pitfalls

- **Description is the discovery surface.** A subagent/skill without concrete "Use when…"
  triggers in its `description` won't be found for `@mention` or auto-load.
- **`tools:` is deprecated** — use `permission:` for new configs; mixing both invites
  confusion.
- **`model:` needs the `provider/model-id` format** (e.g. `anthropic/claude-sonnet-4-20250514`,
  `opencode/gpt-5.1-codex`) — a bare model name won't resolve.
- **No description-triggered instructions** — don't try to render Mirai's `.instructions.md`;
  use a skill or the `instructions:` array + ledger pointer instead.
- **`name` must equal the skill folder name** and `SKILL.md` must be all-caps.

## Official docs

`https://opencode.ai/docs/<page>` where `<page>` is one of: `agents`, `commands`, `skills`,
`rules`, `permissions`, `config`, `mcp`.

## Related

- [adapters/opencode/MAPPING.md](../../adapters/opencode/MAPPING.md) — loom SKILLS → `.opencode/skills`
  mapping, stage → agent/command mapping, capability → permission table, model render target.
- [adapters/opencode/STAGES.md](../../adapters/opencode/STAGES.md) — Shaping/Delivery/Closing
  stage groupings, role capability sets, and their command+agent pairs.
- [adapters/opencode/references/capabilities.md](../../adapters/opencode/references/capabilities.md)
  — generic capability → OpenCode permission mapping and docs-lookup/MCP wiring.
- [adapters/opencode/setup.md](../../adapters/opencode/setup.md) — the adapter setup instruction
  that reads this page to generate a project's `.opencode/` configuration.
- [wiki/adr/adr-014-loom-opencode-setup.md](../adr/adr-014-loom-opencode-setup.md) — the ADR
  recording why this OpenCode setup approach was chosen (peer of ADR-004).
- [wiki/adr/adr-006-capability-based-roles.md](../adr/adr-006-capability-based-roles.md) —
  capability-based role discipline (the `permission:` capability withholds).
