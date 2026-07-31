# Write format & idempotency rules

Consulted by [setup.md](../setup.md) step 5. Every file the setup instruction writes must
be valid in **Mirai's exact format** — see [wiki/environments/mirai.md](../../../wiki/environments/mirai.md)
for the authoritative frontmatter schema per primitive. This file only adds the
loom-specific conventions for *how* the write happens (idempotency, provenance marking,
placeholder-filling) — it does not restate Mirai's schema.

Templates referenced below live at
[../assets/templates/role.agent.md.template](../assets/templates/role.agent.md.template),
[../assets/templates/stage.prompt.md.template](../assets/templates/stage.prompt.md.template),
and [../assets/templates/AGENTS.md.template](../assets/templates/AGENTS.md.template).

## Provenance marking (for idempotent patching)

Every file this skill writes gets an HTML comment marker so a later `update` run can find
and replace the loom-authored section without touching user additions:

```markdown
<!-- loom:setup-loom:begin -->
...loom-authored content...
<!-- loom:setup-loom:end -->
```

- For `SKILL.md`/`.agent.md`/`.prompt.md` files that are **entirely** loom-authored (e.g.
  a copied `SKILLS/<bucket>/<slug>/SKILL.md`), the marker wraps the whole body — a patch
  simply replaces everything between the markers.
- For root `AGENTS.md` (which mixes loom-authored and project-specific content), the
  marker wraps only the sections this skill owns (e.g. a "loom SDLC" section listing
  available stage prompts/agents) — never the user's own Architecture/Build/Conventions
  sections.
- If a file has no markers yet (hand-written before this skill existed), **do not**
  silently rewrite it. Ask the user whether to adopt it (wrap it in markers, migrating
  its content into the loom-authored section) or leave it untouched and write alongside it.

## Filling templates

The templates above hold skeletons with `{{PLACEHOLDER}}` tokens.
Fill every placeholder — never leave a literal `{{...}}` in a written file. If a
placeholder's value wasn't resolved by Explore or the interview, that's a bug in the
procedure — stop and ask rather than guessing or leaving it blank.

### `role.agent.md.template` placeholders

| Placeholder | Source |
|---|---|
| `{{ROLE_NAME}}` | The role/agent name — `shaping`, `planner`, `orchestrator`, `closing`, `verifier`, etc. (see [STAGES.md](../STAGES.md)) |
| `{{ROLE_DESCRIPTION}}` | One-line "Use when…" description for the agent picker/subagent discovery |
| `{{ROLE_PHASES}}` | The SDLC phase(s) this role owns (e.g. "the Discovery and Design phases") |
| `{{ROLE_TOOLS}}` | The role's capability set from [STAGES.md](../STAGES.md), each generic capability resolved to its Mirai tool via [capabilities.md](capabilities.md) — a YAML array |
| `{{ROLE_CAPABILITY_NOTE}}` | One sentence naming the load-bearing **withheld** capability and why (e.g. "You have no `edit` capability — you dispatch work to executors rather than writing code yourself.") |
| `{{ROLE_WORKFLOW_PROSE}}` | Concatenated body of the role's `workflows/sdlc/<phase>.md` file(s) — see [STAGES.md](../STAGES.md) |
| `{{ROLE_SKILL_LIST}}` | The role's adopted skill roster from [STAGES.md](../STAGES.md), pruned per the Scope interview table |
| `{{ROLE_MODEL}}` | The archetype-matched model fallback array (Model Matching interview table) — Verifier uses the extended-thinking archetype |
| `{{ROLE_INVOCATION_SURFACE}}` | The two Mirai invocation flags for the role's [invocation surface](../../../wiki/glossary/index.md#invocation-surface) ([ADR-012](../../../wiki/adr/adr-012-invocation-surface.md)) — derived from the role kind, **not** a setup question. See the [rule below](#role-invocation-surface). |
| `{{ROLE_HANDOFFS}}` | A `handoffs:` block for stage agents at a producing seam (`shaping → planner`, `orchestrator → closing`), written as an **array of objects** (see the schema below) — **not** a bare array of agent names. Expand to the **empty string** (omit the key entirely) for roles with no downstream stage transition. |
| `{{ROLE_HANDOFF_NOTE}}` | The role's PRODUCE or DISCOVER instruction from [STAGES.md](../STAGES.md), pointing at `.mirai/instructions/handoff.instructions.md`; for a role at no stage seam (e.g. a utility), a one-line "within-stage dispatch is ephemeral — see `dispatch-context`" note |

#### `handoffs:` frontmatter — object schema (do NOT use a bare array)

