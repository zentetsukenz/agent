---
type: Research
title: OpenAI Codex
description: Baseline profile of OpenAI Codex — the open-source CLI and its cloud surface, non-interactive use, and the portable formats it reads
tags: [research, harness, codex, openai, agents-md]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://github.com/openai/codex, title: openai/codex }
  - { resource: https://learn.chatgpt.com/docs/codex/cli, title: Codex CLI docs }
---

# OpenAI Codex

*As of 2026-09-25: the CLI is open source under Apache-2.0; 126,455 GitHub stars; latest release
`rust-v0.157.0` (2026-09-25).* Part of the
[Harness](index.md) pillar. OpenAI's developer docs moved: `developers.openai.com/codex/*` now
redirects to `learn.chatgpt.com/docs/codex/`.

**Baseline profile** — its shape, and where its knowledge lives.

## What it is

A coding agent that "runs locally on your computer" as a CLI, with IDE extensions (VS Code, Cursor,
Windsurf), a desktop app (`codex app`), and Codex Web at chatgpt.com/codex
([repository](https://github.com/openai/codex)). Signs in with a ChatGPT plan or an API key.

## Shape

| Axis ([harness-archetypes](../../../wiki/patterns/harness-archetypes.md)) | Codex |
|---|---|
| Who holds the loop | Per-invocation (human) |
| Headless-dispatchable | **Yes** — "`codex exec` from repeatable workflows and pipelines" ([CLI docs](https://learn.chatgpt.com/docs/codex/cli)) |

Models: OpenAI's.

## Knowledge

`AGENTS.md` — `/init` writes one — plus skills ("Package repeatable instructions as skills") and
plugins, and local or remote MCP servers via `codex mcp` ([CLI docs](https://learn.chatgpt.com/docs/codex/cli)).
Codex is where `AGENTS.md` started ([standards](standards.md)).

## Checks & autonomy

`/permissions` chooses "what Codex is allowed to do" — sandbox and approval settings per run. The
exact mode names were not read on 2026-09-25.

## Bearing on Jacquard

- An open-source, dispatchable ephemeral agent that reads Jacquard's formats natively — the same
  profile as [OpenCode](opencode.md), with a single model vendor.
- The documentation's move between domains in 2026 is itself a freshness lesson: links to vendor docs
  rot faster than papers.
