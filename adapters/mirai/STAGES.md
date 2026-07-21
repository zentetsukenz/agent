# loom Stages in Mirai

> Concrete Shaping/Delivery/Closing groupings for the Mirai adapter's [setup.md](setup.md). Each stage gets
> **two** delivery tiers (prompt = quick combo, agent = deep workflow) per
> [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) and
> [MAPPING.md](MAPPING.md#2-stages--prompts-combo--agents-deep). This file supplies the
> exact skill roster per stage and where each agent's workflow prose comes from.

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

Skill roster (full default; pruned per the Scope interview table in
[references/interview.md](references/interview.md)):

- `discovery/session-bootstrap`, `discovery/zoom-out`, `discovery/grill-me`,
  `discovery/grill-with-docs`, `discovery/research`, `discovery/research-recommend`
- `design/domain-model`, `design/design-an-interface`, `design/codebase-design`,
  `design/improve-codebase-architecture`

## Delivery (Planning + Implementation + Verification)

**Owner (illustrative)**: delivery team. **Seam artifact**: a shipped, verified change
proven against the success criteria.

| | |
|---|---|
| Workflow prose source | `workflows/sdlc/planning.md` + `workflows/sdlc/implementation.md` + `workflows/sdlc/verification.md`, concatenated |
| Model archetype | Deep Specialist (agent tier) / Communicator (planning-heavy prompt tier — see note below) |
| Prompt file | `.mirai/prompts/deliver.prompt.md` |
| Agent file | `.mirai/agents/delivery.agent.md` |

Skill roster:

- `planning/task-sizing`, `planning/dispatch-context`, `planning/plan-review`,
  `planning/to-prd`, `planning/to-issues`, `planning/triage`, `planning/wayfinder`
- `implementation/tdd`, `implementation/prototype`, `implementation/diagnose`,
  `implementation/systematic-debugging`, `implementation/frontend-runtime-debugging`,
  `implementation/architect-review`, `implementation/server-operations`
- `verification/verification-before-completion`, `verification/visual-verification`,
  `verification/qa-witness-protocol`

**Note on model archetype**: Delivery is the one stage that spans genuinely different
working styles (planning is Communicator-shaped; hard implementation/debugging is Deep
Specialist-shaped). Default: the **agent** tier gets the Deep Specialist fallback array
(it carries the highest-stakes work); the **prompt** tier gets the Communicator fallback
array (quick planning/dispatch tasks dominate the quick path). The interview may ask the
user to confirm this split rather than assuming it.

## Closing (Preservation)

**Owner (illustrative)**: the organisation. **Seam artifact**: durable, curated knowledge
fed back into the framework.

| | |
|---|---|
| Workflow prose source | `workflows/sdlc/preservation.md` |
| Model archetype | Utility |
| Prompt file | `.mirai/prompts/close.prompt.md` |
| Agent file | `.mirai/agents/closing.agent.md` |

Skill roster:

- `preservation/handoff`, `preservation/wiki-init`, `preservation/wiki-curator`,
  `preservation/wiki-query`, `preservation/wiki-audit`, `preservation/wiki-crosslink`,
  `preservation/checkpoint`

## Meta bucket — not a stage

`SKILLS/meta/*` (`skill-creator`, `caveman`, `context-compression`, `edit-article`) is an
always-available toolbox, not tied to a stage. The Mirai adapter's [setup.md](setup.md)
copies any meta skill a stage's skills reference (e.g. `context-compression` referenced
by `planning/dispatch-context`) into `.mirai/skills/` alongside the referencing skill, so
relative links resolve — see
[MAPPING.md](MAPPING.md#1-skills--miraiskills).

## Utility agents (cross-stage)

See [MAPPING.md](MAPPING.md#3-utility-agents-à-la-omo) for the `explore`/`quick`/`deep`/
`writing` roster — these are independent of the three stages above and generated per the
Utility Agents interview table.

## Related

- [MAPPING.md](MAPPING.md) — the general lookup table this file's rosters plug into.
- [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) — the decision this implements.
- [workflows/sdlc/index.md](../../workflows/sdlc/index.md) — the six phases and three
  stages this file maps 1:1 onto.
- [setup.md](setup.md) — the Mirai adapter setup instruction that reads
  this file during Write (step 5).
</content>
