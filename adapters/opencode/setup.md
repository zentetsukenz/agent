# Setup loom for OpenCode — the OpenCode adapter

> **This is loom's OpenCode adapter** — the second implementation of the harness-agnostic
> setup contract. The generic contract body (the five steps, `init`/`update` semantics,
> universal safety, the six primitives, skill rosters, capability sets, model archetypes,
> interview questions, provenance/idempotency, and the generic invariant-checks) lives
> **once** in the shared [`contract/`](../../contract/index.md) core — this file
> **references** it and never restates it
> ([ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md)). This adapter supplies
> only OpenCode's **four port answers** (see [MAPPING.md](MAPPING.md), [STAGES.md](STAGES.md),
> [references/](references/write-format.md)) plus the harness manifest below. See
> [ADR-005](../../wiki/adr/adr-005-harness-agnostic-setup.md) (harness-agnostic contract) and
> [ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md) (why this adapter is shaped the way
> it is).
>
> **Read remotely — do not clone loom.** An agent runs this by _reading_ these instructions
> plus the `contract/` core and the OpenCode references, either from a local loom checkout or
> straight from the canonical repo (e.g. `curl` the raw files — both the adapter files **and**
> the `contract/` files). There is **no command to invoke**; reading and following this file
> (in `init` or `update` mode) is the whole mechanism.

## Trigger

Follow this adapter when the user wants to:

- Set up loom's SDLC framework in a project that uses the OpenCode harness (`init`), or
- Refresh/patch an existing `.opencode/` config after loom or the project changed (`update`).

Do **not** use it for: writing a single ad-hoc `.opencode/` file (edit directly), general loom
maintenance unrelated to OpenCode delivery, or a different target harness (each harness has its
own adapter — see [ADR-001](../../wiki/adr/adr-001-adapter-pattern.md)).

## The contract (generic — read the core)

This adapter runs the universal five-step setup contract. **Read the generic body from the
core, don't re-derive it:**

- **The five steps + `init`/`update` semantics + universal safety rules** — [contract/index.md](../../contract/index.md).
- **The six primitives, stage groupings, skill rosters, capability sets, model archetypes** — [contract/primitives.md](../../contract/primitives.md).
- **The interview questions** (Scope, tiers, model matching, utility agents, docs-lookup, handoff, quality baseline) — [contract/interview.md](../../contract/interview.md).
- **Provenance/idempotency discipline + the generic invariant-checks** — [contract/discipline.md](../../contract/discipline.md).

The interview engine is loom's [grill-with-docs](../../SKILLS/discovery/grill-with-docs/SKILL.md)
skill — one question at a time, always leading with the recommended default.

`init` vs `update` for OpenCode: if invoked with no clear signal, check whether `.opencode/`
(or `.claude/`, `.agents/`) already has loom-authored content (a `.opencode/skills/<slug>/SKILL.md`
whose `name` matches a loom `SKILLS/<bucket>/<slug>/`, or a `.opencode/agents/*.md` carrying the
loom provenance marker) — if so, this is an `update`; otherwise `init`. Drift detection: see
[contract/index.md](../../contract/index.md).

## OpenCode's four port answers (the adapter's job)

Everything OpenCode-specific is one of the four [port obligations](../../contract/PORTS.md):

