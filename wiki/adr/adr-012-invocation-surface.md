---
type: ADR
title: Invocation surface is a role facet; stage agents are front doors, utilities are dispatched
status: Accepted
timestamp: 2026-07-31T00:00:00Z
tags: [agent, role, invocation, user-invocable, dispatch, handoff, autopilot, mirai, loom]
---

# ADR-012: Invocation Surface Is a Role Facet

## Context

The Mirai adapter generates every agent from one skeleton
([role.agent.md.template](../../adapters/mirai/assets/templates/role.agent.md.template)), which
hardcodes the two Mirai invocation flags on **every** generated agent:

```yaml
user-invocable: true
disable-model-invocation: false
```

So the whole [utility (dispatched) agent](../glossary/index.md#utility-dispatched-agent) roster —
`explore`, `quick`, `deep`, `verifier`, `frontend`, `visual-qa` — ships **user-invocable**,
appearing in the harness's agent picker right next to the lifecycle stage agents. A human can pick
`deep` (or `visual-qa`, the screenshot-taker) straight from the UI.

That contradicts the roster's own design. A utility is *defined* by receiving **dispatched** work
from a [Dispatcher](../glossary/index.md#dispatcher) that sizes and routes it
([ADR-008](adr-008-delivery-dispatchers.md)). Letting a human start `deep` directly bypasses the
Orchestrator that gauges size and enforces gates — the same swiss-army collapse the dispatcher/
utility split exists to prevent, reintroduced through the front door.

Mirai exposes **two orthogonal** invocation flags (confirmed against the official
[custom-agents doc](https://code.visualstudio.com/docs/copilot/customization/custom-agents); the
older single `infer` field is deprecated precisely to split these apart):

- `user-invocable` (default `true`) — whether the agent appears in the **agent picker** (the human
  front door). `false` = hidden, reachable only as a subagent or programmatically.
- `disable-model-invocation` (default `false`) — whether **other agents** may invoke it **as a
  subagent**. `true` = not subagent-invocable.

Crucially, **`handoffs` is a separate transition mechanism**, keyed on the target agent's *name*,
not on the subagent-invocation path. Setting `disable-model-invocation: true` therefore does **not**
suppress an agent as a *handoff target*.

## Decision

Treat **invocation surface** as a first-class facet of a
[Role](../glossary/index.md#role) — parallel to its capability set
([ADR-006](adr-006-capability-based-roles.md)) — and scope it by the same discipline: **withhold
an entry point to shape the role.** loom names a closed two-value vocabulary; the adapter maps each
value to the harness's concrete flag pair.

| Invocation surface | Who may start it | Mirai flags |
|---|---|---|
| **`front-door`** | a human (picker) **or** an explicit handoff — *not* a silent subagent pull | `user-invocable: true`, `disable-model-invocation: true` |
| **`dispatched`** | only a dispatcher, by delegation | `user-invocable: false`, `disable-model-invocation: false` |

Assignment:

- **Stage agents are `front-door`** — `shaping`, `planner`, `orchestrator`, `closing`. A stage is a
  lifecycle checkpoint a human enters, or a declared [handoff](adr-011-seam-artifact-protocol.md)
  crosses into. Making them `disable-model-invocation: true` blocks a peer from pulling `shaping` in
  as a subagent to "just design something quick" and erasing the stage seam — while the intended
  `shaping → planner → orchestrator → closing` transitions still flow, because handoffs are keyed on
  agent name, not the subagent path.
- **All utilities are `dispatched`** — `explore`, `quick`, `deep`, `verifier`, `writing`,
  `frontend`, `visual-qa`. Hidden from the picker (`user-invocable: false`) so a human can't skip
  the dispatcher; still subagent-invocable (`disable-model-invocation: false`) so dispatchers reach
  them. `frontend` is a `deep`/`quick`-tier executor with UI/UX awareness the Orchestrator
  dispatches to — a utility by role, `dispatched` by surface — even though it delegates
  pixel-looking to `visual-qa`.

The facet is **orthogonal** to the dispatcher/utility split, which is why it is named separately
rather than derived from "holds `delegate`": both `orchestrator` (`front-door`) and `frontend`
(`dispatched`) hold `delegate`, yet their surfaces differ.

## Considered options

| Option | Verdict |
|---|---|
| **Status quo** — every agent `user-invocable: true`, `disable-model-invocation: false` | Rejected — utilities appear in the picker; humans bypass the dispatcher. |
| **Quiet bug-fix** — just flip utilities to `user-invocable: false`, no named concept | Rejected — misses the reusable abstraction; the same "withhold an entry point" logic is loom's capability thesis applied to invocation. |
| **Expose both raw booleans** in the role model and templates | Rejected — leaks Mirai's two-boolean schema into loom's generic role model and admits the two nonsensical corners. |
| **`front-door` = `user-invocable: true`, `disable-model-invocation: false`** (stages stay subagent-invocable) | Rejected — a stage could be silently dispatched mid-task, collapsing the seam; the surface would withhold nothing. |
| **Named facet, closed `front-door \| dispatched` vocabulary, adapter maps to the flag pair; `front-door` withholds subagent dispatch** | **Chosen.** |

## Consequences

- `role.agent.md.template` gains a placeholder for the flag pair; the setup instruction fills it
  from the role's invocation surface (derived from the role kind — **not** a new interview
  question). See [write-format.md](../../adapters/mirai/references/write-format.md) and
  [STAGES.md](../../adapters/mirai/STAGES.md).
- The utility roster no longer clutters the agent picker; the dispatcher becomes the only path to a
  utility, making the ADR-008 split real at the UI layer.
- Stage agents can't be silently pulled in as subagents; they are entered by a human or a handoff.
- **Automation forward-pointer.** The invocation surface is the *manual* half of the workflow
  substrate (where a human enters); the `handoffs:` chain is the *automatic* half (where stages
  advance). Mirai's autopilot is `handoffs.send: true` (auto-submit) plus optional
  `handoffs.model`. Laying the surface cleanly now is the prerequisite for later flipping handoffs
  to auto-advance. That automation is a **separate effort** with its own open decisions — completing
  the missing `planner → orchestrator` link in the handoff chain, and gating auto-advance at the
  Verification seam so it can't erode into "we shipped it" — and this facet does not depend on it.

## Related

- [ADR-006](adr-006-capability-based-roles.md) — the capability facet this one parallels.
- [ADR-008](adr-008-delivery-dispatchers.md) — the dispatcher/utility split the `dispatched` surface enforces at the UI.
- [ADR-009](adr-009-frontend-domain-utility.md) — `frontend`/`visual-qa`, the domain utilities assigned `dispatched` here.
- [ADR-011](adr-011-seam-artifact-protocol.md) — the handoff/seam mechanism that `front-door` stages transition through.
- [wiki/patterns/role-scoped-capabilities.md](../patterns/role-scoped-capabilities.md) — the pattern extended with the invocation-surface facet.
- [wiki/environments/mirai.md](../environments/mirai.md) — the `user-invocable` / `disable-model-invocation` / `handoffs` primitives.
- [adapters/mirai/STAGES.md](../../adapters/mirai/STAGES.md), [adapters/mirai/MAPPING.md](../../adapters/mirai/MAPPING.md) — the concrete surface assignments per role.
</content>
