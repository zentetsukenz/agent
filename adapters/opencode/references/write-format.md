# OpenCode write format & template mechanics

Consulted by [setup.md](../setup.md) step 5. Every file the setup instruction writes must be
valid in **OpenCode's exact format** — see [wiki/environments/opencode.md](../../../wiki/environments/opencode.md)
for the authoritative frontmatter/config schema per primitive.

> **The generic write disciplines live once in the core** — provenance/idempotency, the
> `update` frontmatter-reconcile rule, and the marker convention are harness-agnostic:
> [contract/discipline.md](../../../contract/discipline.md)
> ([ADR-013](../../../wiki/adr/adr-013-shared-adapter-contract-core.md)). This file adds only
> OpenCode's **template-filling mechanics** and the OpenCode-specific field lists the reconcile
> operates on — it does not restate the generic discipline or OpenCode's frontmatter schema.

Templates referenced below live at
[../assets/templates/role.agent.md.template](../assets/templates/role.agent.md.template),
[../assets/templates/stage.command.md.template](../assets/templates/stage.command.md.template),
[../assets/templates/AGENTS.md.template](../assets/templates/AGENTS.md.template), and
[../assets/templates/handoff.md.template](../assets/templates/handoff.md.template).

## Provenance marking (for idempotent patching)

