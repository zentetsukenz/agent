# Setup loom for Mirai — the Mirai adapter

> **This is loom's Mirai adapter** — one implementation of the harness-agnostic setup
> contract defined in [SETUP.md](../../SETUP.md) (see
> [ADR-005](../../wiki/adr/adr-005-harness-agnostic-setup.md)). It is Mirai-specific by
> design; the generic entrypoint is the root `SETUP.md`, not this file. This is an
> **adapter instruction an agent reads and follows** — not a loom skill, not a command.
>
> **Read remotely — do not clone loom.** An agent runs this by _reading_ these
> instructions and the three references below, either from a local loom checkout if one is
> present, or straight from the canonical repo (e.g. `curl` the raw files). Cloning the
> loom repo into the target project is unnecessary and discouraged — it would pollute the
> target with framework source. There is **no command to invoke**; reading and following
> this file (in `init` or `update` mode) is the whole mechanism.
>
> It runs against some **target project** (which may be the loom repo itself, or a separate
> project the user names) and reads three loom references, never re-deriving their content:
> [wiki/environments/mirai.md](../../wiki/environments/mirai.md) (Mirai's six
> customization primitives, exact frontmatter), [MAPPING.md](MAPPING.md)
> (SKILLS→`.mirai/skills` table, model-archetype table), and
> [STAGES.md](STAGES.md) (stage → prompt/agent
> rosters). If any of the three is missing or stale, stop and say so rather than guessing.

Turn loom's generic SDLC skills/wiki/workflow into a **bespoke, correctly-formatted**
`.mirai/` configuration for a specific project — through an interview, not a mechanical
1:1 copy. See [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) for why this adapter
is shaped the way it is, and [ADR-005](../../wiki/adr/adr-005-harness-agnostic-setup.md)
for the harness-agnostic contract it implements.

## Trigger

Follow this adapter instruction when the user wants to:

- Set up loom's SDLC framework in a project that uses the Mirai harness (`init`)
- Refresh/patch an existing `.mirai/` config after loom's skills or workflow changed, or
  after the project's own conventions changed (`update`)

Do **not** use it for: writing a single ad-hoc `.mirai/` file (edit directly),
general loom framework maintenance unrelated to Mirai delivery, or setting up a different
target harness (there is no adapter for those yet — see
[ADR-001](../../wiki/adr/adr-001-adapter-pattern.md)).

## Mode: `init` vs `update`

Both modes run the same six-step flow below. The difference is scope and defaults:

|                | `init`                                                                            | `update`                                                                             |
| -------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Starting point | No `.mirai/` (or an empty one)                                                    | Existing `.mirai/` from a prior run                                                  |
| Explore focus  | Whole project from scratch                                                        | Diff: what changed in loom _and_ in the project since last run                       |
| Interview      | Full — every decision table in [references/interview.md](references/interview.md) | Targeted — only decisions whose inputs changed (see "Detecting drift" below)         |
| Write          | Create all files                                                                  | Patch in place — **never** duplicate a file that already exists for the same purpose |

If invoked with no clear `init`/`update` signal, check whether `.mirai/` (or `.agents/`,
`.claude/`) already has loom-authored content (a `.mirai/skills/<slug>/SKILL.md` whose
`name` matches a loom `SKILLS/<bucket>/<slug>/`) — if so, this is an `update`; otherwise
`init`.

## Procedure

### 1. Explore

Read the target project (its own `AGENTS.md`/`mirai-instructions.md` if present, its
`package.json`/build config, its existing `.mirai/`, `.agents/`, or `.claude/` directories)
before asking anything. Never ask a question explorable from the filesystem.

For `update`: also diff against what this adapter last wrote (compare each generated
file's content against what [MAPPING.md](MAPPING.md)
and [STAGES.md](STAGES.md) currently say it _should_ contain) to
scope the interview to what actually changed — see "Detecting drift" below.

### 2. Grill / interview

