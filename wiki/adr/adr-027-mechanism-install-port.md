---
type: ADR
title: A fifth adapter port `mechanism→install` obligates each adapter to answer how loom's Mechanism-layer distributable is placed on disk in an invocable form — the placement question is prior to, and distinct from, ADR-017's deferred enforcement hooks
status: Accepted
timestamp: 2026-09-06T00:00:00Z
tags: [adapter, port, mechanism, distributable, install, layer-model, prose-first, quality-baseline, graduation-ladder, board-api, loom]
---

# ADR-027: The `mechanism→install` Port

> Draws the fifth port that [ADR-026](adr-026-gate-mechanism-layer-model.md) named but did not
> write ("The fifth port `mechanism→install` (drawn in a following task) is what lets an adapter
> place that distributable"). It **amends** [`contract/PORTS.md`](../../contract/PORTS.md)'s
> "four is deliberate" stance (line 24) to five — the sanctioned path that file itself describes
> ("if 'four' turns out wrong, one prose contract is edited"). It does **not** reverse
> [ADR-017](adr-017-quality-baseline.md)'s deferral of enforcement hooks — the two answer
> different questions, argued below. This ADR **decides the obligation**; the edit to `PORTS.md`
> and the per-adapter answers are made by following tasks, not here.

## Context

The [Core/Gate/Mechanism layer model](adr-026-gate-mechanism-layer-model.md) introduced a
**Mechanism layer**: scripts that kill *recall slop* by re-executing reality instead of
describing it. The [graduation ladder](../glossary/index.md) says a mechanism starts
skill-local (`SKILLS/<bucket>/<slug>/scripts/`, already legal per [SPEC.md](../../SPEC.md)) and,
when a **second** caller needs it, graduates to a **shared distributable** — one installable,
exposing namespaced verbs (`loom board add`, `loom size score`, `loom check gates`), following
the single-distributable discipline that mirrors [ADR-025](adr-025-deterministic-board-api.md)'s
"start small".

Both of those decisions presuppose one thing that is nowhere provided: **something must place
that distributable on disk, in a form the harness can actually invoke.** A `loom size score`
that lives only as a design intention cannot be called by any gate step, prose-directed or not.

The gap is measured, not inferred. All three adapters' `setup.md` files only **write Markdown
and report created-vs-patched paths** — verified by grep across
[`adapters/mirai/setup.md`](../../adapters/mirai/setup.md),
[`adapters/opencode/setup.md`](../../adapters/opencode/setup.md), and
[`adapters/hermes/setup.md`](../../adapters/hermes/setup.md): **zero** `npm install`, `chmod`,
`export PATH`, symlink, or comparable install/invocability tokens across all three. So today
**nothing installs an executable**. The four existing [ports](../../contract/PORTS.md) each
resolve a *content* obligation to a file or a harness flag — none of them names *"get an
executable onto disk and make it callable"*. That concern has no owner, and the Mechanism layer
is dead on arrival without one.

This is the "one adapter is a hypothetical seam, two make it real" moment applied to placement:
the Mechanism-layer distributable will need placing on **three** harnesses whose install stories
differ, so the placement concern is a real, recurring seam — exactly the test that justified the
first four ports.

## Decision

**Add a fifth port, `mechanism→install`, to the shared adapter-contract core.** It obligates
each adapter to answer *how loom's Mechanism-layer distributable is placed on disk in a form the
harness can invoke*. Stated as an obligation, in the prose-table style of the existing ports:

> **Port 5 — `mechanism→install`**
>
> **Obligation:** resolve loom's shared **Mechanism-layer distributable** (the single installable
> that exposes the namespaced verbs — `loom board add`, `loom size score`, `loom check gates`) to
> the harness's **placement-and-invocation primitive** — *"how does the distributable get onto
> disk for a project set up under this harness, and how does a workflow step or agent invoke it."*
> The distributable's existence, its verb surface, and its CLI contract are the core's (the seed
> holds the contract, the distributable holds the code — [ADR-025](adr-025-deterministic-board-api.md),
> [ADR-026](adr-026-gate-mechanism-layer-model.md)). The **placement-and-invocation primitive** is
> the adapter's. The port answer MUST state:
>
> - **Where the distributable lives** for a project under this harness — a repo-local tree, a
>   harness profile/plugin location, or another install root the harness already owns.
> - **How it becomes invocable** — the concrete path/alias/`PATH` entry (or harness-native
>   equivalent) by which `loom <verb>` resolves to the installed script, discovered/confirmed
>   against the harness rather than guessed (same discipline as tool-name and model-name strings
>   in Ports 1–2).
> - **What "installed" means for this harness** — the setup step that performs the placement and
>   the created-vs-patched path it reports, so the gate's Verify step can confirm the distributable
>   is present and callable.

