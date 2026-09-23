---
type: Index
title: loom — Constitution
description: The entities loom is built from, how they compose, and the rules binding them
---

# Constitution

[VISION.md](VISION.md) says what loom is for. This document says how it is **built** — the
entities it is made of, how they fit together, and the rules every one of them obeys.

Every term used here is defined once, in [CONTEXT.md](CONTEXT.md), and linked rather than
restated. That is rule 3 below, applied to this document first.

## The entities

| Entity | Where it lives |
|---|---|
| [Skill](CONTEXT.md#skill) | `SKILLS/<bucket>/<slug>/SKILL.md` |
| [Workflow](CONTEXT.md#workflow) | `workflows/<name>/` |
| [Agent](CONTEXT.md#agent) | `agents/<name>.md` |
| [Adapter](CONTEXT.md#adapter) | `adapters/<harness>/` |
| [Harness](CONTEXT.md#harness) | external — not ours, we target it |
| [Setup contract](CONTEXT.md#setup-contract) | `contract/` |
| [Wiki](CONTEXT.md#wiki) | `wiki/` |
| [Wrapper](CONTEXT.md#wrapper) | `commands/` |
| Distributable | `scripts/loom/` — the only executable loom ships |

## How they compose

The spine runs one way, and it is worth stating plainly because the two ends are easy to
confuse:

```
skills ──▶ workflow ──[ adapter ]──▶ harness
                                       │
                                       ▼
                                  rendered agents
```

A workflow is a prose seed. An adapter interprets that seed at build time and emits whatever the
target harness natively wants. So a workflow is compiled *into* a harness; a harness is never a
kind of workflow, and a workflow is never a tool.

Two consequences follow:

1. **A workflow names no tool.** If a lifecycle document mentions a specific harness, that
   knowledge belongs in an adapter instead.
2. **An adapter owns only harness-specific knowledge.** Everything generic lives in
   [`contract/`](contract/index.md) and is referenced, never copied
   ([ADR-013](wiki/adr/adr-013-shared-adapter-contract-core.md)).

Workflows may dispatch into one another across an [altitude seam](CONTEXT.md#altitude-seam) —
today `macro-pm` dispatches buildable leaves down into `sdlc`. What crosses that seam is a
[seam artifact](CONTEXT.md#seam-artifact) on a shared [substrate](CONTEXT.md#substrate), never
harness memory.

## The binding rules

1. **Prose first.** Structured output — YAML, JSON, tool config — lives solely in the adapter
   layer. A workflow or skill expresses policy; the adapter's interpreting agent maps it onto
   the target environment's real capabilities. See
   [workflows/index.md](workflows/index.md#prose-first-principle).

2. **One home per fact.** Every term, decision and rule is defined in exactly one place and
   linked from everywhere else. A second copy is not redundancy, it is a future contradiction.
   Terms live in [CONTEXT.md](CONTEXT.md); decisions in [wiki/adr/](wiki/adr/index.md);
   file-level rules in [SPEC.md](SPEC.md).

3. **Reference, never restate.** Prose that describes what a machine-readable file already says
   will drift from it, and the prose is what drifts. If a fact has a structured home — frontmatter,
   a config file, a script — point at it.

4. **Harness-agnostic by default.** No practice is written against one tool. The harness-specific
   delta is named, bounded, and isolated to its adapter.

5. **Everything traces to the vision.** Every document is reachable by links from
   [VISION.md](VISION.md), and a reader following links upward arrives there. The
   [gate](CONTEXT.md#gate) enforces reachability; coherence is the author's job.

6. **Earn your abstractions.** A seam observed once is a hypothesis; a seam observed twice is
   real. Do not introduce a layer until a second member demands it — see
   [harness-archetypes](wiki/patterns/harness-archetypes.md#why-the-axes-matter).

## Quality

`scripts/quality.sh` **is** loom's [quality baseline](CONTEXT.md#quality-baseline) — the floors
for `scripts/loom/`, and the commands that prove them. Per
[quality-baseline](wiki/patterns/quality-baseline.md) ([ADR-017](wiki/adr/adr-017-quality-baseline.md))
a project's floor belongs in its own committed tooling, with loom holding only a pointer; the
script carries the floors and the reasons its command shapes cannot be simplified.

The floors are a [ratchet](CONTEXT.md#ratchet): they may be raised, never lowered. The rest of the
repository — skills, wiki, workflows — is content-only and outside that baseline's scope.

## The gate

`scripts/validate.sh` is the mechanical enforcement of this constitution: frontmatter, link
resolution, anchor existence, orphan reachability, and registry consistency.

It blocks on **new** violations only. The rules for what may be recorded as accepted debt live in
the header of `.claude/hooks/validate-baseline.txt` — the file they govern.

## Amendment

This document changes by [ADR](CONTEXT.md#adr-architecture-decision-record). A rule here that a
decision supersedes is rewritten, not annotated, and the ADR is linked from the rule it changed.
