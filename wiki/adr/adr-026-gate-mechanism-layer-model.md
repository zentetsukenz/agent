---
type: ADR
title: Determinism that a workflow asserts must be made executable, not left as prose — loom is organised into a Core/Gate/Mechanism layer model, each layer owning one kind of slop, superseding ADR-002's "determinism is traded for adaptivity" and "no machine-parseable contract in framework content"
status: Accepted
timestamp: 2026-09-04T00:00:00Z
tags: [layer-model, gate, mechanism, core, prose-first, determinism, slop-taxonomy, quality-baseline, verification, supersedes-adr-002, adapter, loom]
---

# ADR-026: The Core/Gate/Mechanism Layer Model

> **Supersedes [ADR-002](adr-002-workflow-as-adapter-seed.md)** (status was
> `Accepted`) on two specific, load-bearing sentences — see *What this supersedes*.
> It does **not** reverse prose-first-for-judgment and does **not** move executable code
> into the workflow seed (see *What is NOT reversed*). It builds on the precedent
> [ADR-025](adr-025-deterministic-board-api.md) already set ("the seed holds the contract,
> the distributable holds the code") and generalises the per-project floor pattern of
> [ADR-017](adr-017-quality-baseline.md) from four quality aspects to every exit criterion.

## Context

ADR-002 (2026-07-14) decided that a workflow is a **prose seed** an adapter interprets, that
**no machine-parseable contract lives in framework content**, and that **determinism is
deliberately traded away for adaptivity**. That was a reasonable bet at authoring time. Three
months of real use refuted it — not as an opinion, but as a set of measured failures across
the twelve open issues, eleven of which reduce to one root cause: *determinism asserted in
prose and never made executable.*

The evidence (each item independently measured, not inferred):

- **Nothing in loom can fail.** Of 28 exit-gate criteria across the six SDLC phases, exactly
  ONE names an executable command (`preservation.md` → [`scripts/validate.sh`](../../scripts/validate.sh)).
  The other 27 are self-attested — the agent that did the work declares it acceptable.
- **The one mechanical gate was a silent no-op.** `validate.sh` resolved its root one level
  too high and globbed a lowercase-typo'd path; a renamed copy of the repo reported
  `0 validated … all OK`, exit 0. It passed locally only because the folder is named `agent`
  and macOS case-folds — on Linux CI it validated nothing.
- **Unexecuted prose is wrong prose.** `task-sizing`'s rubric made its `Small` band
  mathematically unreachable (5 dimensions × min 1 ⇒ min score 5, yet `Small = 1-3`), and a
  worked example printed `~8%` where its own formula yields 9%. A rubric nothing executes can
  be wrong and stay wrong.
- **Every learning path terminated in Markdown.** The preservation loop only ever proposed a
  new skill or a new ADR; no path said *write a script* or *add a check*. Each lesson enlarged
  the prose an agent must recall — the learning loop fed the failure mode it should fix.

The deeper reading: loom is **unenforceable, not merely verbose**. Prose is the right medium
for judgment and rationale, but it is the wrong medium for a guarantee — a guarantee stated in
prose is an aspiration until something re-executes reality and reads the result.

## What this supersedes

Two sentences of ADR-002 are reversed. Quoted **verbatim** from
[`adr-002-workflow-as-adapter-seed.md`](adr-002-workflow-as-adapter-seed.md) (the milestone's
own finding is that unexecuted prose is easy to misquote, so these are transcribed exactly as
the file reads, including where the first wraps across lines 33–34):

> No structured/machine-parseable contract lives in the workflow (or in skills or agents).

and (lines 58–59):

> Determinism is traded for adaptivity; two adapters may compile the same workflow into
> different (but compliant) harnesses. This is intended.

Both are refuted. A structured, machine-parseable contract is now **required** at one narrow
layer (the Gate — a committed per-project file of typed criteria), and determinism is no
longer traded away wholesale: it is **relocated** out of model reasoning and into checks and
mechanisms that re-execute reality. This is an **explicit supersession**, not a quiet
work-around — [ADR-002](adr-002-workflow-as-adapter-seed.md)'s own status is flipped to
`Superseded by ADR-026` in the companion change, so the reversal is visible in both files.

## Decision

loom is organised into **three layers**, each owning exactly one kind of slop, each enforced
by a mechanism suited to what it owns:

| Layer | Form | Owns | Enforced by | Kills |
|---|---|---|---|---|
| Core | prose (skills/wiki/ADRs) | judgment + rationale | reasoning + a DIFFERENT actor | nothing (judgment slop is irreducible) |
| Gate | committed per-project typed criteria | form + order | exit codes + withheld capabilities | form slop |
| Mechanism | scripts (skill-local → shared → structural) | recall + environment facts | re-executing reality | recall slop |

The layers are not a hierarchy of importance but a division of labour by *what kind of failure
each can actually prevent*:

- **Core** stays prose. Judgment slop — a tradeoff evaluated badly — is irreducible; no amount
  of additional prose prevents it. It is answered *structurally* by producer ≠ judge (the actor
  that reviews is not the actor that did the work), which loom already has because the verifier
  role holds no `edit`.
- **Gate** is the one place a machine-parseable contract now lives: a committed, per-project
  file of **typed** criteria (`artifact` | `executable` | `judgment`), each naming its evidence
  producer or marked judgment and escalated to a different actor. This generalises the
  [quality-baseline pattern](../patterns/quality-baseline.md) ([ADR-017](adr-017-quality-baseline.md))
  from four quality aspects to every exit criterion — same shape (single source of truth,
  command + floor per aspect, "a gate that drops below the floor FAILS").
- **Mechanism** is a script that removes a class of failure by *re-executing reality* rather
  than describing it, trustworthy only once observed failing. Mechanisms graduate along a
  ladder — skill-local → shared distributable → structural withhold — whose end state is
  *fewer* mechanisms, because the last rung makes the failure impossible (a role with no `edit`
  cannot commit a bad edit), so the check disappears.

## What is NOT reversed

This is the load-bearing scope guard. Two commitments of the prose-first doctrine are
**preserved**, and overreaching past them would break a seam that three months of use
*re-confirmed* as sound (the adapter-prose collapse, candidate #7, was measured and withdrawn):

1. **Prose-first still governs judgment.** The Core layer — skills, wiki, ADRs — remains prose
   a model interprets. loom does not become a state machine; the ~80/20 policy and every other
   *judgment* stays expressed as intent, not schema. Only *form* (the Gate) and *recall*
   (Mechanisms) leave prose.
2. **Executable code still never lives in the workflow seed.** It lives in the distributable an
   adapter installs — exactly the boundary [ADR-025](adr-025-deterministic-board-api.md) already
   drew ("the seed holds the *contract*, the distributable holds the *code*"). The seed and
   skills hold prose plus an illustrative CLI contract; the executable stays off the seed. The
   fifth port `mechanism→install` (drawn in a following task) is what lets an adapter place that
   distributable — it does not put code back into the seed.

The machine-parseable contract this ADR admits is therefore **narrow and singular**: it is the
Gate file, not a schema smeared across skills and agents. [`contract/PORTS.md`](../../contract/PORTS.md)'s
blanket "no schema, no DSL" stance is hereby granted **one committed, narrow exception** — the
Gate file — and no other. The edit recording that exception in `PORTS.md` (and the Gate file's
own schema) is made by a following task; this ADR only authorises it.

## Consequences

Grounded in the three kinds of slop this milestone named
([glossary additions](../glossary/index.md)):

- **Form slop** (paperwork undone — artifact unwritten, field missing, gate unrun) is now
  caught by the Gate: an `artifact` or `executable` criterion fails instead of being
  self-attested. Bypassable criteria are logged on the tracker, never silently.
- **Recall slop** (a known environment fact forgotten — the E2E-means-start-the-server and
  sandbox-proxy failures) is now caught by a Mechanism that re-executes reality. It is
  ratcheted on *first* occurrence, because a forgotten fact will always recur.
- **Judgment slop** (a tradeoff evaluated badly) stays in the Core and is answered only
  structurally — producer ≠ judge — never by adding more prose. It is deliberately *not*
  "killed"; it is irreducible, and pretending prose could kill it is the original error.

**Follow-up (do NOT fix here — these are owned by companion tasks):** every ADR that currently
cites ADR-002 as live doctrine now points at a partly-superseded decision and must have its
citation contextualised (most cite the *preserved* prose-first stance, not the refuted
sentences — so most need a pointer, not a reversal). The set, established by
`grep -rln 'adr-002\|ADR-002' wiki/adr/`:

- [ADR-003](adr-003-architecture-first-ordering.md)
- [ADR-004](adr-004-loom-mirai-setup.md)
- [ADR-005](adr-005-harness-agnostic-setup.md)
- [ADR-013](adr-013-shared-adapter-contract-core.md) — its adapter seam is the one this ADR
  explicitly does **not** disturb
- [ADR-019](adr-019-loom-hermes-setup.md)
- [ADR-025](adr-025-deterministic-board-api.md) — already carves the same contract/code split
- plus the ADR [index](index.md) and [log](log.md) (the changelog), and ADR-002 itself.

Other accepted consequences:

- **A maintenance surface is accepted deliberately.** loom now owns Gate files and a small set
  of mechanisms/distributables. Kept minimal by the graduation ladder (whose end state is
  fewer mechanisms) and by the single-distributable, namespaced-verb discipline.
- **Determinism becomes falsifiable.** A guarantee can now fail loudly at a known exit code
  instead of passing silently — which is the entire point of superseding "determinism is
  traded away".

## Alternatives considered

- **Leave ADR-002 standing and treat the failures as verbosity to trim.** Rejected — the
  measured root cause is unenforceability, not word count; trimming prose leaves every gate
  still self-attested.
- **Amend ADR-002 in place rather than supersede it.** Rejected — this is a reversal of two
  load-bearing sentences that four other ADRs cite; the Core layer forbids a doctrine being
  quietly worked around, so the reversal must be an explicit, visible supersession.
- **Put the typed criteria in `AGENTS.md` instead of a committed Gate file.** Rejected — 28
  criteria with commands would bloat always-on context for every agent, a context-first
  regression.
- **Reverse prose-first entirely / move executable code into the seed.** Rejected — that is
  *not* what three months of use refuted; it would break [ADR-013](adr-013-shared-adapter-contract-core.md)'s
  adapter seam, which was re-measured and confirmed sound.

## Related

- [ADR-002](adr-002-workflow-as-adapter-seed.md) — the decision this supersedes (two sentences), preserves the rest of.
- [ADR-001](adr-001-adapter-pattern.md) — the adapter layer; prose-first-for-judgment survives intact.
- [ADR-013](adr-013-shared-adapter-contract-core.md) — the adapter-contract seam this ADR deliberately does not disturb.
- [ADR-017](adr-017-quality-baseline.md) / [quality-baseline pattern](../patterns/quality-baseline.md) — the per-project floor pattern the Gate generalises.
- [ADR-025](adr-025-deterministic-board-api.md) — the "seed holds the contract, distributable holds the code" split this ADR extends beyond the board.
- [contract/PORTS.md](../../contract/PORTS.md) — the "no schema" stance that gains one narrow Gate-layer exception.
- [scripts/validate.sh](../../scripts/validate.sh) — the one mechanical gate, and the shape every executable criterion follows.
- [workflows/sdlc/index.md](../../workflows/sdlc/index.md) — the six-phase lifecycle whose exit gates become typed.
- [glossary](../glossary/index.md) — the slop taxonomy (form / recall / judgment) grounding the Consequences.
