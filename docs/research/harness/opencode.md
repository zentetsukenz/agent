---
type: Research
title: OpenCode — open-source, headless coding agent
description: Baseline profile of OpenCode — its shape, headless and server modes, the portable formats it reads, and its permission model
tags: [research, harness, opencode, ephemeral, headless, open-source]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://github.com/anomalyco/opencode, title: anomalyco/opencode, last_modified: 2026-09-21 }
  - { resource: https://github.com/anomalyco/opencode/releases, title: OpenCode releases, last_modified: 2026-09-21 }
  - { resource: https://opencode.ai/docs/cli/, title: OpenCode CLI }
  - { resource: https://opencode.ai/docs/config/, title: OpenCode config }
  - { resource: https://opencode.ai/docs/skills/, title: OpenCode skills }
  - { resource: https://opencode.ai/docs/mcp-servers/, title: OpenCode MCP servers }
  - { resource: https://opencode.ai/docs/acp/, title: OpenCode ACP }
  - { resource: https://opencode.ai/docs/permissions/, title: OpenCode permissions }
  - { resource: https://github.com/anomalyco/opencode/pull/21538, title: macOS bash sandboxing PR }
  - { resource: https://aminroosta.github.io/tools/llm/security/macos/2026/02/25/sandboxing-opencode-on-macos.html, title: Sandboxing OpenCode on macOS, last_modified: 2026-02-25 }
---

# OpenCode — open-source, headless coding agent

*As of 2026-09-25: v1.18.32 (2026-09-21); MIT; 210,029 GitHub stars; the repository is now
`anomalyco/opencode`.* Part of the [Harness](index.md) pillar. Jacquard already has an OpenCode
[adapter](../../../adapters/opencode/setup.md).

**Baseline profile** — no hypothesis to test; the question is its shape and where its knowledge lives.

## What it is

A terminal-first coding agent with a TUI, a desktop app and a server
([repository](https://github.com/anomalyco/opencode)). Two built-in agents — `build` with full
access and `plan` read-only — plus custom agents; 75+ model providers, local models included.

## Shape

| Axis ([harness-archetypes](../../../wiki/patterns/harness-archetypes.md)) | OpenCode |
|---|---|
| Who holds the loop | Per-invocation (human) |
| Headless-dispatchable | **Yes** — `opencode run` takes a prompt non-interactively; `opencode serve` runs a headless HTTP server with an OpenAPI spec ([CLI](https://opencode.ai/docs/cli/)) |

## Knowledge

All in the repository, in portable formats: `AGENTS.md` (`/init` writes one —
[config](https://opencode.ai/docs/config/)); `SKILL.md` skills found in `.opencode/skills/`,
`.claude/skills/` or `.agents/skills/` ([skills](https://opencode.ai/docs/skills/)); local and remote
MCP servers ([MCP](https://opencode.ai/docs/mcp-servers/)); and ACP for editors
([ACP](https://opencode.ai/docs/acp/)). Sessions are stored locally.

## Checks & autonomy

Per-tool `allow` / `deny` / `ask` rules with wildcards, last match wins
([permissions](https://opencode.ai/docs/permissions/)). These are a UX control, not isolation: real
isolation needs a container or VM ([Roosta](https://aminroosta.github.io/tools/llm/security/macos/2026/02/25/sandboxing-opencode-on-macos.html),
*secondary*); native macOS sandboxing is experimental ([PR](https://github.com/anomalyco/opencode/pull/21538), *preview*).

## Bearing on Jacquard

- **For:** the ephemeral shape — "start fresh from what the project has written" — with nothing to
  translate: it reads `AGENTS.md` and `SKILL.md` where Jacquard already writes them, and a resident
  loop can dispatch it by command or over HTTP.
- **For:** "Knowledge lives in the project" — OpenCode adds no private knowledge store of its own.
- **Against:** permissions are advisory to the agent, not a boundary; a resident loop dispatching it
  unattended must supply the sandbox.
- Compare [pi](pi.md), the minimal alternative.
