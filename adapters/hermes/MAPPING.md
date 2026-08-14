# loom → Hermes Mapping

> **Hermes's answers to the four [port obligations](../../contract/PORTS.md).** The generic
> content — the SKILLS→skills copy rule, model archetypes, capability vocabulary, protocol
> obligation — lives once in the shared [`contract/`](../../contract/index.md) core; this file
> **references** it and states only the Hermes-specific render bindings
> ([ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md)). See
> [wiki/environments/hermes.md](../../wiki/environments/hermes.md) for Hermes's primitives.
>
> **Thin-macro scope** ([ADR-019](../../wiki/adr/adr-019-loom-hermes-setup.md)): Hermes is a
> **resident** adapter that renders exactly **one** profile — the `wayfinder-macro` resident agent —
> and dispatches SDLC runs **down** into a separate per-invocation harness. It renders **no** SDLC
> stage or utility profiles; §2–§3 below record that absence (the roster lives in the
> [dispatch target](references/macro-pm.md#the-micro-dispatch-target), see [STAGES.md](STAGES.md)).

The four ports (all defined generically in [contract/PORTS.md](../../contract/PORTS.md)):

| Port | Section |
|---|---|
| `primitive→file` manifest (skill, resident profile) | §1 (macro skills), §2–§3 (no stage/utility profiles — absence), §4 (AGENTS.md), and the [manifest in setup.md](setup.md#harness-manifest) |
| `archetype→model` | §5 |
| `capability→tool` | §6 |
| `seam-obligation→wiring` | §7 |

## The one shape difference: Hermes is profile-home-centric

Mirai and OpenCode write a **project-local** config dir (`.mirai/`, `.opencode/`). Hermes keeps
agent state in a **profile home** (`~/.hermes/` or `~/.hermes/profiles/<name>/`), and a "named
agent" is a [**profile**](../../wiki/environments/hermes.md#profiles) — its own `config.yaml`
(model + toolsets), `SOUL.md` (persona/system prompt), memory, and skills. loom therefore renders
a **stage/utility agent as a profile**, and delivers the whole set as a git-committable
[profile distribution](../../wiki/environments/hermes.md#profile-distributions) plus the project's
`AGENTS.md` (the only project-local file). This is the harness-native way to keep the generated
config in a reviewable diff (the universal safety rule) — see
[references/write-format.md §delivery-shape](references/write-format.md#delivery-shape).

## 1. skill primitive → `<profile>/skills/<slug>/`

Every loom skill a project adopts is copied (and lightly tailored during the interview) from
`SKILLS/<bucket>/<slug>/SKILL.md`. **The copy/tailor rule itself is generic** — see
[contract/primitives.md](../../contract/primitives.md#the-six-primitives-the-core-renders) and the
[skill copy rules](references/write-format.md#skill-copy-rules). Hermes-specific render bindings
only:

| loom source | Hermes target | Hermes rule |
|---|---|---|
| `SKILLS/<bucket>/<slug>/SKILL.md` | `<profile>/skills/<slug>/SKILL.md` | `name` in frontmatter **must equal** `<slug>` — Hermes/agentskills.io requirement (already enforced by loom). `SKILL.md` filename verbatim. |
| `SKILLS/<bucket>/<slug>/references/*` · `scripts/*` · `assets/*` | `<profile>/skills/<slug>/…` | Copied verbatim, one level deep (Hermes's progressive-loading model, same as agentskills.io). |
| `SKILLS/meta/*` referenced by an adopted skill | `<profile>/skills/<slug>/` | Copied alongside the referencing skill so relative links resolve. |

- Skills live either **per-profile** (`~/.hermes/profiles/<name>/skills/`, the loom default so a
  role's roster travels with its profile in the distribution) or **globally**
  (`~/.hermes/skills/`, shared across profiles). loom writes them **into the profile distribution**
  so `hermes profile install` carries them.
- **Unknown frontmatter fields are ignored by Hermes** — loom's skill frontmatter
  (`argument-hint`, `user-invocable`, `disable-model-invocation`) copies in as-is; Hermes reads
  `name` + `description` (+ its own optional `metadata.hermes.*`) and ignores the rest.
- **The setup instruction itself is not copied** — `setup.md` *writes* the profiles/skills, it is
  not content that ships inside them.

## 2. stage-agent + stage-prompt primitives → **not rendered** (dispatched down)

The stage groupings and the two-tier model are **generic**
([contract/primitives.md](../../contract/primitives.md#stage-groupings-six-phases--three-stages)) —
but under the resident thin-macro archetype **Hermes renders none of them**. The SDLC stages
(Shaping / Planner / Orchestrator / Verifier and the quick/deep tiers) are the **terminating**
lifecycle, compiled by a **per-invocation** harness ([harness-archetypes](../../wiki/patterns/harness-archetypes.md)).
Hermes dispatches a buildable leaf **down** into that separate harness (the
[micro dispatch target](references/macro-pm.md#the-micro-dispatch-target)); it does not host the
stages itself. See [STAGES.md](STAGES.md) for the full rationale of this absence, and the
[OpenCode adapter](../opencode/setup.md) for an example harness that *does* render them.

## 3. utility agents → **not rendered** (dispatched down)

Likewise, the utility roster (`explore`/`quick`/`deep`/`verifier`/`writing`) and the
domain-specialized utilities (`frontend`/`visual-qa`) belong to the SDLC lifecycle and are rendered
by the **dispatch-target** harness, not Hermes. The one exception is the **`research` subagent** the
resident agent spawns directly for `wayfinder:research` tickets — that uses the native
`delegate_task` tool ([§6](#6-capability--hermes-tool-mapping),
[wiki/environments/hermes.md §delegation](../../wiki/environments/hermes.md#delegation--subagents)),
resolving a decision at the macro altitude without descending into an SDLC run.

## 4. project-context primitive → `AGENTS.md`

The role of the always-on context file (per-project conventions, **not** workflow steering) is
generic — see [contract/interview.md](../../contract/interview.md#project-context--instruction-file).
Hermes render binding: it is project-root **`AGENTS.md`** (Hermes reads it natively; its priority
order is `.hermes.md`/`HERMES.md` → `AGENTS.md` → `CLAUDE.md` → `.cursorrules`, first match wins —
loom writes `AGENTS.md` unless the project already uses `.hermes.md`, in which case loom edits its
own section there). `SOUL.md` is the agent's **persona**, not project context — loom writes role
stance into each profile's `SOUL.md`, and project conventions into `AGENTS.md`. Written at `init`,
kept current by `update`. loom edits only its provenance-marked section, never the human's content.

## 5. Model-archetype render target

The three archetypes + working styles + role→archetype assignment are **generic**
([contract/primitives.md](../../contract/primitives.md#the-model-archetypes)). Hermes's answer to
the [`archetype→model` port](../../contract/PORTS.md#port-2--archetypemodel):

**Render target = each profile's `config.yaml` `model.default` (a `provider/model` string) plus a
`model.fallback_providers:` array.** Hermes has a native fallback-array mechanism, so loom's
fallback-array discipline maps directly:

```yaml
# <profile>/config.yaml
model:
  default: "anthropic/claude-sonnet-4"        # the archetype-matched model
  fallback_providers:
    - provider: openrouter
      model: google/gemini-2.5-flash          # a fallback so a deprecation doesn't break the role
```

Exact model-name strings are project/subscription-specific: collect them in the interview
([contract/interview.md §3](../../contract/interview.md#3-model-matching)) and confirm against the
user's actual Hermes providers (`hermes model` / their `providers:` block) — **never hardcode a
guessed string**. Under the thin-macro adapter there is only **one** profile to resolve — the
resident `wayfinder-macro` agent (a coordinator archetype: strong reasoning for routing/translation,
no code generation). Its extended-thinking variant is set via `model.default` +
`agent.reasoning_effort` (a Hermes knob) if the user wants deeper routing deliberation.

## 6. Capability → Hermes tool mapping

The capability vocabulary + the "discover, don't guess" discipline are **generic**
([contract/primitives.md](../../contract/primitives.md)). Hermes's answer to the
[`capability→tool` port](../../contract/PORTS.md#port-1--capabilitytool) — full detail in
[references/capabilities.md](references/capabilities.md):

| Capability | Hermes tool(s) | Toolset | Notes |
|---|---|---|---|
| `read` | `read_file` | `file` | stable |
| `edit` | `write_file`, `patch` | `file` | stable — **the withheld one for read-only roles** |
| `search` | `search_files` | `file` | ripgrep-backed; shares the `file` toolset with `read`/`edit` |
| `shell` | `terminal`, `process` | `terminal` | stable |
| `delegate` | `delegate_task` | `delegation` | dispatch a buildable leaf **down** into the [micro dispatch target](references/macro-pm.md#the-micro-dispatch-target); spawn the `research` subagent |
| `web` | `web_search`, `web_extract` | `web` | stable |
| `tasks` | `todo` | `todo` | stable |
| `persist` | `memory` | `memory` | **native** — the resident agent's own relational continuity **only** (never project state, never the micro ledger — §7). |
| `interview` | `clarify` | `clarify` | **native** — no discovery needed |
| `docs-lookup` | `mcp-<server>/*` | dynamic | **opt-in** ([ADR-007](../../wiki/adr/adr-007-docs-lookup-capability.md)); each MCP server yields an `mcp-<server>` toolset |

**Withhold mechanism (Hermes) — the load-bearing forcing function.** Hermes toolsets are
whole-group bundles (`file` bundles `read_file`+`write_file`+`patch`+`search_files`), so a role is
scoped by **two levers together**:

1. **Compose the profile's `toolsets:`** — grant only the toolsets the role needs (a role with no
   `delegation` toolset cannot spawn subagents).
2. **Disable individual tools** where a toolset is needed for *part* of its contents — the
   `hermes tools` UI (persisted to `config.yaml`) operates *finer than toolsets* and filters a tool
   out even if its toolset is enabled. This is how a read-only role keeps `read_file`/`search_files`
   but loses `write_file`/`patch`: grant `file`, **disable `write_file` and `patch`**.

The withheld capability is load-bearing — a role that cannot call `write_file`/`patch` cannot write
code, and that is the point ([ADR-006](../../wiki/adr/adr-006-capability-based-roles.md)). The exact
config key for the per-tool disable is **discovered/confirmed at setup** against the user's Hermes
version (same discipline as model-name strings) — see
[references/capabilities.md §withhold](references/capabilities.md#the-withhold-mechanism). `agent.disabled_toolsets`
is the global whole-toolset off-switch; per-role withholds live in the profile.

## 7. Communication protocol document → the two altitude ledgers

The seam-artifact protocol obligation (ledger, manifest, PRODUCE/DISCOVER, mandatory at the two
stage seams) is **generic**
([contract/primitives.md](../../contract/primitives.md#the-communication-protocol-document-cross-stage),
[ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md)). Per
[ADR-018](../../wiki/adr/adr-018-macro-project-management.md) the substrate is **altitude-scoped**,
and Hermes answers each altitude differently:

| Generic obligation | Hermes wiring |
|---|---|
| Communication protocol document | Committed `.loom/handoffs/protocol.md`, referenced from the loom-owned section of `AGENTS.md` (Hermes has **no description-triggered instruction** primitive — the GAP is the same as OpenCode; always-on `AGENTS.md` context is the mechanism). Its **macro section** names the source of truth and the named micro dispatch target. |
| **Macro** board (the resident lifecycle) → networked substrate | The chosen **networked tracker** (default: GitHub Issues+Projects; also Notion/Linear) reached over Hermes **MCP** (`mcp-<tracker>` toolset). Distributes across servers/agents ([ADR-018](../../wiki/adr/adr-018-macro-project-management.md)), and its native labels carry the `wayfinder:*`/`sdlc:*` vocabularies. Full binding: [references/macro-pm.md](references/macro-pm.md). |
| **Micro** [ledger](../../wiki/glossary/index.md#ledger) (SDLC inner loop) → cross-harness substrate | A **shared, on-disk, gitignored** directory (e.g. `.loom/handoffs/`). It **cannot** be Hermes `memory`: the SDLC run executes in a *separate* [dispatch-target harness](references/macro-pm.md#the-micro-dispatch-target), and memory is intra-harness — only on-disk files cross the boundary. Gitignored because ephemeral coordination is never version-controlled ([ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md) Option A; durable knowledge → wiki). Hermes `memory` holds the resident agent's continuity only, never this ledger. |
| Ledger manifest | `<ledger-root>/index.md` in the shared on-disk directory — seeded empty at setup; the dispatched harness's producers register rows. |
| PRODUCE / DISCOVER handoff | The resident agent translates a leaf ticket into a `shaping/` seam artifact in the shared ledger (PRODUCE at the seam), then dispatches the run; the dispatch-target harness DISCOVERs it at its entry gate and, at exit, PRODUCEs `delivery/<milestone>/verified-change`, which the resident agent reads to update the board. The crossing is the [altitude seam](../../wiki/glossary/index.md#altitude-seam) — see [references/macro-pm.md](references/macro-pm.md#the-altitude-seam--the-translator). |

The protocol document is **always generated**; only its macro substrate + the micro-ledger path are
user choices (the micro ledger is always shared-on-disk gitignored — no substrate choice). The
**macro section + one-source-of-truth invariant** (exactly one registered tracker for project
state) is added when macro PM is chosen — see
[seam-artifact-protocol](../../wiki/patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant)
and [references/macro-pm.md](references/macro-pm.md). Template:
[assets/templates/handoff.md.template](assets/templates/handoff.md.template).

## Related

- [contract/PORTS.md](../../contract/PORTS.md) — the four obligations this file answers for Hermes.
- [contract/primitives.md](../../contract/primitives.md) — the generic primitives/rosters/archetypes referenced above.
- [ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md) — the shared-core split (reference, never restate).
- [ADR-019](../../wiki/adr/adr-019-loom-hermes-setup.md) — the resident thin-macro shape (why §2–§3 render nothing).
- [ADR-018](../../wiki/adr/adr-018-macro-project-management.md) — the altitude-scoped substrate (§7) and the macro binding.
- [ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md) — the seam-artifact handoff protocol (§7).
- [ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md) — Option A: the micro ledger is always gitignored (§7).
- [ADR-006](../../wiki/adr/adr-006-capability-based-roles.md) — capability-based role discipline (§6).
- [ADR-007](../../wiki/adr/adr-007-docs-lookup-capability.md) — the optional `docs-lookup` capability.
- [harness-archetypes](../../wiki/patterns/harness-archetypes.md) — resident vs per-invocation (why the SDLC roster lives in the dispatch target).
- [wiki/environments/hermes.md](../../wiki/environments/hermes.md) — Hermes primitive reference.
- [references/capabilities.md](references/capabilities.md) — full capability→tool mapping + the withhold.
- [references/macro-pm.md](references/macro-pm.md) — the resident-daemon / altitude-seam binding + the micro dispatch target.
- [STAGES.md](STAGES.md) — why Hermes renders no SDLC stage/utility roster (the dispatch target does).
- [setup.md](setup.md) — the Hermes adapter setup instruction that reads this file.
