---
type: Index
title: loom — Vision
description: Why loom exists, where it is going, and the commitments every document in this repository traces back to
---

# Vision

## In one sentence

loom turns **written practice into working agents** — one ordered lifecycle per engineering
discipline, compiled by an adapter onto whatever harness a project already runs.

## The problem

Agents do not fail for lack of intelligence. They fail for lack of **context** — starting a run
without knowing what the project decided, what its words mean, or what good looks like here.
The knowledge exists; it is scattered across tribal memory, stale READMEs, and closed pull
requests, in no form an agent can pick up.

Worse, every team re-solves this per tool. The practice gets re-encoded for Claude Code, then
again for Cursor, then again for the next thing — and the three copies drift.

## The answer

Write the practice **once, in prose, for a machine to interpret**. Keep it harness-agnostic.
Let an [adapter](CONTEXT.md#adapter) compile it into whatever a given
[harness](CONTEXT.md#harness) needs.

Prose is the substrate on purpose. A schema locks you to the environments you imagined; prose
lets an interpreting agent map a policy onto whatever capabilities it actually finds.

## Where this is going

loom began as one discipline — software development. It is becoming a framework for **several**,
each with its own lifecycle, vocabulary and governance, each compiled onto the harness that
suits it:

| Discipline | Status | Concern |
|---|---|---|
| **Software development** | shipped — [workflows/sdlc](workflows/sdlc/index.md) | Context retrieval, precise change, correct code, architectural governance |
| **Project management** | shipped — [workflows/macro-pm](workflows/macro-pm/index.md) | Charting effort, routing work, dispatching down into delivery |
| **Product** | not yet | Product governance — what to build and why |
| **Infrastructure** | not yet | Provisioning, incident response, capacity |

Many disciplines, many compiled harnesses, one written source. That plurality is the
destination.

## What we commit to

1. **Prose first.** Structured output lives in the adapter layer, never in a workflow.
2. **One home per fact.** Every term, decision and rule is defined in exactly one place, and
   linked from everywhere else. Duplication is how drift starts, so we do not duplicate —
   we link.
3. **Harness-agnostic.** No practice is written against one tool.
4. **Traceable.** Every document in this repository connects back to this one. A reader who
   follows the links up should arrive here and understand *why* the document exists.
5. **Dogfooded.** loom's own knowledge base is built with loom's own conventions. If a practice
   does not survive its author using it, it does not ship.

## How to read this repository

Start here, then:

- **[CONSTITUTION.md](CONSTITUTION.md)** — how the entities fit together, and the rules binding them
- **[CONTEXT.md](CONTEXT.md)** — what every word means, and what has already been decided
- **[SPEC.md](SPEC.md)** — conformance rules for individual files
- **[SETUP.md](SETUP.md)** — installing loom into a project

## Related

- [CHANGELOG.md](CHANGELOG.md) — release history
- [wiki/principles/wisdom.md](wiki/principles/wisdom.md) — the cross-cutting principles that guide every agent decision
