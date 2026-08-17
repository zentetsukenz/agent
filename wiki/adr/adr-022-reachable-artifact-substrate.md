---
type: ADR
title: HITL ticket artifacts land on a reachable networked artifact ref, produced by a uniform resolution sub-step and guarded by a reachability invariant
status: Accepted
timestamp: 2026-08-17T00:00:00Z
tags: [handoff, seam, artifact, ledger, substrate, networked, hitl, wayfinder, macro, altitude, grilling, prototype, communication, loom]
---

# ADR-022: Reachable Artifact Substrate for HITL Ticket Outputs

> Extends [ADR-011](adr-011-seam-artifact-protocol.md) / [ADR-015](adr-015-communication-line-refinement.md)
> (the Seam Artifact Protocol and its lanes) and [ADR-018](adr-018-macro-project-management.md)
> (macro project-management, the networked substrate, the altitude seam). It adds no new
> primitive and no fifth port — it names an existing substrate class's second instrument, folds a
> PRODUCE sub-step into machinery [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) already runs,
> and states one invariant.

## Context

Some [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) ticket types are **HITL** — a human works
them live: a `grilling` ticket resolves through [grill-with-docs](../../SKILLS/discovery/grill-with-docs/SKILL.md),
a `prototype` ticket through [prototype](../../SKILLS/implementation/prototype/SKILL.md). Resolving
one **produces content** — a sharpened design doc, findings, a runnable prototype — that a *later*
reader needs: another macro session on another server, and, most importantly, the **SDLC run
dispatched from a `task` leaf that points back at that ticket** ([ADR-018](adr-018-macro-project-management.md)
§4 down-translation). The [macro section](../patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant)
already requires macro artifacts to be **linked, not embedded** on the board.

But the three sibling ticket types persist their output **three different ways**, and only one is
reachable:

- **`research`** (AFK) already writes findings to a throwaway `research/<name>` **branch** and links a
  context pointer from the ticket — reachable by another session.
- **`grilling`** (HITL) dumps to a **local-only** substrate (`.loom/…` on-disk folder or repo
  memory) — a board link that resolves to a path no other agent can reach.
- **`prototype`** (HITL) persists **nowhere formal** — "capture the answer in a `NOTES.md`",
  never registered, never linked as a reachable asset.

So the board's *"linked, not embedded"* discipline is honored in the letter (no copy) but broken in
spirit: the link is a **dead end**. The canonical failure: a `task` leaf dispatches into an SDLC run
in a *different* harness, whose `shaping/<milestone>/` seam artifact points at a `.loom/` path that
harness cannot see. The baton drops at the altitude seam. The current human workaround — manually
`git push` the artifacts to a temp branch and edit the ticket link — is exactly the missing protocol,
hand-rolled and unstandardized.

The naive fix ("push the `.loom/` folder to a branch") is wrong for three reasons the user surfaced:
committing the on-disk-folder substrate drags a shared manifest and artifact pile through **every
clone** (merge conflicts on parallel pull/rebase), **pollutes the SDLC session** with content it
should not carry, and blurs the working tree. That is the on-disk-folder class's *defining* property —
and it is precisely wrong here.

## Decision

1. **The artifact home is a second instrument of the *networked* substrate class — not the
   on-disk-folder class.** [ADR-018](adr-018-macro-project-management.md) added the
   [networked/external store](../patterns/seam-artifact-protocol.md#substrate-is-an-adapter-choice)
   class (*"distributes across agents **and** stays out of the code tree"*). That class now has **two
   instruments**: the **tracker/board** holds macro *state* (tickets, status, the map index — small,
   structured); an **artifact ref** holds bulky HITL *content* (prototypes, design docs, findings) as a
   git ref on the server, fetched by URL on demand. Both are networked, both out-of-tree. This is a
   *reuse of an existing class*, not a fourth class — a "found, not forced" signal.

2. **The ref is an orphan branch per effort, `loom-artifacts/<map-slug>`.** Orphan (disconnected)
   history means it **never participates in a rebase or merge of `main`** — it is a pure content
   bucket reachable by URL, exactly the networked-store shape. It never enters an SDLC session's
   working tree; the run's entry seam artifact carries only the **URL**, and the run fetches the one
   artifact it needs on demand. The concrete ref mechanics are the adapter's `persist` resolver's
   job; a non-git host may substitute a blob store.

3. **Publishing is a uniform PRODUCE sub-step in ticket resolution — no ticket-type branching.**
   wayfinder's existing *"record the resolution"* step (post comment, close, append to
   Decisions-so-far) gains one unconditional sub-step: **PRODUCE — persist any artifact this
   resolution created to the reachable artifact substrate via `persist`, and link the returned URL
   from the ticket, never a local path.** It **always runs** and is a **no-op when the resolution
   produced nothing**, so no agent ever contains `if ticket.type == grilling`. It reuses the
   [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md) PRODUCE contract **by reference**
   (write + return a reachable pointer) rather than restating the mechanics, and adds **no new skill**.

