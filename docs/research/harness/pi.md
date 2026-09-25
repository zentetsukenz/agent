---
type: Research
title: pi — a minimal coding harness
description: Whether pi, a deliberately minimal and extensible coding agent, is a viable OpenCode alternative as Jacquard's ephemeral agent — and what its missing checks mean
tags: [research, harness, pi, minimal, ephemeral, rpc, earendil]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://github.com/earendil-works/pi, title: earendil-works/pi }
  - { resource: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/rpc.md, title: pi RPC mode }
  - { resource: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md, title: pi SDK }
  - { resource: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md, title: pi skills }
  - { resource: https://github.com/earendil-works/pi/issues/5002, title: "Support global ~/.agents/AGENTS.md instructions" }
  - { resource: https://mariozechner.at/posts/2025-11-30-pi-coding-agent/, title: pi coding agent (Mario Zechner), last_modified: 2025-11-30 }
  - { resource: https://mariozechner.at/posts/2026-04-08-ive-sold-out/, title: "I've sold out" (Mario Zechner), last_modified: 2026-04-08 }
---

# pi — a minimal coding harness

*As of 2026-09-25: release v0.87.1 (2026-09-22); MIT; 109,331 GitHub stars.* Part of the
[Harness](index.md) pillar.

**Hypothesis under test** (the user's): *"Minimal coding harness. Worth looking for Opencode
alternative."*

**Verdict: partly.** As a base to *build on* it is a strong fit: tiny, headless over RPC, and it
reads Jacquard's formats. As a *drop-in* it is weaker than OpenCode, because it deliberately ships no
permission system — the checks would be Jacquard's to supply.

## What it is

An agent toolkit — a unified multi-provider LLM API, an agent runtime, a terminal UI, and a coding
agent CLI ([repository](https://github.com/earendil-works/pi)). Created by Mario Zechner and, since
2026, maintained under Earendil ([post](https://mariozechner.at/posts/2026-04-08-ive-sold-out/)).
It powers OpenClaw.

It is minimal on purpose: "Pi deliberately skips features other agents bake in: MCP, sub-agents, plan
mode, permission popups, built-in todos, background bash"
([Zechner](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)). The stated reason for no MCP
is context cost: Playwright's MCP server alone exposes 21 tools at about 13.7k tokens.

## Shape

| Axis ([harness-archetypes](../../../wiki/patterns/harness-archetypes.md)) | pi |
|---|---|
| Who holds the loop | Per-invocation (human) — no scheduler |
| Headless-dispatchable | **Yes** — `pi --rpc` speaks JSONL over stdin/stdout ([RPC](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/rpc.md)); an SDK embeds it in Node or Bun ([SDK](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md)) |

Models: any provider through its own unified API. Extensions are TypeScript.

## Knowledge

`AGENTS.md` context files (a global `~/.agents/AGENTS.md` was requested in
[issue #5002](https://github.com/earendil-works/pi/issues/5002)); skills as `SKILL.md` directories
with the Agent Skills frontmatter ([skills](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md)).
No MCP. Memory beyond the session is a community extension, not core.

## Checks & autonomy

None built in: "Pi does not include a built-in permission system"; it runs with the user's
permissions. Isolation, where wanted, comes from a container around it.

## Bearing on Jacquard

- **For:** an ephemeral agent that "take[s] one piece of work, start[s] fresh from what the project
  has written, finish[es] it" wants little harness of its own. pi's small surface is also a context
  lever — every tool definition it does not load is context the task keeps.
- **Against:** "An agent acts alone exactly where a check can catch it being wrong." pi supplies no
  such check. Choosing pi means Jacquard writes the permission and verification layer — as
  extensions, or as the sandbox around it.
- **Open:** is a Jacquard-owned check layer on pi less work, and more portable, than accepting
  OpenCode's? See [OpenCode](opencode.md).
