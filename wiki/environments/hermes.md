---
type: Environment
title: Hermes (Nous Research Agent Harness)
description: Hermes Agent's customization primitives — profiles, skills, toolsets/tools, memory, context files, cron/gateway, kanban, and MCP — as the authoritative reference for loom's Hermes adapter setup instruction
tags: [hermes, nous, harness, customization, adapter, setup, profile, kanban, macro]
timestamp: 2026-08-12T00:00:00Z
---

# Hermes (Nous Research Agent Harness)

Hermes Agent (hermes-agent.nousresearch.com, `NousResearch/hermes-agent`, MIT) is a
self-improving autonomous agent that runs anywhere — a laptop, a `$5` VPS, or serverless
infrastructure — and is reached from 20+ messaging platforms via one gateway. Unlike Mirai and
OpenCode (which write a **project-local** config dir), Hermes keeps agent state in a **profile
home** (`~/.hermes/`), and a "named agent" is a **profile**. This page is the authoritative
reference the Hermes adapter's setup instruction (see [adapters/hermes/setup.md](../../adapters/hermes/setup.md))
consults when generating a bespoke config for a project, so that instruction doesn't re-derive
Hermes's model from scratch every run.

Source of truth: the official docs at `https://hermes-agent.nousresearch.com/docs/<page>` (see
`user-guide/configuration`, `user-guide/profiles`, `reference/toolsets-reference`,
`reference/tools-reference`, `user-guide/features/{memory,skills,delegation,kanban,cron,context-files,mcp}`,
`user-guide/security`). A machine-readable index is at `/docs/llms.txt`.

## The primitives loom renders into

