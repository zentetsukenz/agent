# Capability → OpenCode permission mapping

> **This is OpenCode's answer to the [`capability→tool` port](../../../contract/PORTS.md#port-1--capabilitytool).**
> The generic capability *vocabulary* and the "discover, don't guess" discipline are the core's
> ([contract/primitives.md](../../../contract/primitives.md), [wiki/patterns/role-scoped-capabilities.md](../../../wiki/patterns/role-scoped-capabilities.md),
> [ADR-006](../../../wiki/adr/adr-006-capability-based-roles.md)); this file resolves each
> generic capability to its concrete OpenCode `permission:` key and states the OpenCode
> **withhold mechanism**. The authoritative OpenCode tool model lives in
> [wiki/environments/opencode.md](../../../wiki/environments/opencode.md). Consulted by
> [setup.md](../setup.md) step 5 when building each agent's `permission:` block.

## The mapping

| Generic capability | OpenCode permission key(s) | Kind | Resolution |
|---|---|---|---|
| `read` | `read` | permission | stable — grant `allow` |
| `edit` | `edit` (gates write/edit/apply_patch) | permission | grant `allow`; **withhold = `deny`** |
| `shell` | `bash` | permission | stable |
| `delegate` | `task` | permission | stable — dispatch subagents |
| `web` | `webfetch`, `websearch` | permission | stable |
| `tasks` | `todowrite` (gates todowrite/todoread) | permission | stable |
| `search` | `grep`, `glob`, `list` | permission | the file/text search family |
| `persist` | **GAP** — committed `.loom/handoffs/` folder | no native tool | scoped `edit` glob (below) |
| `interview` | `question` | permission | **native** — OpenCode has a first-class `question` tool; grant `allow` |
| `docs-lookup` | MCP wildcard (e.g. `context7_*`) | permission | **opt-in**; built-in `scout` covers keyless research |

## Withhold mechanism (OpenCode)

Unlike Mirai (which grants only the tool aliases it lists and withholds by **omission**),
OpenCode grants tools by default and gates them with **`permission:`**. A role *denied* a
capability (the load-bearing withholding — a Shaping agent that cannot edit) sets that key to
**`deny`**:

```yaml
permission:
  edit: deny        # withholds write/edit/apply_patch — the Shaping/Planner/Orchestrator/Verifier forcing function
```

Grant a capability with `allow` (or leave it to the global default). `ask` prompts the human —
loom uses `deny` for the load-bearing withholds so the forcing function is unconditional, not a
prompt the human can wave through. **`tools:` is deprecated — always use `permission:`.**

## `persist` — the memory GAP (scoped edit) {#persist-scoped-edit}

OpenCode has **no harness memory tool**. loom persists the [ledger](../../../wiki/patterns/seam-artifact-protocol.md)
to a **committed `.loom/handoffs/` folder** ([MAPPING.md §7](../MAPPING.md#7-communication-protocol-document--loomhandoffs)).
A PRODUCE/DISCOVER role therefore needs to *write files* — but only the ledger, never general
code. Express this with a **glob-scoped `edit` permission**:

```yaml
permission:
  edit:
    "*": deny
    ".loom/handoffs/**": allow    # write the ledger, nothing else
```

This preserves the load-bearing "no code edit" withhold while letting the role persist the seam
artifact. DISCOVER-only roles (the Planner at entry) need only `read` — they read the ledger,
they don't write it.

## `interview` — native `question` tool

OpenCode ships a first-class `question` tool (gated by the `question` permission), so loom's
`interview` capability resolves **natively** — no discover-or-ask step (unlike Mirai, where the
ask-user tool name is harness/version-specific). Grant `question: allow` on the roles that
interview the human (Shaping, Planner).

## `search`

loom folds "search files/text" into a role's read-family grant. OpenCode splits it across
`grep` (text), `glob` (filename patterns), and `list` (directory) permissions — grant all three
`allow` where a role lists `read, search`.

## docs-lookup (optional, opt-in)

`docs-lookup` is the generic "query up-to-date external documentation" capability
([ADR-007](../../../wiki/adr/adr-007-docs-lookup-capability.md)). It is **off by default**
([keyless-by-default](../../../wiki/principles/keyless-by-default.md),
[ADR-010](../../../wiki/adr/adr-010-keyless-by-default-recommendations.md)):

- **OpenCode ships `scout`** — a built-in read-only subagent for external-docs / dependency
  research that needs **no MCP setup or API key**. Prefer it for the common case; a role that
  needs docs simply delegates to `scout`.
- **If the user wants an MCP docs server** (e.g. Context7), grant its wildcard in `permission:`
  (`"context7_*": "allow"`) and configure the server in `opencode.json`'s `mcp` block (see the
  official `mcp` doc). Treat the exact server name/config as **verify-later** — confirm against
  the user's tool list; don't invent it.
- **Which roles get it:** Shaping and the `planner` (design/plan against current docs) and the
  `deep` utility (hard implementation). Not the Orchestrator (it dispatches) and not the
  Verifier (it checks against acceptance criteria, not docs).

## Related

- [wiki/environments/opencode.md](../../../wiki/environments/opencode.md) — authoritative OpenCode tool/permission model.
- [MAPPING.md §6](../MAPPING.md#6-capability--opencode-tool-mapping) — the same table in the mapping doc.
- [STAGES.md](../STAGES.md) — each role's generic capability set.
- [interview.md](interview.md) — §docs-lookup and model-format resolution.
- [ADR-006](../../../wiki/adr/adr-006-capability-based-roles.md), [ADR-007](../../../wiki/adr/adr-007-docs-lookup-capability.md), [ADR-010](../../../wiki/adr/adr-010-keyless-by-default-recommendations.md).
- [wiki/principles/keyless-by-default.md](../../../wiki/principles/keyless-by-default.md) — default recommendations are keyless; API-key tools are opt-in.