Interview the user using loom's own [grill-with-docs](../../SKILLS/discovery/grill-with-docs/SKILL.md)
skill as the interview engine — one question at a time, always leading with a recommended
default, waiting for feedback before the next question. Walk the decision tables in
[references/interview.md](references/interview.md) in order:

1. **Scope** — which SDLC stages/skills does this project actually need?
2. **Delivery tiers** — prompts only, agents only, or both per stage?
3. **Model matching** — the user's available models, mapped onto the three archetypes.
4. **Utility agents** — which of `explore`/`quick`/`deep`/`writing` to generate.
5. **AGENTS.md vs `mirai-instructions.md`** — which file already exists (edit that one;
   never create the other; ask only if neither exists).
6. **Existing `.claude/`/`.agents/` content** — extend, leave alone, or migrate?

Fold model-matching into this same interview pass — it is not a separate step.

### 3. Present proposed config

Before writing anything, present the full proposed `.mirai/` tree (paths only, one section
at a time matching the decision tables above) and a one-line rationale per file. Lead with
the recommended answer, as above.

### 4. Confirm

Wait for explicit user confirmation on the presented tree. Adjust and re-present if the
user pushes back on any section — do not silently proceed past an objection.

### 5. Write

Write every file in **Mirai's exact format** — do not invent frontmatter fields. Consult:

- [wiki/environments/mirai.md](../../wiki/environments/mirai.md) for the frontmatter
  schema of each of the six primitives.
- [MAPPING.md](MAPPING.md) for which loom skill
  goes where and the model-archetype table.
- [STAGES.md](STAGES.md) for each stage prompt's
  skill roster and each stage agent's workflow-prose sourcing.
- [assets/templates/stage.agent.md.template](assets/templates/stage.agent.md.template),
  [stage.prompt.md.template](assets/templates/stage.prompt.md.template), and
  [AGENTS.md.template](assets/templates/AGENTS.md.template) for seed file skeletons —
  fill in the placeholders, don't restate the whole template inline.

Idempotency rule: if a target file already exists, **patch it in place** (preserve any
user-added content outside loom-authored sections, marked as described in
[references/write-format.md](references/write-format.md)) — never write a second file for
the same purpose.

### 6. Verify

Run the checklist in [references/verify.md](references/verify.md): frontmatter parses,
`name` fields match folder names, no `AGENTS.md`/`mirai-instructions.md` duplication, all
referenced skills/paths actually exist, model fallback arrays are well-formed.

### 7. Done

Report exactly what was created vs. patched (paths only), and flag anything from the
interview the user deferred (e.g., "utility agents skipped — re-run `update` to add them
later").

## Detecting drift (for `update`)

An `update` run is targeted, not full, when both are true:

- loom's own `SKILLS/`, `workflows/sdlc/`, or `adapters/mirai/*` changed since the
  `.mirai/` config was last written (check git log / file mtimes if available, otherwise
  ask the user "has loom itself changed since your last setup?").
- The project's own conventions (build/test commands, directory layout) are unchanged.

If the project's own conventions changed, re-run the full interview for step 5
(AGENTS.md content) even in `update` mode.

## Output

- A `.mirai/` tree: `agents/`, `prompts/`, `skills/<slug>/`, `instructions/` (only if the
  interview called for file-scoped instructions), plus root `AGENTS.md` (or
  `.mirai/mirai-instructions.md` — never both).
- A short report of created vs. patched paths.

## Related

- [ADR-004](../../wiki/adr/adr-004-loom-mirai-setup.md) — the decision this adapter implements.
- [wiki/environments/mirai.md](../../wiki/environments/mirai.md) — Mirai primitive reference.
- [MAPPING.md](MAPPING.md), [STAGES.md](STAGES.md) — concrete lookup tables.
- [grill-with-docs](../../SKILLS/discovery/grill-with-docs/SKILL.md) — the interview engine this adapter delegates to.
- [SETUP.md](../../SETUP.md) — the harness-agnostic entrypoint an agent reads to reach this adapter (both `init` and `update` modes; no command wrapper).
  </content>
