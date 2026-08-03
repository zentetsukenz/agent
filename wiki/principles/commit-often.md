---
type: Principle
title: Commit Often
description: Every green quality gate is a commit point — land verified work in small, reversible increments rather than one large drop at the end
tags: [quality, discipline, git, checkpoint, sdlc]
timestamp: 2026-08-03T00:00:00Z
---

# Commit Often

A cross-cutting principle of the [SDLC workflow](../../workflows/sdlc/index.md), peer to
[verification-culture](verification-culture.md) and [architecture-first](architecture-first.md).
It governs *when* work is committed to version control during Delivery.

## Core Principle

**A green gate is a commit point.** Every time a [quality gate](../../workflows/sdlc/implementation.md#quality-gates)
passes — verification is green and the review found nothing blocking — the agent **commits the
work before continuing**. Delivery lands as a series of small, reversible, individually-verified
commits, never one large unreviewed drop at the end.

## Why

- **Reversibility.** A small commit behind a green gate is a known-good restore point. When the
  next slice goes wrong, `git reset` to the last gate costs minutes, not the whole session.
- **Bisectable history.** One commit per verified slice means `git bisect` can find a regression's
  origin. A single mega-commit hides which change broke what.
- **Review actually happens.** Coupling the commit to the review gate means the two-axis review
  (Standards + Spec) runs against a bounded diff, not an unreviewable end-of-session pile.
- **Context hygiene.** Committing at a gate is the natural moment to
  [checkpoint](../../SKILLS/preservation/checkpoint/SKILL.md) the decision trail and, if context is
  high, hand off — the commit hash is the anchor a fresh session resumes from.

## The rule at each gate

At every quality gate in the plan:

1. **Verify** — run the task's verification commands; they must be green
   ([verification-culture](verification-culture.md)).
2. **Review** — run the two-axis review gate (Standards + Spec) over the slice's diff.
3. **Commit** — only once both pass, commit the slice with a message naming what it delivers and
   the review outcome. A failing gate is **never** committed past.

## What a commit is *not*

- ❌ Not a checkpoint of broken/red work "to save progress" — that is what
  [checkpoint](../../SKILLS/preservation/checkpoint/SKILL.md) and the memory trail are for.
- ❌ Not one commit per keystroke — the unit is a **verified slice at a gate**, not every edit.
- ❌ Not deferred to the end — "I'll commit once it all works" defeats reversibility and review.

## Where it is enforced

| Phase | Enforcement |
|---|---|
| [Planning](../../workflows/sdlc/planning.md) | The plan **sequences the quality gates** (review + commit points) across the task graph, so commit cadence is designed in, not improvised. |
| [Implementation](../../workflows/sdlc/implementation.md) | Each task's exit runs the **review-and-commit gate**; the Orchestrator does not advance to the next slice until the current one is committed behind a green gate. |
| [Verification](../../workflows/sdlc/verification.md) | The final gate confirms the whole against evidence; its commit is the one the Delivery seam artifact references. |

## Related

- [verification-culture](verification-culture.md) — the sibling "evidence over assertion" gate a commit must clear first.
- [architecture-first](architecture-first.md) — the sibling cross-cutting SDLC principle.
- [Implementation phase](../../workflows/sdlc/implementation.md) — where the review-and-commit gate executes.
- [checkpoint](../../SKILLS/preservation/checkpoint/SKILL.md) — the within-session trail anchored to each commit.
- [adr-016-embedded-review-gate](../adr/adr-016-embedded-review-gate.md) — the decision record embedding review as a gate and adopting this principle.
