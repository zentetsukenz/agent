# Setup loom for Hermes — the Hermes adapter

> **This is loom's Hermes adapter** — the third implementation of the harness-agnostic setup
> contract, and the **first resident-archetype** adapter
> ([harness-archetypes](../../wiki/patterns/harness-archetypes.md)). Unlike Mirai and OpenCode
> (per-invocation harnesses that compile the **terminating** [SDLC](../../workflows/sdlc/index.md)
> lifecycle), Hermes is a **resident** harness that compiles the **reactive**
> [macro-PM](../../workflows/macro-pm/index.md) lifecycle: it renders a resident project-management
> agent that charts many efforts and **dispatches SDLC runs down into a *different*,
> headless-dispatchable harness** (e.g. OpenCode). It does **not** render its own SDLC stage agents.
> See [ADR-019](../../wiki/adr/adr-019-loom-hermes-setup.md) for why this adapter is shaped this way,
> and [ADR-018](../../wiki/adr/adr-018-macro-project-management.md) for the macro-PM decision.
>
> The generic contract body (five steps, `init`/`update`, universal safety, the six primitives,
> interview questions, provenance/idempotency, invariant-checks) lives **once** in the shared
> [`contract/`](../../contract/index.md) core — this file **references** it and never restates it
> ([ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md)). This adapter supplies only
> Hermes's **four port answers** (see [MAPPING.md](MAPPING.md), [STAGES.md](STAGES.md),
> [references/](references/write-format.md)) plus the macro-PM binding
> ([references/macro-pm.md](references/macro-pm.md)). See
> [ADR-005](../../wiki/adr/adr-005-harness-agnostic-setup.md) (harness-agnostic contract) and
> [ADR-001](../../wiki/adr/adr-001-adapter-pattern.md) (a new harness = a new adapter).
>
> **Read remotely — do not clone loom.** An agent runs this by *reading* these instructions plus
> the `contract/` core and the Hermes references, either from a local loom checkout or straight
> from the canonical repo (e.g. `curl` the raw files — both the adapter files **and** the
> `contract/` files). There is **no command to invoke**; reading and following this file (in
> `init` or `update` mode) is the whole mechanism.

## What this adapter renders (and what it does not)

Hermes compiles the **[macro-PM reactive lifecycle](../../workflows/macro-pm/index.md)**, so it is a
**thin macro-only** adapter. It renders exactly four things:

