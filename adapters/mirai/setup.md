# Setup loom for Mirai — the Mirai adapter

> **This is loom's Mirai adapter** — one implementation of the harness-agnostic setup
> contract. The generic contract body (the five steps, `init`/`update` semantics, universal
> safety, the six primitives, skill rosters, capability sets, model archetypes, interview
> questions, provenance/idempotency, and the generic invariant-checks) lives **once** in the
> shared [`contract/`](../../contract/index.md) core — this file **references** it and never
> restates it ([ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md)). This
> adapter supplies only Mirai's **four port answers** (see
> [MAPPING.md](MAPPING.md), [STAGES.md](STAGES.md), [references/](references/write-format.md))
> plus the harness manifest below. See [ADR-005](../../wiki/adr/adr-005-harness-agnostic-setup.md)
> (harness-agnostic contract) and [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) (why
> this adapter is shaped the way it is).
>
> **Read remotely — do not clone loom.** An agent runs this by _reading_ these instructions
> plus the `contract/` core and the Mirai references, either from a local loom checkout or
> straight from the canonical repo (e.g. `curl` the raw files — both the adapter files **and**
> the `contract/` files). There is **no command to invoke**; reading and following this file
> (in `init` or `update` mode) is the whole mechanism.

## Trigger

Follow this adapter when the user wants to:

- Set up loom's SDLC framework in a project that uses the Mirai harness (`init`), or
- Refresh/patch an existing `.mirai/` config after loom or the project changed (`update`).

Do **not** use it for: writing a single ad-hoc `.mirai/` file (edit directly), general loom
maintenance unrelated to Mirai delivery, or a different target harness (there is no adapter
for those yet — see [ADR-001](../../wiki/adr/adr-001-adapter-pattern.md)).

## The contract (generic — read the core)

This adapter runs the universal five-step setup contract. **Read the generic body from the
core, don't re-derive it:**

- **The five steps + `init`/`update` semantics + universal safety rules** — [contract/index.md](../../contract/index.md).
- **The six primitives, stage groupings, skill rosters, capability sets, model archetypes** — [contract/primitives.md](../../contract/primitives.md).
- **The interview questions** (Scope, tiers, model matching, utility agents, docs-lookup, handoff, quality baseline) — [contract/interview.md](../../contract/interview.md).
- **Provenance/idempotency discipline + the generic invariant-checks** — [contract/discipline.md](../../contract/discipline.md).

The interview engine is loom's [grill-with-docs](../../SKILLS/discovery/grill-with-docs/SKILL.md)
skill — one question at a time, always leading with the recommended default.

`init` vs `update` for Mirai: if invoked with no clear signal, check whether `.mirai/` (or
`.agents/`, `.claude/`) already has loom-authored content (a `.mirai/skills/<slug>/SKILL.md`
whose `name` matches a loom `SKILLS/<bucket>/<slug>/`) — if so, this is an `update`;
otherwise `init`. Drift detection: see [contract/index.md](../../contract/index.md).

## Mirai's four port answers (the adapter's job)

Everything Mirai-specific is one of the four [port obligations](../../contract/PORTS.md):

