---
type: Pattern
title: Ratchet Routing
description: Route a preservation lesson by slop kind — judgment to prose (ADR/wiki/skill-creator), form to a GATE.md artifact criterion, recall to a Mechanism installed via Port 5 — ratcheting recall slop on first occurrence so no learning path terminates in Markdown.
tags: [ratchet, slop-taxonomy, gate, mechanism, preservation, feedback-loop, loom]
timestamp: 2026-09-06T00:00:00Z
---

# Ratchet Routing

> **Applied vocabulary:** see the glossary for [Form slop](../glossary/index.md#form-slop),
> [Recall slop](../glossary/index.md#recall-slop), [Judgment slop](../glossary/index.md#judgment-slop),
> [Mechanism](../glossary/index.md#mechanism), and [Ratchet](../glossary/index.md#ratchet).
> This page is the conceptual reference; [ADR-026](../adr/adr-026-gate-mechanism-layer-model.md)
> records the decision. It gives [Preservation](../../workflows/sdlc/preservation.md#feedback-loop-completes-the-cycle)'s
> feedback loop the same routing discipline [quality-baseline](quality-baseline.md) already
> gives the quality gate.

## The problem

Preservation's feedback loop only ever proposed a new skill or a new ADR — every lesson,
regardless of kind, terminated in Markdown. A forgotten environment fact and a badly-judged
tradeoff got the *same* treatment: more prose for the next agent to recall. Prose does not
prevent recurrence of a fact the system already knew; it just enlarges what must be recalled
before it fails the same way again.

## Core idea

**Route the lesson by which kind of slop produced it, not by habit.** The decision rule:
*if a lesson could recur while every existing gate stays green, prose is the wrong
destination.*

| Slop kind | Destination | Why |
|---|---|---|
| [Judgment slop](../glossary/index.md#judgment-slop) | ADR / wiki / skill-creator (prose) | Irreducible — a tradeoff evaluated badly has no mechanical check; answered structurally by producer ≠ judge, never by more prose. |
| [Form slop](../glossary/index.md#form-slop) | A new [`GATE.md`](../../GATE.md) `artifact` criterion | Paperwork undone is a shape check — the Gate's typed-criteria schema already exists for exactly this. |
| [Recall slop](../glossary/index.md#recall-slop) | A [Mechanism](../glossary/index.md#mechanism), installed via [Port 5](../../contract/PORTS.md#port-5--mechanisminstall) | Fully mechanizable — a forgotten environment fact is re-checked by re-executing reality, not by describing it. |

## The first-occurrence rule

Recall slop is ratcheted on the **first** occurrence, not the second. A forgotten
environment fact will always recur — the fact does not change — so waiting for a repeat
before mechanizing it only guarantees a second, identical failure with the fix already
known. This mirrors [quality-baseline](quality-baseline.md)'s no-regression floor, generalized
from a quality metric to any forgotten fact: once observed, it never gets to regress back to
"someone will remember next time."

A Mechanism earned this way must name the failure that produced it — the same
`verified-failing` discipline `GATE.md` already records for its one executable row.

## Where it plugs in

Preservation's [Feedback loop](../../workflows/sdlc/preservation.md#feedback-loop-completes-the-cycle)
is the single place this routing applies — it does not add a new phase or gate, it gives an
existing step three destinations instead of one:

- **Judgment** → the existing skill-creator / ADR path, unchanged.
- **Form** → a `GATE.md` row, typed `artifact`, naming its evidence-producer.
- **Recall** → a Mechanism, following the pattern
  `SKILLS/planning/task-sizing/scripts/size-score.sh` set, installed per Port 5.

Closing (the Preservation stage) holds no `edit` capability, so it never builds the Mechanism
itself — it PROPOSES the mechanism and dispatches to `quick`/`deep` to build it, the same
withhold that keeps Closing curating rather than building, mirroring Discovery's spike escape
hatch.

## Deferred: near-duplicate paragraph detection

A validator check that flags near-duplicate *prose* (not exact-match text — restated
explanations reworded across files) was proposed to catch restatement drift automatically
(surfaced by finding #10 of the loom-core-layer-model milestone: the same explanation
duplicated 3-5× across `adapters/*/`). **Deferred, not built.** It would need fuzzy text
comparison — a materially larger lift than every other Mechanism this milestone graduated —
and the graduation ladder above requires the routing to reuse *existing* enforcement, not
build new infrastructure on a single occurrence. One finding does not meet the bar the
ladder itself sets: **Recall** slop ratchets on first occurrence because the mechanism
already exists (re-execute reality); a check that does not yet exist and requires fuzzy
matching is a different, unproven cost class. Revisit only if a second, independent
restatement-drift finding lands — that is the second real need the ladder asks for before
building.

## Why

- **No learning path dead-ends in prose it can't enforce.** A recall lesson becomes a check
  that fails loudly; a form lesson becomes a Gate row that fails loudly. Only judgment —
  which nothing can mechanically fail — stays prose.
- **First occurrence, not second.** Ratcheting late means paying for the same failure twice.
- **Reuses the Gate/Mechanism split, doesn't invent a third system.** The routing is a
  dispatch table onto layers [ADR-026](../adr/adr-026-gate-mechanism-layer-model.md) already
  defined — no new taxonomy, no new enforcement path.

## Related

- [ADR-026](../adr/adr-026-gate-mechanism-layer-model.md) — the Core/Gate/Mechanism layer
  model and slop taxonomy this pattern routes onto.
- [Quality Baseline](quality-baseline.md) — the ratchet (no-regression floor) precedent this
  pattern generalizes from a quality metric to any forgotten fact.
- [Preservation](../../workflows/sdlc/preservation.md) — the phase whose feedback loop this
  pattern governs.
- [contract/PORTS.md](../../contract/PORTS.md) — Port 5, the placement obligation a routed
  Mechanism resolves against.
- [GATE.md](../../GATE.md) — the typed-criteria file a routed form-slop lesson adds a row to.
