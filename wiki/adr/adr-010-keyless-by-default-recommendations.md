---
type: ADR
title: Recommendations are keyless by default; API-key tools are opt-in
status: Accepted
timestamp: 2026-07-30T00:00:00Z
tags: [capability, tool-agnostic, opt-in, mcp, api-key, degradation, skill, loom]
---

# ADR-010: Keyless-by-Default Recommendations

## Context

[ADR-007](adr-007-docs-lookup-capability.md) made *documentation lookup* an opt-in,
tool-agnostic capability so no project inherits a Context7/MCP dependency it didn't choose.
But that discipline was scoped to `docs-lookup`. Other skills still hardcode API-key tools
as **required** steps:

- `SKILLS/discovery/research-recommend/SKILL.md` names Exa/websearch, a GitHub code-search
  tool, and Context7 as mandatory search phases.
- `docs/researcher-agent-design.md` lists `mcp_web-search_*` under "Required tools".

A user who follows these hits an unconfigured server, a missing key, or an auth wall — the
recommendation becomes a headache instead of help. The underlying issue is that these skills
name *tools* where they should name *capabilities*.

## Decision

Adopt **[keyless-by-default](../principles/keyless-by-default.md)** as a framework principle
and generalize ADR-007 from `docs-lookup` to **every external tool**:

- **Skills name capabilities, not tools.** A phase says "search the web" / "look up library
  docs" / "search code examples" — a generic capability the adapter maps to the user's
  actual tool. Concrete tools (Context7, Exa, a GitHub code-search MCP) appear only as
  *examples if available*, never as required steps.
- **API-key/account tools are opt-in.** Any capability that resolves to a tool needing a key
  or external account stays **off by default** and interview-gated at setup — as `docs-lookup`
  already is.
- **Graceful degradation is mandatory.** When an opt-in capability isn't configured, the
  skill still completes on keyless substrate (model knowledge, `web`, `read`/`search`) and
  states the reduced coverage. It does not fail or stall on a missing key.
- **Keyless-but-local tools may remain defaults.** Browser-automation MCPs (Playwright,
  Chrome DevTools) need no key; recommending them by default is allowed. The line is the
  *key/account*, not "is it an MCP".

## Considered options

| Option | Verdict |
|---|---|
| **Leave skills as-is** | Rejected — hardcoded API-key tools break for users who haven't configured them. |
| **Delete Context7/web-search references entirely** | Rejected — loses real value for library-heavy and research work; the tools are fine *when opted in*. |
| **Fix only the offending skills, no principle** | Rejected — the same drift would reappear in the next skill; the rule needs to be discoverable. |
| **Generalize ADR-007 into a keyless-by-default principle + tool-agnostic skills** | **Chosen.** |

## Consequences

- `research-recommend` and the researcher design doc describe capabilities with keyless
  fallbacks; they run with zero MCPs configured.
- New skills have a principle to cite; reviewers have a rule to enforce.
- Swapping or dropping a provider is an adapter mapping edit, not a skill rewrite.
- ADR-007 remains valid for the `docs-lookup` specifics; this ADR is the general rule it is
  an instance of.

## Related

- [ADR-007](adr-007-docs-lookup-capability.md) — the docs-lookup case this generalizes.
- [ADR-006](adr-006-capability-based-roles.md) — capability discipline both build on.
- [wiki/principles/keyless-by-default.md](../principles/keyless-by-default.md) — the principle this ADR adopts.
- [wiki/patterns/role-scoped-capabilities.md](../patterns/role-scoped-capabilities.md) — capabilities are generic; adapters map them to tools.