| Port | Mirai answer |
|---|---|
| **`capability→tool`** | [references/capabilities.md](references/capabilities.md) + [MAPPING.md §6](MAPPING.md#6-capability--mirai-tool-mapping) — capability → Mirai tool alias / discovered tool name / MCP glob; withhold = omit the tool. |
| **`archetype→model`** | [MAPPING.md §5](MAPPING.md#5-model-archetype-render-target) — inline `model:` (string or fallback array) per generated file. |
| **`seam-obligation→wiring`** | [MAPPING.md §7](MAPPING.md#7-communication-protocol-document--miraiinstructions) + [STAGES.md](STAGES.md) — `handoffs:` object-array in frontmatter; `persist` to repo memory and/or a committed `.loom/handoffs/` folder. |
| **`primitive→file` manifest** | The [harness manifest](#harness-manifest) below + [MAPPING.md §1–3](MAPPING.md#1-skill-primitive--miraiskills), [STAGES.md](STAGES.md), and the [templates](assets/templates/role.agent.md.template); format-checks in [references/verify.md](references/verify.md). |

## Procedure

Run the five steps from [contract/index.md](../../contract/index.md). Mirai specifics per step:

1. **Explore** — read the target's `AGENTS.md`/`mirai-instructions.md`, `package.json`/build
   config, and existing `.mirai/`, `.agents/`, or `.claude/` dirs. For `update`, also diff
   against what this adapter last wrote (compare each generated file against what
   [MAPPING.md](MAPPING.md)/[STAGES.md](STAGES.md) now say it should contain).
2. **Interview** — walk [contract/interview.md](../../contract/interview.md) via
   grill-with-docs, then fold in Mirai's two harness-specific resolution steps: the
   **AGENTS.md vs `mirai-instructions.md`** filesystem check and the **`persist`/`interview`
   tool-name resolution** (see [references/interview.md](references/interview.md)).
3. **Present** the full proposed `.mirai/` tree (paths only, one section at a time) with a
   one-line rationale per file.
4. **Confirm** — wait for explicit user "go"; adjust and re-present on pushback.
5. **Write** in Mirai's exact format — consult [references/write-format.md](references/write-format.md)
   (Mirai frontmatter mechanics, template-filling, the `handoffs:` object schema, the
   Delivery split migration) and the harness manifest below. Never invent frontmatter fields.
6. **Verify** — run the generic invariant-checks
   ([contract/discipline.md](../../contract/discipline.md)) **plus** Mirai's format-checks
   ([references/verify.md](references/verify.md)).
7. **Done** — report created vs. patched paths and flag anything deferred.

## Harness manifest

Mirai's answers to the `primitive→file` manifest ([port 4](../../contract/PORTS.md)):

| Primitive | Native name / format | Output location |
|---|---|---|
| skill | `SKILL.md`, YAML frontmatter, `name` **must equal** folder | `.mirai/skills/<slug>/` (+ `references/`/`scripts/`/`assets/` one level deep) |
| stage-agent / utility | `*.agent.md`, frontmatter (`description`, `name`, `tools`, `model`, invocation flags, `handoffs`) | `.mirai/agents/` |
| stage-prompt | `*.prompt.md`, frontmatter (`description`, `name`, `agent`, `model`, `argument-hint`) | `.mirai/prompts/` |
| instruction (protocol doc) | `*.instructions.md`, description-triggered (**no** `applyTo`) | `.mirai/instructions/handoff.instructions.md` |
| project-context | root `AGENTS.md` **or** `.mirai/mirai-instructions.md` (never both) | project root / `.mirai/` |

- **Base-agent names** (quick prompts): `Plan` (Mirai's built-in read-only mode) for
  Shaping; `agent` otherwise. See [STAGES.md](STAGES.md).
- **Invocation-surface flags**: `front-door` = `user-invocable: true` +
  `disable-model-invocation: true`; `dispatched` = `user-invocable: false` +
  `disable-model-invocation: false`. See [references/write-format.md](references/write-format.md#role-invocation-surface).
- **Delivery emits role agents, not one `delivery.agent.md`** — `planner.agent.md` +
  `orchestrator.agent.md` (dispatchers, no `edit`) + the `verifier` utility. On `update`,
  replace any prior single `delivery.agent.md` (see the migration note in
  [references/write-format.md](references/write-format.md)).
- **Templates**: [assets/templates/](assets/templates/role.agent.md.template) — fill the
  placeholders, don't restate the template inline.
- Authoritative Mirai frontmatter reference: [wiki/environments/mirai.md](../../wiki/environments/mirai.md).

**The setup instruction itself is not copied** into a target project — this file _writes_
`.mirai/`; it is not content that ships inside it.

## Output

- A `.mirai/` tree: `agents/`, `prompts/`, `skills/<slug>/`, `instructions/` (always includes
  `handoff.instructions.md`), plus root `AGENTS.md` (or `.mirai/mirai-instructions.md` — never
  both).
- A seeded ledger manifest at the chosen `<ledger-root>/index.md`.
- A short report of created vs. patched paths.

## Related

- [contract/index.md](../../contract/index.md) — the generic setup contract this adapter implements.
- [contract/PORTS.md](../../contract/PORTS.md) — the four obligations; this adapter answers all four.
- [ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md) — the shared-core decision (reference, never restate).
- [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) — the Mirai adapter decision.
- [MAPPING.md](MAPPING.md), [STAGES.md](STAGES.md) — Mirai's concrete port answers.
- [wiki/environments/mirai.md](../../wiki/environments/mirai.md) — Mirai primitive reference.
- [SETUP.md](../../SETUP.md) — the harness-agnostic entrypoint that routes here.
