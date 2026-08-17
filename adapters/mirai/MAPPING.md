# loom → Mirai Mapping

> **Mirai's answers to the four [port obligations](../../contract/PORTS.md).** The generic
> content this table used to restate — the SKILLS→skills copy rule, stage groupings, utility
> roster, model archetypes, capability vocabulary, protocol obligation — now lives once in the
> shared [`contract/`](../../contract/index.md) core; this file **references** it and states
> only the Mirai-specific render bindings ([ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md)).
> See [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) for why this mapping exists,
> [wiki/environments/mirai.md](../../wiki/environments/mirai.md) for Mirai's primitives, and
> [STAGES.md](STAGES.md) for the per-stage rosters/capability-sets these bindings feed.

The four ports (all defined generically in [contract/PORTS.md](../../contract/PORTS.md)):

| Port | Section |
|---|---|
| `primitive→file` manifest (skill, agent, prompt) | §1 (skills), §2 (stages), §3 (utilities), and the [manifest in setup.md](setup.md#harness-manifest) |
| `archetype→model` | §5 |
| `capability→tool` | §6 |
| `seam-obligation→wiring` | §7 |

## 1. skill primitive → `.mirai/skills/`

Every loom skill a project adopts is copied (and lightly tailored during the interview) from
`SKILLS/<bucket>/<slug>/SKILL.md` to `.mirai/skills/<slug>/SKILL.md`. **The copy/tailor rule
itself is generic** — see [contract/primitives.md](../../contract/primitives.md#the-six-primitives-the-core-renders)
and the [skill copy rules](references/write-format.md#skill-copy-rules). Mirai-specific render
bindings only:

| loom source | `.mirai/` target | Mirai rule |
|---|---|---|
| `SKILLS/<bucket>/<slug>/SKILL.md` | `.mirai/skills/<slug>/SKILL.md` | `name` in frontmatter **must equal** `<slug>` (Mirai requirement) — already enforced by loom. |
| `SKILLS/<bucket>/<slug>/references/*` · `scripts/*` · `assets/*` | `.mirai/skills/<slug>/…` | Copied verbatim, one level deep (Mirai's progressive-loading model). |
| `SKILLS/meta/*` referenced by an adopted skill | `.mirai/skills/<slug>/` | Copied alongside the referencing skill so relative links resolve. |

**Output location** is `.mirai/skills/`. **The setup instruction itself is not copied** —
`setup.md` *writes* `.mirai/`, it is not content that ships inside it.

## 2. stage-agent + stage-prompt primitives → `.mirai/` files

The stage groupings, the two-tier (prompt = quick combo / agent = deep workflow) model, and
the Delivery dispatcher split are **generic** — see
[contract/primitives.md](../../contract/primitives.md#stage-groupings-six-phases--three-stages)
and [STAGES.md](STAGES.md). Mirai's render bindings for those primitives:

| Stage | Prompt file (quick) | Deep agent file(s) |
|---|---|---|
| Shaping | `.mirai/prompts/shape.prompt.md` | `.mirai/agents/shaping.agent.md` |
| Delivery | `.mirai/prompts/deliver.prompt.md` | `.mirai/agents/planner.agent.md` + `.mirai/agents/orchestrator.agent.md`; verification → `verifier` utility |
| Closing | `.mirai/prompts/close.prompt.md` | `.mirai/agents/closing.agent.md` |

- A **prompt**'s `agent:` field names a **Mirai base agent** — `Plan` (built-in read-only) for
  Shaping, `agent` otherwise — **not** the deep stage agent. Read-only stages inherit Mirai's
  no-edit guarantee from `Plan` mode ([ADR-006](../../wiki/adr/adr-006-capability-based-roles.md)).
- A **deep agent** carries the phase workflow prose + role capability set + a `front-door`
  [invocation surface](../../wiki/glossary/index.md#invocation-surface)
  ([ADR-012](../../wiki/adr/adr-012-invocation-surface.md)): `user-invocable:true` +
  `disable-model-invocation:true`.
- **Delivery is split** ([ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md)); the old
  single `delivery.agent.md` is retired (migration: [write-format.md](references/write-format.md#delivery-split-migration-deliveryagentmd--dispatchers)).

See [STAGES.md](STAGES.md) for the exact skill roster, capability set, and workflow-prose
sourcing per role (all generic, sourced from the core).

## 3. utility agents → `.mirai/agents/*.agent.md`

The utility roster (`explore`/`quick`/`deep`/`verifier`/`writing`) and the domain-specialized
utilities (`frontend`/`visual-qa`) are **generic** — see
[contract/primitives.md](../../contract/primitives.md#utility-agents-cross-stage). Mirai render
bindings: each is a plain `.mirai/agents/*.agent.md` with a **`dispatched`** invocation surface
(`user-invocable:false` + `disable-model-invocation:false`) so a
[Dispatcher](../../wiki/glossary/index.md#dispatcher) can reach it but the picker hides it. The
per-utility capability sets live in [STAGES.md](STAGES.md#utility-agents-cross-stage); resolve
them to tool names via §6. Source agents for the domain utilities:
[agents/frontend.md](../../agents/frontend.md), [agents/visual-qa.md](../../agents/visual-qa.md).

## 4. project-context primitive → `AGENTS.md` / `mirai-instructions.md`

The role of the always-on context file (per-project conventions, **not** workflow steering) is
generic — see [contract/interview.md](../../contract/interview.md#project-context--instruction-file).
Mirai render binding: it is either root `AGENTS.md` **or** `.mirai/mirai-instructions.md` —
**pick one, never both** (see [wiki/environments/mirai.md](../../wiki/environments/mirai.md)).
Written at `init`, kept current by `update`.

## 5. Model-archetype render target

The three archetypes + working styles + role→archetype assignment are **generic**
([contract/primitives.md](../../contract/primitives.md#the-model-archetypes)). Mirai's
answer to the [`archetype→model` port](../../contract/PORTS.md#port-2--archetypemodel):

**Render target = an inline `model:` field (string or fallback array) in each generated
`.agent.md`/`.prompt.md`** — Mirai has no central model-routing config, so the archetype
resolves per-file. Always write a **fallback array** (even one item) so a future model
deprecation doesn't silently break the config. Exact model-name strings are
project/subscription-specific: collect them in the interview
([contract/interview.md §3](../../contract/interview.md#3-model-matching)) and confirm against
the user's actual Mirai model picker — never hardcode a guessed string.

**Open item** (verify-later): whether Mirai exposes a programmatic way to enumerate available
models (VS Code LM API, or a `mirai`/`code` CLI command) for auto-detect. Until resolved, the
interview asks the user directly.

## 6. Capability → Mirai tool mapping

The capability vocabulary + the "discover, don't guess" discipline are **generic**
([contract/primitives.md](../../contract/primitives.md)). Mirai's answer to the
[`capability→tool` port](../../contract/PORTS.md#port-1--capabilitytool) — full detail in
[references/capabilities.md](references/capabilities.md):

| Capability | Mirai tool | Kind | Notes |
|---|---|---|---|
| `read` | `read` | alias | stable |
| `edit` | `edit` | alias | stable |
| `shell` | `execute` | alias | stable |
| `delegate` | `agent` | alias | dispatch subagents |
| `web` | `web` | alias | stable |
| `tasks` | `todo` | alias | stable |
| `search` | `search` | alias | stable |
| `persist` | e.g. `vscode/memory` | specific tool | **discover/confirm at setup** — not an alias |
| `interview` | e.g. `vscode/askQuestions` | specific tool | **discover/confirm at setup** — not an alias |
| `docs-lookup` | MCP `<server>/*` (e.g. `context7/*`) | MCP server | **opt-in** ([ADR-007](../../wiki/adr/adr-007-docs-lookup-capability.md)); server config lives outside the agent file |

**Withhold mechanism (Mirai):** a role *denied* a capability simply **omits** the tool from
its `tools:` array. The withheld capability is load-bearing — a role with no `edit` cannot
write code. The adapter **tolerates deviation** — where a mapped name is harness-/version-
specific (`persist`, `interview`, `docs-lookup`), discover or confirm it against the user's
actual tool list rather than hardcoding.

## 7. Communication protocol document → `.mirai/instructions/`

The seam-artifact protocol obligation (ledger, manifest, PRODUCE/DISCOVER, mandatory at the
two stage seams) is **generic**
([contract/primitives.md](../../contract/primitives.md#the-communication-protocol-document-cross-stage),
[ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md)). Mirai's answer to the
[`seam-obligation→wiring` port](../../contract/PORTS.md#port-3--seam-obligationwiring):

| Generic obligation | Mirai wiring |
|---|---|
| Communication protocol document | `.mirai/instructions/handoff.instructions.md` — description-triggered (**no** `applyTo`) so it loads on demand, not every request. |
| [Ledger](../../wiki/glossary/index.md#ledger) substrate → `persist` target | Mirai repo memory (`/memories/repo/loom/…`) and/or a `.loom/handoffs/` on-disk folder (chosen in [interview 4d](references/interview.md)). The on-disk folder is **gitignored by default** — ephemeral coordination, not version-controlled ([ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md) Option A; durable knowledge → wiki/ADRs); a project may opt to commit it for reviewable diffs. Note Mirai is a **GUI-only, non-dispatch-target** [harness archetype](../../wiki/patterns/harness-archetypes.md): its SDLC runs are human-driven and not dispatched into by a resident macro agent, so memory is a valid substrate here (a shared on-disk folder is only *mandatory* when the run is dispatched cross-harness). |
| [Artifact ref](../../wiki/glossary/index.md#artifact-ref) → `persist` target (macro altitude) | When the project runs macro-PM, a HITL ticket's bulky output (`grilling`/`prototype`/`research`) publishes to a **networked artifact ref** — an orphan branch `loom-artifacts/<map-slug>` on the project's git host ([ADR-022](../../wiki/adr/adr-022-reachable-artifact-substrate.md)) — and the ticket links the URL. This is the **second instrument of the networked class**, distinct from the on-disk `.loom/` micro ledger: it stays out of the working tree (no rebase/merge tangle, no SDLC-session pollution) and is reachable by a dispatched run in another harness. No new port — it resolves through this same `persist` wiring. |
| Ledger manifest | `<ledger-root>/index.md` — seeded empty at setup; producers register rows. |
| PRODUCE / DISCOVER handoff | `handoffs:` frontmatter (an **array of objects** — `label`, `agent`, `prompt`, optional `send`; **never** a bare array) between stage agents + `persist` in their `tools:` + a body reference to the instruction. See [STAGES.md](STAGES.md#the-communication-protocol-document-cross-stage). |

The protocol document is **always generated**; only its substrate/namespace are user choices. When
the on-disk folder is chosen (default gitignored), seed a `.gitignore` entry for the ledger
artifacts unless the user opts to commit them.
Template: [assets/templates/handoff.instructions.md.template](assets/templates/handoff.instructions.md.template).

## Related

- [contract/PORTS.md](../../contract/PORTS.md) — the four obligations this file answers for Mirai.
- [contract/primitives.md](../../contract/primitives.md) — the generic primitives/rosters/archetypes referenced above.
- [ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md) — the shared-core split (reference, never restate).
- [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) — the base setup approach this mapping implements.
- [ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md) — the seam-artifact handoff protocol (§7).
- [ADR-022](../../wiki/adr/adr-022-reachable-artifact-substrate.md) — the networked artifact ref for reachable HITL ticket outputs (§7).
- [ADR-006](../../wiki/adr/adr-006-capability-based-roles.md) — capability-based role discipline (§6).
- [ADR-007](../../wiki/adr/adr-007-docs-lookup-capability.md) — the optional `docs-lookup` capability.
- [ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md) — the Delivery dispatcher split (§2, §3).
- [ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md) — the `frontend` + `visual-qa` domain utilities (§3).
- [ADR-012](../../wiki/adr/adr-012-invocation-surface.md) — the invocation-surface facet (§2, §3).
- [wiki/environments/mirai.md](../../wiki/environments/mirai.md) — Mirai primitive reference.
- [references/capabilities.md](references/capabilities.md) — full capability→tool mapping and docs-lookup wiring.
- [STAGES.md](STAGES.md) — stage groupings, skill rosters, capability sets, workflow-prose sourcing.
- [setup.md](setup.md) — the Mirai adapter setup instruction that reads this file.
