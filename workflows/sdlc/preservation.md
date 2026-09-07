---
type: Pattern
title: SDLC — Preservation Phase
description: Policy governing how the Preservation phase performs — consolidate documentation, curate durable knowledge, hand off, and feed learnings back into the framework
---

# Preservation Phase

> **Bucket:** `preservation/` · **Position:** 6 of 6 · **Stage:** Closing · **Follows:** [Verification](verification.md) · **Closes the loop back to:** the framework itself

## 1. Intent

Capture what was learned and leave the system and knowledge base in a state the *next*
agent or human can pick up cold.

## 2. Gates

**Entry gate**

- Verification passed; the change is accepted.
- **The Delivery seam artifact has been discovered** — this is the Closing side of the
  Delivery → Closing handoff (see below).

## Stage seam — DISCOVER (Delivery → Closing)

Preservation is the **Closing stage**, so its entry is where the organisation receives the baton.
Per the [Seam Artifact Protocol](../../wiki/patterns/seam-artifact-protocol.md), Closing
**discovers** the Delivery seam artifact rather than reconstructing what shipped from memory:

- Read the ledger manifest, find the latest `shipped` row for the milestone, and load
  `delivery/<milestone>/verified-change.md` — it tells Closing exactly what to curate.
- Use [session-bootstrap](../../SKILLS/discovery/session-bootstrap/SKILL.md) (the DISCOVER
  adapter) and the project's [communication protocol document](../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document).
- On completion, Closing may register a final `preserved` row pointing at the curated wiki
  entries, closing the ledger trail for the milestone.

**Exit gate**

- Durable knowledge is captured and cross-linked in the wiki.
- A handoff exists.
- No orphaned or undocumented decisions remain.
- `scripts/validate.sh` passes (frontmatter + link integrity).

## 3. Recommended skills

1. [edit-article](../../SKILLS/meta/edit-article/SKILL.md) — write the docs.
2. [wiki-init](../../SKILLS/preservation/wiki-init/SKILL.md) / [wiki-curator](../../SKILLS/preservation/wiki-curator/SKILL.md) — place and curate knowledge.
3. [wiki-crosslink](../../SKILLS/preservation/wiki-crosslink/SKILL.md) — link, never duplicate.
4. [wiki-audit](../../SKILLS/preservation/wiki-audit/SKILL.md) — consistency and coverage check.
5. [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md) — the formal cross-stage seam artifact (PRODUCE adapter).
6. [checkpoint](../../SKILLS/preservation/checkpoint/SKILL.md) — used throughout long runs, not only at the end.

## 4. Agent-effort policy

- **Delegable → small agent:** curation, cross-linking, auditing.
- **High-judgment → higher-intelligence agent:** deciding *what knowledge is worth
  preserving* (signal vs. noise).

## 5. Shift-left obligation

Preservation **consolidates** the documentation that every prior phase produced as it went
(documentation is cross-cutting, not authored from scratch at the end). It also captures
reusable patterns flagged during [Implementation](implementation.md) into the wiki.

## Deployment / Release (optional)

Deployment is **optional** in this workflow — CI/CD is assumed to be in place. When a
release occurs, however, **update the related documents** (release notes, changelog, etc.)
if any. Use [release-notes](../../commands/release-notes.md).

## Feedback loop (completes the cycle)

Preservation feeds learnings back into the framework — but *where* depends on which kind of
slop the lesson is, per the routing rule in [Ratchet Routing](../../wiki/patterns/ratchet.md)
([ADR-026](../../wiki/adr/adr-026-gate-mechanism-layer-model.md)):

- **[Judgment slop](../../wiki/glossary/index.md#judgment-slop)** (a tradeoff evaluated
  badly) → propose a new skill via
  [skill-creator](../../SKILLS/meta/skill-creator/SKILL.md), or record a hard-to-reverse
  decision as an ADR. This is the **existing** path and stays unchanged — judgment is
  irreducible, so prose remains its correct destination.
- **[Form slop](../../wiki/glossary/index.md#form-slop)** (paperwork left undone) → a new
  [`GATE.md`](../../GATE.md) criterion, typed `artifact` and naming its evidence-producer per
  that file's five-column schema — not an ADR or a skill.
- **[Recall slop](../../wiki/glossary/index.md#recall-slop)** (a known environment fact
  forgotten) → a Mechanism installed via
  [Port 5](../../contract/PORTS.md#port-5--mechanisminstall), following the pattern
  `SKILLS/planning/task-sizing/scripts/size-score.sh` set. Ratchet on the **first**
  occurrence, not the second — a forgotten environment fact will always recur, so waiting for
  a repeat only guarantees a second failure with the fix already known.

**The rule behind the routing:** if a lesson could recur while every existing gate stays
green, prose is the wrong destination. This is what makes the SDLC workflow a *loop* rather
than a line.

### Closing's propose-and-dispatch edge

The Form and Recall destinations above (a `GATE.md` criterion, a Mechanism) require `edit`
capability — but Closing holds none, the same withhold that keeps
[Discovery's spike](discovery.md) a disposable probe rather than a build step. So Closing
does not build them itself: it PROPOSES. It assembles a dispatch payload — per
[dispatch-context](../../SKILLS/planning/dispatch-context/SKILL.md)'s conventions — naming the
exact `GATE.md` row or Port 5 Mechanism the lesson warrants and the evidence behind it, and
hands that payload to `quick` or `deep` to actually build. The built artifact returns to
Closing for curation into the wiki. See
[Ratchet Routing](../../wiki/patterns/ratchet.md) for why this handoff exists.

## 6. Artifacts

- Updated, curated wiki (principles / patterns / glossary).
- Cross-links and a validated knowledge base.
- A handoff document.
- New/updated ADRs and any proposed new skills.
- Release notes, when a release occurred.

## Related

- [Verification](verification.md) — gates entry to this phase.
- [architecture-first](../../wiki/principles/architecture-first.md) — new/updated ADRs are captured here.
- [SDLC index](index.md) — the full five-phase workflow.
</content>
