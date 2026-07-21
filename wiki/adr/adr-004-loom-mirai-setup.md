---
type: ADR
title: loom setup approach for the Mirai harness
status: Accepted
timestamp: 2026-07-20T00:00:00Z
tags: [mirai, setup, adapter, agent, skill, model-matching, loom]
---

# ADR-004: loom Setup Approach for the Mirai Harness

## Context

loom ships as content-only: skills, wiki, agents, commands (see [ADR-001](adr-001-adapter-pattern.md)).
Getting that content usefully into a concrete tool is still an open problem the adapter
layer defers to v2. **Mirai** — the VS Code-based agent harness this repository is
developed in — is the first concrete target we need working *now*, ahead of the general
adapter. Mirai natively reads root `AGENTS.md` and offers six customization primitives
under `.mirai/` (documented in [wiki/environments/mirai.md](../environments/mirai.md)):
agent instructions, file instructions, prompts, hooks, custom agents, and skills.

Two prior investigations informed the design:

- **oh-my-openagent (OMO)** ships an agent-executable install skill: curl-able Markdown a
  coding agent runs directly, interviewing the user (decision tables), installing
  prerequisites, verifying, and explaining. It also ships explicit **model matching** —
  "models are developers," each agent assigned a model suited to its working style
  (planner vs. deep specialist vs. cheap utility).
- **mattpocock's `setup-matt-pocock-skills`** ships a user-invocable setup skill
  (`disable-model-invocation: true`) that explores the project, presents proposed changes
  section-by-section with a recommended default, confirms, writes, and is idempotent
  (edits whichever instruction file already exists; never creates the other).

The core problem: **how does loom "set up" a project for Mirai** — turning loom's generic
SDLC skills/wiki/workflow into a bespoke, correctly-formatted `.mirai/` configuration —
without hardcoding a rigid 1:1 copy that ignores the target project's actual shape?

## Decision

### Delivery mechanism

Ship the setup logic as an **agent-executable setup skill**
(`SKILLS/meta/setup-loom/`, mattpocock-shaped: `disable-model-invocation: true`,
user-invocable), plus a thin root `SETUP.md` entrypoint — a short "paste this to your
agent" bootstrap pointing at the skill. Two guided commands share the same interview
style: `init` (first-time setup/tailor) and `update` (idempotent patch/re-run).

### Setup is interview-driven, not mechanical copying

Setup **explores** the target project, then **interviews** the user to tailor which
agents and skills actually apply — reusing loom's own `grill-with-docs` skill as the
interview engine rather than inventing a new one. This folds in model-matching questions
(see below) as part of the same interview, instead of a separate step.

### Four-layer architecture

| Layer | Path | Role |
|---|---|---|
| Project context | root `AGENTS.md` | Per-**project** conventions (not workflow steering). Written at `init`, kept current by `update`. Mirai reads it natively. |
| Per-stage agents | `.mirai/agents/*.agent.md` | Carry the DEEP-workflow system prompt (from `workflows/sdlc/<phase>.md`) for a stage, plus a preset model. Also hosts utility agents (explore, quick, deep, writing, ...). |
| Granular skills | `.mirai/skills/<x>/` | loom's existing `SKILLS/<bucket>/<slug>/` capabilities, customized per project during setup. Composable by human or agent. |
| Stage combos | `.mirai/prompts/<x>/` | The "quick" path: a preset bundle of skills + a preset model. The prompt file **is** the bundle — no separate bundle-skill layer. |

**Two tiers per stage**, user's choice at invocation time: a **prompt** (quick combo) or
an **agent** (deep workflow). Stages group the SDLC's six phases by ownership seam:
**Shaping** (Discovery + Design) · **Delivery** (Implementation + Verification) ·
**Closing** (Preservation) — see [workflows/sdlc/index.md](../../workflows/sdlc/index.md).

### Model matching

