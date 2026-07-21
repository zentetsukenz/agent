# loom

loom installs disciplined workflows into your AI coding agent — portable Markdown
skills, knowledge, and orchestration that an agent adapts to whatever harness you use.
The SDLC workflow (discovery → design → planning → implementation → verification →
preservation) ships first; loom is built to carry any workflow you want.

*loom is early: the SDLC workflow and the Mirai adapter ship today; more workflows and
harness adapters are planned.*

## How it works

- **Content** — portable Markdown: lifecycle-bucketed skills, workflow orchestration
  seeds, and an OKF knowledge wiki.
- **Adapters** — loom is harness-agnostic; a per-harness adapter renders its content for
  a specific tool. **Mirai** is the first supported adapter, with more planned.
- **Agent-run setup** — point an agent at `SETUP.md`; it interviews you about your
  project, then generates harness-native config tailored to what it learns. It doesn't
  copy static files.

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

Explore loom → [index.md](index.md)
