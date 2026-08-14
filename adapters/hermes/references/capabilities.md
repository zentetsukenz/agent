# Capability → Hermes tool mapping

> **This is Hermes's answer to the [`capability→tool` port](../../../contract/PORTS.md#port-1--capabilitytool).**
> The generic capability *vocabulary* and the "discover, don't guess" discipline are the core's
> ([contract/primitives.md](../../../contract/primitives.md), [wiki/patterns/role-scoped-capabilities.md](../../../wiki/patterns/role-scoped-capabilities.md),
> [ADR-006](../../../wiki/adr/adr-006-capability-based-roles.md)); this file resolves each generic
> capability to its concrete Hermes tool/toolset and states the Hermes **withhold mechanism**. The
> authoritative Hermes tool model lives in [wiki/environments/hermes.md](../../../wiki/environments/hermes.md).
> Consulted by [setup.md](../setup.md) step 5 when building each profile's `toolsets:` composition.

## The mapping

| Generic capability | Hermes tool(s) | Toolset | Resolution |
|---|---|---|---|
| `read` | `read_file` | `file` | stable — grant the `file` toolset |
| `edit` | `write_file`, `patch` | `file` | grant `file`; **withhold = disable `write_file` + `patch` at the tool level** (below) |
| `search` | `search_files` | `file` | shares the `file` toolset with read/edit |
| `shell` | `terminal`, `process` | `terminal` | stable |
| `delegate` | `delegate_task` | `delegation` | dispatch a buildable leaf **down** into the [micro dispatch target](macro-pm.md#the-micro-dispatch-target) (a separate per-invocation harness), and spawn the `research` subagent |
| `web` | `web_search`, `web_extract` | `web` | stable |
| `tasks` | `todo` | `todo` | stable |
| `persist` | `memory` | `memory` | **native** — the resident agent's **own relational continuity only**, never project state and never the micro ledger (below) |
| `interview` | `clarify` | `clarify` | **native** — grant the `clarify` toolset |
| `docs-lookup` | `mcp-<server>/*` | dynamic `mcp-<server>` | **opt-in**; each MCP server yields an `mcp-<server>` toolset |

Grant a capability by listing its **toolset** in the profile's `config.yaml`:

```yaml
# <profile>/config.yaml
toolsets:
  - file        # read + search (+ edit unless the tools below are disabled)
  - terminal
  - memory
  - clarify
```

## The withhold mechanism (Hermes) {#the-withhold-mechanism}

Hermes toolsets are **whole-group bundles** — the `file` toolset bundles `read_file`, `write_file`,
`patch`, and `search_files` together. So a role is scoped with **two levers together**, and the
load-bearing "no code edit" withhold uses **both**:

1. **Compose `toolsets:`** — grant only the toolsets a role needs. A role with no `delegation`
   toolset cannot spawn subagents; a role with no `terminal` cannot run shell. This is the coarse
   lever (whole capability on/off).
2. **Disable individual tools** — the `hermes tools` UI (persisted to `config.yaml`) operates
   **finer than toolsets** and filters a tool out *even if its toolset is enabled*. This is how a
   role keeps `read_file`/`search_files` (needs the `file` toolset) but loses `write_file`/`patch`:

   > grant the `file` toolset, then **disable `write_file` and `patch`** for that profile.

The **resident macro agent** uses exactly this withhold: it needs to *read* the board and its linked
artifacts but must never *write* code (building happens one altitude down, in the dispatched SDLC
run). The withheld `write_file`/`patch` is the forcing function
([ADR-006](../../../wiki/adr/adr-006-capability-based-roles.md)) — a role that cannot call
`write_file`/`patch` cannot build, so it can only route, translate, and dispatch. (The read-only
SDLC stages that would also use this withhold — `shaping`, `planner`, `orchestrator`, `verifier` —
are **not** rendered by Hermes; they live in the [dispatched per-invocation harness](../STAGES.md).)

**The exact config key** for the per-tool disable is **version-specific** — Hermes persists
`hermes tools` selections under a platform-tool config block in `config.yaml`. **Discover or
confirm it against the user's actual Hermes version at setup** (the same "discover, don't guess"
discipline loom applies to model-name strings) rather than hardcoding a key that may drift. Record
the resolved shape in the generated profile and in
[write-format.md](write-format.md#the-per-tool-withhold). `agent.disabled_toolsets:` is the
**global** whole-toolset off-switch (applies across CLI + every gateway platform) — use it only for
a capability the whole install should never have, never for a per-role withhold (per-role withholds
live in the profile).

## `persist` — the native memory tool (macro continuity only) {#persist--the-native-memory-tool-macro-continuity-only}

Hermes ships a first-class **`memory`** tool in its own **`memory` toolset**. In the thin-macro
adapter ([ADR-019](../../../wiki/adr/adr-019-loom-hermes-setup.md)) this memory holds **only the
resident agent's own relational continuity** — persona, standing preferences, skills — and **never
project state**. The test is the one-source-of-truth invariant: *"if this agent died and a fresh one
booted on another server, would the project stall without this datum?"* If yes, it belongs on the
board, not in memory. A bounded memory budget is a **forcing function** that keeps project state on
the board where it belongs — do not enlarge memory to hold more state.

**Memory is not the micro ledger.** Because Hermes renders no SDLC stage agents, the seam artifacts
(`shaping/`/`delivery/`) that cross the altitude seam are written and read by the **dispatched
per-invocation harness**, a *different process* Hermes memory cannot reach (memory is intra-harness,
per-profile, and not distributed across servers). The micro ledger is therefore a **shared, on-disk,
gitignored** substrate both harnesses read — see
[macro-pm.md](macro-pm.md#the-micro-dispatch-target) and
[MAPPING.md §7](../MAPPING.md#7-communication-protocol-document--the-two-altitude-ledgers). Grant the
`memory` toolset **only** on the resident macro profile, and only for its own continuity.

## `interview` — native `clarify` tool

Hermes ships a first-class **`clarify`** tool (its own toolset) supporting single-select,
multi-select, and open-ended questions, on the CLI and every messaging platform. loom's `interview`
capability resolves **natively** — no discover-or-ask step. Grant the `clarify` toolset on the
**resident macro profile**, which uses it for `wayfinder:grilling`/`prototype` HITL tickets over the
gateway. (SDLC stage roles that also interview — Shaping, Planner — live in the dispatched
per-invocation harness, not here.)

## `search`

loom folds "search files/text" into a role's read-family grant. In Hermes both `read_file` and
`search_files` live in the **`file`** toolset, so granting `file` (and, for read-only roles,
disabling only `write_file`/`patch`) covers `read` + `search` together.

## docs-lookup (optional, opt-in)

`docs-lookup` is the generic "query up-to-date external documentation" capability
([ADR-007](../../../wiki/adr/adr-007-docs-lookup-capability.md)). It is **off by default**
([keyless-by-default](../../../wiki/principles/keyless-by-default.md),
[ADR-010](../../../wiki/adr/adr-010-keyless-by-default-recommendations.md)):

- **Hermes has a keyless `web` toolset** (`web_search` + `web_extract`) that covers most
  dependency/docs research without any MCP setup — prefer it for the common case (grant `web`).
- **If the user wants an MCP docs server** (e.g. Context7), configure it in `config.yaml`'s
  `mcp_servers:` block; Hermes exposes it as an `mcp-<server>` toolset you grant on the profile.
  Per-server tool filtering (`tools.include`/`tools.exclude`) is supported. Treat the exact server
  name/config as **verify-later** — confirm against the user's setup; don't invent it.
- **Which role gets it:** for the thin-macro adapter, docs-lookup is rarely needed — the resident
  agent routes, it does not design against docs. The `mcp-<tracker>` board server is its one required
  MCP toolset. SDLC roles that *do* consult docs (Shaping, `planner`, `deep`) live in the dispatched
  per-invocation harness and get docs-lookup there.

## Related

- [wiki/environments/hermes.md](../../../wiki/environments/hermes.md) — authoritative Hermes tool/toolset model.
- [MAPPING.md §6](../MAPPING.md#6-capability--hermes-tool-mapping) — the same table in the mapping doc.
- [STAGES.md](../STAGES.md) — why Hermes renders no SDLC stage roles (they live in the dispatch target).
- [macro-pm.md](macro-pm.md) — the resident macro binding; the micro dispatch target + shared on-disk ledger.
- [interview.md](interview.md) — §docs-lookup, model-format, and the withhold-key resolution steps.
- [write-format.md](write-format.md) — how the resolved toolsets/withhold land in a profile `config.yaml`.
- [ADR-006](../../../wiki/adr/adr-006-capability-based-roles.md), [ADR-007](../../../wiki/adr/adr-007-docs-lookup-capability.md), [ADR-010](../../../wiki/adr/adr-010-keyless-by-default-recommendations.md).
- [wiki/principles/keyless-by-default.md](../../../wiki/principles/keyless-by-default.md) — default recommendations are keyless; API-key tools are opt-in.