| Port | OpenCode answer |
|---|---|
| **`capability→tool`** | [references/capabilities.md](references/capabilities.md) + [MAPPING.md §6](MAPPING.md#6-capability--opencode-tool-mapping) — capability → OpenCode `permission:` key; withhold = `permission: { <key>: deny }`. `interview` resolves to the native `question` tool; `persist` is a GAP (committed folder). |
| **`archetype→model`** | [MAPPING.md §5](MAPPING.md#5-model-archetype-render-target) — inline `model: provider/model-id` per agent by default; **opt-in** central `omo.json` when OMO is chosen ([references/omo.md](references/omo.md)). |
| **`seam-obligation→wiring`** | [MAPPING.md §7](MAPPING.md#7-communication-protocol-document--loomhandoffs) + [STAGES.md](STAGES.md) — no `handoffs:` primitive → committed `.loom/handoffs/` ledger + a pointer in `opencode.json`'s `instructions:`; the human `Tab`-selects the next primary agent, which DISCOVERs the ledger. |
| **`primitive→file` manifest** | The [harness manifest](#harness-manifest) below + [MAPPING.md §1–3](MAPPING.md#1-skill-primitive--opencodeskills), [STAGES.md](STAGES.md), and the [templates](assets/templates/role.agent.md.template); format-checks in [references/verify.md](references/verify.md). |

## Procedure

Run the five steps from [contract/index.md](../../contract/index.md). OpenCode specifics per step:

1. **Explore** — read the target's `AGENTS.md`/`CLAUDE.md`, `opencode.json`, `package.json`/build
   config, and existing `.opencode/`, `.claude/`, or `.agents/` dirs. For `update`, also diff
   against what this adapter last wrote (compare each generated file against what
   [MAPPING.md](MAPPING.md)/[STAGES.md](STAGES.md) now say it should contain).
2. **Interview** — walk [contract/interview.md](../../contract/interview.md) via
   grill-with-docs, then fold in OpenCode's harness-specific resolution steps: the
   **AGENTS.md vs `instructions:`** placement, the **`provider/model-id`** format resolution,
   and the **OMO opt-in** decision (see [references/interview.md](references/interview.md)).
3. **Present** the full proposed `.opencode/` tree (paths only, one section at a time) with a
   one-line rationale per file.
4. **Confirm** — wait for explicit user "go"; adjust and re-present on pushback.
5. **Write** in OpenCode's exact format — consult [references/write-format.md](references/write-format.md)
   (agent/command frontmatter, `permission:` withholds, template-filling, the OMO render, the
   committed-ledger wiring) and the harness manifest below. Never invent frontmatter fields.
6. **Verify** — run the generic invariant-checks
   ([contract/discipline.md](../../contract/discipline.md)) **plus** OpenCode's format-checks
   ([references/verify.md](references/verify.md)).
7. **Done** — report created vs. patched paths and flag anything deferred.

## Harness manifest

OpenCode's answers to the `primitive→file` manifest ([port 4](../../contract/PORTS.md)):

| Primitive | Native name / format | Output location |
|---|---|---|
| skill | `SKILL.md`, YAML frontmatter, `name` **must equal** folder | `.opencode/skills/<slug>/` (+ `references/`/`scripts/`/`assets/` one level deep) |
| stage-agent (primary) | `<name>.md`, frontmatter (`description`, `mode: primary`, `model`, `permission`) | `.opencode/agents/` |
| utility (subagent) | `<name>.md`, frontmatter (`description`, `mode: subagent`, `model`, `permission`) | `.opencode/agents/` |
| stage-command (quick) | `<name>.md`, frontmatter (`description`, `agent`, `model`) + template body | `.opencode/commands/` |
| protocol doc (GAP) | committed Markdown + `opencode.json` `instructions:` pointer | `.loom/handoffs/protocol.md` (+ manifest `index.md`) |
| project-context | root `AGENTS.md` (native) | project root |

- **Base-agent names** (quick commands): `plan` (OpenCode's built-in read-only mode) for
  Shaping; `build` otherwise. See [STAGES.md](STAGES.md).
- **Invocation-surface flags**: `front-door` = `mode: primary`; `dispatched` = `mode: subagent`.
  See [references/write-format.md](references/write-format.md#role-invocation-surface).
- **Delivery emits two dispatcher primary agents**, not one — `planner.md` + `orchestrator.md`
  (both `permission: { edit: deny }`) + the `verifier` subagent. On `update`, replace any prior
  single `delivery.md` (see the migration note in [references/write-format.md](references/write-format.md)).
- **Withhold mechanism**: a role denied a capability sets `permission: { <key>: deny }` — see
  [references/capabilities.md](references/capabilities.md).
- **Templates**: [assets/templates/](assets/templates/role.agent.md.template) — fill the
  placeholders, don't restate the template inline.
- **OMO layer is opt-in** — only rendered if the interview chose it ([references/omo.md](references/omo.md));
  a bare-OpenCode project keeps inline `model:` fields.
- Authoritative OpenCode reference: [wiki/environments/opencode.md](../../wiki/environments/opencode.md).

**The setup instruction itself is not copied** into a target project — this file _writes_
`.opencode/`; it is not content that ships inside it.

## Output

- A `.opencode/` tree: `agents/` (primary stage agents + subagent utilities), `commands/`
  (quick stage combos), `skills/<slug>/`, plus root `AGENTS.md`.
- A committed `.loom/handoffs/` ledger with a seeded manifest at `.loom/handoffs/index.md`, and
  an `instructions:` pointer in `opencode.json` to the protocol file.
- Optionally (if OMO opted in) an `omo.json` at the project root or `.omo/`.
- A short report of created vs. patched paths.

## Related

- [contract/index.md](../../contract/index.md) — the generic setup contract this adapter implements.
- [contract/PORTS.md](../../contract/PORTS.md) — the four obligations; this adapter answers all four.
- [ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md) — the shared-core decision (reference, never restate).
- [ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md) — the OpenCode adapter decision.
- [MAPPING.md](MAPPING.md), [STAGES.md](STAGES.md) — OpenCode's concrete port answers.
- [references/omo.md](references/omo.md) — the opt-in OMO model-tiering layer.
- [wiki/environments/opencode.md](../../wiki/environments/opencode.md) — OpenCode primitive reference.
- [adapters/mirai/setup.md](../mirai/setup.md) — the first adapter implementing this contract (the shape this one mirrors).
- [SETUP.md](../../SETUP.md) — the harness-agnostic entrypoint that routes here.