The port **states the obligation, not the implementation**. It does not prescribe a package
manager, an install command, a directory layout, or an invocation syntax — only that the adapter
answers the three questions above in whatever prose table/checklist fits its harness, mirroring
the existing ports' latitude.

### Why this is a genuinely new port, not a stretch of an existing one

The four current ports resolve *content-to-file* or *content-to-flag* concerns for
**declarative** primitives (skills, agents, prompts, capability/model/seam bindings). None of
them owns an **executable's placement and invocability** — a concern that only exists because
ADR-026 admitted the Mechanism layer. Folding it into Port 4 (`primitive→file`) would be a
category error: Port 4 answers *"how does a primitive become a Markdown/config file, and where"*;
a Mechanism distributable is not a rendered primitive-file, it is an installed executable whose
success condition is *"can the harness call `loom size score` and read its exit code"*, not
*"does the frontmatter parse"*. The obligations are disjoint, so the port is real.

## The ADR-017 distinction (this is the load-bearing scope guard)

[ADR-017](adr-017-quality-baseline.md) touches this area **twice**, and this ADR contradicts
neither. Both distinctions are argued, not asserted:

1. **ADR-017 *deferred* enforcement hooks; Port 5 answers a *prior, different* question —
   placement.** ADR-017's "Considered options" table deferred *"Deterministic harness hooks that
   block on a failing baseline"* as "stronger but harness-specific and heavier … a possible future
   hardening", keeping instead the **prose-driven, harness-agnostic** floor where a workflow step
   runs the check explicitly. That deferral is about **enforcement**: a hook that *automatically
   fires around a tool or commit and blocks* when a metric is below floor. Port 5 is about
   **placement**: getting the executable onto disk *so that it can be invoked at all* — by the
   very prose-directed gate step ADR-017 kept. Placement is strictly **prior** to enforcement: you
   cannot hook, block on, or even prose-invoke a script that was never installed. Port 5 stops at
   "the script exists and is callable"; it does **not** add an auto-firing, blocking hook, so it
   leaves ADR-017's deferral standing. The `loom size score` a Port-5 answer installs is invoked
   exactly the way ADR-017 blessed — explicitly, from workflow prose at a gate's Verify step — not
   by a harness hook ADR-017 declined to require.

2. **ADR-017 *rejected* "a fifth adapter port" — but for a reason scoped to the quality
   baseline, not to mechanism distribution.** ADR-017's option A rejected "a new dedicated
   quality-baseline primitive + a fifth adapter port" because *the quality baseline is
   project-context (commands + floors), not a new file kind needing harness-specific rendering* —
   tool-name resolution already reuses `capability→tool`, and the recorded baseline is ordinary
   project-context. That reasoning is correct **for the quality baseline** and is untouched here:
   this ADR does not render quality commands as a primitive. Port 5's subject is the **Mechanism
   layer** that ADR-026 introduced *after* ADR-017 — a genuinely new kind of artifact (an
   installed executable) whose placement no existing port covers and whose distinction from
   project-context ADR-017 never considered because the layer did not yet exist. ADR-026 already
   re-opened this exact door by naming the port; this ADR walks through it. So ADR-017's "no fifth
   port" verdict is honoured on its own terms (no port for the quality baseline) while a fifth port
   is added for a different concern it never ruled on.

In short: ADR-017 said *don't add a port to render quality commands, and don't require blocking
hooks yet.* This ADR adds a port to **place an executable**, and adds **no hook**. The scopes do
not overlap.

## The two anticipated adapter answer shapes (confirmed)

The open decision this closes anticipated two answer shapes; both are **confirmed** as the likely
per-adapter answers, and each is consistent with the harness's
[archetype](../patterns/harness-archetypes.md):

- **Mirai / OpenCode → a repo-local tree.** Per-project, per-invocation harnesses whose setup
  already writes a repo-local tree (`.mirai/`, `.opencode/`); the distributable lands in that same
  tree and is invoked by a repo-local path or alias.
- **Hermes → profile distribution.** A resident harness with a profile/plugin location it owns;
  the distributable is placed there and invoked from the profile, since a repo-local tree does not
  fit its install story.

