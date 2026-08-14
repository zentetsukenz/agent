---
type: ADR
title: loom setup approach for the Hermes harness — the first resident-archetype adapter, compiling the reactive macro-PM lifecycle and dispatching SDLC runs into a per-invocation harness
status: Accepted
timestamp: 2026-08-14T00:00:00Z
tags: [hermes, resident, macro-pm, reactive-lifecycle, setup, adapter, altitude, dispatch, cron, gateway, memory, keyless, loom]
---

# ADR-019: loom Setup Approach for the Hermes Harness

## Context

loom installs into a project through a harness-agnostic entrypoint that runs a universal setup
contract via the target harness's **adapter** ([ADR-005](adr-005-harness-agnostic-setup.md),
[ADR-013](adr-013-shared-adapter-contract-core.md)). **Mirai** ([ADR-004](adr-004-loom-mirai-setup.md))
and **OpenCode** ([ADR-014](adr-014-loom-opencode-setup.md)) were the first two adapters. Both are
**per-invocation, human-driven** harnesses (see [harness-archetypes](../patterns/harness-archetypes.md)):
a human starts and steers each session, and the adapter renders the [SDLC](../../workflows/sdlc/index.md)
stage agents as `front-door` roles.

**Hermes** (hermes-agent.nousresearch.com, Nous Research, MIT) is a different archetype: a
**resident, agent-driven** harness. It runs unattended behind a gateway, is reached conversationally
from 20+ messaging platforms (Discord/Telegram/Slack/…), keeps state in a **profile home**
(`~/.hermes/`), and ships native **cron** scheduling, **`delegate_task`** subagents with restricted
toolsets, agentskills.io **skills**, **MCP** integration, and **persistent memory**
(`MEMORY.md`/`USER.md` + pluggable providers). Its verified primitives are catalogued in
[wiki/environments/hermes.md](../environments/hermes.md).

A first attempt built the Hermes adapter as a **self-contained SDLC** — rendering its own
`shaping`/`planner`/`orchestrator`/`closing`/`verifier` profiles and dispatching implementation
internally via `delegate_task`/kanban. That inverted the design: for a resident harness the SDLC is
not what it *is*, it is what it *delegates into*. The real question: **how does loom set a project up
for Hermes** as the harness that runs macro-scale project management above SDLC, per
[ADR-018](adr-018-macro-project-management.md)?

## Decision

### Hermes compiles the reactive macro-PM lifecycle, not the terminating SDLC lifecycle

loom has **two lifecycle-kind seeds** ([workflows](../../workflows/index.md)): the **terminating**
SDLC pipeline and the **reactive** [macro-PM](../../workflows/macro-pm/index.md) loop. A
per-invocation harness compiles SDLC; the **resident** Hermes harness compiles **macro-PM**. This is
why the self-contained attempt was wrong — it compiled the wrong seed. The Hermes adapter is the
**first resident-archetype adapter**, and its seed is `workflows/macro-pm/`.

### Thin-macro adapter: dispatch SDLC runs into a configured per-invocation harness

