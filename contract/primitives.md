# The six loom primitives + their generic content

> Part of the shared adapter-contract core — see [index.md](index.md). This doc holds the
> **generic** content every adapter renders: the six primitives, the stage groupings, the
> per-stage skill rosters, each role's **capability set**, and the model archetypes. An
> adapter **references** this (never restates it) and supplies the per-harness render
> bindings via [PORTS.md](PORTS.md). Classification authority: seam ticket
> [#4](https://github.com/zentetsukenz/agent/issues/4); interface: ADR-013.

## The six primitives the core renders

An adapter renders exactly six loom primitives into harness-native files. Three of them
have a **render-binding port** attached (see [PORTS.md](PORTS.md)):

1. **skill** — a loom `SKILLS/<bucket>/<slug>/SKILL.md` copied/tailored into the harness.
2. **stage-agent** — a stage's deep-workflow agent (phase prose + capability set).
   **Utility agents fold under this** — a utility is a stage-agent minus the stage binding
   (kept at six, not seven).
3. **stage-prompt** — a stage's quick-combo bundle (references skills to invoke; does not
   re-embed the deep workflow prose).
4. **capability** — a generic grant, resolved via the **`capability→tool`** port.
5. **instruction** — the communication-protocol document (the [ADR-011](../wiki/adr/adr-011-seam-artifact-protocol.md)
   seam-artifact obligation), resolved via the **`seam-obligation→wiring`** port.
6. **model-archetype** — a working-style tier, resolved via the **`archetype→model`** port.

The three render-binding ports attach to primitives **4, 5, 6** respectively; the
**`primitive→file` manifest** port (PORTS.md) covers rendering primitives **1–3** to disk.

## Stage groupings (six phases → three stages)

Pure overlay of [workflows/sdlc/index.md](../workflows/sdlc/index.md) — harness-agnostic:

| Stage | Phases | Seam artifact |
|---|---|---|
| **Shaping** | Discovery, Design | A milestone with design docs (domain model, interfaces, ADRs) |
| **Delivery** | Planning, Implementation, Verification | A shipped, verified change proven against the success criteria |
| **Closing** | Preservation | Durable, curated knowledge fed back into the framework |

Each stage gets **two tiers** — a **quick prompt** (stage-prompt primitive) and a **deep
agent** (stage-agent primitive); the user picks per invocation. Delivery's deep tier is a
**split** into two dispatcher agents (see below).

## Per-stage skill rosters + capability sets + workflow-prose sourcing

Which loom skills belong to each stage, each role's **role-scoped capability set**
([ADR-006](../wiki/adr/adr-006-capability-based-roles.md)), and where each agent's workflow
prose comes from. **The withheld capabilities are load-bearing** — a role with no `edit`
cannot write code, and that is the point. Capabilities are named generically here; the
adapter resolves them to harness tool names / withhold mechanisms via the
[`capability→tool` port](PORTS.md).

### Shaping (Discovery + Design)

| | |
|---|---|
| Workflow prose source | `workflows/sdlc/discovery.md` + `workflows/sdlc/design.md`, concatenated |
| Model archetype | Communicator |
| Capabilities | `read`, `search`, `shell`, `persist`, `interview`, `tasks` (+ `docs-lookup` if opted). **No `edit`** — Shaping produces understanding and design, not code. |
| Quick stance | "You are shaping, not building — produce understanding and design artifacts. Do NOT edit application code." |

Skill roster (full default; pruned per the Scope interview table in [interview.md](interview.md)):

- `discovery/session-bootstrap`, `discovery/zoom-out`,
  `discovery/grill-with-docs`, `discovery/research`, `discovery/research-recommend`
- `design/domain-model`, `design/design-an-interface`, `design/codebase-design`,
  `design/improve-codebase-architecture`

**Spike escape hatch:** a Discovery throwaway spike that needs to write code is dispatched
to an executor utility (`quick`/`deep`) — Shaping itself stays edit-free.

