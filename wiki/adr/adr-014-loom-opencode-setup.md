---
type: ADR
title: loom setup approach for the OpenCode harness, with an opt-in OMO model-tiering layer
status: Accepted
timestamp: 2026-07-31T00:00:00Z
tags: [opencode, omo, setup, adapter, agent, skill, model-matching, permissions, loom]
---

# ADR-014: loom Setup Approach for the OpenCode Harness

## Context

loom ships content-only and installs into a project through a harness-agnostic entrypoint
that runs a universal setup contract via the target harness's **adapter**
([ADR-005](adr-005-harness-agnostic-setup.md)). With the shared adapter-contract core built
([ADR-013](adr-013-shared-adapter-contract-core.md); ticket
[#9](https://github.com/zentetsukenz/agent/issues/9)), an adapter is now a **thin rendering
layer** that references the generic `contract/` content and supplies only its four
[port obligations](../../contract/PORTS.md). **Mirai** was the first adapter
([ADR-004](adr-004-loom-mirai-setup.md)); **OpenCode** is the second — the "one adapter is a
hypothetical seam, two make it real" moment now realized against a real, shared core.

OpenCode (opencode.ai) is a terminal/TUI agent harness. Two prior research tickets surfaced
the facts this adapter renders from:

- **OpenCode native primitives** ([#5](https://github.com/zentetsukenz/agent/issues/5)):
  agents are `.opencode/agents/*.md` (or `opencode.json`) with `mode: primary|subagent` and
  **`permission`-based** tool control (`edit: deny` = the withhold); commands are
  `.opencode/commands/*.md`; skills use the identical agentskills.io `SKILL.md` format
  (`name == folder`); `AGENTS.md` carries always-on context; built-in `plan` is the read-only
  analogue of Mirai's `plan`, and built-in `explore`/`scout` subagents cover recon/docs. Two
  **GAPS**: no harness memory tool, and no description-triggered per-file instructions.
- **OMO model-tiering** ([#6](https://github.com/zentetsukenz/agent/issues/6)): OMO's config is
  `omo.json`, with a `models` catalog + `categories` tiers + `agents` overlay, and OMO's
  "models are developers" framing is loom's three archetypes exactly (Sisyphus = Communicator,
  Hephaestus = Deep Specialist, Explore = Utility). Canonical field is `reasoning` (not the
  deprecated `variant`).

The problem: **how does loom set a project up for OpenCode** — rendering the generic contract
into `.opencode/`-native config — while (a) staying a thin reference-not-restate layer over
`contract/`, and (b) offering OMO's tiering without forcing a bare-OpenCode project into it?

## Decision

### An adapter that references the core and answers four ports

Mirror the Mirai adapter's shape — a thin `setup.md` orchestrator plus port-answer docs
(`MAPPING.md`, `STAGES.md`, `references/{capabilities,write-format,verify,interview,omo}.md`,
`assets/templates/*`) — and **reference** `contract/` for all generic content, restating none
of it ([ADR-013](adr-013-shared-adapter-contract-core.md)). The four
[port obligations](../../contract/PORTS.md) are answered for OpenCode as:

| Port | OpenCode answer |
|---|---|
| `capability→tool` | Generic capability → OpenCode **`permission:` key**; **withhold = `permission: { <key>: deny }`** (OpenCode grants by default and gates via permissions — the inverse of Mirai's omit-the-alias). `interview` resolves **natively** to the `question` tool; `persist` is a GAP (committed folder + scoped-edit glob). |
| `archetype→model` | **Two render targets:** inline `model: provider/model-id` per agent by default, **or** a central `omo.json` when the opt-in OMO layer is chosen. |
| `seam-obligation→wiring` | No `handoffs:` primitive and no memory tool → a **committed `.loom/handoffs/` folder** as the ledger, a `.loom/handoffs/protocol.md` pointed at from `opencode.json`'s `instructions:`, and a human `Tab`-selected primary-agent transition that DISCOVERs the ledger. |
| `primitive→file` manifest | skills → `.opencode/skills/<slug>/SKILL.md`; stage agents → `.opencode/agents/*.md` (`mode: primary`); utilities → `.opencode/agents/*.md` (`mode: subagent`); quick combos → `.opencode/commands/*.md`; base agents `plan`/`build`; format-checks in `references/verify.md`. |

### Withholding is `permission: deny`, not omission

OpenCode grants tools by default and gates them with `permission:` (the `tools:` field is
deprecated). So loom's load-bearing capability withholds render as explicit `deny` — a Shaping
agent gets `permission: { edit: deny }` — the inverse of Mirai's grant-only-what-you-list model,
but the same load-bearing invariant ([ADR-006](adr-006-capability-based-roles.md)).

### The two GAPs render around OpenCode's missing primitives

- **No memory tool** → `persist` is a **committed `.loom/handoffs/` folder**. PRODUCE/DISCOVER
  roles get a **glob-scoped `edit` permission** (`edit: { "*": deny, ".loom/handoffs/**": allow }`)
  so they can write the ledger without gaining general code-edit — preserving the no-code-edit
  withhold.
- **No `handoffs:` primitive and no description-triggered instructions** → the protocol lives as a
  committed `.loom/handoffs/protocol.md` wired into always-on context via `opencode.json`'s
  `instructions:` array, and the stage transition is the human `Tab`-selecting the next primary
  agent, which DISCOVERs the ledger at its entry gate.

### OMO is an opt-in layer, not the default

OMO tiering renders to a central `omo.json` (`models` + `categories` + `agents`) **only if the
interview opts in** — mapping loom's three archetypes onto OMO's tiers and **overlaying** OMO's
builtins rather than redefining loom's roster. A bare-OpenCode project keeps inline `model:`
fields and writes no OMO config. This mirrors how `docs-lookup` is an opt-in capability in Mirai
([ADR-007](adr-007-docs-lookup-capability.md)), honoring
[keyless-by-default](../principles/keyless-by-default.md)
([ADR-010](adr-010-keyless-by-default-recommendations.md)): the built-in `scout` subagent also
covers dependency-source research without any MCP/API-key setup.

### Everything else is inherited from the core, unchanged

Stage groupings (Shaping / Delivery / Closing), the two-tier quick-command + deep-agent model,
the Delivery dispatcher split ([ADR-008](adr-008-delivery-dispatchers.md)), the utility roster,
the invocation-surface facet ([ADR-012](adr-012-invocation-surface.md) → `mode`), the
interview questions, and the five-step contract all come from `contract/` — the OpenCode adapter
adds only the render bindings above.

## Alternatives considered

- **Copy the Mirai adapter and hand-edit it.** The pre-`contract/` failure mode: generic content
  drifts between adapters. Rejected — the whole point of ADR-013's core is that the second adapter
  references it. This adapter restates nothing generic.
- **Make OMO the default model layer.** OMO is powerful but is an extra dependency and an opinion;
  forcing it on a bare-OpenCode project violates keyless-by-default and the "fit the project"
  principle. Rejected — OMO is strictly opt-in.
- **Fabricate an automatic stage transition** (e.g. a hook that switches agents). OpenCode has no
  such primitive; simulating one would be brittle and surprising. Rejected — the ledger plus the
  incoming agent's DISCOVER instruction *are* the wiring; the human drives the `Tab` switch.
- **Render the protocol as a skill instead of a committed file.** A skill is on-demand but not
  guaranteed-loaded; the handoff protocol must be always-on context. Rejected in favor of the
  `instructions:` array pointer (OpenCode's always-on mechanism), which the committed file backs.
- **Use the deprecated `tools:` field for capability control.** Rejected — `permission:` is the
  supported, finer-grained mechanism and the only one that expresses the scoped-ledger-edit glob.

## Consequences

- loom gains its **second** concrete harness, proving the `contract/` seam is real (not
  hypothetical) and that a new adapter is a thin, port-only layer.
- The `permission: deny` withhold and the `mode`-based invocation surface give OpenCode a clean,
  native rendering of loom's capability + surface facets — arguably cleaner than Mirai's
  omit-the-alias + two-flag-pair model.
- The committed-folder ledger makes handoffs **repo-visible** (a reviewable diff) but means the
  ledger is versioned with the code — acceptable, and it sidesteps the missing memory tool.
- OMO support is available for teams that want central tiering, without imposing it — but the two
  render targets mean the `archetype→model` port has a branch the interview must resolve.
- The adapter must stay in sync with OpenCode's model as it evolves;
  [wiki/environments/opencode.md](../environments/opencode.md) is the single point of truth to
  update, not the adapter bodies.

## Related

- [ADR-005](adr-005-harness-agnostic-setup.md) — the harness-agnostic setup contract this adapter
  implements (its second implementation, after Mirai).
- [ADR-013](adr-013-shared-adapter-contract-core.md) — the shared `contract/` core this adapter
  references and answers the four ports of.
- [ADR-004](adr-004-loom-mirai-setup.md) — the first adapter (Mirai); this ADR is its OpenCode peer.
- [ADR-006](adr-006-capability-based-roles.md) — capability-based roles (the `permission:` withholds).
- [ADR-007](adr-007-docs-lookup-capability.md), [ADR-010](adr-010-keyless-by-default-recommendations.md)
  — the opt-in / keyless-by-default discipline OMO and docs-lookup follow.
- [ADR-008](adr-008-delivery-dispatchers.md) — the Delivery dispatcher split the stage bindings honor.
- [ADR-011](adr-011-seam-artifact-protocol.md) — the seam-artifact protocol the committed ledger wires.
- [ADR-012](adr-012-invocation-surface.md) — the invocation surface → `mode: primary|subagent`.
- [ADR-001](adr-001-adapter-pattern.md) — the adapter pattern this second adapter validates.
- [wiki/environments/opencode.md](../environments/opencode.md) — the OpenCode customization reference.
- [adapters/opencode/setup.md](../../adapters/opencode/setup.md) — the adapter setup instruction.
- [adapters/opencode/MAPPING.md](../../adapters/opencode/MAPPING.md),
  [adapters/opencode/STAGES.md](../../adapters/opencode/STAGES.md),
  [adapters/opencode/references/omo.md](../../adapters/opencode/references/omo.md) — the concrete port answers.
