# loom Stages in Mirai

> **Mirai render bindings for the stage/utility primitives.** The generic content — stage
> groupings, per-stage **skill rosters**, each role's **capability set**, **workflow-prose
> sourcing**, and the **seam-artifact PRODUCE/DISCOVER obligation** — lives once in the shared
> [`contract/`](../../contract/primitives.md) core; this file **references** it and states only
> what is Mirai-specific ([ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md)):
> the deep/quick file paths, the quick **base-agent** names, the **invocation-surface** flag
> pairs, and the **`handoffs:`** wiring. Feeds [setup.md](setup.md) step 5 (Write) and
> [MAPPING.md §2–3](MAPPING.md#2-stage-agent--stage-prompt-primitives--mirai-files).
>
> Read the generic per-role rosters, capabilities, and workflow-prose sources from
> [contract/primitives.md](../../contract/primitives.md#per-stage-skill-rosters--capability-sets--workflow-prose-sourcing).
> The **withheld** capabilities are load-bearing (a role with no `edit` cannot write code);
> capabilities resolve to Mirai tool names via [references/capabilities.md](references/capabilities.md).
> **`docs-lookup`** is wired only if the project opted in (interview 4b).
>
> **Invocation surface** ([ADR-012](../../wiki/adr/adr-012-invocation-surface.md)) is derived
> from the role kind, **not** a setup question — every stage agent is **`front-door`**, every
> [utility](#utility-agents-cross-stage) is **`dispatched`**. Mirai flag pairs: `front-door` =
> `user-invocable:true` + `disable-model-invocation:true`; `dispatched` =
> `user-invocable:false` + `disable-model-invocation:false` (the `{{ROLE_INVOCATION_SURFACE}}`
> placeholder — see [write-format.md](references/write-format.md#role-invocation-surface)).

## Stage agents — Mirai bindings

Generic rosters/capabilities/prose per role:
[contract/primitives.md](../../contract/primitives.md#per-stage-skill-rosters--capability-sets--workflow-prose-sourcing).
Mirai render bindings:

| Role | Deep agent file | Quick prompt file | Quick base agent | Invocation surface | `handoffs:` target |
|---|---|---|---|---|---|
| Shaping | `.mirai/agents/shaping.agent.md` | `.mirai/prompts/shape.prompt.md` | `Plan` (built-in read-only; inherits the no-edit guarantee) | `front-door` | `agent: planner` |
| Planner | `.mirai/agents/planner.agent.md` | `.mirai/prompts/deliver.prompt.md` (shared) | `agent` | `front-door` | — (no downstream stage) |
| Orchestrator | `.mirai/agents/orchestrator.agent.md` | `.mirai/prompts/deliver.prompt.md` (shared) | `agent` | `front-door` | `agent: closing` |
| Closing | `.mirai/agents/closing.agent.md` | `.mirai/prompts/close.prompt.md` | `agent` | `front-door` | — (no downstream stage) |

- **Delivery is two dispatcher agents**, not one — Planner + Orchestrator
  ([ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md)); the single `deliver.prompt.md`
  serves the low-ceremony quick path. The old single `delivery.agent.md` is retired (migration:
  [write-format.md](references/write-format.md#delivery-split-migration-deliveryagentmd--dispatchers)).
- **Quick stances** (the portable no-jump-to-conclusions backstop) are generic — take them from
  [contract/primitives.md](../../contract/primitives.md#per-stage-skill-rosters--capability-sets--workflow-prose-sourcing).

## Utility agents (cross-stage)

The utility roster (`explore`/`quick`/`deep`/`verifier`/`writing`) and the domain-specialized
utilities (`frontend`/`visual-qa`), their purposes, archetypes, and capability sets are
**generic** — see [contract/primitives.md](../../contract/primitives.md#utility-agents-cross-stage).
Mirai render bindings: each is a plain `.mirai/agents/<name>.agent.md` with a **`dispatched`**
invocation surface (`user-invocable:false` + `disable-model-invocation:false`) so a
[Dispatcher](../../wiki/glossary/index.md#dispatcher) reaches it but the picker hides it. A human
never picks a utility directly. Resolve each capability set to Mirai tool names via
[references/capabilities.md](references/capabilities.md).

- **Verifier** — `.mirai/agents/verifier.agent.md`, an extended-thinking / long-context model
  named by the user at setup. A *utility*, not a Delivery stage agent (two dispatchers reuse it).
- **Frontend + Visual QA** — `.mirai/agents/frontend.agent.md` (`edit`-capable) delegates
  pixel-looking to `.mirai/agents/visual-qa.agent.md` (`edit`-free, vision-capable) so
  screenshot bytes never enter the edit-capable context
  ([ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md)). Source agents:
  [agents/frontend.md](../../agents/frontend.md), [agents/visual-qa.md](../../agents/visual-qa.md);
  shared browser-drive knowledge: [wiki/patterns/browser-capture.md](../../wiki/patterns/browser-capture.md).

## The communication protocol document (cross-stage)

The seam-artifact protocol obligation — where the [ledger](../../wiki/patterns/seam-artifact-protocol.md)
lives, the namespace, each stage's seam artifacts, and which role PRODUCEs vs DISCOVERs — is
**generic** ([contract/primitives.md](../../contract/primitives.md#the-communication-protocol-document-cross-stage),
[ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md)). Mirai's wiring answer (the
[`seam-obligation→wiring` port](../../contract/PORTS.md#port-3--seam-obligationwiring), detailed
in [MAPPING.md §7](MAPPING.md#7-communication-protocol-document--miraiinstructions)):

- The protocol document is a description-triggered file instruction at
  `.mirai/instructions/handoff.instructions.md` (no `applyTo` — see
  [write-format.md](references/write-format.md#communication-protocol-document)).
- **PRODUCE roles** (`shaping`, `orchestrator`, `closing` at exit) and **DISCOVER roles**
  (`planner`, `closing` at entry) carry `persist` in `tools:` and reference the document in
  their body (never a restated convention).
- Each producing stage agent's `handoffs:` frontmatter is an **array of objects** (`label`,
  `agent`, `prompt`, optional `send` — **never** a bare array of agent names) pointing at the
  next stage's agent (`shaping → planner`, `orchestrator → closing`) so Mirai offers the
  transition. See the [schema](references/write-format.md#handoffs-frontmatter--object-schema-do-not-use-a-bare-array).
- The skills `preservation/stage-handoff` (PRODUCE) and `discovery/session-bootstrap` (DISCOVER) are
  the thin adapters that implement the read/write.

Mandatory at the **two stage seams** only (Shaping → Delivery, Delivery → Closing); within-stage
dispatch stays ephemeral via `planning/dispatch-context` (its organized, unregistered `working/` lane).

## Meta bucket — not a stage

`SKILLS/meta/*` is an always-available toolbox, not tied to a stage — generic
([contract/primitives.md](../../contract/primitives.md#meta-bucket--not-a-stage)). Mirai render
binding: any meta skill an adopted skill references (e.g. `context-compression` referenced by
`planning/dispatch-context`) is copied into `.mirai/skills/` alongside the referencing skill so
relative links resolve — see [MAPPING.md §1](MAPPING.md#1-skill-primitive--miraiskills).

## Related

- [contract/primitives.md](../../contract/primitives.md) — the generic rosters/capabilities/prose/protocol this file binds to Mirai.
- [contract/PORTS.md](../../contract/PORTS.md) — the four obligations; this file supplies the manifest + seam-wiring bindings.
- [MAPPING.md](MAPPING.md) — the sibling port answers (skills copy, model target, capability→tool, protocol doc).
- [ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md) — the shared-core split (reference, never restate).
- [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) — the base setup approach.
- [ADR-006](../../wiki/adr/adr-006-capability-based-roles.md), [ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md), [ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md), [ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md), [ADR-012](../../wiki/adr/adr-012-invocation-surface.md) — the disciplines these bindings honor.
- [references/capabilities.md](references/capabilities.md) — generic capability → Mirai tool-name mapping.
- [setup.md](setup.md) — the Mirai adapter setup instruction that reads this file during Write (step 5).