Borrow OMO's role-archetype framing rather than its JSONC config format (Mirai has no
such config; matching is expressed directly in each `.agent.md`/`.prompt.md`'s `model:`
field, with a fallback array). Archetypes: **Communicator** (Claude-like — interviews,
planning, writing) → **Deep Specialist** (GPT-like — architecture, hard debugging) →
**Utility** (cheap/fast — exploration, mechanical edits). The setup interview asks for the
user's available model list (optionally auto-detected) and assigns per-agent/per-prompt
model + fallback accordingly. See [MAPPING.md](../../adapters/mirai/MAPPING.md) for the
concrete table.

### Workflow discipline lives in prose, not an orchestrator

No routing/dispatch orchestrator is generated. Steering is emergent from system prompts
(`AGENTS.md` + each `.agent.md` body) and composable skills — consistent with
[ADR-002](adr-002-workflow-as-adapter-seed.md)'s prose-first stance: the workflow is
policy an interpreting agent (here, the setup skill) compiles into a concrete harness at
setup time, not a schema loom bakes in.

### Setup flow (final)

```text
Explore -> GRILL/interview (tailor agents+skills; fold in model-matching)
        -> Present proposed .mirai/ config -> Confirm -> Write (correct Mirai format)
        -> Verify -> Done
```

Idempotent: `update` re-runs the same guided style but patches in place — it never
duplicates already-written config.

## Alternatives considered

- **Mechanical 1:1 copy of `SKILLS/` into `.mirai/skills/`.** Simplest, but ignores that
  most projects need only a subset of loom's SDLC skills and produces bloat/irrelevant
  triggers. Rejected in favor of the interview-driven tailoring above.
- **A dispatch/routing orchestrator agent.** Matches some multi-agent frameworks (e.g.
  OMO's Atlas), but reintroduces a structured contract loom's prose-first philosophy
  (ADR-002) deliberately avoids, and adds a single point of failure. Rejected — steering
  stays emergent from prompts.
- **Separate "bundle" skills wrapping combos of granular skills.** Redundant with
  `.mirai/prompts/*.prompt.md`, which already IS a combo (skills + model) at no extra
  layer. Rejected.
- **Building the general adapter (Path X/Y/Z from ADR-001) first, then deriving Mirai
  support from it.** Blocks on unresolved adapter-layer decisions (Rust CLI vs. plugin)
  that don't need to be resolved to ship a working Mirai setup today. Rejected for now;
  this ADR's design should inform, not wait for, the eventual general adapter.

## Consequences

- loom gains a first concrete, working "install into a real tool" path, ahead of and
  informing the general adapter layer.
- The setup skill must stay in sync with Mirai's customization model as it evolves;
  [wiki/environments/mirai.md](../environments/mirai.md) is the single point of truth to
  update, not the skill body itself.
- Two guided commands (`init`, `update`) and the interview-driven approach mean setup is
  slower than a mechanical copy, but produces a config that actually fits the project.
- Model-matching decisions are captured directly in generated frontmatter rather than a
  separate config file — simpler, but means changing a model mapping later means editing
  each `.agent.md`/`.prompt.md` (or re-running `update`) rather than one central file.

## Related

- [ADR-001](adr-001-adapter-pattern.md) — the general adapter layer this setup approach
  precedes and informs.
- [ADR-002](adr-002-workflow-as-adapter-seed.md) — prose-first principle this setup flow
  honors (no baked-in schema; the workflow is interpreted at setup time).
- [wiki/environments/mirai.md](../environments/mirai.md) — the Mirai customization
  reference the setup skill consults.
- [adapters/mirai/MAPPING.md](../../adapters/mirai/MAPPING.md) — concrete SKILLS→`.mirai/skills`
  mapping and model-archetype table.
- [adapters/mirai/STAGES.md](../../adapters/mirai/STAGES.md) — Shaping/Delivery/Closing
  stage groupings, each delivered as prompt(combo) + agent(deep).
- [SKILLS/meta/setup-loom](../../SKILLS/meta/setup-loom/SKILL.md) — the
  skill implementing this decision.
</content>
