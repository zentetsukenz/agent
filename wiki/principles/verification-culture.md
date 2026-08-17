---
type: Principle
title: Verification Culture
description: Evidence before claims, always — no completion, success, or positive work-state claim is allowed without fresh verification evidence gathered in the same turn it is claimed
tags: [quality, discipline, verification, evidence, iron-law, sdlc]
timestamp: 2026-08-17T00:00:00Z
---

# Verification Culture

A cross-cutting principle of the [SDLC workflow](../../workflows/sdlc/index.md), peer to
[commit-often](commit-often.md) and [architecture-first](architecture-first.md). It governs the
single most important honesty constraint on any agent: **you may not claim work is done until you
have proven it — with fresh evidence, in the same turn you claim it.**

Claiming completion without verification is not efficiency, it is dishonesty. It is also the
failure mode most likely to defeat an autonomous agent: a model that *narrates* success it has not
*demonstrated* silently ships broken work. This principle is the standing law that forbids it.

## The Iron Law

> **No completion, success, or positive work-state claim without fresh verification evidence.**

If you have not run the verifying observation *in the turn you are making the claim*, you cannot
make the claim. This binds not just the word "done" but every paraphrase, synonym, and implication
of success — *"that should work now"*, *"looks good"*, *"fixed"*, an expression of satisfaction,
or moving on to the next task as if this one were complete. **Violating the letter of the rule is
violating its spirit.**

The law is deliberately harness-agnostic: it names *evidence*, never a specific tool or command.
*What* command proves a claim is a project/harness concern (resolved through the project's
[quality baseline](../patterns/quality-baseline.md) and its own scripts); *that* evidence is
mandatory is the universal law.

## The Gate Function

Every agent, before making any status or satisfaction claim, runs this — mechanically:

1. **Identify** — what observation would prove this claim? (a command, a test, a rendered screen,
   a query result).
2. **Produce it fresh** — run it now, in full; do not reuse a stale prior run or extrapolate from a
   partial one.
3. **Read it honestly** — full output, exit state, failure count; adversarially, not hopefully.
4. **Judge** — does the evidence actually confirm the claim? If no → state the *actual* state with
   evidence. If yes → make the claim *with* the evidence attached.

Skipping any step is claiming without proof — the thing this principle forbids.

## Evidence over assertion

The distinction the whole principle turns on:

| Assertion (forbidden alone) | Evidence (required) |
|---|---|
| "I added the code" | "I ran it and saw `<expected output>`" |
| "Tests should pass" | "`<test command>` → 0 failures, this turn" |
| "The bug is fixed" | "The original failing case now passes; here is the run" |
| "An agent reported success" | "The diff/artifact shows the change, independently checked" |
| "Requirements met" | "Each success criterion checked line-by-line against evidence" |

A passing check is a *minimum*, not proof of correctness: criteria are the floor, and evidence is
rated by confidence (proven vs. circumstantial), with anything unproven flagged even when it
appears to pass.

## Where it is enforced

Verification is **shift-left**: the obligation is not deferred to one late phase, it accrues from
the first.

| Phase | Enforcement |
|---|---|
| [Discovery](../../workflows/sdlc/discovery.md) | Authors **testable success criteria** — the evidence targets a later claim will be checked against. The law starts here. |
| [Implementation](../../workflows/sdlc/implementation.md) | Each quality gate's **Verify** step produces fresh evidence before the slice may be reviewed and committed ([commit-often](commit-often.md)). |
| [Verification](../../workflows/sdlc/verification.md) | The exit gate admits **no "done" claim without proof**; the whole delivery is confirmed against the Discovery criteria via evidence, not assertion. |

The *procedural how-to* of gathering that evidence — the checklist of what to run, boundary
probing, failure forensics, the evidence-handoff shape — lives in the
[verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md)
skill. This principle is the *law*; that skill is the *procedure*.

## Common rationalizations (all rejected)

| Excuse | Reality |
|---|---|
| "Should work now" | Run the verification. |
| "I'm confident" | Confidence is not evidence. |
| "Just this once" | No exceptions — the exception *is* the failure. |
| "The linter passed" | One aspect green ≠ the claim proven. |
| "The agent said success" | Verify independently; a report is an assertion. |
| "Different words, so the rule doesn't apply" | Spirit over letter; paraphrase is still a claim. |

## Related

- [verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md) — the procedural skill that operationalizes this law (how to gather evidence, forensics, handoff).
- [commit-often](commit-often.md) — the sibling gate; a commit clears the Verify step this principle governs.
- [architecture-first](architecture-first.md) — the sibling cross-cutting SDLC principle.
- [quality-baseline](../patterns/quality-baseline.md) — the per-project floor whose checks supply much of the evidence.
- [wisdom](wisdom.md) — "Verify before claiming done".
