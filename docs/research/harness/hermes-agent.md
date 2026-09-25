---
type: Research
title: Hermes Agent — a resident agent with a chat gateway
description: Whether Hermes Agent's built-in messaging gateway gives an instant resident agent, and what its self-written memory and skills mean for keeping knowledge in the project
tags: [research, harness, hermes, resident, gateway, memory, skills]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://github.com/nousresearch/hermes-agent, title: nousresearch/hermes-agent, last_modified: 2026-09-24 }
  - { resource: https://github.com/NousResearch/hermes-agent/blob/main/AGENTS.md, title: Hermes Agent AGENTS.md }
  - { resource: https://hermes-agent.nousresearch.com/docs/user-guide/features/overview, title: Hermes features overview }
  - { resource: https://hermes-agent.nousresearch.com/docs/user-guide/features/memory, title: Hermes persistent memory }
  - { resource: https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/autonomous-ai-agents/autonomous-ai-agents-claude-code, title: Hermes claude-code skill }
  - { resource: https://www.marktechpost.com/2026/06/24/nous-research-adds-learn-to-hermes-agents-skills-system-capturing-workflows-as-slash-commands-without-hand-writing-skill-md/, title: MarkTechPost on Hermes skills, last_modified: 2026-06-24 }
---

# Hermes Agent — a resident agent with a chat gateway

*As of 2026-09-25: release v2026.9.24 (2026-09-24); MIT; 248,930 GitHub stars; Nous Research.* Part of the
[Harness](index.md) pillar. Jacquard already has a Hermes [adapter](../../../adapters/hermes/setup.md).

**Hypothesis under test** (the user's): *"I like how they build-in the gateway so that you can
integrate to any chat app easily which give you instant resident agent."*

**Verdict: supports — with one strain.** The gateway plus built-in cron is the resident shape, ready
to run. The strain is where it learns: memory and self-written skills accumulate in the user's home
directory, outside the project.

## What it is

A self-hosted agent ([repository](https://github.com/nousresearch/hermes-agent)) with a messaging
gateway — Telegram, Discord, Slack, WhatsApp, Signal, Email and Home Assistant, "all from a single
gateway process" — a built-in cron scheduler "with delivery to any platform",
persistent memory, and a learning loop that writes and refines its own skills, reviewed by a
"Curator" ([MarkTechPost](https://www.marktechpost.com/2026/06/24/nous-research-adds-learn-to-hermes-agents-skills-system-capturing-workflows-as-slash-commands-without-hand-writing-skill-md/), *secondary*).

## Shape

| Axis ([harness-archetypes](../../../wiki/patterns/harness-archetypes.md)) | Hermes |
|---|---|
| Who holds the loop | **Resident** — the gateway and cron keep it running |
| Headless-dispatchable | It *dispatches*: it ships a `claude-code` skill for handing coding passes to Claude Code, and delegates to subagents ([skill](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/autonomous-ai-agents/autonomous-ai-agents-claude-code)). It also exposes "an OpenAI-compatible HTTP endpoint" and runs inside ACP editors ([features](https://hermes-agent.nousresearch.com/docs/user-guide/features/overview)), so another program can drive it |

Models: Nous Portal, OpenAI, OpenRouter and custom endpoints.

## Knowledge

- **Reads the project's formats:** `AGENTS.md`, `SKILL.md` skills compatible with the Agent Skills
  standard, and MCP servers.
- **Writes outside the project:** three memory tiers — episodic (SQLite full-text search), semantic
  (`MEMORY.md`, `USER.md`) and procedural (auto-written `SKILL.md`) — all under `~/.hermes/`, the
  user's home directory, not the repository
  ([memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory)).

## Checks & autonomy

The Curator reviews agent-written skills. No approval gate for agent-initiated actions was found;
cron runs unattended.

## Bearing on Jacquard

- **For:** "It never stops. A resident agent holds the project's loop." A chat gateway also puts the
  loop where humans already are — the human-decides moments arrive as messages. The documented
  community pattern, a cheap model holding the always-on loop and delegating hard coding to Claude
  Code, is the [Model](../model/index.md) pillar's "smallest model per step" in practice.
- **Against:** "Knowledge lives in the project … a fresh agent anywhere can rebuild the whole picture
  from it." What Hermes learns lives in one machine's home directory. Another agent, on another
  machine, starts without it.
- **Open:** can the memory and skills directories point into the repository, so what Hermes learns
  lands as a reviewable change?
