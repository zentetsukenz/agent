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

### `stage.prompt.md.template` placeholders

| Placeholder | Source |
|---|---|
| `{{STAGE_NAME}}` | One of `shape`, `deliver`, `close` (the quick-prompt stage) |
| `{{STAGE_BASE_AGENT}}` | The quick base agent from [STAGES.md](../STAGES.md): `Plan` for read-only Shaping, `agent` for Delivery/Closing |
| `{{STAGE_STANCE}}` | The stage's one-line stance from [STAGES.md](../STAGES.md) (the portable no-jump-to-conclusions backstop) |
| `{{STAGE_SKILL_LIST}}` | The stage's adopted skill roster from [STAGES.md](../STAGES.md), pruned per the Scope interview table |
| `{{MODEL_FALLBACK_ARRAY}}` | The archetype-matched model array from the Model Matching interview table |

### Shared

| Placeholder | Source |
|---|---|
| `{{PROJECT_NAME}}`, `{{BUILD_CMD}}`, `{{TEST_CMD}}` | Explore step — read from the target project's own config |

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
`name:`, `description:`, `argument-hint:`) lives **above** the `<!-- loom:setup-loom:begin -->`
marker. A body-only patch therefore **will not** fix stale frontmatter.

On `update`, after replacing the marked body, **reconcile the loom-authored frontmatter
fields** against what [STAGES.md](../STAGES.md), [capabilities.md](capabilities.md), and the
prompt/role templates now say they should be:

- Prompt `agent:` — must be the current base agent (`Plan` for Shaping, `agent` otherwise),
  not a stale `agent: "agent"` from an earlier version.
- Agent `tools:` — must match the role's current capability set (e.g. a Shaping agent that
  still carries `edit` from an old run must have it **removed**).
- `model:` — reconcile against the current archetype mapping.

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