The generic provenance/idempotency discipline is the core's
([contract/discipline.md](../../../contract/discipline.md#provenance-marking-for-idempotent-patching)).
OpenCode namespaces the HTML-comment marker to this setup instruction:

```markdown
<!-- loom:setup-opencode:begin -->
...loom-authored content...
<!-- loom:setup-opencode:end -->
```

Wrap the whole body of an entirely loom-authored file; for a mixed root `AGENTS.md`, wrap only
the loom-owned sections (never the user's Architecture/Build/Conventions). If a file has no
markers yet, do not silently rewrite it — ask (per the core discipline).

## Filling templates

The templates above hold skeletons with `{{PLACEHOLDER}}` tokens. Fill every placeholder — never
leave a literal `{{...}}` in a written file. If a placeholder's value wasn't resolved by Explore
or the interview, that's a bug in the procedure — stop and ask rather than guessing or leaving it
blank.

### `role.agent.md.template` placeholders

| Placeholder | Source |
|---|---|
| `{{ROLE_NAME}}` | The role/agent name — `shaping`, `planner`, `orchestrator`, `closing`, `verifier`, etc. (see [STAGES.md](../STAGES.md)) |
| `{{ROLE_DESCRIPTION}}` | One-line "Use when…" description for `@mention` discovery |
| `{{ROLE_PHASES}}` | The SDLC phase(s) this role owns (e.g. "the Discovery and Design phases") |
| `{{ROLE_MODE}}` | The [invocation surface](../../../wiki/glossary/index.md#invocation-surface) → `primary` (stage agent) or `subagent` (utility) — derived from role kind, **not** asked. See the [rule below](#role-invocation-surface). |
| `{{ROLE_MODEL}}` | The archetype-matched model in `provider/model-id` format (Model Matching interview table). **Omit the whole line** if the OMO layer was opted in (models live in `omo.json`). |
| `{{ROLE_PERMISSION}}` | The role's capability set from [STAGES.md](../STAGES.md), each generic capability resolved to its OpenCode `permission:` key via [capabilities.md](capabilities.md) — a YAML `permission:` block. Load-bearing withholds are `deny`; PRODUCE roles get the scoped-edit glob. |
| `{{ROLE_CAPABILITY_NOTE}}` | One sentence naming the load-bearing **withheld** capability and why (e.g. "You have `edit: deny` — you dispatch work to executors rather than writing code yourself.") |
| `{{ROLE_WORKFLOW_PROSE}}` | Concatenated body of the role's `workflows/sdlc/<phase>.md` file(s) — see [STAGES.md](../STAGES.md) |
| `{{ROLE_SKILL_LIST}}` | The role's adopted skill roster from [STAGES.md](../STAGES.md), pruned per the Scope interview table |
| `{{ROLE_HANDOFF_NOTE}}` | The role's PRODUCE or DISCOVER instruction from [STAGES.md](../STAGES.md), pointing at `.loom/handoffs/protocol.md`; for a role at no stage seam (e.g. a utility), a one-line "within-stage dispatch is ephemeral — see `dispatch-context`" note |

There is **no `{{ROLE_HANDOFFS}}` placeholder** — OpenCode has no `handoffs:` primitive. The
transition between stages is the human `Tab`-selecting the next primary agent; that agent's
`{{ROLE_HANDOFF_NOTE}}` instructs it to DISCOVER the committed ledger at its entry gate.

#### `{{ROLE_MODE}}` — derive from the role kind {#role-invocation-surface}

Fill this from the role's [invocation surface](../../../wiki/glossary/index.md#invocation-surface)
([ADR-012](../../../wiki/adr/adr-012-invocation-surface.md)) — it is **not** an interview
question; it follows deterministically from *what kind of role* this is:

| Role kind | Invocation surface | Fill `{{ROLE_MODE}}` with |
|---|---|---|
| **Stage agent** — `shaping`, `planner`, `orchestrator`, `closing` | `front-door` | `primary` |
| **Utility** — `explore`, `quick`, `deep`, `verifier`, `writing`, `frontend`, `visual-qa` | `dispatched` | `subagent` |

- **`orchestrator` and `frontend` both hold `delegate`, yet differ:** `orchestrator` is a stage
  agent (`primary`); `frontend` is a utility (`subagent`). Derive from the role kind, not from
  whether it delegates — see [MAPPING.md §2/§3](../MAPPING.md#3-utility-agents--opencodeagentsmd-mode-subagent).
- On `update`, reconcile `mode` like any other loom-owned frontmatter (it sits **above** the
  provenance markers — see the [frontmatter reconcile rule](#frontmatter-reconcile-rule-for-update)):
  a utility that still carries `mode: primary` from an older run must be flipped to `subagent`.

#### `{{ROLE_PERMISSION}}` — the capability set as a `permission:` block

Resolve each generic capability in the role's set ([STAGES.md](../STAGES.md)) to its OpenCode
`permission:` key via [capabilities.md](capabilities.md). Withhold a denied capability with
`deny`; grant a held one with `allow` (or omit to inherit the global default). Example for a
Shaping agent (no `edit`, but persists the ledger):

```yaml
permission:
  edit:
    "*": deny
    ".loom/handoffs/**": allow    # PRODUCE the seam artifact, nothing else
  question: allow                 # interview the human
  webfetch: allow                 # (+ websearch) if web capability granted
```

See [capabilities.md §persist-scoped-edit](capabilities.md#persist-scoped-edit) for the
ledger-write glob every PRODUCE/DISCOVER role uses.

### `stage.command.md.template` placeholders

| Placeholder | Source |
|---|---|
| `{{STAGE_NAME}}` | One of `shape`, `deliver`, `close` (the quick-command stage) |
| `{{STAGE_BASE_AGENT}}` | The quick base agent from [STAGES.md](../STAGES.md): `plan` for read-only Shaping, `build` for Delivery/Closing |
| `{{STAGE_STANCE}}` | The stage's one-line stance from [STAGES.md](../STAGES.md) (the portable no-jump-to-conclusions backstop) |
| `{{STAGE_SKILL_LIST}}` | The stage's adopted skill roster from [STAGES.md](../STAGES.md), pruned per the Scope interview table |
| `{{STAGE_MODEL}}` | The archetype-matched model (`provider/model-id`) from the Model Matching interview table. **Omit the line** if OMO was opted in. |

### `handoff.md.template` placeholders

| Placeholder | Source |
|---|---|
| `{{LEDGER_ROOT}}` | Handoff interview table 4d — the committed ledger root (default `.loom/handoffs/`) |
| `{{SHAPING_ARTIFACTS}}` | Handoff interview table 4d — Shaping seam docs (default `findings.md`, `domain-model.md` or link, `design-decisions.md`) |
| `{{DELIVERY_ARTIFACTS}}` | Handoff interview table 4d — Delivery seam docs (default `verified-change.md`) |
| `{{CLOSING_ARTIFACTS}}` | Handoff interview table 4d — Closing seam docs (default `knowledge.md`) |

### Shared

| Placeholder | Source |
|---|---|
| `{{PROJECT_NAME}}`, `{{BUILD_CMD}}`, `{{TEST_CMD}}` | Explore step — read from the target project's own config |

## Communication protocol document

The [handoff.md.template](../assets/templates/handoff.md.template) is written to
`.loom/handoffs/protocol.md` — the project's
[communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document)
([ADR-011](../../../wiki/adr/adr-011-seam-artifact-protocol.md)). Rules:

- OpenCode has **no description-triggered instruction** primitive, so the protocol lives as a
  **committed file** and is wired into always-on context by adding its path to `opencode.json`'s
  `instructions:` array:

  ```jsonc
  // opencode.json
  "instructions": [".loom/handoffs/protocol.md"]
  ```

  Add the entry idempotently (don't duplicate it on `update`); preserve any other entries the
  user already listed. Also reference the protocol from `AGENTS.md`'s loom section.
- Seed the ledger **manifest** at `.loom/handoffs/index.md` with the table header only (no rows)
  so producers have somewhere to register.
- On `update`, if the user changes the ledger root, **migrate** existing artifacts to the new
  location, rewrite the manifest paths, and update the `instructions:` pointer + the scoped-edit
  globs in every PRODUCE/DISCOVER agent.
- The stage agents reference this document rather than restating the convention — patch their
  bodies (inside the markers) to point at it, don't duplicate the protocol into each agent.

## Skill copy rules

When copying a loom `SKILLS/<bucket>/<slug>/SKILL.md` into `.opencode/skills/<slug>/SKILL.md`:

- Preserve `name` exactly (must equal `<slug>`, the OpenCode requirement); keep `SKILL.md`
  all-caps.
- Preserve any extra frontmatter (`argument-hint`, `user-invocable`, `disable-model-invocation`)
  verbatim — **OpenCode ignores unknown fields**, so the copy is lossless and stays valid on
  Mirai/Claude too.
- Copy `references/`, `scripts/`, `assets/` subdirectories verbatim, one level deep.
- If the interview tailored the `description` (e.g. to mention the project's actual test
  command), edit only the `description` field — never the body's procedure — and note the
  tailoring in the step-7 report.

## Frontmatter reconcile rule (for `update`)

> The generic reconcile *discipline* (frontmatter lives above the body markers, so a body-only
> patch won't fix it; reconcile only loom-owned fields, preserve user additions, ask if in doubt)
> is the core's: [contract/discipline.md](../../../contract/discipline.md#frontmatter-reconcile-for-update).
> Below are the **OpenCode fields** it operates on.

The OpenCode frontmatter (`description:`, `mode:`, `model:`, `permission:`; for commands
`agent:`, `model:`) lives **above** the `<!-- loom:setup-opencode:begin -->` marker. On `update`,
after replacing the marked body, **reconcile these loom-authored fields** against what
[STAGES.md](../STAGES.md), [capabilities.md](capabilities.md), and the command/role templates now
say they should be:

- Command `agent:` — must be the current base agent (`plan` for Shaping, `build` otherwise), not
  a stale `agent: build` on the Shaping command.
- Agent `permission:` — must match the role's current capability set (e.g. a Shaping agent that
  still lacks `edit: deny` from an old run must have it **added**; the scoped-ledger glob must be
  present on PRODUCE/DISCOVER roles).
- `model:` — reconcile against the current archetype mapping (or remove it if the user switched to
  the OMO layer, which centralizes models in `omo.json`).
- `mode:` — reconcile against the role's [invocation surface](#role-invocation-surface): a utility
  that still carries `mode: primary` from an older run must be flipped to `subagent`; a stage agent
  must carry `mode: primary`.

Preserve any genuinely user-added frontmatter (a model the user swapped in, an extra permission
they added on purpose) — reconcile only the fields loom owns, and if in doubt, show the diff and
ask.

## Delivery split migration (`delivery.md` → dispatchers)

Older configs have a single `.opencode/agents/delivery.md`. Per
[ADR-008](../../../wiki/adr/adr-008-delivery-dispatchers.md) Delivery is now two dispatcher agents
plus a utility Verifier. On `update`:

1. Generate `planner.md` and `orchestrator.md` (and `verifier.md` in the utility roster).
2. **Retire** the old `delivery.md` — delete it (or, if the user added content inside its
   markers, surface that content and ask where it should move before deleting). Never leave both
   the old single agent and the new dispatchers — that reintroduces the edit-capable Delivery
   agent the split exists to remove.
3. Report the replacement explicitly in the step-7 done report.

## OMO layer (opt-in)

If the interview opted into OMO, model matching is rendered to a central `omo.json` instead of
inline `model:` fields — **omit** `{{ROLE_MODEL}}` / `{{STAGE_MODEL}}` from every agent/command
and write the `omo.json` per [omo.md](omo.md). A bare-OpenCode project keeps inline `model:`
fields and writes no `omo.json`.

## Never do

- Never write `CLAUDE.md` — write `AGENTS.md` (OpenCode's native rules file); `CLAUDE.md` is only
  a read fallback.
- Never use the deprecated `tools:` field — use `permission:`.
- Never write a `.opencode/commands/<x>.md` that re-embeds a `.opencode/agents/<x>.md`'s full
  workflow prose — the command references skills to invoke; it does not re-embed the deep workflow
  text.
- Never emit a bare model name — OpenCode `model:` needs the `provider/model-id` format.
- Never invent a frontmatter/config field not documented in
  [wiki/environments/opencode.md](../../../wiki/environments/opencode.md).
