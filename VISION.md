---
type: Index
title: Jacquard — Vision
description: The future Jacquard exists to make real — a semi-automated software project development system — and the root every other document in this repository serves
---

# Vision

## In one sentence

Jacquard is a **semi-automated software project development system**. It is the harness in
*agent = model + harness*: joined with a capable model, it gives a software project a team of
agents that works with the project's humans — agents doing the work, humans deciding what the work
must be.

## Why this is possible now

Code is cheap. A model — even a small one — can carry an agentic workflow to a good result when it
is given the right context: the smallest set of true, current facts the task needs.

The right context is the hard part. A project's decisions, its vocabulary, its intent and its bar
for "good" live in people's heads, chat threads and closed pull requests, in no form an agent can
pick up. A frontier model can guess its way around part of that gap; a smaller model cannot; no
model can recover a decision nobody wrote down. Closing the gap needs no technology that does not
already exist. It needs the project written down, and checked, for agents.

## The picture

An agent is a model plus a **harness** — everything around the model: what it is told, what it can
reach, what it may do, and what checks its work. Models improve and change hands. Jacquard is that
harness, built to know *this* project.

When Jacquard has done its job, a software project runs like this:

- **It never stops.** A resident agent holds the project's loop: it watches the work, routes it,
  and keeps it moving around the clock. Ephemeral agents each take one piece of work, start fresh
  from what the project has written, finish it, and write down what they did.
- **It is one project, in lanes.** Development, project management, product and infrastructure are
  lanes of the same project, drawing on one body of knowledge.
- **Humans decide, agents do, checks verify.** Humans decide what the project must be and why,
  choose its trade-offs, and answer for its outcome. Agents do the work. Checks prove it.

## What the picture rests on

1. **Written and checked beats smarter.** A model should never have to infer what the project could
   have written down, or reason about what a script could check. The better the project's context,
   the smaller, cheaper and more local the model each task needs. Scaffolding that only props up a
   weak model is temporary by design; what the project knows and can check is not, because no model
   recovers a decision nobody wrote down or a test nobody ran.

2. **Autonomy is earned by checks.** An agent acts alone exactly where a check can catch it being
   wrong; where nothing can, a human decides. A mistake a check could have caught becomes a check
   the first time it happens, so human attention moves up toward decisions over time. It never
   reaches zero — judgment does not automate away, and accountability stays human. *Semi*-automated
   is the design, not a stage on the way to full automation.

3. **Humans keep the theory.** Jacquard is built as if no human writes the code — a forcing
   function, not a forecast: every gap a human would patch by hand must be closed in the harness
   instead. The human's work is the project's *theory* — what it is for, what it decided, what its
   words mean, what good looks like — kept where agents can read it. Keeping that theory is also
   what keeps a human able to judge work they no longer type.

4. **Knowledge lives in the project.** Never inside a model, a vendor or a runtime, so it outlives
   all three. It is written once, kept current and checked, and a fresh agent anywhere can rebuild
   the whole picture from it.

## The name

The Jacquard loom took the pattern out of the weaver's head and put it on punched cards the machine
could read — and the weaver still worked the loom. That is this picture in one machine: a project's
theory, written where machines can read it, with a human at the loom.

## How this document works

This is the destination, not a report of progress. Every other document in this repository exists
to serve it, and a reader following links upward arrives here. Where a document stops serving the
picture, that document changes or goes; the vision does not bend to fit it.

## Reading this repository

| Document | For |
|---|---|
| [CONSTITUTION.md](CONSTITUTION.md) | How Jacquard is built toward this picture — its entities and the rules binding them |
| [CONTEXT.md](CONTEXT.md) | Every term Jacquard uses, and pointers to every decision it has made |
| [SPEC.md](SPEC.md) | Conformance rules for individual files |
| [SETUP.md](SETUP.md) | Installing Jacquard into a project |
| [AGENTS.md](AGENTS.md) | How an agent bootstraps context before doing work here |
| [Research, 2026-09](docs/research/2026-09-vision.md) | The literature behind this restatement — background, not authority |

Directory layout lives in [CONSTITUTION.md](CONSTITUTION.md#the-entities), so it is stated once.
