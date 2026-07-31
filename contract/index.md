# The shared adapter-contract core

> **This is loom's shared adapter-contract core** — the single home of everything an
> adapter would otherwise have to restate. It is what every adapter *implements*; it is
> **not itself an adapter** (see [ADR-013](../wiki/adr/adr-013-shared-adapter-contract-core.md)).
> The harness-agnostic entrypoint is the root [SETUP.md](../SETUP.md); the concrete
> per-harness implementation is an adapter under `adapters/<harness>/` (e.g.
> [`adapters/mirai/`](../adapters/mirai/setup.md)).

loom is content-only. It ships no fixed config to copy. Instead every adapter runs one
universal **setup contract** — *explore → interview → present & confirm → generate →
verify* — rendering loom's generic content into the target harness's native format. This
directory holds the **generic** half of that contract, written once. An adapter
**references** it and supplies only the four **port obligations** in [PORTS.md](PORTS.md);
it **MUST NOT restate** generic content it could link to
([ADR-013](../wiki/adr/adr-013-shared-adapter-contract-core.md) — reference, never copy).

## What the core provides

| Doc | Provides |
|---|---|
| [index.md](index.md) (this file) | The five-step setup contract, `init`/`update` semantics, universal safety rules |
| [primitives.md](primitives.md) | The six loom primitives + their generic content: stage groupings, skill rosters, capability-set-per-role, model archetypes |
| [interview.md](interview.md) | The generic, harness-agnostic interview questions |
| [discipline.md](discipline.md) | Provenance/idempotency discipline + the generic invariant-checks every adapter's verify step inherits |
| [PORTS.md](PORTS.md) | The **four named port obligations** an adapter MUST supply |

## The setup contract (five steps)

Both first-time setup (`init`) and later refreshes (`update`) run through the root
[SETUP.md](../SETUP.md) and the harness's adapter — there is no slash command and nothing
to clone; an agent reads the instructions (locally or remotely) and follows them. Every
adapter implements the same five steps:

1. **Explore** — read the project deeply (stack, build/test commands, existing agent
   config). Never ask what you can read.
2. **Interview** — grill the human one question at a time, always leading with a
   recommended default, to tailor which skills/agents/stages the project actually needs
   (the generic questions live in [interview.md](interview.md)). Do **not** skip this — a
   mechanical copy produces bloat and irrelevant triggers; the interview is what makes the
   result fit the project.
3. **Present & confirm** — show the full proposed config tree and wait for an explicit
   "go" before writing anything.
4. **Generate** — write the config in the **harness's native format** (the adapter's port
   docs define this exactly). First run = `init`; refreshing an existing loom setup =
   `update` (idempotent, patch in place, never duplicate).
5. **Verify** — run the generic invariant-checks in [discipline.md](discipline.md) plus the
   adapter's own format-checks before reporting done.

## `init` vs `update`

Both modes run the same five steps; the difference is scope and defaults:

|                | `init`                                   | `update`                                                              |
| -------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| Starting point | No prior loom config (or an empty one)   | Existing loom-authored config from a prior run                        |
| Explore focus  | Whole project from scratch               | Diff: what changed in loom **and** in the project since the last run  |
| Interview      | Full — every generic decision table      | Targeted — only decisions whose inputs changed                        |
| Write          | Create all files                         | **Patch in place** — never duplicate a file that already exists for the same purpose |

Drift detection for `update`: an `update` run is targeted (not full) when loom's own
`SKILLS/`, `workflows/sdlc/`, the `contract/`, or the adapter changed since the config was
last written **and** the project's own conventions (build/test commands, layout) are
unchanged. If the project's conventions changed, re-run the full interview for the
project-context file even in `update` mode. See the idempotency discipline in
[discipline.md](discipline.md).

## Universal safety rules

Harness-agnostic; doubly so for a live/production project. Every adapter honors these:

- **Never overwrite or delete existing files.** Edit only loom-owned sections (marked with
  the provenance comments defined in [discipline.md](discipline.md)); leave the human's own
  content untouched.
- **Leave pre-existing agent config from other tools alone** unless the human explicitly
  asks to migrate it.
- **Change zero application code, CI, or runtime config.** You only add files in the
  harness's customization location (the adapter says where).
- **Model matching: ask** for the human's available model list; don't guess model-name
  strings — confirm them against what the harness actually offers.
- **Recommend a fresh git branch** so the generated config lands in a reviewable diff, not
  directly on the main branch.

## Related

- [ADR-013](../wiki/adr/adr-013-shared-adapter-contract-core.md) — the decision this core records.
- [ADR-005](../wiki/adr/adr-005-harness-agnostic-setup.md) — the harness-agnostic entrypoint and setup contract this core gives a body to.
- [ADR-002](../wiki/adr/adr-002-workflow-as-adapter-seed.md) — the prose-first stance the ports honor (no schema/DSL).
- [SETUP.md](../SETUP.md) — the front door that routes to an adapter and points here for the generic body.
- [SPEC.md](../SPEC.md) — Setup contract conformance, including the four-port + reference-not-restate rule.
- [adapters/mirai/](../adapters/mirai/setup.md) — the first adapter to implement this contract.
