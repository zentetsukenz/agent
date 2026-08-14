# Hermes interview resolution steps

> The **generic interview questions** (Scope, delivery tiers, model matching, utility agents,
> docs-lookup, handoff / communication protocol, quality baseline, macro PM §4f) are
> harness-agnostic and live once in the core: [contract/interview.md](../../../contract/interview.md).
> Walk them via [grill-with-docs](../../../SKILLS/discovery/grill-with-docs/SKILL.md) — one question
> at a time, leading with the recommended default. This file adds only the **Hermes-specific
> resolution steps** that fold into that same interview pass
> ([ADR-013](../../../wiki/adr/adr-013-shared-adapter-contract-core.md)).

## Model format resolution (Hermes)

Not a preference — a resolution step for the [`archetype→model` port](../../../contract/PORTS.md#port-2--archetypemodel).
loom collects the user's available model list in the generic Model Matching question
([contract/interview.md §3](../../../contract/interview.md#3-model-matching)); Hermes then needs each
written in its **`provider/model`** string form (e.g. `anthropic/claude-sonnet-4`,
`openrouter/google/gemini-2.5-flash`) in the profile's `config.yaml` `model.default`, plus a
`model.fallback_providers:` array entry. Confirm the exact provider + model against the user's
Hermes providers (`hermes model` / their `providers:` block) — never emit a bare or guessed name.

## The per-tool withhold key (Hermes) — a resolution step

The load-bearing no-code-edit withhold ([capabilities.md](capabilities.md#the-withhold-mechanism))
disables `write_file` + `patch` at the tool level for read-only roles. Hermes persists
`hermes tools` selections into `config.yaml` under a platform-tool block whose **exact key is
version-specific**. Resolve it at interview/Write time by reading the user's existing `config.yaml`
or inspecting `hermes tools`/`hermes config` output — do **not** hardcode a key that may have
drifted. See [write-format.md §the-per-tool-withhold](write-format.md#the-per-tool-withhold) for the
fallback if the running version can't disable an individual tool.

## Micro ledger substrate (Hermes) — no choice: shared on-disk, gitignored

A resolution step for the [`seam-obligation→wiring` port](../../../contract/PORTS.md#port-3--seam-obligationwiring)
folding into the generic handoff question (core interview 4d). For the thin-macro adapter this is
**not a user choice** — it is forced by the archetype:

| Question | Resolution | Why no choice |
|---|---|---|
| "Where do within-run (Shaping→Delivery→Closing) handoffs live?" | A **shared, on-disk, gitignored** directory both the resident harness and the [micro dispatch target](macro-pm.md#the-micro-dispatch-target) can read | The SDLC run executes in a **separate** per-invocation harness; Hermes `memory` is intra-harness and cannot cross the boundary. Gitignored because ephemeral coordination is never version-controlled — see [ADR-014](../../../wiki/adr/adr-014-loom-opencode-setup.md) (Option A) and the [seam-artifact protocol](../../../wiki/patterns/seam-artifact-protocol.md#substrate-is-also-altitude-scoped) |

The only thing to resolve is the **path** of that shared directory (a project convention), which is
recorded in the protocol document alongside the named dispatch target. The **macro** substrate (the
board) is a separate §4f choice — see [macro-pm.md](macro-pm.md).

## `interview` capability — native, no resolution needed

Hermes has a first-class **`clarify`** tool (single/multi-select + open-ended, on CLI and every
messaging platform). loom's `interview` capability resolves directly to granting the `clarify`
toolset — no discover-or-ask step (unlike Mirai, where the ask-user tool name is version-specific).

## docs-lookup — prefer the keyless `web` toolset (Hermes)

If the project opted into `docs-lookup` (core interview 4b), Hermes has a **keyless default**: the
`web` toolset (`web_search` + `web_extract`) covers most dependency/docs research without any MCP
server or API key. Recommend it first; only wire an MCP docs server (e.g. Context7) if the user
explicitly wants one — then confirm the exact server name against the user's setup and grant its
`mcp-<server>` toolset (the server *config* lives in `config.yaml`'s `mcp_servers:` block; treat its
exact shape as verify-later). See [capabilities.md](capabilities.md#docs-lookup-optional-opt-in).

## Macro PM §4f resolution (Hermes)

If the project runs macro PM (core interview [§4f](../../../contract/interview.md#4f-macro-project-management-optional)),
fold in these Hermes-specific resolutions (full binding: [macro-pm.md](macro-pm.md)):

| Question | Recommended default | Signal to deviate |
|---|---|---|
| Which networked tracker is the macro source of truth? | **A networked tracker over MCP** (GitHub Issues+Projects default; Notion/Linear also fine) so it distributes across servers | Solo/single-host effort that never distributes → Hermes's native Kanban board is allowed, but warn it won't distribute and disable `auto_decompose` |
| Which resident-daemon interval + deliver channel? | A `cron` interval (e.g. every 5–15 min) delivering to the user's primary messaging platform | Event-driven only → rely on the gateway's inbound-message trigger for HITL, keep a slower cron for the AFK sweep |
| Provision the two label vocabularies on the tracker? | **Yes** — create `wayfinder:{research,prototype,grilling,task}` + `sdlc:{in-progress,done,needs-recharter,needs-clarification}` via the tracker's MCP tools | Tracker already uses a different scheme → map onto it and record the mapping in the macro section |

## Project-context placement (Hermes)

The generic "project-context file" question ([contract/interview.md](../../../contract/interview.md#project-context--instruction-file))
resolves in Hermes to project-root **`AGENTS.md`** (Hermes reads it natively; priority order
`.hermes.md`/`HERMES.md` → `AGENTS.md` → `CLAUDE.md` → `.cursorrules`, first match wins):

- If the project already uses `.hermes.md`/`HERMES.md` → edit *its* loom-owned section (it outranks
  `AGENTS.md`). Otherwise write/patch `AGENTS.md`.
- `SOUL.md` is the agent **persona**, not project context — loom writes role stance into each
  profile's `SOUL.md`, project conventions into `AGENTS.md`. Never conflate them.
- The communication protocol document (`.loom/handoffs/protocol.md`) is referenced from the
  loom-owned `AGENTS.md` section (always-on, since Hermes has no description-triggered instruction).

## Existing Hermes state (do no harm)

Hermes reads `AGENTS.md`/`CLAUDE.md`/`.cursorrules` and installs profiles into `~/.hermes/`. The
generic "leave other tools' config alone" rule
([contract/interview.md](../../../contract/interview.md#existing-agent-config-from-other-tools))
resolves as:

| Situation | Recommended default | Signal to deviate |
|---|---|---|
| User already has profiles in `~/.hermes/profiles/` | Deliver loom's roles as a **new profile distribution** (its own git repo) rather than editing the user's existing profiles | User wants loom folded into an existing profile → ask before touching it; never overwrite a `SOUL.md`/`config.yaml` you didn't author |
| Project already has a `CLAUDE.md`/`.cursorrules` | Leave it; write loom's context into `AGENTS.md` (or `.hermes.md` if present) | User wants a single file → ask before consolidating |

## Related

- [contract/interview.md](../../../contract/interview.md) — the generic questions this file resolves for Hermes.
- [capabilities.md](capabilities.md) — the `capability→tool` mapping + withhold this resolution feeds.
- [macro-pm.md](macro-pm.md) — the §4f macro binding the macro questions branch to.
- [write-format.md](write-format.md) — how the resolved values are written into the profile distribution.
- [../setup.md](../setup.md) — step 2 walks the core questions, then folds in these Hermes steps.