Mirai requires each `handoffs` entry to be an **object** with `label`, `agent`, `prompt`, and
optional `send` (see [wiki/environments/mirai.md](../../../wiki/environments/mirai.md#5-custom-agents)).
Writing `handoffs: [planner]` fails validation with *"Each handoff in the 'handoffs' attribute
must be an object with 'label', 'agent', 'prompt' and optional 'send'."* Fill `{{ROLE_HANDOFFS}}`
like this (indentation matters — it sits at frontmatter top level):

```yaml
handoffs:
  - label: "Plan this milestone"
    agent: planner
    prompt: "Discover the Shaping seam artifact for this milestone from the ledger and start planning from it."
    send: false
```

- `shaping.agent.md` → `agent: planner` (label/prompt about planning the discovered findings).
- `orchestrator.agent.md` → `agent: closing` (label/prompt about curating the shipped, verified change).
- Any role with no downstream stage (planner, closing, all utilities): `{{ROLE_HANDOFFS}}` is the
  **empty string** — do not emit a `handoffs:` key at all.

#### `{{ROLE_INVOCATION_SURFACE}}` — derive from the role kind {#role-invocation-surface}

Fill this from the role's [invocation surface](../../../wiki/glossary/index.md#invocation-surface)
([ADR-012](../../../wiki/adr/adr-012-invocation-surface.md)) — it is **not** an interview question;
it follows deterministically from *what kind of role* this is:

| Role kind | Invocation surface | Fill `{{ROLE_INVOCATION_SURFACE}}` with |
|---|---|---|
| **Stage agent** — `shaping`, `planner`, `orchestrator`, `closing` | `front-door` | `user-invocable: true`<br>`disable-model-invocation: true` |
| **Utility** — `explore`, `quick`, `deep`, `verifier`, `writing`, `frontend`, `visual-qa` | `dispatched` | `user-invocable: false`<br>`disable-model-invocation: false` |

- The placeholder expands to **both YAML lines** (two frontmatter keys), e.g. for a stage agent:

  ```yaml
  user-invocable: true
  disable-model-invocation: true
  ```

- **`orchestrator` and `frontend` both hold `delegate`, yet differ:** `orchestrator` is a stage
  agent (`front-door`); `frontend` is a utility (`dispatched`). Derive from the role kind, not from
  whether it delegates — see [MAPPING.md §2/§3](../MAPPING.md#3-utility-agents-à-la-omo).
- **Why `front-door` sets `disable-model-invocation: true`:** it stops a peer from silently pulling
  a stage in as a subagent (collapsing the stage seam). It does **not** block the stage's
  `handoffs:` transitions — those are keyed on agent name, a separate mechanism (see
  [wiki/environments/mirai.md](../../../wiki/environments/mirai.md#5-custom-agents)).
- On `update`, reconcile these two fields like any other loom-owned frontmatter (they sit **above**
  the provenance markers — see the [frontmatter reconcile rule](#frontmatter-reconcile-rule-for-update)):
  a utility that still carries `user-invocable: true` from an older run must be flipped to
  `false`.

### `stage.prompt.md.template` placeholders

| Placeholder | Source |
|---|---|
| `{{STAGE_NAME}}` | One of `shape`, `deliver`, `close` (the quick-prompt stage) |
| `{{STAGE_BASE_AGENT}}` | The quick base agent from [STAGES.md](../STAGES.md): `Plan` for read-only Shaping, `agent` for Delivery/Closing |
| `{{STAGE_STANCE}}` | The stage's one-line stance from [STAGES.md](../STAGES.md) (the portable no-jump-to-conclusions backstop) |
| `{{STAGE_SKILL_LIST}}` | The stage's adopted skill roster from [STAGES.md](../STAGES.md), pruned per the Scope interview table |
| `{{MODEL_FALLBACK_ARRAY}}` | The archetype-matched model array from the Model Matching interview table |

### `handoff.instructions.md.template` placeholders

| Placeholder | Source |
|---|---|
| `{{LEDGER_SUBSTRATE}}` | Handoff interview table 4d — `memory`, `committed folder`, or `both` |
| `{{LEDGER_ROOT}}` | Handoff interview table 4d — e.g. `.loom/handoffs/` and/or `/memories/repo/loom/handoffs/` |
| `{{SHAPING_ARTIFACTS}}` | Handoff interview table 4d — Shaping seam docs (default `findings.md`, `domain-model.md` or link, `design-decisions.md`) |
| `{{DELIVERY_ARTIFACTS}}` | Handoff interview table 4d — Delivery seam docs (default `verified-change.md`) |
| `{{CLOSING_ARTIFACTS}}` | Handoff interview table 4d — Closing seam docs (default `knowledge.md`) |

### Shared

| Placeholder | Source |
|---|---|
| `{{PROJECT_NAME}}`, `{{BUILD_CMD}}`, `{{TEST_CMD}}` | Explore step — read from the target project's own config |

## Communication protocol document

The [handoff.instructions.md.template](../assets/templates/handoff.instructions.md.template) is
written to `.mirai/instructions/handoff.instructions.md` — the project's
[communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document)
([ADR-011](../../../wiki/adr/adr-011-seam-artifact-protocol.md)). Rules:

- It is a **description-triggered** file instruction — set a keyword-rich `description` and **no**
  `applyTo` (an `applyTo:"**"` would load it on every request and burn context; see
  [wiki/environments/mirai.md](../../../wiki/environments/mirai.md#2-file-instructions)).
- Seed the ledger **manifest** at the chosen `<ledger-root>/index.md` with the table header only
  (no rows) so producers have somewhere to register.
- On `update`, if the user changes the substrate/root, **migrate** existing artifacts to the new
  location and rewrite the manifest paths; if migration is unsafe (e.g. memory → committed with
  secrets), surface the artifacts and ask rather than moving silently.
- The stage agents reference this document rather than restating the convention — patch their
  bodies (inside the markers) to point at it, don't duplicate the protocol into each agent.

## Skill copy rules

When copying a loom `SKILLS/<bucket>/<slug>/SKILL.md` into `.mirai/skills/<slug>/SKILL.md`:

- Preserve `name` exactly (must equal `<slug>`, the Mirai requirement).
- Preserve `disable-model-invocation` and `user-invocable` flags from the source skill
  unless the interview explicitly asked to change them.
- Do not add `argument-hint` unless the source skill already declares one.
- Copy `references/`, `scripts/`, `assets/` subdirectories verbatim, one level deep, per
  Mirai's progressive-loading model (don't flatten or rename them).
- If the interview tailored the `description` (e.g. to mention the project's actual test
  command), edit only the `description` field — never the body's procedure — and note the
  tailoring in the step-7 report.

## Frontmatter reconcile rule (for `update`)

The provenance markers wrap only the **body**. Frontmatter (`agent:`, `tools:`, `model:`,
`name:`, `description:`, `argument-hint:`, `user-invocable:`, `disable-model-invocation:`)
lives **above** the `<!-- loom:setup-loom:begin -->` marker. A body-only patch therefore
**will not** fix stale frontmatter.

On `update`, after replacing the marked body, **reconcile the loom-authored frontmatter
fields** against what [STAGES.md](../STAGES.md), [capabilities.md](capabilities.md), and the
prompt/role templates now say they should be:

- Prompt `agent:` — must be the current base agent (`Plan` for Shaping, `agent` otherwise),
  not a stale `agent: "agent"` from an earlier version.
- Agent `tools:` — must match the role's current capability set (e.g. a Shaping agent that
  still carries `edit` from an old run must have it **removed**).
- `model:` — reconcile against the current archetype mapping.
- `user-invocable:` / `disable-model-invocation:` — reconcile against the role's
  [invocation surface](#role-invocation-surface): a utility that still carries
  `user-invocable: true` from a pre-ADR-012 run must be flipped to `false` (and
  `disable-model-invocation` to `false`); a stage agent must carry `user-invocable: true` +
  `disable-model-invocation: true`.

Preserve any genuinely user-added frontmatter (a model the user swapped in, an extra tool
they added on purpose) — reconcile only the fields loom owns, and if in doubt, show the diff
and ask.

## Delivery split migration (`delivery.agent.md` → dispatchers)

Older configs have a single `.mirai/agents/delivery.agent.md`. Per
[ADR-008](../../../wiki/adr/adr-008-delivery-dispatchers.md) Delivery is now two dispatcher
agents plus a utility Verifier. On `update`:

1. Generate `planner.agent.md` and `orchestrator.agent.md` (and `verifier.agent.md` in the
   utility roster).
2. **Retire** the old `delivery.agent.md` — delete it (or, if the user added content inside
   its markers, surface that content and ask where it should move before deleting). Never
   leave both the old single agent and the new dispatchers — that reintroduces the
   edit-capable Delivery agent the split exists to remove.
3. Report the replacement explicitly in the step-7 done report.

## Never do

- Never write both root `AGENTS.md` **and** `.mirai/mirai-instructions.md`.
- Never write a `.mirai/prompts/<x>.prompt.md` that duplicates a `.mirai/agents/<x>.agent.md`'s
  full workflow prose — the prompt references skills to invoke; it does not re-embed the
  deep workflow text.
- Never invent a frontmatter field not documented in
  [wiki/environments/mirai.md](../../../wiki/environments/mirai.md).
</content>