| # | Primitive | File(s) | Location | When to use |
|---|---|---|---|---|
| 1 | Project context | `AGENTS.md` (native) | repo root (priority `.hermes.md`/`HERMES.md` → `AGENTS.md` → `CLAUDE.md` → `.cursorrules`) | Always-on, project-wide conventions |
| 2 | Named agent (profile) | `config.yaml` + `SOUL.md` (+ `skills/`) | `~/.hermes/profiles/<name>/` (delivered as a profile distribution) | A named agent with its own model, toolsets, persona, memory (for loom's thin-macro adapter: the resident `wayfinder-macro` agent) |
| 3 | Persona / system prompt | `SOUL.md` | `~/.hermes/SOUL.md` (global) · per-profile | The agent's identity + (for loom) role workflow steering |
| 4 | Skills | `SKILL.md` in a named folder | `~/.hermes/skills/<name>/` · per-profile `skills/` | agentskills.io on-demand workflow with bundled scripts/references/assets |
| 5 | Toolsets / tools | `toolsets:` list + per-tool disable in `config.yaml` | per-profile | Grant/withhold a role's capabilities |
| 6 | Cron / gateway | `~/.hermes/cron/jobs.json`, `hermes gateway` | per-profile | Scheduled/resident automations (the macro daemon) |
| 7 | Kanban board | `~/.hermes/kanban.db` | single-host (local SQLite) | Durable multi-agent task board (single-host only — **not** loom's macro source of truth, which must distribute across servers; see [macro-pm.md](../../adapters/hermes/references/macro-pm.md)) |
| 8 | MCP servers | `mcp_servers:` in `config.yaml` → `mcp-<server>` toolset | per-profile | External tools (docs-lookup, or a networked tracker) |

There is **no description-triggered per-file instruction** primitive (Mirai's `.instructions.md`)
and **no prompt-file** primitive (Mirai/OpenCode commands). Instructions are always-on context
files (`AGENTS.md`/`SOUL.md`) or on-demand skills; a "quick-combo prompt" renders as a **skill**.
These are GAPs the loom adapter renders around (see [adapters/hermes/MAPPING.md](../../adapters/hermes/MAPPING.md)).

## Configuration

- Main config: `~/.hermes/config.yaml` (YAML); secrets in `~/.hermes/.env`. Precedence: CLI args →
  `config.yaml` → `.env` → built-in defaults. `hermes config set KEY VAL` routes to the right file.
- Directory: `~/.hermes/{config.yaml, .env, SOUL.md, memories/, skills/, cron/, sessions/, logs/}`.

## Profiles {#profiles}

A **profile** is a separate Hermes home (`~/.hermes/profiles/<name>/`) with its own `config.yaml`,
`.env`, `SOUL.md`, memory, sessions, skills, and cron. Created with
`hermes profile create <name> --description "<role>"` — the description is a **routing primitive**
(Hermes's dispatcher/decomposer routes by it). Each profile becomes a command alias (`<name> chat`),
or target any command with `hermes -p <name>`. loom's Hermes adapter is **thin-macro**
([ADR-019](../adr/adr-019-loom-hermes-setup.md)): it renders exactly one profile — the resident
`wayfinder-macro` agent — and dispatches SDLC runs down into a separate per-invocation harness that
renders its own stage/utility agents.

### Profile distributions {#profile-distributions}

A profile can be packaged as a **git repository** and installed with
`hermes profile install github.com/you/<repo>` (carries `SOUL.md`, `config.yaml`, `skills/`, cron,
MCP; credentials/memory stay per-machine). This is loom's reviewable, git-committable **delivery
shape** — see [adapters/hermes/references/write-format.md](../../adapters/hermes/references/write-format.md#delivery-shape).

## Models

Per-profile `config.yaml`: `model.default: "provider/model"` plus a `model.fallback_providers:`
array (native fallback chain — loom's fallback-array discipline maps directly). Providers include
Nous Portal, OpenRouter, OpenAI, Anthropic, and any OpenAI-compatible endpoint. `agent.reasoning_effort`
tunes thinking depth (loom can raise it on the resident agent for deeper routing deliberation).

## Toolsets & the withhold mechanism {#toolsets}

Every tool belongs to exactly one **toolset** (a bundle). Grant a role its capabilities by listing
toolsets in `config.yaml` `toolsets:`. Core toolsets loom uses: `file` (`read_file`, `write_file`,
`patch`, `search_files`), `terminal` (`terminal`, `process`), `web` (`web_search`, `web_extract`),
`memory` (`memory`), `clarify` (`clarify`), `delegation` (`delegate_task`), `todo` (`todo`),
`kanban` (opt-in), `skills`, `session_search`, `code_execution`, `vision`, `browser`.

**Withhold** works at two granularities: compose the profile's `toolsets:` (coarse — whole
capability on/off), and disable **individual tools** via `hermes tools` (persisted to `config.yaml`,
"finer than toolsets", filtered out even if the toolset is enabled). loom's load-bearing no-code-edit
withhold grants `file` but **disables `write_file` + `patch`** so a read-only role keeps
`read_file`/`search_files` ([ADR-006](../adr/adr-006-capability-based-roles.md)). `agent.disabled_toolsets:`
is the global whole-toolset off-switch. The exact per-tool-disable key is version-specific —
discover/confirm at setup.

## Memory (persist) {#memory}

`MEMORY.md` + `USER.md` at `~/.hermes/memories/`, managed by the native **`memory`** tool (its own
toolset) and injected into the system prompt at session start; FTS5 session search over
`~/.hermes/state.db`. Memory is **per-profile and not distributed across servers**. In loom's
thin-macro adapter it holds the resident agent's **own relational continuity only** (persona,
preferences, skills) — never project state (that lives on the networked board) and never the micro
ledger (that is a shared on-disk directory the dispatched SDLC harness also reads, since memory
cannot cross a harness boundary — [macro-pm.md](../../adapters/hermes/references/macro-pm.md#the-micro-dispatch-target)).

## Context files {#context-files}

Project context: `.hermes.md`/`HERMES.md` → `AGENTS.md` → `CLAUDE.md` → `.cursorrules` (first match
wins, project-scoped). `SOUL.md` is the agent's **global/per-profile persona** (system-prompt slot),
not project context. loom writes project conventions to `AGENTS.md`, role stance to each profile's
`SOUL.md`.

## Delegation & subagents {#delegation--subagents}

`delegate_task(goal, context)` / `delegate_task(tasks=[...])` (the `delegation` toolset) spawns an
isolated subagent (fresh context, own terminal, inherits parent toolsets, can't widen). Config:
`delegation.{max_concurrent_children, max_spawn_depth, orchestrator_enabled, model, provider}`. loom's
resident `wayfinder-macro` agent uses this to spawn the `research` subagent and to dispatch a
buildable leaf **down** into the per-invocation SDLC harness.

## Cron & gateway (the resident daemon) {#cron--gateway}

- **Cron:** `~/.hermes/cron/jobs.json`; `hermes cron create "<schedule>" "<prompt>"` or the
  `cronjob` tool. Schedules: `30m`/`2h`/`1d`, `every 2h`, cron `0 9 * * *`, ISO. Each run is a
  **fresh, stateless session** — the restart-safety property loom's macro router relies on.
- **Gateway:** `hermes gateway install` (systemd/launchd user or system service) — an always-on
  process that hosts the cron dispatcher and receives inbound messages from 20+ platforms. This is
  the home for loom's resident macro agent ([adapters/hermes/references/macro-pm.md](../../adapters/hermes/references/macro-pm.md)).

## Kanban {#kanban}

A native durable task board at `~/.hermes/kanban.db` (SQLite, WAL). Task fields: title, body, one
`assignee` (profile), `status` (`triage|todo|ready|running|blocked|review|done|archived`), tenant,
priority, `scheduled_at`, `skills[]`, workspace, model override. `task_links` = parent→child
dependency (dispatcher promotes `todo→ready` when parents are `done`). Agents drive it via `kanban_*`
tools (the `kanban` toolset); the dispatcher (in the gateway) spawns the assignee profile as a
worker. A child worker's context includes `## Parent task results` = each parent's `kanban_complete`
**summary + metadata** verbatim — a native DISCOVER carrier. **Kanban is single-host by design**
(local SQLite; a shared board across hosts is unsupported), so loom uses it only as a **local-only**
macro-board alternative; the distributing default is an external tracker over MCP
([ADR-018](../adr/adr-018-macro-project-management.md), [adapters/hermes/references/macro-pm.md](../../adapters/hermes/references/macro-pm.md)).
Hermes's own LLM `auto_decompose` is judgment-based routing — loom disables it (`kanban.auto_decompose: false`)
when using kanban, to keep the mechanical wayfinder router authoritative.

## MCP {#mcp}

`mcp_servers:` in `config.yaml` (`command`/`args`/`env` or `url`/`auth: oauth`), with per-server
`tools.{include,exclude}`. Each server yields an `mcp-<server>` toolset. loom uses MCP for the
optional `docs-lookup` capability and for the **networked macro tracker** (GitHub/Notion/Linear).

## Security & backends

`approvals.mode: smart|manual|off`; a hardline blocklist is always on. Terminal backends:
`local`/`ssh` (approval-checked) and `docker`/`singularity`/`modal`/`daytona`/`vercel_sandbox`
(isolated sandboxes). Serverless backends (Daytona/Modal) hibernate when idle — a cheap resident
daemon host.

## loom mapping summary

loom's Hermes adapter is **thin-macro** ([ADR-019](../adr/adr-019-loom-hermes-setup.md)): it renders
only the resident macro layer. The SDLC primitives (stage agents, quick tiers, utilities) are
compiled by the **per-invocation dispatch-target harness**, not Hermes.

| loom primitive | Hermes binding |
|---|---|
| skill | `skills/<slug>/SKILL.md` (name==folder) — the resident agent's macro skills |
| resident macro agent | a profile (`config.yaml` toolsets + `SOUL.md` tick-loop prose) + `gateway` + `cron` |
| SDLC stage agents / quick tiers / utilities | **not rendered** — dispatched down into a separate per-invocation harness |
| capability | a toolset grant + per-tool withhold (resident agent: `file` read but `write_file`/`patch` disabled) |
| instruction (protocol doc) | committed `.loom/handoffs/protocol.md` referenced from `AGENTS.md` (no description-triggered instruction — GAP) |
| model-archetype | the resident profile's `model.default` + `fallback_providers[]` |
| macro board (source of truth) | external tracker over MCP (default) or local kanban (single-host alt) |
| micro ledger | a shared, on-disk, **gitignored** directory the dispatched harness also reads (never Hermes `memory`) |

## Related

- [adapters/hermes/setup.md](../../adapters/hermes/setup.md) — the adapter setup instruction that consults this reference.
- [adapters/hermes/MAPPING.md](../../adapters/hermes/MAPPING.md), [adapters/hermes/STAGES.md](../../adapters/hermes/STAGES.md) — the concrete port answers.
- [adapters/hermes/references/capabilities.md](../../adapters/hermes/references/capabilities.md) — capability→tool + the withhold.
- [adapters/hermes/references/macro-pm.md](../../adapters/hermes/references/macro-pm.md) — the resident-daemon / altitude-seam binding.
- [ADR-018](../adr/adr-018-macro-project-management.md) — the macro-PM protocol the daemon binds.
- [ADR-001](../adr/adr-001-adapter-pattern.md) — a new harness = a new adapter.
- [wiki/environments/opencode.md](opencode.md), [wiki/environments/mirai.md](mirai.md) — the sibling harness references.
- [wiki/environments/index.md](index.md) — the environments catalog.
