# Setting up loom

You're an AI coding agent, pointed at this file to wire loom's SDLC framework (skills,
agents, prompts, workflow) into a project. This file is the **harness-agnostic
entrypoint** — the whole bootstrap. A human shouldn't have to paste more than a link to it.

> One-line invite a human pastes into a fresh agent chat:
> *"Set up loom in this project by following <https://raw.githubusercontent.com/zentetsukenz/agent/main/SETUP.md> — use `curl` to read it and the files it points to, not WebFetch."*

loom is content-only. It does **not** ship a fixed config to copy. Instead you run a
universal **setup contract** — *explore → interview → generate harness-native config →
verify* — through the **adapter** for whatever **harness** the project uses. This file
picks the adapter; the adapter knows the harness's exact config format. The **generic body**
of that contract (the five steps, `init`/`update` semantics, the six primitives, skill
rosters, capability sets, model archetypes, interview questions, and invariant-checks) lives
once in the shared [`contract/`](contract/index.md) core; each adapter references it and
supplies only its four harness-specific [port obligations](contract/PORTS.md). See
[ADR-013](wiki/adr/adr-013-shared-adapter-contract-core.md) (the shared core),
[ADR-001](wiki/adr/adr-001-adapter-pattern.md) (adapter pattern) and
[ADR-002](wiki/adr/adr-002-workflow-as-adapter-seed.md) (why setup is interpreted, not baked).

## Step 0 — Identify the harness and its adapter

An **agent harness** is the tool the project's agent runs in (Mirai, Claude Code, Cursor,
Aider, OpenCode, …). Each harness stores customization differently, so loom ships one
**adapter** per supported harness — a module that knows that harness's native config
format and maps loom's generic content onto it.

1. Determine which harness you're running in (check your own environment; if unsure, ask
   the human).
2. Select its adapter from the table below. **If no adapter exists for the harness, stop
   and say so** — don't improvise a config in a format loom hasn't been taught. Adding a
   new harness means adding an adapter (see [ADR-001](wiki/adr/adr-001-adapter-pattern.md)),
   not stretching an existing one.

| Harness | Adapter entrypoint | Reference material |
| --- | --- | --- |
| **Mirai** (VS Code) | [`adapters/mirai/setup.md`](adapters/mirai/setup.md) | [wiki/environments/mirai.md](wiki/environments/mirai.md), [adapters/mirai/MAPPING.md](adapters/mirai/MAPPING.md), [adapters/mirai/STAGES.md](adapters/mirai/STAGES.md) |
| **OpenCode** (terminal) | [`adapters/opencode/setup.md`](adapters/opencode/setup.md) | [wiki/environments/opencode.md](wiki/environments/opencode.md), [adapters/opencode/MAPPING.md](adapters/opencode/MAPPING.md), [adapters/opencode/STAGES.md](adapters/opencode/STAGES.md), [adapters/opencode/references/omo.md](adapters/opencode/references/omo.md) |
| **Hermes** (Nous Research, resident) | [`adapters/hermes/setup.md`](adapters/hermes/setup.md) | [wiki/environments/hermes.md](wiki/environments/hermes.md), [adapters/hermes/MAPPING.md](adapters/hermes/MAPPING.md), [adapters/hermes/STAGES.md](adapters/hermes/STAGES.md), [adapters/hermes/references/macro-pm.md](adapters/hermes/references/macro-pm.md) |

## Step 1 — Get loom's files in front of you

- **If loom's files already exist in this workspace**, read them via the relative links above.
- **Otherwise** (the common case — a target project that doesn't vendor loom), fetch them
  with `curl` from loom's canonical repo (`https://github.com/zentetsukenz/agent`, branch
  `main`, raw base `https://raw.githubusercontent.com/zentetsukenz/agent/main/`).
  **Use `curl`, not WebFetch** — WebFetch summarizes and drops the exact frontmatter and
  formats the adapter must reproduce verbatim. Read your adapter's entrypoint first; it
  tells you which further files to fetch.

  (e.g. `curl -fsSL https://raw.githubusercontent.com/zentetsukenz/agent/main/adapters/mirai/setup.md`)

## Step 2 — Run the adapter's setup, following the contract

Both first-time setup (`init`) and later refreshes (`update`) run **through this file and
its adapter** — there is no slash command to invoke and nothing to clone; an agent just
reads these instructions (locally or remotely) and follows them. Follow the adapter
entrypoint exactly. Every adapter implements the same **setup contract**, whose generic body
and the four port obligations an adapter must supply live in the shared
[`contract/`](contract/index.md) core (read [`contract/index.md`](contract/index.md) for the
full body and [`contract/PORTS.md`](contract/PORTS.md) for the obligations). The five steps:

1. **Explore** — read the project deeply (stack, build/test commands, existing agent
   config). Never ask what you can read.
2. **Interview** — grill the human one question at a time, always leading with a
   recommended default, to tailor which skills/agents/stages the project actually needs.
   Do **not** skip this — a mechanical copy produces bloat and irrelevant triggers; the
   interview is what makes the result fit the project.
3. **Present & confirm** — show the full proposed config tree and wait for an explicit
   "go" before writing anything.
4. **Generate** — write the config in the **harness's native format** (the adapter defines
   this exactly). First run = `init`; refreshing an existing loom setup = `update`
   (idempotent, patch in place, never duplicate).
5. **Verify** — run the adapter's verification checklist before reporting done.

## Universal safety rules (harness-agnostic; doubly so for a live/production project)

- **Never overwrite or delete existing files.** Edit only loom-owned sections (adapters
  mark these with provenance comments); leave the human's own content untouched.
- **Leave pre-existing agent config from other tools alone** unless the human explicitly
  asks to migrate it.
- **Change zero application code, CI, or runtime config.** You only add files in the
  harness's customization location (the adapter says where).
- **Model matching: ask** for the human's available model list; don't guess model-name
  strings — confirm them against what the harness actually offers.
- **Recommend a fresh git branch** so the generated config lands in a reviewable diff, not
  directly on the main branch.

## No adapter for your harness?

Then loom can't set it up yet — say so plainly rather than improvising a config in an
unsupported format. Supporting a new harness is a first-class contribution: a new adapter
under `adapters/<harness>/` plus its setup entrypoint, implementing the contract above.
See [ADR-001](wiki/adr/adr-001-adapter-pattern.md).
</content>
