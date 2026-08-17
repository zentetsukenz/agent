# loom Stages in OpenCode

> **OpenCode render bindings for the stage/utility primitives.** The generic content — stage
> groupings, per-stage **skill rosters**, each role's **capability set**, **workflow-prose
> sourcing**, and the **seam-artifact PRODUCE/DISCOVER obligation** — lives once in the shared
> [`contract/`](../../contract/primitives.md) core; this file **references** it and states only
> what is OpenCode-specific ([ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md)):
> the deep/quick file paths, the quick **base-agent** names, the **`mode`** invocation flag, and
> the **committed-ledger** wiring. Feeds [setup.md](setup.md) step 5 (Write) and
> [MAPPING.md §2–3](MAPPING.md#2-stage-agent--stage-command-primitives--opencode-files).
>
> Read the generic per-role rosters, capabilities, and workflow-prose sources from
> [contract/primitives.md](../../contract/primitives.md#per-stage-skill-rosters--capability-sets--workflow-prose-sourcing).
> The **withheld** capabilities are load-bearing (a role with `edit: deny` cannot write code);
> capabilities resolve to OpenCode `permission:` keys via [references/capabilities.md](references/capabilities.md).
> **`docs-lookup`** is wired only if the project opted in (interview 4b).
>
> **Invocation surface** ([ADR-012](../../wiki/adr/adr-012-invocation-surface.md)) is derived
> from the role kind, **not** a setup question — every stage agent is **`front-door`**
> (`mode: primary`), every [utility](#utility-agents-cross-stage) is **`dispatched`**
> (`mode: subagent`). See [write-format.md](references/write-format.md#role-invocation-surface).

## Stage agents — OpenCode bindings

Generic rosters/capabilities/prose per role:
[contract/primitives.md](../../contract/primitives.md#per-stage-skill-rosters--capability-sets--workflow-prose-sourcing).
OpenCode render bindings:

| Role | Deep agent file | Quick command file | Quick base agent | `mode` | Handoff target |
|---|---|---|---|---|---|
| Shaping | `.opencode/agents/shaping.md` | `.opencode/commands/shape.md` | `plan` (built-in read-only; inherits the no-edit guarantee) | `primary` | → `planner` (human `Tab`-selects; DISCOVERs ledger) |
| Planner | `.opencode/agents/planner.md` | `.opencode/commands/deliver.md` (shared) | `build` | `primary` | — (no downstream stage) |
| Orchestrator | `.opencode/agents/orchestrator.md` | `.opencode/commands/deliver.md` (shared) | `build` | `primary` | → `closing` (human `Tab`-selects; DISCOVERs ledger) |
| Closing | `.opencode/agents/closing.md` | `.opencode/commands/close.md` | `build` | `primary` | — (no downstream stage) |

- **Delivery is two dispatcher agents**, not one — Planner + Orchestrator
  ([ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md)); the single `deliver.md` command
  serves the low-ceremony quick path. The old single `delivery.md` is retired (migration:
  [write-format.md](references/write-format.md#delivery-split-migration-deliverymd--dispatchers)).
- **Shaping is a `primary` (front-door) agent *and* a read-only Dispatcher** ([ADR-021](../../wiki/adr/adr-021-shaping-research-orchestrator.md)):
  its generic capability set holds `delegate` (no `edit`), so it renders with `permission: { task: allow }`
  and dispatches recon/research to the `explore` utility and spikes to `quick`/`deep`. The two
  role facets are orthogonal — `mode: primary` is how a human *enters* it; `delegate` is whether it
  *dispatches out*. It is the one stage agent that is both.
- **No native `handoffs:` transition** — OpenCode has no such primitive. The transition is the
  human selecting the next primary agent (`Tab`); the incoming agent's body instructs it to
  DISCOVER the on-disk ledger (see [§protocol](#the-communication-protocol-document-cross-stage)).
- **Quick stances** (the portable no-jump-to-conclusions backstop) are generic — take them from
  [contract/primitives.md](../../contract/primitives.md#per-stage-skill-rosters--capability-sets--workflow-prose-sourcing).

## Utility agents (cross-stage)

The utility roster (`explore`/`quick`/`deep`/`verifier`/`writing`) and the domain-specialized
utilities (`frontend`/`visual-qa`), their purposes, archetypes, and capability sets are
**generic** — see [contract/primitives.md](../../contract/primitives.md#utility-agents-cross-stage).
OpenCode render bindings: each is a plain `.opencode/agents/<name>.md` with **`mode: subagent`**
(the `dispatched` surface) so a [Dispatcher](../../wiki/glossary/index.md#dispatcher) reaches it
via `@mention`/delegation but the `Tab` cycle hides it. A human never `Tab`-selects a utility.
Resolve each capability set to OpenCode `permission:` keys via
[references/capabilities.md](references/capabilities.md).

- **Built-in reuse — but pin the model.** OpenCode ships `explore` (read-only recon), `scout`
  (external-docs research), and `general` (full-access) subagents. loom **always emits a thin
  `.opencode/agents/explore.md`** carrying the **Utility** archetype `model:` — even though it
  reuses the built-in's read-only recon behavior. This is load-bearing for cost: the bare
  built-in `explore` runs on OpenCode's *default* model, so relying on it silently forfeits
  cheap-tier dispatch — the whole point of routing recon to a Utility agent
  ([ADR-021](../../wiki/adr/adr-021-shaping-research-orchestrator.md)). The emitted agent is
  `read`+`search` only (`mode: subagent`). `scout` gives keyless dependency-source research, so
  the optional `docs-lookup` (MCP) capability stays off by default.
- **Verifier** — `.opencode/agents/verifier.md`, an extended-thinking / long-context model named
  by the user at setup, `permission: { edit: deny }`. A *utility*, not a Delivery stage agent
  (two dispatchers reuse it).
- **Frontend + Visual QA** — `.opencode/agents/frontend.md` (`edit`-capable) delegates
  pixel-looking to `.opencode/agents/visual-qa.md` (`edit: deny`, vision-capable) so screenshot
  bytes never enter the edit-capable context
  ([ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md)). Source agents:
  [agents/frontend.md](../../agents/frontend.md), [agents/visual-qa.md](../../agents/visual-qa.md);
  shared browser-drive knowledge: [wiki/patterns/browser-capture.md](../../wiki/patterns/browser-capture.md).

## The communication protocol document (cross-stage)

The seam-artifact protocol obligation — where the [ledger](../../wiki/patterns/seam-artifact-protocol.md)
lives, the namespace, each stage's seam artifacts, and which role PRODUCEs vs DISCOVERs — is
**generic** ([contract/primitives.md](../../contract/primitives.md#the-communication-protocol-document-cross-stage),
[ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md)). OpenCode's wiring answer (the
[`seam-obligation→wiring` port](../../contract/PORTS.md#port-3--seam-obligationwiring), detailed
in [MAPPING.md §7](MAPPING.md#7-communication-protocol-document--loomhandoffs)):

- The protocol document is a **committed file** at `.loom/handoffs/protocol.md`, pointed at from
  `opencode.json`'s `instructions:` array (so it merges into always-on context) and referenced
  from `AGENTS.md`. OpenCode has **no description-triggered instruction** primitive, so this
  replaces Mirai's on-demand `.instructions.md`. (The protocol *document* is committed loom config;
  the *ledger* it points at is **gitignored by default** — ephemeral coordination, not
  version-controlled, per [ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md) Option A; a
  project may opt to commit the ledger for reviewable diffs.)
- **PRODUCE roles** (`shaping`, `orchestrator`, `closing` at exit) and **DISCOVER roles**
  (`planner`, `closing` at entry) reference the protocol document in their body. Because OpenCode
  has **no memory tool**, `persist` is the on-disk folder: these roles need `edit` **scoped to
  `.loom/handoffs/`** so they can write the ledger without gaining general code-edit — use a
  glob permission `permission: { edit: { "*": deny, ".loom/handoffs/**": allow } }` (see
  [write-format.md](references/write-format.md#persist-scoped-edit)). This same on-disk folder is
  the shared ground when OpenCode is the **micro dispatch target** of a resident macro agent (a
  [dispatch-target harness](../../wiki/patterns/harness-archetypes.md)): the dispatching harness and
  this SDLC run read the one folder, because memory cannot cross a harness boundary.
- **No native `handoffs:` frontmatter** — the transition between stages is the human selecting
  the next primary agent (`Tab`), which reads the ledger. loom does not fabricate an automatic
  transition; the ledger + the incoming agent's DISCOVER instruction *are* the wiring.
- The skills `preservation/stage-handoff` (PRODUCE) and `discovery/session-bootstrap` (DISCOVER) are
  the thin adapters that implement the read/write against the on-disk folder.

Mandatory at the **two stage seams** only (Shaping → Delivery, Delivery → Closing); within-stage
dispatch stays ephemeral via `planning/dispatch-context` (its organized, unregistered `working/` lane).

## Meta bucket — not a stage

`SKILLS/meta/*` is an always-available toolbox, not tied to a stage — generic
([contract/primitives.md](../../contract/primitives.md#meta-bucket--not-a-stage)). OpenCode render
binding: any meta skill an adopted skill references (e.g. `context-compression` referenced by
`planning/dispatch-context`) is copied into `.opencode/skills/` alongside the referencing skill so
relative links resolve — see [MAPPING.md §1](MAPPING.md#1-skill-primitive--opencodeskills).

## Related

- [contract/primitives.md](../../contract/primitives.md) — the generic rosters/capabilities/prose/protocol this file binds to OpenCode.
- [contract/PORTS.md](../../contract/PORTS.md) — the four obligations; this file supplies the manifest + seam-wiring bindings.
- [MAPPING.md](MAPPING.md) — the sibling port answers (skills copy, model target, capability→permission, protocol doc).
- [ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md) — the shared-core split (reference, never restate).
- [ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md) — the base setup approach.
- [ADR-006](../../wiki/adr/adr-006-capability-based-roles.md), [ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md), [ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md), [ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md), [ADR-012](../../wiki/adr/adr-012-invocation-surface.md) — the disciplines these bindings honor.
- [references/capabilities.md](references/capabilities.md) — generic capability → OpenCode permission mapping.
- [setup.md](setup.md) — the OpenCode adapter setup instruction that reads this file during Write (step 5).
