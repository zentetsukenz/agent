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
5. [handoff](../../SKILLS/preservation/handoff/SKILL.md) — context transfer.
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

Preservation feeds learnings **back into the framework itself**: when a repeated pattern
emerges, propose a new skill via
[skill-creator](../../SKILLS/meta/skill-creator/SKILL.md), and record hard-to-reverse
decisions as ADRs. This is what makes the SDLC workflow a *loop* rather than a line.

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
