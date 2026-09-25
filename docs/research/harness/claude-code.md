---
type: Research
title: Claude Code and the Claude Agent SDK
description: Baseline profile of Claude Code and its Agent SDK — shape, headless use, extension points, and the portable formats it reads
tags: [research, harness, claude-code, agent-sdk, anthropic]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://code.claude.com/docs/en/overview, title: Claude Code overview }
  - { resource: https://code.claude.com/docs/en/agent-sdk/overview, title: Claude Agent SDK overview }
  - { resource: https://code.claude.com/docs/en/memory, title: Claude Code memory (CLAUDE.md and AGENTS.md) }
  - { resource: https://www.morphllm.com/claude-agent-sdk, title: Claude Agent SDK overview (Morph) }
---

# Claude Code and the Claude Agent SDK

*As of 2026-09-25: proprietary (Anthropic), generally available.* Part of the [Harness](index.md)
pillar. This repository is itself configured for Claude Code by hand — see
[.claude/README.md](../../../.claude/README.md).

**Baseline profile** — its shape, and where its knowledge lives.

## What it is

A coding agent on the terminal, in IDE extensions, a desktop app and the web
([overview](https://code.claude.com/docs/en/overview)). The **Agent SDK** exposes "the same tools,
agent loop, and context management that power Claude Code, programmable in Python and TypeScript",
with hooks, subagents, MCP, permissions, sessions and skills
([SDK](https://code.claude.com/docs/en/agent-sdk/overview)).

## Shape

| Axis ([harness-archetypes](../../../wiki/patterns/harness-archetypes.md)) | Claude Code |
|---|---|
| Who holds the loop | Per-invocation (human) |
| Headless-dispatchable | **Yes** — `claude -p` runs non-interactively; the Agent SDK drives the same loop as a library |

Extension points: subagents, hooks, skills, plugins, MCP servers. Models: the Claude family.

## Knowledge

`CLAUDE.md` is its native instruction file, and it reads `AGENTS.md`: "If your repository already has
an `AGENTS.md` for other coding agents, Claude Code can read that on its own or alongside `CLAUDE.md`"
([memory](https://code.claude.com/docs/en/memory)). Skills are `SKILL.md` directories — Anthropic
originated the Agent Skills format ([standards](standards.md)). Auto-memory is kept as local files.

## Checks & autonomy

Permission modes for tool approval; hooks at lifecycle points — this repository uses them to run its
gates after every edit.

## Bearing on Jacquard

- **Build = compose on a proven loop.** The Agent SDK is the "build" option that does not mean
  writing an agent loop: permission modes, callbacks and unattended runs come with it
  ([Morph](https://www.morphllm.com/claude-agent-sdk), *secondary*; the SDK docs above are primary).
- **Knowledge stays portable.** Everything it reads is a file in the repository in a cross-vendor
  format — "Knowledge lives in the project" holds, as long as Jacquard writes `AGENTS.md` and
  `SKILL.md` rather than Claude-only files.
- **Single-vendor models.** It runs Claude models; per-task model choice across vendors
  ([Model](../model/index.md)) needs a different base or a router in front.