4. **A reachability invariant sits beside the one-source-of-truth invariant.** In the
   [communication protocol document's macro section](../patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant):

   > A linked artifact's link MUST resolve to a substrate **every participant of that altitude can
   > reach**. A link to a local-only path (`.loom/…`, harness memory) is a protocol **violation** — the
   > same class of violation as a second, unregistered source of truth.

   It turns a silent dead-end link into caught drift, mirroring the invariant it sits next to. Every
   participating agent references the document, which is how the drift is caught.

5. **Cleanup is trivial by construction.** An artifact ref lives until its content reaches a
   **durable home** (merged code, or knowledge curated to the wiki at the Closing seam); refs for a
   closed effort's map are swept when the **map/effort closes** as a backstop. Because there is one
   orphan branch per effort under a fixed `loom-artifacts/` prefix, cleanup is a pure
   **enumerate-by-prefix + delete-ref** operation — no history to untangle, no working-tree checkout,
   no manifest to reconcile.

6. **The SDLC line stays untouched and board-oblivious.** Shaping → Planning → Orchestrator →
   Verifier → Closing keeps using the *micro* ledger (memory or gitignored on-disk) exactly as today.
   The single point of contact is the **down-translation**: a dispatched leaf's `shaping/<milestone>/`
   seam artifact carries a *URL* to the networked ref, which the run reads on demand — no new phase, no
   new gate, no working-tree baggage. A prototype built *inside* a dispatched run is **not** in scope
   here: it follows the normal micro→macro **up**-translation (the `delivery/<milestone>/verified-change`
   seam artifact already covers it). This ADR governs only artifacts produced while **resolving a
   tracker ticket** at the macro altitude.

## Considered options

| Option | Verdict |
|---|---|
| **Status quo** — grilling→`.loom/`, prototype→nowhere | Rejected — board links are dead ends; the baton drops at the altitude seam. |
| **Commit/push the on-disk-folder substrate to a branch** | Rejected — drags a shared manifest through every clone (rebase/merge conflicts), pollutes the focused SDLC session, blurs the working tree. That is the on-disk-folder class's defining flaw. |
| **A brand-new fourth substrate class** | Rejected — the networked class already fits (out-of-tree, distributes); a new class is an unearned invention. |
| **A new `publish-artifact` skill** | Rejected — more to maintain; wayfinder's resolution step already exists and `stage-handoff` already owns PRODUCE. Reference, don't restate. |
| **Ticket-type branching in Shaping/Orchestrator** | Rejected — `if grilling: push` is exactly the leak; the obligation must be uniform. |
| **Normal branch off `main`** | Rejected — shares history, can tangle on rebase/merge; the whole point is zero mainline interaction. |
| **A second networked instrument (orphan-branch artifact ref) + uniform PRODUCE sub-step + reachability invariant** | **Chosen.** |

## Consequences

- The [Seam Artifact Protocol's substrate table](../patterns/seam-artifact-protocol.md#substrate-is-an-adapter-choice)
  gains a note that the networked class has **two instruments** (board = state, artifact ref = bulky
  content); the macro section gains the **reachability invariant**.
- [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md)'s *"record the resolution"* step gains the
  uniform PRODUCE sub-step; its Ticket Types note that `grilling`/`prototype` outputs publish to the
  reachable artifact substrate (as `research` already does to its branch).
- [prototype](../../SKILLS/implementation/prototype/SKILL.md)'s "When done" learns that, **when
  resolving a tracker ticket**, the kept answer/artifact publishes to the reachable ref and links from
  the ticket — not a local `NOTES.md`.
- The glossary gains an **Artifact ref** term and the **Substrate** term notes the two networked
  instruments.
- Adapters resolve the artifact ref through the existing **Port 3** `persist` wiring — **no fifth
  port, no new primitive**. Mirai/Hermes `persist` resolvers gain the artifact-ref target for the
  macro altitude.
- SDLC runs stay unchanged internally and board-oblivious; they only learn that an entry seam
  artifact's links may be URLs to fetch on demand.
- Only one genuinely new thing results: the second networked instrument (the orphan-branch artifact
  ref). Everything else reuses existing machinery — the networked class, wayfinder's resolution step,
  the stage-handoff PRODUCE contract, the one-source-of-truth invariant's shape — a signal the design
  is found, not forced.

## Related

- [ADR-011](adr-011-seam-artifact-protocol.md) — the Seam Artifact Protocol this extends.
- [ADR-015](adr-015-communication-line-refinement.md) — the three lanes over one ledger home; PRODUCE = `stage-handoff`.
- [ADR-018](adr-018-macro-project-management.md) — macro-PM, the networked substrate class, the altitude seam this artifact crosses.
- [seam-artifact-protocol](../patterns/seam-artifact-protocol.md) — the substrate table and macro section this ADR edits.
- [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) — the resolution step the PRODUCE sub-step folds into; the two-vocabulary down-translation.
- [grill-with-docs](../../SKILLS/discovery/grill-with-docs/SKILL.md), [prototype](../../SKILLS/implementation/prototype/SKILL.md) — the HITL skills whose outputs this makes reachable.
- [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md) — the PRODUCE contract reused by reference.
- [role-scoped-capabilities](../patterns/role-scoped-capabilities.md) — `persist` resolves the artifact-ref substrate (Port 3).
