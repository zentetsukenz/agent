---
type: Index
title: loom — Constitution
description: The entities loom is built from, how they compose, and the rules binding them
---

# Constitution

[VISION.md](VISION.md) says what loom is for. This document says how it is **built** — the
entities it is made of, how they fit together, and the rules every one of them obeys.

Terms used here are defined once, in [CONTEXT.md](CONTEXT.md). This document links to them
and does not restate them.

## The entities

| Entity | What it is | Where it lives |
|---|---|---|
| [Skill](CONTEXT.md#skill) | A single judgment pattern — one decision, reusably written | `SKILLS/<bucket>/<slug>/SKILL.md` |
| [Workflow](CONTEXT.md#workflow) | An ordered lifecycle for one discipline, prose-first | `workflows/<name>/` |
| [Agent](CONTEXT.md#agent) | An identity: a role, a capability grant, and wired skills | `agents/<name>.md` |
| [Adapter](CONTEXT.md#adapter) | The per-harness compiler that renders loom into native format | `adapters/<harness>/` |
| [Harness](CONTEXT.md#harness) | The agent tool a project runs in — not ours, we target it | external |
| Contract | The shared core every adapter answers | `contract/` |
| [Wiki](CONTEXT.md#wiki) | Decisions, patterns, principles, environments | `wiki/` |
| Command | Thin invocation wrapper over a skill | `commands/` |
| Distributable | The only executable loom ships | `scripts/loom/` |

## How they compose

The spine runs one way, and it is worth stating plainly because the two ends are easy to
confuse:

```
skills ──▶ workflow ──[ adapter ]──▶ harness
                                       │
                                       ▼
                                  rendered agents
```

A **workflow** is a prose seed. An **adapter** interprets that seed at build time and emits
whatever the target **harness** natively wants — agent configs, skill wiring, commands. So a
workflow is compiled *into* a harness; a harness is never a kind of workflow, and a workflow is
never a tool.

Two consequences follow:

1. **A workflow names no tool.** If a lifecycle document mentions a specific harness, that
   knowledge belongs in an adapter instead.
2. **An adapter owns only harness-specific knowledge.** Everything generic lives in `contract/`
   and is referenced, never copied ([ADR-013](wiki/adr/adr-013-shared-adapter-contract-core.md)).

Workflows may dispatch into one another across an [altitude seam](CONTEXT.md#altitude-seam) —
today `macro-pm` dispatches buildable leaves down into `sdlc`. What crosses that seam is a
[seam artifact](CONTEXT.md#seam-artifact) on a shared [substrate](CONTEXT.md#substrate), never
harness memory.

## The binding rules

1. **Prose first.** Structured output — YAML, JSON, tool config — lives solely in the adapter
   layer. A workflow or skill expresses policy; the adapter's interpreting agent maps it onto
   the target environment's real capabilities.

2. **One home per fact.** Every term, decision and rule is defined in exactly one place and
   linked from everywhere else. A second copy is not redundancy, it is a future contradiction.
   Terms live in [CONTEXT.md](CONTEXT.md); decisions live in
   [wiki/adr/](wiki/adr/index.md); file-level rules live in [SPEC.md](SPEC.md).

3. **Reference, never restate.** Adapters point at `contract/`. Documents point at the
   definitional home. Copying prose across a boundary is the drift mechanism this repository
   most reliably suffers from.

4. **Harness-agnostic by default.** No practice is written against one tool. The harness-specific
   delta is named, bounded, and isolated to its adapter.

5. **Everything traces to the vision.** Every document is reachable by links from
   [VISION.md](VISION.md), and a reader following links upward arrives there. The
   [gate](CONTEXT.md#gate) enforces reachability; coherence is the author's job.

6. **Earn your abstractions.** A seam observed once is a hypothesis; a seam observed twice is
   real. Do not introduce a layer until a second member demands it — see
   [deep-modules](wiki/patterns/deep-modules.md).

## Quality baseline

loom was content-only until `scripts/loom/` shipped as its first executable distributable
([ADR-025](wiki/adr/adr-025-deterministic-board-api.md),
[ADR-027](wiki/adr/adr-027-mechanism-install-port.md)). Per
[quality-baseline](wiki/patterns/quality-baseline.md)
([ADR-017](wiki/adr/adr-017-quality-baseline.md)), this repository names a floor for the code it
ships — zero dependencies, Node.js `node:test` only:

| [Aspect](CONTEXT.md#quality-aspect) | Tool + run command | Floor |
|---|---|---|
| lint | `find scripts/loom -name '*.js' -print0 \| xargs -0 -n1 node --check` | 0 syntax errors ([ratchet](CONTEXT.md#ratchet)) |
| code-quality | — | `none` — no complexity/duplication tool configured yet; the distributable is small and reviewed by hand |
| security | — | `none` — zero third-party dependencies (Node built-ins plus `gh` as an external CLI), no dependency-scan surface |
| coverage | `node --test 'scripts/loom/**/*.test.js'` | 96/96 passing (ratchet — no regression below 96) |

This is a **ratchet floor**: a gate may raise these numbers, never lower them. The rest of the
repository — skills, wiki, workflows — stays content-only and outside this baseline's scope.

> Both command shapes are load-bearing; do not "simplify" them back. `node --check` validates
> only its **first** argument, so lint runs it once per file via `xargs -0 -n1`. And
> `node --test <dir>` executes an `index.js` in that directory instead of scanning for
> `*.test.js`, so coverage passes a **quoted** glob and lets Node do test discovery.

## The gate

`scripts/validate.sh` is the mechanical enforcement of this constitution. It checks skill
frontmatter, wiki `type:` frontmatter, link resolution, anchor existence, orphan reachability,
and registry consistency.

The gate blocks on **new** violations only. `.claude/hooks/validate-baseline.txt` records known
breaks, and every line there must cite an open issue — a baseline entry is accepted debt, never
a silencer. Do not add to it to get unblocked; fix the break or file the issue first.

## Amendment

This document changes by [ADR](CONTEXT.md#adr-architecture-decision-record). A rule here that a
decision supersedes is rewritten, not annotated, and the ADR is linked from the rule it changed.

## Related

- [VISION.md](VISION.md) — why loom exists and where it is going
- [CONTEXT.md](CONTEXT.md) — the vocabulary this document uses
- [SPEC.md](SPEC.md) — conformance rules for individual files
- [SETUP.md](SETUP.md) — installing loom into a project
- [wiki/principles/wisdom.md](wiki/principles/wisdom.md) — the principles behind these rules