1. The **resident PM agent** — a Hermes profile (`config.yaml` + `SOUL.md`) that runs
   [wayfinder macro mode](../../SKILLS/planning/wayfinder/SKILL.md#macro-mode-dispatching-into-sdlc-runs)
   as a `cron` tick behind a `gateway`.
2. The **board wiring** — the chosen networked tracker over an `mcp-<tracker>` toolset.
3. The **two label vocabularies** provisioned on the tracker (`wayfinder:*` down, `sdlc:*` up).
4. The **altitude-seam translator** — how a buildable leaf is dispatched down and how `sdlc:*`
   returns are integrated.

It does **NOT** render loom's SDLC stage agents (Shaping / Planner / Orchestrator / Verifier /
`quick` / `deep` / `frontend` / `visual-qa`). Under the resident archetype those are **dispatched
down into a separate per-invocation harness**, not rendered here. If the project has no such
harness configured, macro mode has nowhere to dispatch — see
[dispatch target](references/macro-pm.md#the-micro-dispatch-target) — and the setup surfaces that
as a prerequisite.

## Trigger

Follow this adapter when the user wants to:

- Stand up loom's **macro project-management** layer on Hermes — the resident agent that charts many
  efforts and dispatches them into SDLC runs (`init`), or
- Refresh/patch an existing loom-authored Hermes resident profile after loom or the project changed
  (`update`).

Do **not** use it for: running an SDLC *within* Hermes (Hermes dispatches SDLC to a per-invocation
harness — set that harness up with its own adapter), writing a single ad-hoc profile/skill (edit
directly), or a different target harness ([ADR-001](../../wiki/adr/adr-001-adapter-pattern.md)).

## The contract (generic — read the core)

This adapter runs the universal five-step setup contract. **Read the generic body from the core,
don't re-derive it:**

- **The five steps + `init`/`update` semantics + universal safety rules** — [contract/index.md](../../contract/index.md).
- **The six primitives + model archetypes** — [contract/primitives.md](../../contract/primitives.md) (Hermes renders only the resident-agent subset — see above).
- **The interview questions** — [contract/interview.md](../../contract/interview.md); the load-bearing one for Hermes is **macro PM §4f** (source of truth, label provisioning, and the micro dispatch-target choice).
- **Provenance/idempotency discipline + the generic invariant-checks** — [contract/discipline.md](../../contract/discipline.md).

The interview engine is loom's [grill-with-docs](../../SKILLS/discovery/grill-with-docs/SKILL.md)
skill — one question at a time, always leading with the recommended default.

`init` vs `update` for Hermes: if invoked with no clear signal, check whether a loom-authored
resident profile already exists (a `wayfinder-macro` profile `SOUL.md` carrying the loom provenance
marker) — if so, this is an `update`; otherwise `init`. Drift detection: see
[contract/index.md](../../contract/index.md).

## Hermes's four port answers (the adapter's job)

Everything Hermes-specific is one of the four [port obligations](../../contract/PORTS.md):

| Port | Hermes answer |
|---|---|
| **`capability→tool`** | [references/capabilities.md](references/capabilities.md) + [MAPPING.md §6](MAPPING.md#6-capability--hermes-tool-mapping) — capability → Hermes tool / toolset; **withhold = compose the profile's `toolsets:` + disable individual tools**. The resident agent holds `mcp-<tracker>` (board), `delegation` (dispatch a leaf), `clarify` (HITL), `cronjob` (its own schedule), and `memory` (**its own relational continuity only, never project state**). It does **not** hold `file` write — it routes and translates, it does not build. |
| **`archetype→model`** | [MAPPING.md §5](MAPPING.md#5-model-archetype-render-target) — the resident agent's `model.default` + a `model.fallback_providers:` array (the fallback-array discipline is native). |
| **`seam-obligation→wiring`** | [references/macro-pm.md](references/macro-pm.md) — the **macro** board is the chosen networked tracker over MCP; the **micro** ledger is a **shared, on-disk, gitignored** substrate the *dispatched* harness also reads (Hermes memory cannot cross a harness boundary — [ADR-019](../../wiki/adr/adr-019-loom-hermes-setup.md)). The resident daemon (`gateway` + `cron`) is the altitude-seam translator/router. |
| **`primitive→file` manifest** | The [harness manifest](#harness-manifest) below + [MAPPING.md](MAPPING.md); format-checks in [references/verify.md](references/verify.md). |

## Procedure

Run the five steps from [contract/index.md](../../contract/index.md). Hermes specifics per step:

1. **Explore** — read the target's `AGENTS.md`/`.hermes.md`/`HERMES.md`/`CLAUDE.md`, the user's
   `~/.hermes/config.yaml` shape (models/providers, toolsets, gateway/cron state), **which
   per-invocation harness the project uses for SDLC runs** (the dispatch target), and any existing
   loom-authored resident profile. For `update`, diff against what this adapter last wrote.
2. **Interview** — walk [contract/interview.md](../../contract/interview.md) via grill-with-docs,
   then fold in Hermes's resolution steps ([references/interview.md](references/interview.md)): the
   resident agent's **provider/model**, and — the load-bearing part — **macro PM §4f**: the macro
   **source of truth** (networked tracker), **gauge-fit + label provisioning**, and the **micro
   dispatch target** (which headless-dispatchable harness runs the SDLC runs, expressed as *prose*,
   never a hardcoded command).
3. **Present** the proposed resident profile + `AGENTS.md` section + the resident-daemon wiring
   (paths only, one section at a time) with a one-line rationale per file.
4. **Confirm** — wait for explicit user "go"; adjust and re-present on pushback.
5. **Write** in Hermes's exact format — consult [references/write-format.md](references/write-format.md)
   and [references/macro-pm.md](references/macro-pm.md). Never invent config fields.
6. **Verify** — run the generic invariant-checks ([contract/discipline.md](../../contract/discipline.md))
   **plus** Hermes's format-checks ([references/verify.md](references/verify.md)).
7. **Done** — report created vs. patched paths, which tracker labels were provisioned, and the
   named micro dispatch target.

## Harness manifest

Hermes's answers to the `primitive→file` manifest ([port 4](../../contract/PORTS.md)):

| Primitive | Native name / format | Output location |
|---|---|---|
| resident agent | a **profile** — `config.yaml` (`model` + `toolsets`) + `SOUL.md` (macro-mode prose + one-source-of-truth discipline) | `<profile-root>/` (the `wayfinder-macro` profile) |
| skill | `SKILL.md`, YAML frontmatter, `name` **must equal** folder | `<profile>/skills/<slug>/` (the macro-PM / wayfinder skills the resident agent loads) |
| protocol doc (GAP) | committed Markdown, referenced from `AGENTS.md` (no description-triggered instruction primitive) | `.loom/handoffs/protocol.md` — its **macro section** names the source of truth |
| project-context | project-root `AGENTS.md` (native) | project root |

- **No SDLC stage-agent or utility profiles** are rendered — those live in the dispatched
  per-invocation harness ([STAGES.md](STAGES.md) documents this absence).
- **Invocation surface inverts** ([ADR-012](../../wiki/adr/adr-012-invocation-surface.md) as a port
  answer, [ADR-019](../../wiki/adr/adr-019-loom-hermes-setup.md)): the resident agent is the **sole
  `front-door`** (it has the `gateway` and receives human messages); there are no local `dispatched`
  stage agents. See [references/write-format.md](references/write-format.md#role-invocation-surface).
- **Withhold mechanism**: the resident agent has no `file` write toolset at all — routing and
  translating never edit code. See [references/capabilities.md](references/capabilities.md).
- **Templates**: [assets/templates/](assets/templates/profile.config.yaml.template) — fill the
  placeholders, don't restate them inline.
- **Delivery shape**: a **profile distribution** (a git repo the user installs with
  `hermes profile install`) plus the project's `AGENTS.md` — see
  [references/write-format.md](references/write-format.md#delivery-shape).
- Authoritative Hermes reference: [wiki/environments/hermes.md](../../wiki/environments/hermes.md).

**The setup instruction itself is not copied** into a target project — this file *writes* the
resident profile; it is not content that ships inside it.

## Output

- A loom **profile distribution** (git repo): the **`wayfinder-macro` resident profile**
  (`config.yaml` + `SOUL.md` + the macro-PM / wayfinder skills) with a `gateway` + `cron` job.
- A project-root `AGENTS.md` with a loom-owned section pointing at the committed
  `.loom/handoffs/protocol.md` (whose macro section names the source of truth), and the **gitignored**
  micro-ledger location the dispatched harness shares.
- The provisioned `wayfinder:*`/`sdlc:*` labels on the chosen networked tracker.
- The named **micro dispatch target** recorded in the protocol document.
- A short report of created vs. patched paths.

## Related

- [workflows/macro-pm](../../workflows/macro-pm/index.md) — the reactive lifecycle this adapter compiles.
- [ADR-019](../../wiki/adr/adr-019-loom-hermes-setup.md) — why this adapter is thin-macro and dispatches out.
- [ADR-018](../../wiki/adr/adr-018-macro-project-management.md) — the macro-PM decision.
- [harness-archetypes](../../wiki/patterns/harness-archetypes.md) — the resident vs per-invocation taxonomy.
- [contract/index.md](../../contract/index.md), [contract/PORTS.md](../../contract/PORTS.md) — the generic contract + four obligations.
- [MAPPING.md](MAPPING.md), [STAGES.md](STAGES.md), [references/macro-pm.md](references/macro-pm.md) — Hermes's concrete port answers + the resident-daemon binding.
- [wiki/environments/hermes.md](../../wiki/environments/hermes.md) — Hermes primitive reference.
- [adapters/opencode/setup.md](../opencode/setup.md) — a per-invocation adapter (a valid micro dispatch target).
- [SETUP.md](../../SETUP.md) — the harness-agnostic entrypoint that routes here.
