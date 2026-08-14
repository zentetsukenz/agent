# Hermes verify — format-checks

> The verify step (setup contract step 5) splits along the generic/specific seam
> ([ADR-013](../../../wiki/adr/adr-013-shared-adapter-contract-core.md)). **Run the generic
> invariant-checks first** — capability withholding, invocation surface, handoff PRODUCE/DISCOVER,
> and structure — from the core:
> [contract/discipline.md](../../../contract/discipline.md#generic-invariant-checks-the-verify-step-generic-half).
> Those verify *loom's* invariants independent of any harness. **This file adds the Hermes
> format-checks** that complete the [`primitive→file` port](../../../contract/PORTS.md#port-4--the-primitivefile-manifest).
> Both halves are a *manual* checklist the writing agent walks; they complement the repo-level
> `scripts/validate.sh` (which link-checks framework docs, and — via `validate_hermes_config` —
> a committed `agent/.hermes/` in loom's own repo, not an arbitrary target).

## Frontmatter & structure (Hermes format)

- [ ] Every written `skills/<slug>/SKILL.md` opens with `---`/`---` YAML frontmatter and has
      non-empty `name` + `description`; the file is named `SKILL.md`.
- [ ] Every skill `name` field equals its folder name exactly (kebab-case, lowercase) — the
      agentskills.io / Hermes requirement.
- [ ] Every profile has a `config.yaml` (valid YAML) and a non-empty `SOUL.md`.
- [ ] `config.yaml` `model.default` is a `provider/model` string (never a bare name), confirmed
      against the user's providers; `model.fallback_providers:` has at least one entry.
- [ ] No leftover `{{PLACEHOLDER}}` tokens in any written file.
- [ ] No file was duplicated for the same purpose (check the loom provenance markers from
      [write-format.md](write-format.md#provenance-marking-for-idempotent-patching) — a patch should
      have replaced, not appended). *(Generic idempotency discipline:
      [contract/discipline.md](../../../contract/discipline.md#idempotency-rule).)*

## Capability / invocation rendering (Hermes)

> The *invariant* (which roles withhold `edit`, which surface is `front-door` vs `dispatched`) is
> checked generically in
> [contract/discipline.md](../../../contract/discipline.md#generic-invariant-checks-the-verify-step-generic-half).
> These checks confirm the invariant was **rendered correctly into Hermes config**. Under the
> thin-macro adapter there is exactly **one** rendered profile — the resident `wayfinder-macro`
> agent; no SDLC stage or utility profiles ([STAGES.md](../STAGES.md)).

- [ ] The resident `wayfinder-macro` role keeps the `file` toolset for `read_file`/`search_files`
      but has **`write_file` + `patch` disabled** at the tool level (the version-confirmed per-tool
      key) — it routes and translates, it does not build (the load-bearing no-code-edit withhold).
- [ ] The resident role carries the `delegation` toolset (to dispatch a buildable leaf **down** into
      the micro dispatch target and to spawn the `research` subagent).
- [ ] The resident role carries the `clarify` toolset (for `wayfinder:grilling`/`prototype` HITL
      tickets over the gateway).
- [ ] The resident role carries the `memory` toolset for **its own relational continuity only** — it
      is **not** the micro ledger (that is the shared on-disk substrate, below).
- [ ] `docs-lookup` (an `mcp-<server>` toolset) appears **only** if the interview opted in;
      otherwise the keyless `web` toolset covers research (no MCP entry).
- [ ] There is **no** SDLC stage or utility profile rendered into this distribution, and no leftover
      `gateway`/`cron` from an older (b)-shaped run on any non-resident profile.

## Handoff wiring (the two-altitude ledger)

- [ ] `.loom/handoffs/protocol.md` exists; its **macro section** names exactly **one** registered
      source of truth, and it records the **named micro dispatch target** (the per-invocation
      harness) plus the **shared on-disk, gitignored** micro-ledger path.
- [ ] `AGENTS.md`'s loom-owned section references `.loom/handoffs/protocol.md` (always-on context —
      Hermes has no description-triggered instruction).
- [ ] The micro ledger directory is **gitignored** (ephemeral coordination is never
      version-controlled — [ADR-014](../../../wiki/adr/adr-014-loom-opencode-setup.md) Option A) and
      is a plain on-disk path both harnesses can read (never Hermes `memory`).

## Macro PM wiring (the whole point of this adapter)

- [ ] The macro source of truth is a **networked tracker** (over `mcp-<tracker>`) — or, if the user
      chose the local Kanban, `kanban.auto_decompose: false` is set so routing stays the mechanical
      wayfinder table, and the single-host limitation was flagged.
- [ ] The `wayfinder:*` + `sdlc:*` labels were provisioned on the tracker (or an existing scheme was
      mapped and recorded in the macro section).
- [ ] A `wayfinder-macro` profile exists with the `mcp-<tracker>`, `memory`, `clarify`,
      `delegation`, and `cronjob` toolsets, **no `file` write**, a `gateway`, and a `cron` job on
      the chosen interval.
- [ ] The `wayfinder-macro` `SOUL.md` carries the one-source-of-truth directive (private memory =
      persona/continuity only, never project state) and routes **mechanically** (label+status), not
      by judgment.
- [ ] A **micro dispatch target** is configured and named; if none exists, setup flagged it as a
      prerequisite rather than rendering SDLC agents into Hermes.
- [ ] The macro section of `.loom/handoffs/protocol.md` names exactly **one** registered tracker;
      the local Kanban board is not used for project state alongside an external tracker.

## Model layer (Hermes)

- [ ] Every profile's `config.yaml` carries a `model.default` in `provider/model` format + a
      `model.fallback_providers:` array, confirmed against the user's actual providers; no guessed
      strings.

## Report

Follow the generic [report guidance](../../../contract/discipline.md#report-after-the-checklist-passes):
created vs. patched paths (two short lists), anything deferred, and any check that failed and how it
was resolved — or, if unresolved, flagged to the user explicitly rather than silently shipped. For
macro PM, also report which tracker labels were provisioned.

## Related

- [contract/discipline.md](../../../contract/discipline.md) — the generic invariant-checks to run first.
- [write-format.md](write-format.md) — the Hermes write mechanics these checks verify.
- [capabilities.md](capabilities.md) — the toolset withholds these checks assert.
- [macro-pm.md](macro-pm.md) — the resident-daemon wiring the macro checks verify.
- [../setup.md](../setup.md) — step 6 runs the generic checks then these format-checks.
