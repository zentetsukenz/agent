---
type: ADR
title: Shaping is a read-only research orchestrator — it dispatches exploration to the cheap tier
status: Accepted
timestamp: 2026-08-17T00:00:00Z
tags: [agent, role, shaping, dispatcher, delegate, research, cost, explore, opencode, arbor, loom]
---

# ADR-021: Shaping Is a Read-Only Research Orchestrator

## Context

The [Shaping](../../workflows/sdlc/index.md) stage (Discovery + Design) is owned by a single
Communicator-tier agent whose generic capability set
([contract/primitives.md](../../contract/primitives.md#shaping-discovery--design)) was:

```
read, search, shell, persist, interview, tasks (+ docs-lookup)   — no edit
```

No `delegate`. But per the [glossary](../glossary/index.md#role), a role's kind is *defined* by
whether it holds `delegate`: a [Dispatcher](../glossary/index.md#dispatcher) routes work to
others; a [Utility](../glossary/index.md#utility-dispatched-agent) receives it. Without
`delegate`, **Shaping cannot dispatch to any utility** — yet three parts of its own definition
already require exactly that:

1. [`discovery/research`](../../SKILLS/discovery/research/SKILL.md) — "spin up an `Explore`-style
   subagent (via `runSubagent`) to do the reading."
2. [`discovery/grill-with-docs`](../../SKILLS/discovery/grill-with-docs/SKILL.md) — "dispatch a
   sub-agent to find [a fact]… only the questions downstream of it wait."
3. The **spike escape hatch** in `primitives.md` — "a Discovery throwaway spike that needs to
   write code is dispatched to an executor utility (`quick`/`deep`)."

So the role's **interface (capability set) was narrower than its implementation (skills)
demanded** — a leaky seam. It also defeated the cost goal: with no dispatch, the expensive
Communicator does its own grunt reading instead of routing it to the cheap Utility-tier
[`explore`](../../contract/primitives.md#utility-agents-cross-stage) — the very tier the archetype
table earmarks for "exploratory subagent dispatch."

This shape is exactly [Arbor](https://arxiv.org/abs/2606.11926)'s benchmarked
Coordinator/Executor split (2.5× the compute efficiency of Claude Code / Codex on the same
budget): a **Coordinator** research director that maintains the frontier and *dispatches*
experiments, and **Executors** that each do one thing in isolation and report back **distilled
evidence, not raw context**. loom already applies this isolation at the `frontend`↔`visual-qa`
seam ([ADR-009](adr-009-frontend-domain-utility.md)); Shaping is where it belongs for research.

## Decision

**Grant Shaping a read-only `delegate`, making it a read-only research orchestrator** — a
[Dispatcher](../glossary/index.md#dispatcher) that still withholds `edit`:

```
read, search, shell, delegate, persist, interview, tasks (+ docs-lookup)   — no edit
```

- **Dispatches recon/research reading** to the `explore` utility and one-question fact-finding to
  `research`'s subagent; **spikes that need code** go to `quick`/`deep`. The expensive Communicator
  context stays lean while the reading runs on the cheap Utility tier.
- **`edit` stays denied**; `persist` is scoped to the ledger (findings, domain model, design
  decisions), never application code. The "Shaping produces understanding, not code" forcing
  function is intact.
- **Shaping is the one stage agent that is both `front-door` and Dispatcher.** Invocation surface
  ([ADR-012](adr-012-invocation-surface.md)) — how a human *enters* it — is orthogonal to
  `delegate` — whether it *dispatches out*. This amends the illustrative claim in
  [ADR-008](adr-008-delivery-dispatchers.md) that the Orchestrator is *the* dispatcher: Shaping is
  a second, read-only one, and a research need is no longer only "a loop back" — Shaping owns the
  research and dispatches it.

**Emit `explore` with a pinned model on OpenCode.** OpenCode ships a built-in `explore` subagent,
and the adapter previously *reused* it (emitting no file). But the bare built-in runs on
OpenCode's **default** model — so relying on it silently forfeits cheap-tier dispatch, the whole
cost win. The adapter now **always emits `.opencode/agents/explore.md`** carrying the **Utility**
archetype `model:` (reuse the built-in's read-only behavior, pin the cheap model). Mirai already
emits its `explore` agent with the archetype model, so no gap there.

**Fold in two Arbor mechanisms minimally** (this is a first, deliberately small step):

- **Return distilled evidence, not raw context** — added to `research` and `grill-with-docs`: a
  dispatched explorer reads widely but reports back only the cited answer; the reading never
  enters the orchestrator's context.
- **Check prior-art before spending compute** — the spike hatch now says: where cheap novelty
  signal exists, check it *before* dispatching a spike (architecture-first: back unknowns with
  evidence). Arbor's Idea-Tree backpropagation and budget steering are **deferred** — bigger, not
  yet needed.

## Consequences

- Shaping can finally do what its skills already assume — the leaky seam closes.
- Exploration cost drops: grunt reading runs on the Utility tier, not the Communicator.
- OpenCode bare projects no longer silently lose cheap-tier dispatch.
- The Dispatcher vocabulary now has two members (Orchestrator, Shaping); the glossary is updated
  to say Dispatchers *typically* withhold `edit` and can be front-doors too.

## Alternatives considered

- **Remove the dispatch lines from the skills instead of granting `delegate`.** Would push
  expensive reading back into the Communicator — the opposite of the cost goal. Rejected.
- **Give Shaping unrestricted `delegate` like the Orchestrator.** Unnecessary; Shaping dispatches
  recon and spikes, not a full implementation plan. Read-only `delegate` + `edit` withheld keeps
  the forcing function. Rejected.
- **Keep reusing OpenCode's built-in `explore` (emit no file).** Silently forfeits the cheap model
  — the exact gap this ADR closes. Rejected.

## Related

- [contract/primitives.md](../../contract/primitives.md#shaping-discovery--design) — the amended Shaping capability set + orchestrator framing.
- [adapters/mirai/STAGES.md](../../adapters/mirai/STAGES.md), [adapters/opencode/STAGES.md](../../adapters/opencode/STAGES.md) — the render notes for the `delegate` grant and the pinned `explore` model.
- [ADR-008](adr-008-delivery-dispatchers.md) — the Delivery dispatcher split this amends (Shaping is a second, read-only dispatcher).
- [ADR-012](adr-012-invocation-surface.md) — invocation surface, orthogonal to `delegate`.
- [ADR-009](adr-009-frontend-domain-utility.md) — the context-isolation precedent (`frontend`↔`visual-qa`).
- [Arbor](https://arxiv.org/abs/2606.11926) — the Coordinator/Executor research architecture this mirrors.
