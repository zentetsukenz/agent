---
type: Research
title: Cursor
description: Baseline profile of Cursor — the IDE and its headless CLI, its native rules format, and its support for AGENTS.md
tags: [research, harness, cursor, anysphere, rules]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://www.cursor.com/, title: Cursor }
  - { resource: https://cursor.com/docs/context/rules, title: Cursor rules }
  - { resource: https://cursor.com/docs/cli/headless, title: Cursor CLI headless mode }
  - { resource: https://research.contrary.com/company/cursor, title: Contrary Research on Cursor }
---

# Cursor

*As of 2026-09-25: proprietary; made by Anysphere, Inc.* Part of the [Harness](index.md) pillar.

**Baseline profile** — its shape, and where its knowledge lives.

## What it is

An AI-first editor forked from VS Code, with a CLI and a Slack surface; models from several vendors
plus Cursor's own; "add plugins, skills, MCPs, and rules from one place"
([cursor.com](https://www.cursor.com/)). Anysphere is the company behind it
([Contrary Research](https://research.contrary.com/company/cursor), *secondary*).

## Shape

| Axis ([harness-archetypes](../../../wiki/patterns/harness-archetypes.md)) | Cursor |
|---|---|
| Who holds the loop | Per-invocation (human) |
| Headless-dispatchable | **Yes** — `agent -p` (print mode) with `--output-format text \| json \| stream-json`; "Without `--force`, changes are only proposed, not applied" ([headless](https://cursor.com/docs/cli/headless)) |

## Knowledge

Its native format is project rules: "Project rules live in `.cursor/rules` as `.mdc` files and are
version-controlled", with frontmatter for `description`, `globs` and `alwaysApply`. It also reads
`AGENTS.md` — "a simple alternative to `.cursor/rules`" — at the root or in subdirectories
([rules](https://cursor.com/docs/context/rules)).

## Checks & autonomy

Diffs proposed for approval in the editor; in headless mode, writing requires `--force`.

## Bearing on Jacquard

- Jacquard's written knowledge reaches Cursor through `AGENTS.md` without translation; the
  scoped, glob-matched `.mdc` rules are a Cursor-only format an adapter would have to emit.
- "Proposed, not applied" by default in headless mode is a check a resident loop can lean on.
