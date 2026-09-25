---
type: Research
title: DeepSeek Harness (dsh) — everything is a plugin
description: Whether DeepSeek Harness's plugin kernel is extensible enough to embed a Jacquard workflow as plugins — its model, maturity, and cost claims
tags: [research, harness, dsh, deepseek, plugins, cordis, preview]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: draft
sources:
  - { resource: https://github.com/deepseek-ai/deepseek-harness, title: deepseek-ai/deepseek-harness, last_modified: 2026-09-24 }
  - { resource: https://deepseek.com/harness/en/, title: DeepSeek Harness project page }
  - { resource: https://www.infoq.com/news/2026/08/deep-seek-harness/, title: InfoQ on DeepSeek Harness, last_modified: 2026-08 }
  - { resource: https://deepseek-harness.github.io/deepseek-harness/en/guide/quickstart, title: dsh quickstart }
  - { resource: https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-log-deepseek/src/index.ts, title: dsh session log source }
---

# DeepSeek Harness (dsh) — everything is a plugin

*As of 2026-09-25: pre-release `dsh-v0.1.7-rc.2` (2026-09-24); MIT; 235,910 GitHub stars;
**developer preview** with "compatibility-breaking changes" expected.* Part of the [Harness](index.md) pillar. Marked `status: draft` because the
software is.

**Hypothesis under test** (the user's): *"Highly extensible harness. Might be worth looking for
workflow embedding."*

**Verdict: partly.** The design is the most open of any harness here — loops and scheduling are
themselves plugins — so a Jacquard workflow could plausibly *be* plugins rather than prose an adapter
compiles. It is a preview: nothing built on it today is stable.

## What it is

*Agent = Model + Harness*, on the Cordis plugin kernel: "Every capability is a plugin that can be
swapped or recomposed: models, tools, skills, sessions, sandboxes, storage, loops, scheduling, and the
UI" ([project page](https://deepseek.com/harness/en/)). It runs as a web UI, a CLI
(`npx @deepseek-ai/dsh`) or a desktop app ([quickstart](https://deepseek-harness.github.io/deepseek-harness/en/guide/quickstart)),
and keeps an append-only log of everything the model sees — in format v3
(`session.v3.jsonl.zstd`) since 2026-09-17 ([source](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-log-deepseek/src/index.ts)).
Interactive and scheduled/long-running use are both in scope
([InfoQ](https://www.infoq.com/news/2026/08/deep-seek-harness/)).

## Shape

| Axis ([harness-archetypes](../../../wiki/patterns/harness-archetypes.md)) | dsh |
|---|---|
| Who holds the loop | Per-invocation by default; a scheduling plugin makes a resident loop composable |
| Headless-dispatchable | CLI entry point exists; a documented non-interactive mode was not confirmed |

Models: model-agnostic through model plugins; the DeepSeek API is the default.

## Knowledge

MCP client and ACP support. Whether the harness itself loads a project's `AGENTS.md` or `SKILL.md`
is **not confirmed**: the repository ships an `AGENTS.md` for its own contributors and a `SKILL.md`
for Claude Code users, which is not the same thing. Session state lives in the dsh log format.

## Checks & autonomy

Permission prompts before reading or editing the workspace, running commands, or delegating.

## Bearing on Jacquard

- **For:** if loops and scheduling are plugins, one base could host both of the vision's shapes — the
  resident loop and the ephemeral worker — and "build vs customize" becomes "compose plugins".
- **Cost lever:** prefix-cache discipline — cached input at $0.0028/M tokens against $0.14/M uncached,
  one to two orders of magnitude (*vendor-reported*). A second cost lever beside small models.
- **Against:** developer preview; the session log is a dsh format, so what it records is not yet
  knowledge that "outlives … a runtime".
- **Open:** prototype one Jacquard stage as a dsh loop plugin before trusting the claim.
