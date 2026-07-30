# Capability → Mirai tool mapping

> Consulted by [setup.md](../setup.md) step 5 when building each agent's `tools:` array.
> loom names agent capabilities generically
> ([wiki/patterns/role-scoped-capabilities.md](../../../wiki/patterns/role-scoped-capabilities.md),
> [ADR-006](../../../wiki/adr/adr-006-capability-based-roles.md)); this file resolves each
> generic capability to its Mirai tool. The authoritative Mirai tool model lives in
> [wiki/environments/mirai.md](../../../wiki/environments/mirai.md) — this file only adds the
> loom capability layer on top of it.

## The mapping

| Generic capability | Mirai tool | Kind | Resolution |
|---|---|---|---|
| `read` | `read` | alias | stable — write as-is |
| `edit` | `edit` | alias | stable |
| `shell` | `execute` | alias | stable |
| `delegate` | `agent` | alias | stable — dispatch subagents |
| `web` | `web` | alias | stable |
| `tasks` | `todo` | alias | stable |
| `persist` | *specific tool* (e.g. `vscode/memory`) | **not an alias** | **discover/confirm** at setup |
| `interview` | *specific tool* (e.g. `vscode/askQuestions`) | **not an alias** | **discover/confirm** at setup |
| `docs-lookup` | MCP `<server>/*` (e.g. `context7/*`) | MCP server | **opt-in**; discover server name |

## Discover, don't guess (the deviation rule)

Mirai's stable tool **aliases** are exactly `read` `edit` `search` `execute` `agent` `web`
`todo` (see [wiki/environments/mirai.md](../../../wiki/environments/mirai.md)). Anything
outside that set is a **specific tool name** that is harness-/version-dependent:

- `persist` and `interview` are *not* aliases. They resolve to concrete tool names (on this
  build, `vscode/memory` and `vscode/askQuestions`). These names can change across Mirai
  versions or differ on another harness.
- **Rule:** resolve these against the user's *actual* tool list (read the tool list, or ask
  — see [interview.md](interview.md) §4c). If the discovered name differs from the default
  above, **override the default** — write the name that will actually resolve. Never emit a
  guessed name that might silently fail to bind. This is the same discipline loom applies to
  model-name strings.

## `search`

Mirai also exposes a `search` alias. loom folds "search files/text" into the `read`-family
of a role's grant; where a role lists `read, search` in STAGES.md, write both aliases.

## docs-lookup (optional, opt-in)

`docs-lookup` is the generic "query up-to-date external documentation" capability
([ADR-007](../../../wiki/adr/adr-007-docs-lookup-capability.md)). It is **off by default**;
wire it only if the interview (§4b) says yes. This is the canonical instance of the
[keyless-by-default](../../../wiki/principles/keyless-by-default.md) principle
([ADR-010](../../../wiki/adr/adr-010-keyless-by-default-recommendations.md)): any capability
that resolves to an API-key/account tool follows the same opt-in, degrade-gracefully rule.

- **Wiring into an agent:** add the MCP server glob to the agent's `tools:` array, e.g.
  `"context7/*"` (or whichever server the user runs). Confirm the exact server name against
  the user's tool list.
- **Server config lives outside the agent file.** MCP servers are configured per the
  official MCP docs (`https://code.visualstudio.com/docs/copilot/customization/mcp`), not in
  `.agent.md` frontmatter. Treat the exact config file path/format as **verify-later** — do
  not invent it. If the user hasn't set up the server, note that the `tools:` entry will not
  resolve until they do.
- **Which roles get it:** Shaping and the `planner` (design/plan against current docs) and
  the `deep` utility (hard implementation). Not the Orchestrator (it dispatches, it doesn't
  research) and not the Verifier (it checks against acceptance criteria, not docs).

## Related

- [wiki/environments/mirai.md](../../../wiki/environments/mirai.md) — authoritative Mirai tool/alias model.
- [MAPPING.md](../MAPPING.md#6-capability--mirai-tool-mapping) — the same table in the mapping doc.
- [STAGES.md](../STAGES.md) — each role's generic capability set.
- [interview.md](interview.md) — §4b docs-lookup, §4c tool-name resolution.
- [ADR-006](../../../wiki/adr/adr-006-capability-based-roles.md), [ADR-007](../../../wiki/adr/adr-007-docs-lookup-capability.md), [ADR-010](../../../wiki/adr/adr-010-keyless-by-default-recommendations.md).
- [wiki/principles/keyless-by-default.md](../../../wiki/principles/keyless-by-default.md) — default recommendations are keyless; API-key tools are opt-in.