These are **anticipated answers, not mandates** — Port 5 fixes only the *obligation* (the three
questions above). The actual per-adapter answers ([`adapters/mirai/setup.md`](../../adapters/mirai/setup.md),
[`adapters/opencode/setup.md`](../../adapters/opencode/setup.md),
[`adapters/hermes/setup.md`](../../adapters/hermes/setup.md)) are written by following tasks, and
each may refine its shape as long as it answers the obligation. This ADR does not commit any
adapter to a specific install command or path.

## Consequences

- **`PORTS.md`'s "four is deliberate" amends to five.** The `## Why four` heading and the
  line-24 framing in [`contract/PORTS.md`](../../contract/PORTS.md), plus the conformance
  sentence ("supplies all four ports"), are updated to five by a following task — the sanctioned
  "edit one prose contract" path that file itself names. The seam stays a prose contract; no
  template system is unwound.
- **[ADR-025](adr-025-deterministic-board-api.md) (status `Proposed`) depends on this port
  landing.** Its `board add`/`heal` verbs are Mechanism-layer graduations; they cannot be placed
  on any harness until `mechanism→install` exists, so ADR-025's board API graduates out of its
  sub-map only after this port is in the contract.
- **`task-sizing`'s `loom size score` and `check gates` become placeable.** The graduation-ladder
  end state (a mechanism that graduates to a shared distributable) now has a defined install seam,
  so the milestone's own mechanisms can actually reach a harness.
- **A conformance/invariant note is added by a following task,** registering the new port in
  [`contract/index.md`](../../contract/index.md) and [`contract/discipline.md`](../../contract/discipline.md)
  alongside the existing four — not made here.
- **No hook, no blocking enforcement, no key.** Consistent with ADR-017's still-standing deferral,
  this port adds only placement; whether a harness later auto-fires the installed mechanism remains
  the deferred future hardening ADR-017 described.

## Alternatives considered

- **Do not add a port; let each adapter improvise install inside its `setup.md`.** Rejected — the
  placement concern recurs on three harnesses with different install stories; leaving it
  unnamed is exactly the "generic content copied per adapter, drifting" failure that
  [ADR-013](adr-013-shared-adapter-contract-core.md) created the port contract to prevent. An
  un-obligated concern is an unenforced one.
- **Fold placement into Port 4 (`primitive→file`).** Rejected — a category error (argued above):
  Port 4 renders declarative primitives to files; a Mechanism distributable is an installed
  executable with a different success condition ("callable, correct exit code" vs. "frontmatter
  parses"). Merging them would blur the one thing the layer model exists to keep sharp.
- **Treat the distributable as ordinary project-context, like the quality baseline (ADR-017's
  path).** Rejected — the quality baseline is *data* (commands + floors) resolved via
  `capability→tool`; a Mechanism distributable is *code that must be placed and invoked*. ADR-026
  drew that exact boundary ("executable code still never lives in the seed — it lives in the
  distributable an adapter installs"); Port 5 is the seam that install crosses.
- **Add a blocking harness hook now (reverse ADR-017's deferral).** Rejected — out of scope and
  heavier (harness-specific hook wiring, keys/config). Placement is the minimum this milestone
  needs; enforcement hooks stay deferred.

## Related

- [ADR-026](adr-026-gate-mechanism-layer-model.md) — the Core/Gate/Mechanism layer model that
  named this port and introduced the Mechanism layer it serves.
- [ADR-025](adr-025-deterministic-board-api.md) — "the seed holds the contract, the distributable
  holds the code"; its board API depends on this port to be placeable.
- [ADR-017](adr-017-quality-baseline.md) — the deferred enforcement hooks and the "no fifth port"
  rejection, both distinguished above; neither is reversed.
- [ADR-013](adr-013-shared-adapter-contract-core.md) — the prose-contract-of-named-ports seam this
  port extends; re-confirmed sound this milestone and not disturbed.
- [ADR-006](adr-006-capability-based-roles.md) — the discover-don't-guess discipline Port 5 reuses
  for resolving the invocation path/alias.
- [contract/PORTS.md](../../contract/PORTS.md) — the four-port contract this ADR amends to five.
- [contract/primitives.md](../../contract/primitives.md) — the generic vocabulary an adapter
  references rather than restates.
- [GATE.md](../../GATE.md) — the typed exit criteria whose `executable` rows a placed Mechanism is
  what makes runnable.
- [glossary](../glossary/index.md) — the graduation ladder and the slop taxonomy grounding the
  Mechanism layer.
