# Hermes write format & template mechanics

Consulted by [setup.md](../setup.md) step 5. Every file the setup instruction writes must be valid
in **Hermes's exact format** — see [wiki/environments/hermes.md](../../../wiki/environments/hermes.md)
for the authoritative config/frontmatter schema per primitive.

> **The generic write disciplines live once in the core** — provenance/idempotency, the `update`
> frontmatter-reconcile rule, and the marker convention are harness-agnostic:
> [contract/discipline.md](../../../contract/discipline.md)
> ([ADR-013](../../../wiki/adr/adr-013-shared-adapter-contract-core.md)). This file adds only
> Hermes's **template-filling mechanics** and the Hermes-specific fields the reconcile operates on —
> it does not restate the generic discipline or Hermes's config schema.

Templates referenced below live at
[../assets/templates/profile.config.yaml.template](../assets/templates/profile.config.yaml.template),
[../assets/templates/profile.SOUL.md.template](../assets/templates/profile.SOUL.md.template),
[../assets/templates/AGENTS.md.template](../assets/templates/AGENTS.md.template), and
[../assets/templates/handoff.md.template](../assets/templates/handoff.md.template).

> **Thin-macro scope** ([ADR-019](../../../wiki/adr/adr-019-loom-hermes-setup.md)): this adapter
> writes exactly **one** profile — the resident `wayfinder-macro` agent — plus `AGENTS.md` and the
> protocol document. It writes **no** SDLC stage/utility profiles and no quick-tier stage skill
> (those are rendered by the [dispatch-target harness](macro-pm.md#the-micro-dispatch-target)), so
> there is no `stage.skill` template.

## Delivery shape — a profile distribution {#delivery-shape}

Hermes is **profile-home-centric**: a "named agent" is a [profile](../../../wiki/environments/hermes.md#profiles)
under `~/.hermes/profiles/<name>/`, not a project-local file. Writing directly into a user's
`~/.hermes/` would land outside any git diff — violating the universal safety rule that generated
config should be reviewable. So loom delivers the whole set as a **profile distribution**: a git
repository (committed in or beside the project) that Hermes installs with
`hermes profile install <repo>`. The distribution carries each profile's `config.yaml`, `SOUL.md`,
and `skills/`; credentials and memory stay per-machine. The **only** project-local file loom writes
directly is `AGENTS.md`. Recommend a fresh branch for the distribution repo, exactly as for the
other adapters.

- On `init`: scaffold the distribution repo (one directory per profile + a top-level manifest
  Hermes's distribution format expects — confirm its exact shape against the user's Hermes version).
- On `update`: patch the profiles/skills in place in the distribution repo; the user re-runs
  `hermes profile update <name>` to pull.

## Provenance marking (for idempotent patching)

The generic provenance/idempotency discipline is the core's
([contract/discipline.md](../../../contract/discipline.md#provenance-marking-for-idempotent-patching)).
Hermes namespaces the HTML-comment marker to this setup instruction:

```markdown
<!-- loom:setup-hermes:begin -->
...loom-authored content...
<!-- loom:setup-hermes:end -->
```

Wrap the whole body of an entirely loom-authored file (a `SOUL.md`, a stage skill); for a mixed
project `AGENTS.md`, wrap only the loom-owned section (never the user's Architecture/Build/
Conventions). YAML `config.yaml` files can't hold HTML comments — mark loom-owned config with a
leading `# loom:setup-hermes` comment line and reconcile keys individually (below). If a file has no
markers yet, do not silently rewrite it — ask (per the core discipline).

## Filling templates

The templates hold skeletons with `{{PLACEHOLDER}}` tokens. Fill every placeholder — never leave a
literal `{{...}}` in a written file. If a placeholder's value wasn't resolved by Explore or the
interview, that's a bug in the procedure — stop and ask rather than guessing or leaving it blank.

### `profile.config.yaml.template` placeholders

| Placeholder | Source |
|---|---|
| `{{ROLE_MODEL}}` | The archetype-matched model in `provider/model` format (Model Matching interview table), confirmed against the user's Hermes providers |
| `{{ROLE_FALLBACK_MODEL}}` | A fallback `provider`/`model` pair for `model.fallback_providers:` (the fallback-array discipline) |
| `{{ROLE_TOOLSETS}}` | The resident agent's toolsets — `mcp-<tracker>`, `memory`, `clarify`, `delegation`, `cronjob`, and `file` (read/search) — resolved via [capabilities.md](capabilities.md) as a YAML `toolsets:` list |
| `{{ROLE_DISABLED_TOOLS}}` | The load-bearing **withheld** tools — `write_file` + `patch` (the resident agent never builds) — rendered via the version-confirmed per-tool disable key (see [the per-tool withhold](#the-per-tool-withhold)) |
| `{{ROLE_CWD}}` | Optional `terminal.cwd` if the role should start in the project dir (absolute path) |

### `profile.SOUL.md.template` placeholders

There is exactly one profile — the resident `wayfinder-macro` agent:

| Placeholder | Source |
|---|---|
| `{{ROLE_NAME}}` | `wayfinder-macro` (the resident macro-PM agent) |
| `{{ROLE_DESCRIPTION}}` | One-line "Use when…" description — also passed to `hermes profile create --description` |
| `{{MACRO_PM_LINK}}` | A link to the [macro-PM workflow](../../../workflows/macro-pm/index.md) the agent compiles |
| `{{ROLE_WORKFLOW_PROSE}}` | The tick-loop / reactive-lifecycle prose, sourced from the [macro-PM workflow](../../../workflows/macro-pm/index.md#the-tick-loop) + [wayfinder macro mode](../../../SKILLS/planning/wayfinder/SKILL.md#macro-mode-dispatching-into-sdlc-runs) — **referenced, not re-embedded** |
| `{{ROLE_STANCE}}` | The resident agent's one-line stance: route mechanically, surface HITL tickets, never build or stand in for the human |
| `{{ROLE_CAPABILITY_NOTE}}` | The load-bearing **withheld** capability: "You cannot call `write_file`/`patch` — you route and translate; building happens one altitude down in a dispatched SDLC run." |
| `{{ROLE_SKILL_LIST}}` | The macro skill roster (wayfinder + its dependencies) — see [MAPPING.md §1](../MAPPING.md#1-skill-primitive--profileskillsslug) |
| `{{ROLE_HANDOFF_NOTE}}` | The altitude-seam instruction (dispatch down / report up) pointing at `.loom/handoffs/protocol.md` and the shared on-disk micro ledger — see [macro-pm.md](macro-pm.md#the-altitude-seam--the-translator) |
| `{{ROLE_ONE_SOURCE_NOTE}}` | The one-source-of-truth directive: "Your private memory holds persona/continuity/skills only, **never** project state; project state lives on the registered tracker." (see [macro-pm.md](macro-pm.md)) |

`SOUL.md` is the profile's **persona/system prompt** — it carries the role's *workflow steering*
(the tick-loop prose + stance + capability note), which is exactly what the workflow-as-adapter-seed
discipline ([ADR-002](../../../wiki/adr/adr-002-workflow-as-adapter-seed.md)) puts in the agent body,
**not** in `AGENTS.md` (project conventions only).

### `handoff.md.template` placeholders

| Placeholder | Source |
|---|---|
| `{{LEDGER_ROOT}}` | The **shared, on-disk, gitignored** micro-ledger path (a project convention, e.g. `.loom/handoffs/`) — see [interview.md](interview.md#micro-ledger-substrate-hermes--no-choice-shared-on-disk-gitignored) |
| `{{MICRO_SUBSTRATE}}` | Always `shared on-disk (gitignored)` — no substrate choice under the thin-macro adapter (the dispatch-target harness must also read it) |
| `{{SHAPING_ARTIFACTS}}` | Shaping seam docs the dispatched run produces (default `findings`, `domain-model` or link, `design-decisions`) |
| `{{DELIVERY_ARTIFACTS}}` | Delivery seam docs the dispatched run produces (default `verified-change`) |
| `{{CLOSING_ARTIFACTS}}` | Closing seam docs the dispatched run produces (default `knowledge`) |
| `{{MACRO_SECTION}}` | The macro source of truth, fit assessment, label scheme, and **named micro dispatch target** from interview §4f (see [macro-pm.md](macro-pm.md)) — always present for this adapter |

### `AGENTS.md.template` placeholders

| Placeholder | Source |
|---|---|
| `{{PROJECT_CONTEXT}}` | Build/test commands, directory structure, conventions from Explore + interview |
| `{{QUALITY_BASELINE}}` | The provenance-marked Quality baseline section **only** when no committed tool config exists (interview §4e) — else a pointer to the project's own config |
| `{{PROTOCOL_POINTER}}` | A reference to `.loom/handoffs/protocol.md` (the communication protocol document — always-on, since Hermes has no description-triggered instruction) |

## The per-tool withhold {#the-per-tool-withhold}

The load-bearing no-code-edit withhold ([capabilities.md §withhold](capabilities.md#the-withhold-mechanism))
needs the **individual-tool disable** applied to `write_file` + `patch` for read-only roles. Hermes
persists `hermes tools` selections into `config.yaml` under a platform-tool block whose **exact key
is version-specific**. At Write time:

1. **Confirm the key** against the user's Hermes version (read their existing `config.yaml`, or run
   `hermes tools`/`hermes config` to see the shape) — do not hardcode a key that may have drifted.
2. Render the disable for `write_file` and `patch` in the resident `wayfinder-macro` profile,
   keeping the `file` toolset so `read_file`/`search_files` still work.
3. Record the resolved key shape in a comment in the generated `config.yaml` so an `update` run
   reconciles it rather than re-deriving.

If the running Hermes version genuinely cannot disable an individual tool, fall back to **omitting
the `file` toolset entirely** for the resident agent (it loses `search_files` too — note the
degradation) and grant a read-only research path via `web`/`memory`; flag this to the user.

## Micro-ledger substrate {#micro-ledger-substrate}

Always a **shared, on-disk, gitignored** directory — **not** a user choice under the thin-macro
adapter. Because the SDLC run executes in a *separate* [dispatch-target harness](macro-pm.md#the-micro-dispatch-target),
Hermes `memory` (intra-harness) cannot carry the baton; only on-disk files both harnesses read can.
It is gitignored because ephemeral coordination is never version-controlled
([ADR-014](../../../wiki/adr/adr-014-loom-opencode-setup.md) Option A). The resident agent's own
`memory` holds continuity only ([capabilities.md §persist](capabilities.md#persist--the-native-memory-tool-macro-continuity-only)),
never this ledger. The only thing to write is the ledger **path** (a project convention) into the
protocol document.

## Role invocation surface {#role-invocation-surface}

Under the thin-macro adapter there is one profile and its surface is fixed
([ADR-012](../../../wiki/adr/adr-012-invocation-surface.md), [ADR-019](../../../wiki/adr/adr-019-loom-hermes-setup.md)):

| Role kind | Invocation surface | Rendered as |
|---|---|---|
| **Resident macro** — `wayfinder-macro` | `front-door` (+ resident) | a profile with a `gateway` (human HITL channel) + a `cron` job (the tick loop) — see [macro-pm.md](macro-pm.md) |

No SDLC stage or utility profiles are rendered here — they belong to the
[dispatch-target harness](macro-pm.md#the-micro-dispatch-target). On `update`, reconcile any
**leftover (b)-shaped profiles** from an older run: an earlier version of this adapter rendered a
full SDLC roster (`shaping`/`planner`/`orchestrator`/`closing`/`verifier`/…) into the distribution —
those must be **removed**, leaving only the resident `wayfinder-macro` profile.

## Related

- [contract/discipline.md](../../../contract/discipline.md) — the generic write/idempotency discipline this file extends.
- [wiki/environments/hermes.md](../../../wiki/environments/hermes.md) — the authoritative Hermes config/frontmatter schema.
- [capabilities.md](capabilities.md) — the toolset composition + withhold these templates render.
- [macro-pm.md](macro-pm.md) — the resident-daemon wiring the macro placeholders feed.
- [verify.md](verify.md) — the format-checks that confirm these writes.
- [../STAGES.md](../STAGES.md) — the per-role rosters/capabilities/prose the placeholders draw from.
- [../setup.md](../setup.md) — step 5 (Write) consults this file.
