---
type: ADR
title: The knowledge graph is gated context — corpus-cartographer gains delegate, and a third gate checks the graph against the corpus rather than against itself
status: Accepted
timestamp: 2026-09-22T00:00:00Z
tags: [graph, context, capability, delegate, gate, mechanism, corpus-cartographer, graphify, layer-model, ratchet, loom]
---

# ADR-031: The Knowledge Graph Is Gated Context

> Extends [ADR-006](adr-006-capability-based-roles.md) (capability-based roles,
> withhold-as-forcing-function) and [ADR-021](adr-021-shaping-research-orchestrator.md) (read-only
> `delegate`), and applies [ADR-026](adr-026-gate-mechanism-layer-model.md)'s layer model to a third
> kind of artifact. It adds **no new primitive and no new port** — it widens one agent's capability
> set by one capability and installs one Mechanism.

## Context

[AGENTS.md](../../AGENTS.md) tells every agent to bootstrap by querying a committed knowledge graph.
That made the graph *context* in the strict sense: what an agent believes before it reads anything.

The first committed graph was wrong in a way that is worse than being absent. Measured against the
corpus:

- **[ADR-013](adr-013-shared-adapter-contract-core.md)** — the reference-never-restate ADR, the most
  cited in this repository — had a canonical node of **degree 0**, while a phantom node minted by a
  *citing* file carried all 13 of its edges. Asking the graph "what references ADR-013?" returned
  nothing, with complete confidence. Eighteen such forked clusters existed; **35.8%** of their edges
  landed on the wrong copy.
- **392 of 1399** relative Markdown links between documents (28%) had no edge at all.
- All 65 files under `SKILLS/` produced **exactly one node each** — a filename index, not a graph.

The root cause was a capability gap with no detector. `corpus-cartographer` held `Skill` but not
`delegate`, so it could *invoke* the graphify skill but not *execute* the skill's mandatory
subagent-dispatch step. The skill then routed it to its own documented fallback for hosts that
cannot dispatch — "extract those inline yourself" — which the same document forbids. The skill's
integrity guards check for missing **chunk files**; inline extraction writes none, so no guard
fired. It degraded silently and reported success.

Two further facts made the failure undetectable from inside the tooling. graphify's health check is
explicitly non-aborting — *"do not abort — the graph is still usable"* — so a build never fails. And
`graph.json` is a **post-build** serialization whose own `diagnose` notes say it *"cannot recover raw
producer edges"*, so a clean diagnostic is not evidence of a clean build.

This is the exact shape [ADR-021](adr-021-shaping-research-orchestrator.md) named one altitude up:
**the role's interface was narrower than its implementation demanded** — a leaky seam.

## Decision

**1. Grant `corpus-cartographer` a read-only `delegate`.** Its capability set becomes:

```
read, search, shell, delegate, persist (graphify-out/ only)   — no edit
```

The read-only guarantee is the **withheld `edit`**, not the withheld `delegate`.
[role-scoped-capabilities](../patterns/role-scoped-capabilities.md) already defines the shape —
`DISPATCHER (holds delegate, usually withholds edit)` — and ADR-021 granted exactly this to Shaping.
This is the second member of that pattern, not a new one.

> **The grant is necessary and not sufficient — measured, not predicted.** On Claude Code the
> harness withholds nested dispatch: a subagent cannot spawn a subagent, whatever its `tools:` line
> says. Granting `Task` in `corpus-cartographer`'s frontmatter is therefore **inert** here, verified
> by a probe returning *"No such tool available: Task. Task is disabled for this session, in
> subagents as well as here"* with nothing in `.claude/settings.json` disabling it.
>
> **Consequence: on a harness without nested dispatch, building the graph at depth is a
> front-door job, not a subagent job.** `corpus-cartographer` keeps the grant — the interface
> should still match the implementation, and the grant is live on harnesses that allow nesting —
> but it operates queries, reads reports, and runs the repair and the gate. The extraction dispatch
> belongs to whatever session holds the real dispatch capability.
>
> This is the same leaky seam one level further out: the *harness's* capability set is narrower
> than the skill's implementation demands, and no port obligation currently names nested dispatch
> as a harness property. [harness-archetypes](../patterns/harness-archetypes.md) has two axes —
> who holds the loop, and headless-dispatchability — and neither captures *can a dispatched agent
> itself dispatch*. That is a third axis this repository now has evidence for.

