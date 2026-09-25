---
type: Research
title: Paperclip — an orchestrator for teams of agents
description: Whether Paperclip could be the orchestration core every Jacquard agent plugs into — its org-chart, heartbeat and adapter model, and where it keeps the project's state
tags: [research, harness, paperclip, orchestration, resident, heartbeat]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://github.com/paperclipai/paperclip, title: paperclipai/paperclip }
  - { resource: https://docs.paperclip.ing/reference/adapters/overview/, title: Paperclip adapters overview }
  - { resource: https://docs.paperclip.ing/guides/org/skills/, title: Paperclip skills guide }
  - { resource: https://docs.paperclip.ing/how-to/debug-stuck-heartbeat/, title: Debug a stuck heartbeat }
  - { resource: https://paperclip.ing/changelog/, title: Paperclip changelog }
  - { resource: https://pub.towardsai.net/paperclip-the-open-source-operating-system-for-zero-human-companies-2c16f3f22182, title: "Paperclip: the open-source operating system for zero-human companies" }
---

# Paperclip — an orchestrator for teams of agents

*As of 2026-09-25: release v2026.916.1 (2026-09-21); MIT © 2026 Paperclip Labs; 84,340 GitHub
stars.* Part of the [Harness](index.md) pillar.

**Hypothesis under test** (the user's): *"This could be the core of every harness. I can imagine
that this could orchestrate every agent we built so that they work together."*

**Verdict: partly.** As an orchestrator it fits unusually well — it already drives most of the
harnesses profiled here, and its heartbeat is a resident loop. But it keeps the project's work state
— tickets, goals, org chart, budgets, audit — in its own PostgreSQL database, which is exactly where
"Knowledge lives in the project" says it must not live.

## What it is

A Node.js server and React UI that runs AI agents as an organisation
([README](https://github.com/paperclipai/paperclip)): an org chart with roles, reporting lines and
permissions; a ticket system with goal ancestry and atomic task checkout; per-agent monthly budgets
with hard stops; and governance workflows with approval gates and rollback.

Agents work in **heartbeats** — "a scheduled execution window — the moment when an agent wakes up,
checks its inbox, and does work" ([docs](https://docs.paperclip.ing/how-to/debug-stuck-heartbeat/)).
"If it can receive a heartbeat, it's hired."

## Shape

| Axis ([harness-archetypes](../../../wiki/patterns/harness-archetypes.md)) | Paperclip |
|---|---|
| Who holds the loop | **Resident** — Paperclip's scheduler wakes each agent |
| Headless-dispatchable | It *dispatches*; built-in adapters launch Claude Code, Codex, Cursor, Gemini CLI, OpenCode, pi, Hermes, Grok, Kimi Code (via ACP), an OpenClaw gateway, plain HTTP and shell processes, passing "the agent's company, task, and wake context through" ([adapters](https://docs.paperclip.ing/reference/adapters/overview/)) |

## Knowledge

- **Portable:** an agent's instructions enter through an `AGENTS.md` file fed on every heartbeat;
  skills are `SKILL.md` directories ([skills guide](https://docs.paperclip.ing/guides/org/skills/)).
- **Not portable:** the organisation, tickets, goals, sessions, costs and audit trail persist in
  PostgreSQL (embedded locally by default) plus local file storage. A company export/import exists;
  its format was not documented on the pages read.

## Checks & autonomy

Approval gates, budget hard stops, atomic checkout (no two agents take one task), role permissions.

## Bearing on Jacquard

- **For:** "It never stops. A resident agent holds the project's loop" — the heartbeat is that loop,
  already built, and the adapter list means ephemeral agents of any vendor can be "hired" into it.
  Budgets and approvals are checks a resident loop needs.
- **Against:** "Knowledge lives in the project. Never inside a model, a vendor or a runtime, so it
  outlives all three." Paperclip's board *is* its runtime's database. A fresh agent elsewhere cannot
  rebuild the project's state from the repository. Jacquard's own board lives in the forge's issue
  graph instead.
- **Open:** can Paperclip run as the loop only — heartbeats, budgets, adapters — while the tickets and
  decisions stay in the repository and issue tracker? That is the question to answer before treating
  it as "the core".

## Caveats

- Star counts scraped from the repository page on the same day differed by ~2k; the figure above is from the GitHub API.
- The architecture summary from [Towards AI](https://pub.towardsai.net/paperclip-the-open-source-operating-system-for-zero-human-companies-2c16f3f22182) is *secondary*; the README and docs above are the primary sources.
