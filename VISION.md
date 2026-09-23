---
type: Index
title: loom — Vision
description: Why loom exists, where it is going, and the entry point to everything else in this repository
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
destination, and every document in this repository exists to serve it.

## Reading this repository

| Document | For |
|---|---|
| [CONSTITUTION.md](CONSTITUTION.md) | The entities loom is built from, how they compose, and the rules binding them |
| [CONTEXT.md](CONTEXT.md) | Every term loom uses, and pointers to every decision it has made |
| [SPEC.md](SPEC.md) | Conformance rules for individual files |
| [SETUP.md](SETUP.md) | Installing loom into a project |
| [AGENTS.md](AGENTS.md) | How an agent bootstraps context before doing work here |

Directory layout lives in [CONSTITUTION.md](CONSTITUTION.md#the-entities), so it is stated once.