The Hermes adapter is **thin macro-only**. It renders only: (1) the **resident PM agent** (a Hermes
profile = `SOUL.md` persona + `cron`/`gateway` loop running [wayfinder macro mode](../../SKILLS/planning/wayfinder/SKILL.md#macro-mode-dispatching-into-sdlc-runs)),
(2) the **board wiring** (a networked tracker over MCP), (3) **label provisioning** (`wayfinder:*`
down, `sdlc:*` up), and (4) the **altitude-seam translator**. It does **not** render its own
Planner/Orchestrator/Verifier/quick/deep stage agents. When a buildable leaf is ready, the resident
agent **dispatches the SDLC run down into a separate, headless-dispatchable per-invocation harness**
(e.g. OpenCode).

Crucially, **loom holds only prose** for that dispatch — it does **not** hardcode a concrete command
(`opencode --agent=planner …`). The concrete micro harness and its headless CLI invocation are a
**per-project setup choice**; the seed and adapter express dispatch generically ("dispatch the
buildable leaf to the project's configured micro-dispatchable SDLC harness via its headless CLI").
This keeps loom content-only ([ADR-002](adr-002-workflow-as-adapter-seed.md)) and each adapter a deep
module — Hermes owns "resident + macro"; OpenCode owns "execute an SDLC run" — evolvable separately.

### Invocation inverts — a port answer, not an ADR-012 rewrite

For a resident harness the [invocation surface](../patterns/role-scoped-capabilities.md)
([ADR-012](adr-012-invocation-surface.md)) inverts: the **resident PM agent is the sole `front-door`**;
there are no local SDLC stage agents to be front-door. This inversion is recorded here as a **port
answer** for the resident archetype, **not** a change to ADR-012's derivation — per "one adapter is a
hypothetical seam, two make it real", the derivation is generalized into the core only if a *second*
resident harness needs the same shape.

### The four ports, answered for Hermes

| Port | Hermes answer |
|---|---|
| `capability→tool` | Generic capability → Hermes **toolset/tool**; **withhold = compose the profile's `toolsets:` and disable individual tools**. `interview` → native `clarify`; `delegate` → `delegation`/`delegate_task`; the board → an `mcp-<tracker>` toolset. `persist` (the resident agent's own continuity) → native `memory` — **relational continuity only, never project state**. |
| `archetype→model` | Inline `model: provider/model-id` per profile (fallback array), collected/confirmed at the interview. |
| `seam-obligation→wiring` | Macro source of truth = the networked tracker over MCP (**not** Hermes's single-host local kanban). The **micro** ledger is a **shared, on-disk, gitignored** substrate the dispatched harness also reads (see below). The resident profile is the altitude-seam translator; the loop is a `cron` job (fresh stateless tick) behind a `gateway`. |
| `primitive→file` manifest | The **one** resident profile (`config.yaml` + `SOUL.md` + macro-PM `skills/`) in a profile distribution installed to `~/.hermes/`; the two label vocabularies provisioned on the tracker. No SDLC stage-agent/utility profiles are rendered. |

### Cross-harness dispatch ⇒ shared on-disk, gitignored micro ledger (amends ADR-014)

Because Hermes dispatches the SDLC run into a *different* harness, the **micro ledger must be a
shared, on-disk substrate** both harnesses can read — Hermes's private `memory` cannot carry the
baton across a harness boundary. Per the ephemeral-coordination principle, that ledger is **always
gitignored** (durable knowledge goes to the wiki/ADRs; only project state goes to the board; the
handoff ledger is spontaneous coordination that fails the [deletion test](../patterns/deep-modules.md)
for the repo). This **amends [ADR-014](adr-014-loom-opencode-setup.md)**, whose default was a
*committed* `.loom/handoffs/` folder: the default becomes **gitignored**. See the
[seam-artifact protocol](../patterns/seam-artifact-protocol.md#substrate-is-also-altitude-scoped).

### Memory: keyless-first, bounded, discipline in the agent identity

The resident agent's memory holds **only** relational continuity (preferences, conversation history,
learned skills) — never project state (the [one-source-of-truth invariant](../patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant)).
Built-in `MEMORY.md`/`USER.md` is the default; an external **memory provider** is offered **opt-in and
keyless-first** ([keyless-by-default](../principles/keyless-by-default.md), [ADR-010](adr-010-keyless-by-default-recommendations.md)) —
recommend a **local, no-key** provider (e.g. Holographic) first, let the user name a paid one they
already own, and **degrade gracefully** to built-in memory. A **bounded memory budget is kept as a
forcing function** — it pushes project state back to the board rather than letting the agent hoard it.
The universal invariant lives in the protocol/glossary; the resident PM's *operating discipline*
(read board each tick, relational-only, evict by the write-test) lives in its agent identity, which
**references** the invariant rather than restating it.

### Amendment to ADR-018

[ADR-018](adr-018-macro-project-management.md) decision #1 said macro-PM is "**not** a peer workflow."
That was correct under the *old, narrow* definition of "workflow" (an ordered, terminating pipeline).
Now that `workflows/` holds **two lifecycle kinds**, macro-PM **is** a peer *workflow* — the
**reactive-lifecycle** member — but still **not** a peer *phase-pipeline*. The substance of ADR-018 is
unchanged (recursive wayfinding, dispatch into SDLC runs, resident agent, altitude-scoped substrate);
only the "where it is organized" framing evolves: it lands as `workflows/macro-pm/`.

## Considered options

| Option | Verdict |
|---|---|
| **Self-contained SDLC in Hermes** (first attempt; renders own stage roster, internal `delegate_task`) | Rejected — compiles the wrong seed; couples Hermes to the whole SDLC; two adapters re-implement SDLC. |
| **Hardcode the micro dispatch command** (`opencode --agent=…`) | Rejected — violates content-only ([ADR-002](adr-002-workflow-as-adapter-seed.md)); the micro harness is a setup choice. |
| **Micro ledger in Hermes memory** | Rejected — memory is private to one harness; cross-harness dispatch needs shared on-disk ground. |
| **Local kanban as the macro board** | Rejected as default — single-host, doesn't distribute across servers (the property macro mode requires); offered only if the user accepts the limitation. |
| **New top-level `planes/` for macro-PM** | Rejected — macro-PM is a lifecycle (a reactive one); it belongs beside SDLC under `workflows/`, keeping "seeds adapters compile" one deep module. |
| **Thin-macro adapter compiling `workflows/macro-pm/`, dispatching to a configured per-invocation harness via prose** | **Chosen.** |

## Consequences

- A **third adapter** (`adapters/hermes/`) ships, answering the four ports; the self-contained SDLC
  roster it first rendered is deleted.
- A new reactive-lifecycle seed `workflows/macro-pm/` is the thing Hermes compiles; `workflows/`
  now documents two lifecycle kinds; the [harness-archetypes](../patterns/harness-archetypes.md)
  pattern classifies the three harnesses.
- ADR-014's micro-ledger default flips **committed → gitignored**; the seam protocol's substrate
  guidance is updated to match.
- Hermes-as-configured **depends on** a per-project micro dispatch target (a headless-dispatchable
  harness such as OpenCode). This is an honest, recorded dependency, not a hidden one.
- SETUP.md registers Hermes; SPEC.md and `validate.sh` gain Hermes/macro-PM conformance checks.

## Related

- [ADR-018](adr-018-macro-project-management.md) — the macro-PM decision this adapter renders (amended here re: "peer workflow").
- [workflows/macro-pm](../../workflows/macro-pm/index.md) — the reactive-lifecycle seed Hermes compiles.
- [harness-archetypes](../patterns/harness-archetypes.md) — the resident vs per-invocation taxonomy behind the invocation inversion and cross-harness dispatch.
- [ADR-004](adr-004-loom-mirai-setup.md) / [ADR-014](adr-014-loom-opencode-setup.md) — the two per-invocation adapters this one contrasts with.
- [ADR-013](adr-013-shared-adapter-contract-core.md) — the shared core the adapter references; reference-not-restate.
- [wiki/environments/hermes.md](../environments/hermes.md) — the verified Hermes primitives the adapter renders from.
- [seam-artifact-protocol](../patterns/seam-artifact-protocol.md) — altitude-scoped substrate + the shared-on-disk/gitignored constraint.
