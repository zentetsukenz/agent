# Write format & idempotency rules

Consulted by [SKILL.md](../SKILL.md) step 5. Every file this skill writes must be valid
in **Mirai's exact format** — see [wiki/environments/mirai.md](../../../../wiki/environments/mirai.md)
for the authoritative frontmatter schema per primitive. This file only adds the
loom-specific conventions for *how* the write happens (idempotency, provenance marking,
placeholder-filling) — it does not restate Mirai's schema.

Templates referenced below live at
[../assets/templates/stage.agent.md.template](../assets/templates/stage.agent.md.template),
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

| Placeholder | Source |
|---|---|
| `{{STAGE_NAME}}` | One of `shaping`, `delivery`, `closing` |
| `{{STAGE_WORKFLOW_PROSE}}` | Concatenated body of the stage's `workflows/sdlc/<phase>.md` file(s) — see [STAGES.md](../../../../adapters/mirai/STAGES.md) |
| `{{STAGE_SKILL_LIST}}` | The stage's adopted skill roster from [STAGES.md](../../../../adapters/mirai/STAGES.md), pruned per the Scope interview table |
| `{{MODEL_FALLBACK_ARRAY}}` | The archetype-matched model array from the Model Matching interview table |
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

## Never do

- Never write both root `AGENTS.md` **and** `.mirai/mirai-instructions.md`.
- Never write a `.mirai/prompts/<x>.prompt.md` that duplicates a `.mirai/agents/<x>.agent.md`'s
  full workflow prose — the prompt references skills to invoke; it does not re-embed the
  deep workflow text.
- Never invent a frontmatter field not documented in
  [wiki/environments/mirai.md](../../../../wiki/environments/mirai.md).
</content>
