---
type: Index
title: Glossary
description: Key terms and concepts in the agent framework
tags: [glossary, terminology, reference]
timestamp: 2026-01-07T00:00:00Z
---

# Glossary

Key terms and concepts in the agent framework.

---

## Core Concepts

### Skill

A reusable judgment pattern. Not just "how" but "when" and "why". A skill encodes decision-making logic that can be applied across multiple contexts.

**Example**: The `tdd` skill teaches test-driven development workflow (red-green-refactor), not just "how to write tests."

**See**: `mem:principles/wisdom` — "Skills are reusable judgment patterns"

---

### Agent

An autonomous entity with a clear identity and bounded responsibility. Agents specialize by problem domain, not technology.

Identity is only half the picture: an agent is also defined by its [Role](#role) — the
scoped set of [Capabilities](#capability) it is granted. Two agents can share a problem
domain yet differ sharply in what they are *allowed to do* (e.g. an [Orchestrator](#orchestrator)
that may `delegate` but not `edit`).

**Example**: An "Authentication Agent" handles all auth concerns (login, tokens, permissions), not a "Node.js Agent" that does everything in Node.

**See**: `mem:principles/wisdom` — "Identity shapes behavior"; [Role](#role), [Capability](#capability)

---

### Capability

A generic, harness-agnostic power an [Agent](#agent) may hold: `read`, `edit`, `shell`,
`delegate`, `persist`, `interview`, `web`, `docs-lookup`, `tasks`. Capabilities are named
independently of any tool; each [Adapter](#adapter) maps them onto its [Harness](#harness)'s
concrete tool names — and tolerates deviation when a harness's names differ (a mapping the
adapter discovers or is told, never hardcodes blindly).

Granting or **withholding** a capability is how loom enforces a [Role](#role): withholding
`edit` is a *forcing function* — an agent that physically cannot edit must find another
path (design, plan, dispatch, verify) rather than defaulting to writing code.

**Example**: `delegate` (dispatch subagents) maps to Mirai's `agent` tool alias; `persist`
(memory) maps to a specific tool name like `vscode/memory`, discovered from the harness's
tool list rather than assumed.

**See**: `mem:patterns/role-scoped-capabilities`, `mem:adr/adr-006-capability-based-roles`

---

### Role

An [Agent](#agent) defined by its **scoped set of [Capabilities](#capability)** — what it is
allowed to do — rather than only by its problem domain. The role *is* the capability grant:
change the grant and you change the role. Enforcement lives in the grant, not in prose
asking the agent to behave.

Roles divide into two kinds by whether they hold `delegate`: a [Dispatcher](#dispatcher)
routes work to others; a [Utility (dispatched) agent](#utility-dispatched-agent) receives
and executes it.

**Example**: A Planner and an executor may both touch the same feature, but the Planner's
role withholds `edit` (it produces a plan, not code) while the executor's role grants it.

**See**: `mem:patterns/role-scoped-capabilities`, `mem:adr/adr-006-capability-based-roles`

---

### Dispatcher

A [Role](#role) that holds the `delegate` [Capability](#capability): it routes work to other
agents rather than doing it itself. Dispatchers typically **withhold `edit`**, which forces
them to delegate instead of quietly doing the work in-place. The [Orchestrator](#orchestrator)
is the canonical dispatcher; **Shaping** is a second, *read-only* one — it dispatches recon and
research to the `explore` utility and spikes to `quick`/`deep` while staying `edit`-free
([ADR-021](../adr/adr-021-shaping-research-orchestrator.md)).

Being a Dispatcher is orthogonal to the [invocation surface](#invocation-surface): a Dispatcher
may be `dispatched` itself (the Orchestrator) or a `front-door` (Shaping — a human enters it, and
it dispatches out). `delegate` governs *dispatching out*; the invocation surface governs *being
entered*.

**See**: [Orchestrator](#orchestrator), [Invocation surface](#invocation-surface), `mem:patterns/role-scoped-capabilities`

---

### Utility (dispatched) agent

A [Role](#role) that **receives** dispatched work — it holds execution [Capabilities](#capability)
(`edit`, `shell`) but not `delegate` as its purpose. Utility agents are the reusable
executor/verifier pool a [Dispatcher](#dispatcher) hands tasks to: `explore` (read-only
recon), `quick` (mechanical edits), `deep` (hard problems), and the Verifier (checks an
artifact against its acceptance criteria, `edit`-free so it verifies rather than fixes).

Because a single utility can serve *multiple* dispatchers (the Verifier is dispatched by
the Orchestrator today and by a plan-reviewer tomorrow), it sits at a real seam — worth
factoring out as its own agent, per `mem:patterns/deep-modules` ("two consumers = a real seam").

**See**: [Dispatcher](#dispatcher), `mem:patterns/role-scoped-capabilities`

---

### Domain-specialized utility

A [Utility (dispatched) agent](#utility-dispatched-agent) scoped to a **problem domain**
(e.g. frontend) rather than an **intelligence tier** (`quick`/`deep`). It wires that
domain's skill cluster and is dispatched for work in that domain. This closes the gap
between the tier-based roster and the wisdom principle *"specialize by problem domain, not
technology"* — the tier utilities are difficulty-shaped; a domain-specialized utility is
domain-shaped.

**Example**: The `frontend` agent (development + runtime debugging) wires
`frontend-runtime-debugging`, `diagnosing-bugs`, `server-operations`,
`tdd`, and `visual-verification`, and *delegates* pixel-looking to the `visual-qa`
isolation seam. It is the first domain-specialized utility.

**See**: [Utility (dispatched) agent](#utility-dispatched-agent),
`mem:adr/adr-009-frontend-domain-utility`, `mem:patterns/role-scoped-capabilities`

---

### Invocation surface

The set of entry points that may **start** a [Role](#role) — a facet of the role parallel to
its [Capability](#capability) set. Where the capability set answers *what the role may do*,
the invocation surface answers *who may start it*: a **human** (the harness's agent picker /
UI front door) or **another agent** (subagent dispatch). loom names two surfaces:

- **`front-door`** — human-startable, and *not* silently dispatchable as a subagent by a
  peer. The lifecycle stage agents ([shaping, planner, orchestrator, closing](#stage)) — a
  human enters a stage from the picker, or an explicit [handoff](#stage) crosses into it;
  a peer never pulls it in mid-task.
- **`dispatched`** — subagent-only: hidden from the picker, reachable only when a
  [Dispatcher](#dispatcher) delegates to it. The whole [utility](#utility-dispatched-agent)
  roster (`explore`, `quick`, `deep`, `verifier`, `frontend`, `visual-qa`, …).

Like a withheld capability, a withheld invocation surface is a **forcing function**:
withholding the human front door from a dispatched utility keeps a human from running `deep`
directly and bypassing the dispatcher that sizes and routes work. The surface is *orthogonal*
to the dispatcher/utility split — both `orchestrator` (front-door) and `frontend`
(dispatched) hold `delegate`, so "holds `delegate`" does not predict the surface; that
orthogonality is why the facet is named separately.

**Example**: The `deep` utility is `dispatched` (a human can't pick it; the Orchestrator
delegates to it). The `orchestrator` stage agent is `front-door` (a human starts it, or the
Planner hands off to it) yet is *not* subagent-invocable.

**See**: [Role](#role), [Capability](#capability), [Dispatcher](#dispatcher),
`mem:patterns/role-scoped-capabilities`, `mem:adr/adr-012-invocation-surface`

---

### Wiki

Centralized knowledge repository. Contains principles, patterns, environments, and glossary. Reference material, not procedures.

**Structure**:

- `principles/` — Core philosophy and decision-making frameworks
- `patterns/` — Reusable design patterns and best practices
- `environments/` — Development environment setup and tools
- `glossary/` — Terminology and concepts

---

### Harness

The agent tool a project runs in — the thing that reads customization files and drives the
model (Mirai, Claude Code, Cursor, Aider, OpenCode, …). Each harness stores its
customization (instructions, agents, skills, prompts, hooks) in its own **native format**
and location. loom is harness-agnostic; a [Harness Adapter](#adapter) is what teaches loom
a given harness's format.

**Example**: Mirai reads `.mirai/agents/*.agent.md`; Claude Code reads `.claude/agents/*.md`.
Same loom agent, two native formats — one adapter each.

**See**: [wiki/environments/](../environments/index.md), `mem:adr/adr-001-adapter-pattern`

---

### Adapter

In loom, a **harness adapter**: the module that maps loom's generic content (skills,
agents, workflow) onto a specific [Harness](#harness)'s native config format. It owns the
harness-specific knowledge so the [SETUP.md](../../SETUP.md) entrypoint and the
[Setup contract](#setup-contract) stay harness-agnostic. Supporting a new harness = adding
an adapter under `adapters/<harness>/`, not modifying loom's core content.

**Example**: `adapters/mirai/` (its `setup.md` instruction, `MAPPING.md`, `STAGES.md`,
references, and templates) is loom's Mirai adapter — it knows `.mirai/`'s six primitives
and exact frontmatter; nothing else in loom does.

**See**: `mem:adr/adr-001-adapter-pattern`, `mem:adr/adr-004-loom-mirai-setup`

---

### Setup contract

The universal, harness-agnostic flow every [Adapter](#adapter) implements to install loom
into a project: **explore → interview → present & confirm → generate (in the harness's
native format) → verify**. [SETUP.md](../../SETUP.md) defines the contract; each adapter
supplies the harness-specific "generate" and "verify" steps. Interview-driven, not a
mechanical copy — the interview tailors which skills/agents/stages the project needs.

**See**: [SETUP.md](../../SETUP.md), `mem:adr/adr-004-loom-mirai-setup`

---

### Plugin

An extension point that allows external code to hook into a system. Plugins extend behavior without modifying core.

**Example**: A validation plugin that adds custom validators to a form library.

---

### ADR (Architecture Decision Record)

A document that records a significant architectural decision, its context, and consequences. ADRs live in `agent/wiki/adr/`.

**Format**:

- Status (Proposed/Accepted/Deprecated)
- Context (Why this decision?)
- Decision (What did we decide?)
- Consequences (What changes as a result?)

---

### Lifecycle Bucket

A grouping of related tasks or concerns that share a lifecycle. Helps organize work by phase.

**Example**: "Onboarding" bucket contains all tasks related to new developer setup.

---

### Wrapper

A function or class that adds behavior around an existing function or class. Wrappers are composable.

**Example**: A logging wrapper that logs before/after a database call.

---

### Core

The essential, minimal implementation. Everything else is built on top of core.

**Example**: The core of a validation library is type checking; everything else (sanitization, formatting) is optional.

---

### Dogfood

To use your own tools and systems. "Eating your own dogfood" means the framework uses its own principles and patterns.

**Example**: This wiki is dogfooded — it uses the same structure and principles it teaches.

---

## Workflow Concepts

### Workflow

An ordered orchestration document for a specific lifecycle. A workflow is **prose-first**:
it describes phases, gates, recommended skills, and policies as guidance for an interpreting
agent — not as a machine-parseable contract. It is a **seed** an [Adapter](#adapter) compiles
into a concrete harness (agent configs, skill wiring, commands) for a target tool. Distinct
from a [Skill](#skill) (single judgment pattern) and an [Agent](#agent) (identity wiring
skills).

**Example**: The SDLC workflow defines six ordered phases (Discovery → Design → Planning →
Implementation → Verification → Preservation), grouped into three ownership stages
(Shaping → Delivery → Closing).

**See**: [workflows](../../workflows/index.md), `mem:adr/adr-002-workflow-as-adapter-seed`

---

### Stage

An ownership grouping of [Workflow](#workflow) phases that marks a real handoff **seam** — the
point where ownership changes hands. The SDLC workflow has three: **Shaping** (Discovery+Design),
**Delivery** (Planning+Implementation+Verification), and **Closing** (Preservation). Stages carry
no gates of their own; they name *who* owns the work and *what* [Seam artifact](#seam-artifact)
crosses each seam.

**See**: [SDLC workflow](../../workflows/sdlc/index.md), [Seam artifact](#seam-artifact)

---

### Seam artifact

The document that crosses a [Stage](#stage) boundary — the baton one stage's owner hands to the
next. Shaping emits a milestone with design docs (findings, domain model, design decisions);
Delivery emits a shipped, verified change with its acceptance evidence; Closing emits durable,
curated knowledge. A seam artifact carries the *connective tissue* the next agent needs — it
**references** PRDs, plans, ADRs, commits, and diffs by path or URL rather than re-embedding them.
The [Seam Artifact Protocol](../patterns/seam-artifact-protocol.md) defines where it lives and how
it is discovered.

**See**: `mem:patterns/seam-artifact-protocol`, `mem:adr/adr-011-seam-artifact-protocol`, [Ledger](#ledger)

---

### Ledger

The durable store for [Seam artifacts](#seam-artifact). Its root resolves through the
[`persist`](#capability) capability (harness-agnostic); artifacts are addressed by
`<ledger-root>/<stage>/<milestone-slug>/*.md` and indexed by a **manifest** at
`<ledger-root>/index.md` (milestone, stage, artifact, status, updated — latest row wins). A
producing agent writes and registers; a receiving agent reads the manifest and loads the latest
artifact for its seam. The concrete substrate (harness memory / committed folder / both) is a
per-project setup choice.

**See**: `mem:patterns/seam-artifact-protocol`, `mem:adr/adr-011-seam-artifact-protocol`, [Seam artifact](#seam-artifact)

---

### Communication protocol document

A dedicated, standalone per-project document stating where that project's [Ledger](#ledger) lives,
its namespace convention, and each [Stage](#stage)'s expected [Seam artifacts](#seam-artifact). It
is separate from per-project context ([AGENTS.md](#adapter)) and from any single agent or skill:
it is the shared contract they all point at. Agents and skills that participate in handoff
**reference** it rather than re-deriving the convention. Each [Adapter](#adapter) concretizes it
in the harness's native always-available, on-demand form (for Mirai, a description-triggered file
instruction).

**See**: `mem:patterns/seam-artifact-protocol`, `mem:adr/adr-011-seam-artifact-protocol`

---

### Altitude

The scale at which planning and coordination happen. loom distinguishes two. The **micro**
altitude is a single [SDLC](../../workflows/sdlc/index.md) run — one shaped change flowing
Planning → Implementation → Verification, coordinating in harness memory. The **macro** altitude
is project management *above* one run — a [Resident agent](#resident-agent) charting many efforts
as nested [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) maps and dispatching their leaves
*into* SDLC runs. The two altitudes may use different [Substrates](#substrate) (macro on a
[Networked substrate](#substrate), micro in memory) and are joined by an [Altitude seam](#altitude-seam).

**See**: `mem:adr/adr-018-macro-project-management`, [Substrate](#substrate), [Altitude seam](#altitude-seam),
[Resident agent](#resident-agent)

---

### Substrate

Where a [Ledger](#ledger)'s bytes actually land — chosen per project (and, per
[ADR-018](../adr/adr-018-macro-project-management.md), per [Altitude](#altitude)) at
[setup](#setup-contract), never hardcoded by the protocol. Three classes: **harness memory**
(survives across conversations, fast — but not git-committed, so it does not distribute across
agents on different servers); a **committed repo folder** (harness-neutral, reviewable — but adds
state files to the code tree); and a **networked/external store** (a tracker/board or other shared
service — distributes across agents *and* stays out of the code tree, the fit for the macro
altitude). The `persist` [capability](#capability) resolver picks the concrete tool/path. The
networked class has **two instruments** ([ADR-022](../adr/adr-022-reachable-artifact-substrate.md)): a
**tracker/board** for macro state, and an **[Artifact ref](#artifact-ref)** for bulky content.

**See**: `mem:patterns/seam-artifact-protocol`, `mem:adr/adr-018-macro-project-management`, [Ledger](#ledger), [Altitude](#altitude), [Artifact ref](#artifact-ref)

---

### Artifact ref

The second instrument of the networked [Substrate](#substrate) class ([ADR-022](../adr/adr-022-reachable-artifact-substrate.md)):
a git ref on the server — an **orphan branch per effort** (`loom-artifacts/<map-slug>`, disconnected
history so it never tangles a rebase or merge of `main`) — that holds a HITL ticket's **bulky content**
(a `grilling` design doc, a `prototype`'s output, `research` findings), fetched by URL on demand and
never checked into a working tree. Where the **tracker/board** holds macro *state*, the artifact ref
holds the *content* the board's links point at, keeping the board's *"linked, not embedded"* discipline
honest: a link resolves to a place **every participant of the altitude can reach**, never a local-only
path (the [reachability invariant](../patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant)).
A resolving agent writes it via the same PRODUCE act [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md)
owns; cleanup is an enumerate-by-prefix + delete-ref sweep when the effort's content reaches a durable
home (merged code, curated wiki) or the map closes.

**See**: `mem:adr/adr-022-reachable-artifact-substrate`, [Substrate](#substrate), [Seam artifact](#seam-artifact), [Ledger](#ledger)

---

### Altitude seam

The boundary between the macro and micro [Altitudes](#altitude), and the **translator** that
crosses it. A [Resident agent](#resident-agent) performs two translations, reusing the existing
[Seam Artifact Protocol](../patterns/seam-artifact-protocol.md) PRODUCE/DISCOVER contract across
the boundary: **down** — a macro tracker ticket plus its linked artifacts becomes a
`shaping/<milestone>/` [Seam artifact](#seam-artifact) in the SDLC run's memory [Ledger](#ledger),
which Planning's DISCOVER gate already expects; **up** — the run's verified-change artifact becomes
a tracker update (close the ticket, attach the PR/commit link, advance the frontier). The seam is
expressed as a **two-vocabulary label protocol**: `wayfinder:*` labels flow *down* (what the board
hands into a run) and `sdlc:*` statuses flow *up* (what a run reports back).

**See**: `mem:adr/adr-018-macro-project-management`, [Altitude](#altitude), [Resident agent](#resident-agent),
[Seam artifact](#seam-artifact)

---

### Resident agent

A memory-bearing agent that runs the macro [Altitude](#altitude) as a **reactive worker** over a
[Networked substrate](#substrate) (e.g. watching a tracker/board, potentially unattended). The
**board is the single source of truth**: the agent's private memory holds only non-load-bearing
continuity — persona, user preferences, learned skills, conversation continuity — and **never**
project state, so a fresh instance on another server reconstructs the project from the board alone.
Its routing is **mechanical** (a ticket's label + status fully determines the dispatch target), which
is what keeps it restart-safe and the board authoritative. The agent *is* loom-agnostic prose; the
concrete 24/7 daemon that runs it (e.g. Hermes) is an [Adapter](#adapter) concern, not part of the
protocol.

**See**: `mem:adr/adr-018-macro-project-management`, [Altitude seam](#altitude-seam), [Substrate](#substrate)

---

### Orchestrator

An agent [Role](#role) that runs the Implementation loop: it gauges each task's size and
**dispatches it to the correct implementation-agent class** (high / mid / low intelligence)
to maximize the chance of a successful implementation. It does not rely on a small agent
self-assessing its own capability. The Orchestrator also enforces the architecture-prerequisite
gate.

The Orchestrator is loom's canonical [Dispatcher](#dispatcher): its role grants `delegate`
but **withholds `edit`**, so it must route work to [Utility (dispatched) agents](#utility-dispatched-agent)
rather than implementing (or verifying) it itself.

**See**: [SDLC Implementation phase](../../workflows/sdlc/implementation.md), [Dispatcher](#dispatcher),
`mem:adr/adr-008-delivery-dispatchers`

---

### RPI (Research → Plan → Implement)

Disciplined workflow for complex tasks.

1. **Research**: Understand the problem space
2. **Plan**: Design the solution
3. **Implement**: Execute the plan

**See**: `mem:principles/rpi`

---

### Context-First

Design philosophy that treats context as a first-class resource. Minimize what enters context, maximize signal-to-noise.

**See**: `mem:principles/context-first`

---

### Verification Culture

The principle carrying the **iron law**: *no completion, success, or positive work-state claim
without fresh verification evidence, gathered in the same turn it is claimed.* It binds not just
"done" but every paraphrase or implication of success. Harness-agnostic — it names *evidence*, never
a specific command; the [verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md)
skill is the *procedure* that operationalizes it.

**See**: [principles/verification-culture](../principles/verification-culture.md), [ADR-020](../adr/adr-020-system-scoped-qa.md)

---

### Quality baseline

A per-project quality floor recorded at [setup](#setup-contract) and re-checked at every
[quality gate](../../workflows/sdlc/implementation.md#quality-gates)'s Verify step. It names one
tool + run command + floor per [quality aspect](#quality-aspect), defaults to a **ratchet**
(no-regression) floor, is built from **keyless-first** tools, and lives in a single source of
truth (the project's committed tool config when present, else a loom-owned section in the
project-context file). A metric dropping below its floor fails the gate.

**See**: [patterns/quality-baseline](../patterns/quality-baseline.md), [ADR-017](../adr/adr-017-quality-baseline.md)

---

### Quality aspect

One of the four distinct dimensions a [quality baseline](#quality-baseline) covers: **lint**
(style/mechanical correctness), **code-quality** (complexity/duplication/maintainability),
**security** (SAST + vulnerable dependencies), and **coverage** (test %). Each aspect names its
own tool and floor; an aspect with no keyless tool for the stack is recorded as `none` with a
reason.

**See**: [patterns/quality-baseline](../patterns/quality-baseline.md)

---

### Standing regression suite

The **system-scoped** end-to-end test asset a project accumulates over time — distinct from the
per-change [Verification](../../workflows/sdlc/verification.md) that confirms one delivery once.
Each user-facing effort contributes 1:1 the e2e scenarios that guard *its* user journeys (authored
via [derive-e2e-coverage](../../SKILLS/verification/derive-e2e-coverage/SKILL.md)), and the suite
**accretes** them into one body re-run against the whole product. It executes in **CI** at
deterministic points (staging deploy, pre-production), never in the macro tick loop; a
[resident agent](#resident-agent) may *trigger* a run but never runs it. Its long-term operation —
running, and reacting to failures — is a [macro-PM](../../workflows/macro-pm/index.md) concern.

**See**: [ADR-020](../adr/adr-020-system-scoped-qa.md), [derive-e2e-coverage](../../SKILLS/verification/derive-e2e-coverage/SKILL.md), [macro-pm workflow](../../workflows/macro-pm/index.md)

---

### `qa:regression-failed` (regression origin)

A board label marking a **third origin** in the [macro-PM](../../workflows/macro-pm/index.md) loop,
distinct from the [two-vocabulary seam](#altitude-seam): it is neither a `wayfinder:*` ticket
dispatched *down* nor an `sdlc:*` status reported *up* — no leaf produced it. CI posts it (with the
failing run's evidence linked) when the [standing regression suite](#standing-regression-suite) goes
red. The resident agent handles it **mechanically and AFK** by *seeding* — not charting — a fresh
**terminating** root [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) map whose destination is
*"restore the failing check to green"*, then closing the trigger ticket. The regression is thus its
own effort in the forest; it never reopens the closed effort map that shipped the feature.

**See**: [ADR-020](../adr/adr-020-system-scoped-qa.md), [wayfinder: a third origin](../../SKILLS/planning/wayfinder/SKILL.md#a-third-origin-a-regression-seeds-a-fresh-map-not-down-not-up)

---

### Deep Module

A module with a small interface and deep implementation. Hides complexity from callers.

**See**: `mem:patterns/deep-modules`

---

## See Also

- `mem:principles/wisdom` — Core principles
- `mem:principles/rpi` — Research → Plan → Implement workflow
- `mem:principles/context-first` — Context management philosophy
- `mem:principles/verification-culture` — Verification discipline
