---
type: Research
title: Kiro
description: Baseline profile of Kiro — AWS's spec-driven agentic IDE and CLI, its steering files, and the portable formats it reads
tags: [research, harness, kiro, aws, spec-driven, steering]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://kiro.dev/, title: Kiro }
  - { resource: https://kiro.dev/docs/steering/, title: Kiro steering }
  - { resource: https://kiro.dev/docs/cli/, title: Kiro CLI, last_modified: 2026-08-04 }
  - { resource: https://aws.amazon.com/startups/prompt-library/kiro-project-init, title: Kiro project init (AWS Startups) }
---

# Kiro

*As of 2026-09-25: proprietary; published by AWS.* Part of the [Harness](index.md) pillar.

**Baseline profile** — its shape, and where its knowledge lives.

## What it is

An agentic IDE built on Code OSS, with a CLI ([kiro.dev](https://kiro.dev/)). Its signature is
**spec-driven development**: before code, it writes requirements, a design and a sequenced task list,
and those artifacts stay in the repository as the source of truth
([AWS Startups](https://aws.amazon.com/startups/prompt-library/kiro-project-init)).

## Shape

| Axis ([harness-archetypes](../../../wiki/patterns/harness-archetypes.md)) | Kiro |
|---|---|
| Who holds the loop | Per-invocation (human) |
| Headless-dispatchable | **Yes** — the CLI can "run prompts non-interactively in CI/CD pipelines with API keys" ([CLI](https://kiro.dev/docs/cli/)) |

The CLI also has custom agents, MCP, skills, hooks ("automate actions before and after commands") and
"capability-based access controls".

## Knowledge

Steering files — Markdown with optional YAML front matter in `.kiro/steering/` (and globally in
`~/.kiro/steering/`), included always, by file match, manually, or by description. Kiro "follows the
AGENTS.md standard" ([steering](https://kiro.dev/docs/steering/)). On the CLI, inclusion modes are not
supported: every steering file loads.

## Checks & autonomy

The spec is itself a check: a human reviews requirements and design before tasks run. Hooks and
access controls on the CLI.

## Bearing on Jacquard

- The closest vendor analogue to "the project written down": the spec artifacts a human approves
  before work starts are a seam artifact by another name.
- The CLI loading *every* steering file regardless of mode is a context cost — the opposite of "the
  smallest set of true, current facts the task needs".