**2. Install `scripts/graph-check.sh` as a Mechanism**, joining `scripts/validate.sh` (prose) and
`scripts/quality.sh` (code). Per [ADR-026](adr-026-gate-mechanism-layer-model.md)'s layer model, each
layer owns one kind of slop; this gate owns **context slop** — a graph that is internally consistent
and externally false.

Every check compares the graph to the **corpus**, never to itself: forked identities, dangling
endpoints, files with no node, Markdown links with no edge, prose self-loops, staleness against
`HEAD`, and a depth floor that fails any directory averaging one node per file. The depth floor is
what catches degenerate extraction, which is the failure this ADR exists because of.

**3. Own the repair.** `scripts/graph/canonicalize.js` merges forked identities onto the document
they name, re-points their edges, collapses the undocumented `_doc` id spelling, synthesizes document
nodes for files that produced only concepts, and back-fills edges for links the corpus states
outright. It is idempotent and asserted so.

This is a **declared workaround with an exit condition**: both defects are upstream bugs, the script
names them, and it is deleted when upstream fixes them.

## Consequences

- A capability grant is no longer invisible. The gate fails on the *symptom* (one node per file), so
  a future agent silently losing its dispatch capability is caught by the artifact, not by luck.
- The graph becomes a ratcheted artifact like the other two floors: a gate may raise these numbers,
  never lower them.
- loom now maintains a post-processing step over a third-party tool's output. That is a real cost,
  and it is why the workaround carries an exit condition rather than becoming quiet permanent glue.
- `SKILLS/` is the single canonical home for skills, including vendored third-party ones. A skill
  that builds committed context may not live unversioned outside the repository.

## Alternatives considered

- **Leave `delegate` withheld and accept structural extraction.** Rejected: it is not a knowledge
  graph, and `AGENTS.md` would be pointing agents at an index of filenames while claiming otherwise.
- **Gate on graphify's own `diagnose` output.** Rejected on evidence: `diagnose` reported
  `dangling_endpoint_edges: 0` on the very graph where 35.8% of a cluster's edges were misrouted. It
  cannot see what the post-build serialization already absorbed.
- **Report the forking upstream and wait.** Rejected as the *only* action — it is being reported, but
  the graph stays wrong meanwhile, and a wrong graph actively misleads every agent that queries it.
- **Grant `corpus-cartographer` unrestricted capabilities.** Unnecessary and against
  [ADR-006](adr-006-capability-based-roles.md): it dispatches extraction, it does not edit the
  corpus. `edit` withheld keeps the forcing function, and its write scope stays `graphify-out/`.

## Related

- [ADR-006](adr-006-capability-based-roles.md) — capability-based roles and withhold-as-forcing-function.
- [ADR-021](adr-021-shaping-research-orchestrator.md) — the first read-only `delegate`; this is the second.
- [ADR-023](adr-023-explore-read-only-shell.md) — the same leaky-seam argument, one capability and one tier away.
- [ADR-026](adr-026-gate-mechanism-layer-model.md) — the Core/Gate/Mechanism layer model this gate joins.
- [ADR-017](adr-017-quality-baseline.md) — the ratchet floor pattern the graph's floors follow.
- [role-scoped-capabilities](../patterns/role-scoped-capabilities.md) — the dispatcher shape.
- [ratchet](../patterns/ratchet.md) — recall slop becomes a Mechanism on first occurrence.
