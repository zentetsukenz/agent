# loom Stages in Mirai

> Concrete Shaping/Delivery/Closing groupings for the Mirai adapter's [setup.md](setup.md).
> Each stage gets **two** delivery tiers (prompt = quick combo, agent(s) = deep workflow)
> per [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) and
> [MAPPING.md](MAPPING.md#2-stages--prompts-combo--agents-deep). This file supplies the
> exact skill roster per stage, each agent's **role-scoped capabilities**
> ([ADR-006](../../wiki/adr/adr-006-capability-based-roles.md)), and where each agent's
> workflow prose comes from.
>
> **Capabilities are generic; the adapter maps them.** Each `Capabilities` row below names
> generic capabilities (`read` `edit` `shell` `delegate` `persist` `interview` `web`
> `docs-lookup` `tasks`); the setup step resolves them to Mirai tool names via
> [references/capabilities.md](references/capabilities.md) and tolerates deviation. The
> **withheld** capabilities are load-bearing — a role with no `edit` cannot write code, and
> that is the point.
>
> **`docs-lookup`** rows are shown *if the project opted into it* (interview table 7); omit
> otherwise. **`persist`/`interview`** resolve to specific harness tool names discovered at
> setup, not aliases.

## Shaping (Discovery + Design)

**Owner (illustrative)**: product owner / designer / lead. **Seam artifact**: a milestone
with design docs (domain model, interfaces, ADRs). See
[workflows/sdlc/index.md](../../workflows/sdlc/index.md).

| | |
|---|---|
| Workflow prose source | `workflows/sdlc/discovery.md` + `workflows/sdlc/design.md`, concatenated |
| Model archetype | Communicator |
| Prompt file | `.mirai/prompts/shape.prompt.md` |
| Agent file | `.mirai/agents/shaping.agent.md` |
| Capabilities | `read`, `search`, `shell`, `persist`, `interview`, `tasks` (+ `docs-lookup` if opted). **No `edit`** — Shaping produces understanding and design, not code. |
| Quick base agent | `Plan` — Mirai's built-in read-only mode, so the quick path inherits the no-edit guarantee. |
| Quick stance | "You are shaping, not building — produce understanding and design artifacts. Do NOT edit application code." |

Skill roster (full default; pruned per the Scope interview table in
[references/interview.md](references/interview.md)):

- `discovery/session-bootstrap`, `discovery/zoom-out`, `discovery/grill-me`,
  `discovery/grill-with-docs`, `discovery/research`, `discovery/research-recommend`
- `design/domain-model`, `design/design-an-interface`, `design/codebase-design`,
  `design/improve-codebase-architecture`

**Spike escape hatch:** a Discovery throwaway spike that needs to write code is dispatched
to an executor utility (`quick`/`deep`) — Shaping itself stays edit-free.

**Seam artifact — PRODUCE (Shaping → Delivery).** Per
[ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md), the Shaping agent's exit gate writes
the seam artifact (`findings`, `domain-model` or link, `design-decisions`) to the ledger and
registers it in the manifest, following the project's
[communication protocol document](#the-communication-protocol-document-cross-stage). Its `persist`
capability is what lets it write the ledger; its body references the protocol document (not a
restated convention). Set `handoffs:` to `planner` so Mirai offers the transition to Delivery.

## Delivery (Planning + Implementation + Verification)

**Owner (illustrative)**: delivery team. **Seam artifact**: a shipped, verified change
proven against the success criteria.

Delivery is **not** one agent. Per
[ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md) it is split into **two dispatcher
agents** — a Planner and an Orchestrator — that *delegate* execution and verification to the
[utility roster](#utility-agents-cross-stage) (`quick`/`deep` execute; the Verifier
verifies). Neither dispatcher holds `edit`; that withholding is what forces them to plan and
dispatch rather than write code themselves. The single quick prompt
(`.mirai/prompts/deliver.prompt.md`) still serves the low-ceremony path for small work.

| | |
|---|---|
| Quick prompt file | `.mirai/prompts/deliver.prompt.md` |
| Quick base agent | `agent` |
| Quick stance | "Size and plan before you implement, and verify before you call it done — don't skip a gate to save time." |
| Deep agent files | `.mirai/agents/planner.agent.md`, `.mirai/agents/orchestrator.agent.md` |

### Planner — `.mirai/agents/planner.agent.md`

| | |
|---|---|
| Phase | Planning |
| Workflow prose source | `workflows/sdlc/planning.md` |
| Model archetype | Communicator |
| Capabilities | `read`, `search`, `shell` (read-only investigation), `persist`, `interview`, `tasks` (+ `docs-lookup` if opted). **No `edit`, no `delegate`.** |
| Role | Pure plan-author: reads Design + findings, decomposes into a risk-ordered, right-sized execution plan. A research need is a loop back to Shaping, not a dispatch. |

**Seam artifact — DISCOVER (Shaping → Delivery).** The Planner's entry gate **discovers** the
Shaping seam artifact rather than assuming it's in the conversation: it reads the ledger manifest,
loads the latest `ready-for-delivery` `shaping/<milestone>/` set, and plans from it — this is what
makes "start planning the `<milestone>` findings" a one-liner. Its `persist` capability + the
[communication protocol document](#the-communication-protocol-document-cross-stage) drive this.

Skill roster:

- `planning/task-sizing`, `planning/dispatch-context`, `planning/plan-review`,
  `planning/to-prd`, `planning/to-issues`, `planning/triage`, `planning/wayfinder`

### Orchestrator — `.mirai/agents/orchestrator.agent.md`

| | |
|---|---|
| Phase | Implementation (+ dispatches Verification) |
| Workflow prose source | `workflows/sdlc/implementation.md` + `workflows/sdlc/verification.md`, concatenated |
| Model archetype | Deep Specialist |
| Capabilities | `read`, `search`, `delegate`, `persist`, `tasks`. **No `edit`** — the forcing function that makes it dispatch. |
| Role | Reads the plan; dispatches tasks (parallel/sequential) to `quick`/`deep` executors and verification to the Verifier; gauges size; enforces the architecture-prerequisite gate; re-routes on mis-size. |

**Seam artifact — PRODUCE (Delivery → Closing).** At the Verification exit gate the Orchestrator
writes the Delivery seam artifact (`verified-change.md` — what shipped + the Verifier's acceptance
evidence, links to PRs/commits by path) to the ledger and registers a `shipped` manifest row. Set
`handoffs:` to `closing`. Its `persist` capability + the
[communication protocol document](#the-communication-protocol-document-cross-stage) drive this.

Skill roster:

- `implementation/tdd`, `implementation/prototype`, `implementation/diagnose`,
  `implementation/systematic-debugging`, `implementation/frontend-runtime-debugging`,
  `implementation/architect-review`, `implementation/server-operations`
- `verification/verification-before-completion`, `verification/visual-verification`,
  `verification/qa-witness-protocol`

**Note on model archetypes**: the Planner is Communicator-shaped (decomposition, plan
authoring); the Orchestrator is Deep Specialist-shaped (high-stakes routing/gating). The
quick **prompt** tier gets the Communicator fallback array (quick planning/dispatch
dominates the quick path). The interview may ask the user to confirm.

## Closing (Preservation)

**Owner (illustrative)**: the organisation. **Seam artifact**: durable, curated knowledge
fed back into the framework.

| | |
|---|---|
| Workflow prose source | `workflows/sdlc/preservation.md` |
| Model archetype | Utility |
| Prompt file | `.mirai/prompts/close.prompt.md` |
| Agent file | `.mirai/agents/closing.agent.md` |
| Capabilities | `read`, `edit` (documentation/wiki only), `search`, `persist`, `tasks`. |
| Quick base agent | `agent` |
| Quick stance | "Curate durable knowledge; don't change application code." |

**Seam artifact — DISCOVER (Delivery → Closing).** The Closing agent's entry gate **discovers**
the Delivery seam artifact (reads the manifest, loads the latest `shipped`
`delivery/<milestone>/verified-change.md`) to know exactly what to curate, then may register a
final `preserved` row pointing at the curated wiki entries. It also **produces** within Closing via
`preservation/handoff`. Its `persist` capability + the
[communication protocol document](#the-communication-protocol-document-cross-stage) drive this.

Skill roster:

- `preservation/handoff`, `preservation/wiki-init`, `preservation/wiki-curator`,
  `preservation/wiki-query`, `preservation/wiki-audit`, `preservation/wiki-crosslink`,
  `preservation/checkpoint`

## The communication protocol document (cross-stage)

Every stage handoff above routes through one shared artifact: the project's **communication
protocol document**, generated at `.mirai/instructions/handoff.instructions.md` (a
description-triggered file instruction — see
[references/write-format.md](references/write-format.md#communication-protocol-document)). It
states, for this project, where the [ledger](../../wiki/patterns/seam-artifact-protocol.md#1-the-ledger-and-its-namespace)
lives, the namespace, and each stage's expected seam artifacts — the choices collected in
[references/interview.md](references/interview.md) table 4d and revisable via `update`.

- **PRODUCE roles** (`shaping`, `orchestrator`, and `closing` at its own exit) carry `persist` and
  reference this document to write + register a seam artifact at their exit gate.
- **DISCOVER roles** (`planner`, `closing` at entry) carry `persist` and reference this document to
  read the manifest and load the latest seam artifact at their entry gate.
- Each stage agent's `handoffs:` frontmatter points at the next stage's agent (`shaping → planner`,
  `orchestrator → closing`) so Mirai can offer the transition.
- The skills `preservation/handoff` (PRODUCE) and `discovery/session-bootstrap` (DISCOVER) are the
  thin adapters that implement the read/write; agents invoke them rather than re-deriving the
  convention.

This is mandatory at the **two stage seams** only (Shaping → Delivery, Delivery → Closing);
within-stage dispatch stays ephemeral via `planning/dispatch-context`. See
[ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md).

## Meta bucket — not a stage

`SKILLS/meta/*` (`skill-creator`, `caveman`, `context-compression`, `edit-article`) is an
always-available toolbox, not tied to a stage. The Mirai adapter's [setup.md](setup.md)
copies any meta skill a stage's skills reference (e.g. `context-compression` referenced
by `planning/dispatch-context`) into `.mirai/skills/` alongside the referencing skill, so
relative links resolve — see
[MAPPING.md](MAPPING.md#1-skills--miraiskills).

## Utility agents (cross-stage)

Utility agents are the **dispatched** roster ([role-scoped-capabilities](../../wiki/patterns/role-scoped-capabilities.md)):
a [Dispatcher](../../wiki/glossary/index.md#dispatcher) (the Orchestrator, or a future
plan-reviewer) hands them scoped tasks. They are independent of the three stages and
generated per the Utility Agents interview table. See
[MAPPING.md](MAPPING.md#3-utility-agents-à-la-omo) for the roster overview.

| Utility | Purpose | Capabilities |
|---|---|---|
| `explore` | Read-only recon and Q&A | `read`, `search` |
| `quick` | Fast mechanical edits (executor) | `read`, `edit`, `search`, `shell`, `tasks` |
| `deep` | Hard problems (executor) | `read`, `edit`, `search`, `shell`, `delegate`, `persist`, `tasks` (+ `docs-lookup` if opted) |
| `verifier` | Verify an artifact against its acceptance criteria; return evidence | `read`, `search`, `shell` (run tests), `persist`. **No `edit`** — verifies, doesn't fix. |
| `writing` | Prose (commit messages, PRs, docs) | `read`, `edit` (docs), `search` — **DEFERRED for now** |

**Domain-specialized utilities** ([ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md)):
scoped by problem *domain* rather than intelligence tier, offered only when the project has
that domain (interview-gated — skip for a backend-only repo):

| Utility | Purpose | Capabilities |
|---|---|---|
| `frontend` | Frontend development + runtime debugging; delegates pixel-looking to `visual-qa` | `read`, `edit`, `search`, `shell`, `delegate`, `persist`, `tasks` (+ `docs-lookup` if opted) |
| `visual-qa` | Isolated, vision-capable visual verification — screenshots → text-only findings | `read`, `search`, `shell`. **No `edit`** — verifies, doesn't fix. |

### Verifier — `.mirai/agents/verifier.agent.md`

A dispatched utility running an **extended-thinking / long-context** model. It checks a
delivered artifact against its acceptance criteria and returns pass/fail **evidence**; it
holds no `edit`, so defects route back to the dispatcher rather than being silently patched.
It is a *utility*, not a Delivery stage agent, because more than one dispatcher uses it: the
Orchestrator dispatches it to verify a change today, and a future plan-reviewer will
dispatch it to verify a *plan* (two consumers = a real seam — see
[ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md)). Its model is named by the user
at setup (the extended-thinking intent, not a hardcoded string).

### Frontend + Visual QA — the frontend isolation seam

Two domain-specialized utilities that pair up
([ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md)):

- **`frontend`** (`.mirai/agents/frontend.agent.md`) — the `edit`-capable dev + runtime-debug
  agent. Wires `frontend-runtime-debugging` (primary), `systematic-debugging`, `diagnose`,
  `server-operations`, `tdd`, and `visual-verification`. Holds `delegate` for one narrow purpose:
  handing pixel-looking to `visual-qa` inside a fix→verify loop. Source:
  [agents/frontend.md](../../agents/frontend.md).
- **`visual-qa`** (`.mirai/agents/visual-qa.agent.md`) — the `edit`-free, vision-capable
  isolation seam. Captures screenshots in a discarded context and returns text-only findings;
  never returns image bytes. Wires `visual-verification`. Source:
  [agents/visual-qa.md](../../agents/visual-qa.md).

`frontend` never loads screenshot bytes into its own edit-capable context — it *delegates* pixel
review to `visual-qa`, keeping the byte-bloat the [visual-verification](../../SKILLS/verification/visual-verification/SKILL.md)
ISOLATE strategy forbids out of a long-lived edit context. The shared browser-drive knowledge both
wire lives in [wiki/patterns/browser-capture.md](../../wiki/patterns/browser-capture.md).

## Related

- [MAPPING.md](MAPPING.md) — the general lookup table this file's rosters plug into.
- [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) — the base setup approach.
- [ADR-006](../../wiki/adr/adr-006-capability-based-roles.md) — capability-based role discipline (the `Capabilities` rows above).
- [ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md) — the Delivery dispatcher split and Verifier-as-utility.
- [ADR-009](../../wiki/adr/adr-009-frontend-domain-utility.md) — the `frontend` + `visual-qa` domain-specialized utilities added to the roster above.
- [ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md) — the stage-seam handoff protocol the PRODUCE/DISCOVER notes above implement.
- [wiki/patterns/seam-artifact-protocol.md](../../wiki/patterns/seam-artifact-protocol.md) — the protocol contract.
- [references/capabilities.md](references/capabilities.md) — generic capability → Mirai tool-name mapping.
- [workflows/sdlc/index.md](../../workflows/sdlc/index.md) — the six phases and three
  stages this file maps onto.
- [setup.md](setup.md) — the Mirai adapter setup instruction that reads
  this file during Write (step 5).
</content>