**Seam — PRODUCE (Shaping → Delivery):** the Shaping agent's exit gate writes the seam
artifact (`findings`, `domain-model` or link, `design-decisions`) to the ledger and
registers it in the manifest, per the [communication protocol document](#the-communication-protocol-document-cross-stage).
Its `persist` capability is what lets it write the ledger.

### Delivery (Planning + Implementation + Verification)

Delivery is **not** one agent. Per [ADR-008](../wiki/adr/adr-008-delivery-dispatchers.md)
it splits into **two dispatcher agents** — a Planner and an Orchestrator — that *delegate*
execution and verification to the [utility roster](#utility-agents-cross-stage)
(`quick`/`deep` execute; the Verifier verifies). Neither dispatcher holds `edit`; that
withholding is what forces them to plan and dispatch rather than write code. The single
quick prompt still serves the low-ceremony path for small work.

**Planner**

| | |
|---|---|
| Phase | Planning |
| Workflow prose source | `workflows/sdlc/planning.md` |
| Model archetype | Communicator |
| Capabilities | `read`, `search`, `shell` (read-only investigation), `persist`, `interview`, `tasks` (+ `docs-lookup` if opted). **No `edit`, no `delegate`.** |
| Role | Pure plan-author: reads Design + findings, decomposes into a risk-ordered, right-sized execution plan. A research need is a loop back to Shaping, not a dispatch. |

Skill roster: `planning/task-sizing`, `planning/dispatch-context`, `planning/plan-review`,
`planning/to-spec`, `planning/to-tickets`, `planning/triage`, `planning/wayfinder`.

**Seam — DISCOVER (Shaping → Delivery):** the Planner's entry gate discovers the Shaping
seam artifact rather than assuming it's in the conversation — reads the ledger manifest,
loads the latest `ready-for-delivery` shaping set, and plans from it.

**Orchestrator**

| | |
|---|---|
| Phase | Implementation (+ dispatches Verification) |
| Workflow prose source | `workflows/sdlc/implementation.md` + `workflows/sdlc/verification.md`, concatenated |
| Model archetype | Deep Specialist |
| Capabilities | `read`, `search`, `delegate`, `persist`, `tasks`. **No `edit`** — the forcing function that makes it dispatch. |
| Role | Reads the plan; dispatches tasks (parallel/sequential) to `quick`/`deep` executors and verification to the Verifier; gauges size; enforces the architecture-prerequisite gate; re-routes on mis-size. |

Skill roster:

- `implementation/tdd`, `implementation/prototype`, `implementation/diagnose`,
  `implementation/systematic-debugging`, `implementation/frontend-runtime-debugging`,
  `implementation/architect-review`, `implementation/server-operations`
- `verification/verification-before-completion`, `verification/visual-verification`,
  `verification/qa-witness-protocol`

**Seam — PRODUCE (Delivery → Closing):** at the Verification exit gate the Orchestrator
writes the Delivery seam artifact (`verified-change` — what shipped + the Verifier's
acceptance evidence, links to PRs/commits by path) to the ledger and registers a `shipped`
manifest row.

Quick prompt stance: "Size and plan before you implement, and verify before you call it
done — don't skip a gate to save time."

### Closing (Preservation)

| | |
|---|---|
| Workflow prose source | `workflows/sdlc/preservation.md` |
| Model archetype | Utility |
| Capabilities | `read`, `edit` (documentation/wiki only), `search`, `persist`, `tasks`. |
| Quick stance | "Curate durable knowledge; don't change application code." |

Skill roster: `preservation/stage-handoff`, `preservation/wiki-init`, `preservation/wiki-curator`,
`preservation/wiki-query`, `preservation/wiki-audit`, `preservation/wiki-crosslink`,
`preservation/checkpoint`.

**Seam — DISCOVER (Delivery → Closing):** the Closing agent's entry gate discovers the
Delivery seam artifact (reads the manifest, loads the latest `shipped`
`verified-change`) to know exactly what to curate, then may register a final `preserved`
row pointing at the curated wiki entries. It also **produces** within Closing via
`preservation/stage-handoff`.

## Utility agents (cross-stage)

Utility agents are the **dispatched** roster ([role-scoped-capabilities](../wiki/patterns/role-scoped-capabilities.md)):
a [Dispatcher](../wiki/glossary/index.md#dispatcher) (the Orchestrator, or a future
plan-reviewer) hands them scoped tasks. They are independent of the three stages and
generated per the Utility Agents interview table ([interview.md](interview.md)).

| Utility | Purpose | Archetype | Capabilities |
|---|---|---|---|
| `explore` | Read-only recon and Q&A | Utility | `read`, `search` |
| `quick` | Fast mechanical edits (executor) | Utility | `read`, `edit`, `search`, `shell`, `tasks` |
| `deep` | Hard problems (executor) | Deep Specialist | `read`, `edit`, `search`, `shell`, `delegate`, `persist`, `tasks` (+ `docs-lookup` if opted) |
| `verifier` | Verify an artifact against its acceptance criteria; return evidence | Deep Specialist (extended-thinking) | `read`, `search`, `shell`, `persist` — **no `edit`** (verifies, doesn't fix) |
| `writing` | Prose (commit messages, PRs, docs) | Communicator | `read`, `edit` (docs), `search` — **DEFERRED for now** |

The **Verifier** ([ADR-008](../wiki/adr/adr-008-delivery-dispatchers.md)) is a utility, not
a Delivery stage agent, so multiple dispatchers can reuse it (Orchestrator → verify a
change; future plan-reviewer → verify a plan).

### Domain-specialized utilities

A [domain-specialized utility](../wiki/glossary/index.md#domain-specialized-utility)
([ADR-009](../wiki/adr/adr-009-frontend-domain-utility.md)) is scoped to a **problem
domain** rather than an intelligence tier, and wires that domain's skill cluster. Offered
only when the project has that domain (the interview gates them — skip both for a
backend-only repo):

| Utility | Purpose | Archetype | Capabilities |
|---|---|---|---|
| `frontend` | Frontend development + runtime debugging; delegates pixel-looking to `visual-qa` | Deep Specialist | `read`, `edit`, `search`, `shell`, `delegate`, `persist`, `tasks` (+ `docs-lookup` if opted) |
| `visual-qa` | Isolated, vision-capable visual verification — screenshots → text-only findings | Deep Specialist (vision) | `read`, `search`, `shell` — **no `edit`** (verifies, doesn't fix) |

The two form the frontend isolation seam
([ADR-009](../wiki/adr/adr-009-frontend-domain-utility.md)): `frontend` (`edit`-capable)
*delegates* pixel-looking to `visual-qa` (`edit`-free, vision-capable) so screenshot bytes
never enter the edit-capable context. Source agents: [agents/frontend.md](../agents/frontend.md),
[agents/visual-qa.md](../agents/visual-qa.md). Shared browser-drive knowledge:
[wiki/patterns/browser-capture.md](../wiki/patterns/browser-capture.md).

### Invocation surface — derived, not asked

Every stage agent is **`front-door`** (a human enters the stage from the picker, or a
handoff crosses into it — never a silent subagent pull); every utility is **`dispatched`**
(picker-hidden, dispatcher-only). This is the second role facet alongside capabilities
([ADR-012](../wiki/adr/adr-012-invocation-surface.md)) and is **derived from the role kind,
not a setup question.** The adapter maps each surface to the harness's invocation flags via
the [`primitive→file` manifest port](PORTS.md).

## The model archetypes

Borrowed from OMO's "models are developers" framing (assign a model matching an agent's
*working style*). Three archetypes, identical across every harness — only the **render
target** differs (see the [`archetype→model` port](PORTS.md)):

| Archetype | Working style | Assigned to |
|---|---|---|
| **Communicator** | Interviews, planning, writing, sociable lead/orchestrate | Shaping stage (both tiers), `planner`, `writing` utility, the setup instruction itself |
| **Deep Specialist** | Architecture, hard debugging, high-stakes correctness/routing | Orchestrator, `deep` utility, `verifier` (extended-thinking variant), `frontend`/`visual-qa` |
| **Utility** | Cheap/fast, mechanical, high-volume, low-risk | `explore`/`quick` utilities, Closing stage prompt tier, exploratory subagent dispatch |

The interview collects the user's **actual available model list** and maps it onto these
three archetypes (plus the Verifier's extended-thinking variant). Exact model-name strings
are project/subscription-specific — always ask, never guess; write the result as a
**fallback array** so a future deprecation doesn't silently break the config. *Where* the
archetype resolves to a concrete model is harness-specific (the `archetype→model` port).

## The communication-protocol document (cross-stage)

Every stage handoff routes through one shared artifact: the project's **communication
protocol document** (the `instruction` primitive). It states, for this project, where the
[ledger](../wiki/patterns/seam-artifact-protocol.md) lives, the namespace, and each stage's
expected seam artifacts — the choices collected in [interview.md](interview.md).

- **PRODUCE roles** (Shaping, Orchestrator, and Closing at its own exit) carry `persist` and
  reference this document to write + register a seam artifact at their exit gate.
- **DISCOVER roles** (Planner, Closing at entry) carry `persist` and reference this document
  to read the manifest and load the latest seam artifact at their entry gate.
- The skills `preservation/stage-handoff` (PRODUCE) and `discovery/session-bootstrap` (DISCOVER)
  are the thin adapters that implement the read/write; agents invoke them rather than
  re-deriving the convention.

The document itself is **always generated** (handoff is part of the SDLC process); only its
substrate/namespace are user choices. **How** the PRODUCE/DISCOVER obligation wires between
stage agents is harness-specific (the [`seam-obligation→wiring` port](PORTS.md)). Mandatory
at the **two stage seams** only (Shaping → Delivery, Delivery → Closing); within-stage
dispatch stays ephemeral via `planning/dispatch-context`. See
[ADR-011](../wiki/adr/adr-011-seam-artifact-protocol.md).

## Meta bucket — not a stage

`SKILLS/meta/*` (`skill-creator`, `caveman`, `context-compression`, `edit-article`) is an
always-available toolbox, not tied to a stage. An adapter copies any meta skill a stage's
skills reference (e.g. `context-compression`, referenced by `planning/dispatch-context`)
alongside the referencing skill so relative links resolve.

## Related

- [index.md](index.md) — the setup contract, `init`/`update`, safety rules.
- [interview.md](interview.md) — the generic interview questions that prune/tailor these rosters.
- [discipline.md](discipline.md) — provenance/idempotency + generic invariant-checks.
- [PORTS.md](PORTS.md) — the four render bindings an adapter supplies for the primitives above.
- [workflows/sdlc/index.md](../workflows/sdlc/index.md) — the six phases and three stages this doc overlays.
- [ADR-006](../wiki/adr/adr-006-capability-based-roles.md), [ADR-008](../wiki/adr/adr-008-delivery-dispatchers.md), [ADR-009](../wiki/adr/adr-009-frontend-domain-utility.md), [ADR-011](../wiki/adr/adr-011-seam-artifact-protocol.md), [ADR-012](../wiki/adr/adr-012-invocation-surface.md) — the disciplines encoded above.
