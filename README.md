# loom

**loom is a prose-first framework for engineering disciplines.** You write a discipline's
practice once, in Markdown, and an adapter compiles it into working configuration for whatever
AI coding agent your project runs — Claude Code, Cursor, OpenCode, or the next one.

No runtime, no build step, no lock-in. The content *is* the framework.

*loom is early. Two disciplines ship today across three harness adapters; more of both are
planned.*

## Why

Agents don't fail for lack of intelligence. They fail for lack of context — starting a run not
knowing what the project decided, what its words mean, or what good looks like here.

That knowledge usually lives in tribal memory and closed pull requests, in no form an agent can
pick up. And when a team does write it down, they write it again for the next tool, and the
copies drift.

loom's answer: write it once, keep it tool-agnostic, and let an adapter render it per harness.

## What ships

| Discipline | Status |
|---|---|
| **Software development** — discovery → design → planning → implementation → verification → preservation | shipped |
| **Project management** — charting many efforts, routing work, dispatching into delivery | shipped |
| **Product**, **Infrastructure** | planned |

Harness adapters: **Mirai**, **OpenCode**, **Hermes**.

## How it works

- **Content** — portable Markdown: lifecycle-bucketed skills, workflow orchestration seeds, and
  an OKF knowledge wiki.
- **Adapters** — loom is harness-agnostic; a per-harness adapter renders its content for a
  specific tool against the shared [`contract/`](contract/index.md) core.
- **Agent-run setup** — point an agent at `SETUP.md`; it interviews you about your project, then
  generates harness-native config tailored to what it learns. It doesn't copy static files.

## Get started

Give your AI coding agent this:

```text
Set up loom in this project by following
https://raw.githubusercontent.com/zentetsukenz/agent/main/SETUP.md
```

`SETUP.md` is the one and only setup entrypoint — no slash commands, no repo clone.
`init` (first-time) and `update` (idempotent re-run) are modes of the same setup
contract (see [ADR-005](wiki/adr/adr-005-harness-agnostic-setup.md)).

## Explore

Start at [VISION.md](VISION.md) — why loom exists and where it is going. Everything else in the
repository is reachable from there.
