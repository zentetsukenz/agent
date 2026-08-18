---
type: ADR
title: loom setup approach for the OpenCode harness, with an opt-in OMO model-tiering layer
status: Accepted
timestamp: 2026-07-31T00:00:00Z
tags: [opencode, omo, setup, adapter, agent, skill, model-matching, permissions, loom]
---

# ADR-014: loom Setup Approach for the OpenCode Harness

> **Amendment (2026-08-18, issue [#11](https://github.com/zentetsukenz/agent/issues/11)): `.loom`
> is a local-only, blanket-gitignored seam.** The 2026-08-14 amendment (below) flipped the *ledger
> artifacts* to gitignored but kept the **protocol document** (`.loom/handoffs/protocol.md`) and
> **manifest** (`.loom/handoffs/index.md`) committed/tracked via a *selective* ignore
> (`.loom/handoffs/*/`). That selective rule is now **dropped**. `.loom` is a purely local
> context-passing substrate: setup seeds a **blanket `.loom/**` ignore** (protocol document,
> manifest, and per-milestone artifacts all included), **no `.loom` path is ever required to be
> tracked or committed**, and `update` mode **preserves** an existing blanket `.loom` ignore rather
> than proposing selective rules. The protocol document is still generated locally and pointed at
> from `opencode.json`'s `instructions:`; it simply is not committed. The **opt-in to commit the
> ledger for reviewable diffs is removed** — durable/reviewable Macro-PM artifacts use the
> reachable orphan-ref substrate ([ADR-022](adr-022-reachable-artifact-substrate.md)) instead of
> making `.loom` Git-visible. This supersedes the "committed `.loom/handoffs/` folder" /
> "committed `protocol.md`" wording throughout the Decision below.

> **Amendment (2026-08-17, via [ADR-021](adr-021-shaping-research-orchestrator.md)): OMO layer
> dropped.** This ADR originally offered an **opt-in OMO (oh-my-openagent) model-tiering layer** as
> a second `archetype→model` render target (a central `omo.json`). That layer is **removed**: loom
> already expresses per-role model tiering directly via the inline `model:` field on each generated
> agent/command, so OMO added a second way to do the same thing (an extra dependency, a divergent
> config file, and a `docs-lookup`-style opt-in branch) with no capability the inline fields lack.
> The `archetype→model` port answer is now **inline `model:` only**. `adapters/opencode/references/omo.md`
> is deleted; the OMO opt-in interview question, the write-format OMO section, and the verify OMO
> branch are removed. The title's "with an opt-in OMO model-tiering layer" is superseded.

> **Amendment (2026-08-14, via [ADR-019](adr-019-loom-hermes-setup.md), "Option A").** This ADR
> originally made the OpenCode micro ledger a **committed** `.loom/handoffs/` folder ("repo-visible,
> versioned with the code"). ADR-019 revises that **default to gitignored**: the micro ledger is
> **ephemeral coordination**, which is never version-controlled — durable knowledge belongs in the
> wiki/ADRs instead. This is load-bearing when OpenCode is the **dispatch target** of a resident
> Hermes macro agent (the ledger is then a *shared, on-disk, gitignored* substrate both harnesses
> read), and it is the better default even for standalone OpenCode. The folder *location* and the
> glob-scoped-edit wiring below are unchanged; only the commit-vs-gitignore default flips. ~~A project
> that explicitly wants reviewable handoff diffs may still opt to commit it.~~ **(The commit opt-in
> and the selective-ignore that kept `protocol.md`/`index.md` tracked are removed by the 2026-08-18
> amendment above — `.loom` is now blanket-gitignored with no opt-in.)** See the
> [seam-artifact protocol substrate section](../patterns/seam-artifact-protocol.md#substrate-is-also-altitude-scoped).

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
| `capability→tool` | Generic capability → OpenCode **`permission:` key**; **withhold = `permission: { <key>: deny }`** (OpenCode grants by default and gates via permissions — the inverse of Mirai's omit-the-alias). `interview` resolves **natively** to the `question` tool; `persist` is a GAP (local-only, blanket-gitignored folder + scoped-edit glob). |
| `archetype→model` | Inline `model: provider/model-id` per agent/command — per-role tiering expressed directly (the OMO alternative was dropped, see the 2026-08-17 amendment). |
| `seam-obligation→wiring` | No `handoffs:` primitive and no memory tool → a **local-only, blanket-gitignored `.loom/handoffs/` folder** as the ledger, a `.loom/handoffs/protocol.md` pointed at from `opencode.json`'s `instructions:` (generated locally, not committed), and a human `Tab`-selected primary-agent transition that DISCOVERs the ledger. See the 2026-08-18 amendment. |
| `primitive→file` manifest | skills → `.opencode/skills/<slug>/SKILL.md`; stage agents → `.opencode/agents/*.md` (`mode: primary`); utilities → `.opencode/agents/*.md` (`mode: subagent`); quick combos → `.opencode/commands/*.md`; base agents `plan`/`build`; format-checks in `references/verify.md`. |

### Withholding is `permission: deny`, not omission

OpenCode grants tools by default and gates them with `permission:` (the `tools:` field is
deprecated). So loom's load-bearing capability withholds render as explicit `deny` — a Shaping
agent gets `permission: { edit: deny }` — the inverse of Mirai's grant-only-what-you-list model,
but the same load-bearing invariant ([ADR-006](adr-006-capability-based-roles.md)).

### The two GAPs render around OpenCode's missing primitives

- **No memory tool** → `persist` is a **local-only, blanket-gitignored `.loom/handoffs/` folder**
  (see the 2026-08-18 amendment). PRODUCE/DISCOVER roles get a **glob-scoped `edit` permission**
  (`edit: { "*": deny, ".loom/handoffs/**": allow }`) so they can write the ledger without gaining
  general code-edit — preserving the no-code-edit withhold.
- **No `handoffs:` primitive and no description-triggered instructions** → the protocol lives as a
  local `.loom/handoffs/protocol.md` (generated, not committed) wired into always-on context via
  `opencode.json`'s `instructions:` array, and the stage transition is the human `Tab`-selecting
  the next primary agent, which DISCOVERs the ledger at its entry gate.

### Model tiering is inline, per agent

> **Superseded (2026-08-17, [ADR-021](adr-021-shaping-research-orchestrator.md)).** This section
> originally offered OMO as an opt-in second render target. It is removed — see the amendment
> banner at the top. The record below is retained for history.

loom renders the `archetype→model` port as an **inline `model: provider/model-id` field on each
generated agent/command**. Because every role carries its own archetype-matched model, per-role
tiering is already expressed directly — loom needs no external model-tiering overlay, and there is
one way to set a model, not two. (The dropped OMO alternative rendered a central `omo.json`
mapping loom's archetypes onto OMO's tiers; it added a dependency and a divergent config for no
capability the inline field lacks.)

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
- **Render the protocol as a skill instead of an `instructions:` file.** A skill is on-demand but
  not guaranteed-loaded; the handoff protocol must be always-on context. Rejected in favor of the
  `instructions:` array pointer (OpenCode's always-on mechanism), which the local protocol file backs.
- **Use the deprecated `tools:` field for capability control.** Rejected — `permission:` is the
  supported, finer-grained mechanism and the only one that expresses the scoped-ledger-edit glob.

## Consequences

- loom gains its **second** concrete harness, proving the `contract/` seam is real (not
  hypothetical) and that a new adapter is a thin, port-only layer.
- The `permission: deny` withhold and the `mode`-based invocation surface give OpenCode a clean,
  native rendering of loom's capability + surface facets — arguably cleaner than Mirai's
  omit-the-alias + two-flag-pair model.
- The on-disk-folder ledger sidesteps the missing memory tool. Per the 2026-08-18 amendment above,
  `.loom` is **local-only and blanket-gitignored** (`.loom/**` — protocol document, manifest, and
  artifacts all included); no `.loom` path is committed, and there is no opt-in to commit it.
  Reviewable handoff/Macro-PM artifacts use the reachable orphan-ref substrate
  ([ADR-022](adr-022-reachable-artifact-substrate.md)).
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
- [ADR-011](adr-011-seam-artifact-protocol.md) — the seam-artifact protocol the local-only ledger wires.
- [ADR-022](adr-022-reachable-artifact-substrate.md) — the reachable orphan-ref substrate for durable/reviewable artifacts (why `.loom` need not be Git-visible).
- [ADR-012](adr-012-invocation-surface.md) — the invocation surface → `mode: primary|subagent`.
- [ADR-001](adr-001-adapter-pattern.md) — the adapter pattern this second adapter validates.
- [wiki/environments/opencode.md](../environments/opencode.md) — the OpenCode customization reference.
- [adapters/opencode/setup.md](../../adapters/opencode/setup.md) — the adapter setup instruction.
- [adapters/opencode/MAPPING.md](../../adapters/opencode/MAPPING.md),
  [adapters/opencode/STAGES.md](../../adapters/opencode/STAGES.md) — the concrete port answers.
- [ADR-021](adr-021-shaping-research-orchestrator.md) — drops the opt-in OMO layer (amends this ADR); Shaping becomes a read-only research orchestrator.
