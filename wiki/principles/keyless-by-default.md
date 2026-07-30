---
type: Principle
title: Keyless by Default
description: Default recommendations must work with no API key or external account; tools that require one are opt-in capabilities with a keyless fallback
tags: [capability, tool-agnostic, opt-in, mcp, api-key, degradation, loom]
timestamp: 2026-07-30T00:00:00Z
---

# Keyless by Default

The path a user gets without asking must not require an API key, an account, or external
setup. Tools that do are **opt-in capabilities**, never mandatory steps.

## Core Idea

A recommendation that silently assumes an API-key tool is a trap: the user follows it, hits
a wall (unconfigured server, missing key, auth prompt), and the "help" becomes a headache.
The framework already learned this once for documentation lookup
([ADR-007](../adr/adr-007-docs-lookup-capability.md)); this principle generalizes it to
**every** external tool.

Two rules follow:

- **Name the capability, not the tool.** A skill says "search the web" or "look up library
  docs" — a [capability](../patterns/role-scoped-capabilities.md) the adapter maps to whatever tool the
  user actually has. Specific tools (Context7, Exa, a GitHub code-search MCP) appear only as
  *examples if available*, never as required steps.
- **Degrade gracefully.** When an opt-in capability isn't configured, the skill still
  completes on keyless substrate (the model's own knowledge, `web`, `read`/`search`) and
  *states the reduced coverage* rather than failing or stalling on a missing key.

## Why

- **No forced dependency.** No project inherits an external account it didn't choose.
- **Tool-agnostic longevity.** Swapping or dropping a provider is an adapter mapping edit,
  not a skill rewrite — the same discipline loom applies to model-name strings.
- **Honest UX.** "I searched with the tools available and here's what I found, minus the
  docs-lookup you haven't enabled" beats a dead end.

## In Practice

- **Skills** describe capabilities and list concrete tools only as optional examples; every
  phase that leans on an opt-in capability names its keyless fallback.
- **Capabilities** that resolve to an API-key tool (`docs-lookup`, and any future
  equivalent) stay **off by default** and interview-gated at setup.
- **Keyless-but-local tools are fine as defaults.** Browser-automation MCPs (Playwright,
  Chrome DevTools) need no key, so recommending them by default doesn't violate this
  principle — the line is the *key/account*, not "is it an MCP".

## Related

- [ADR-010](../adr/adr-010-keyless-by-default-recommendations.md) — the decision that adopts this principle.
- [ADR-007](../adr/adr-007-docs-lookup-capability.md) — the docs-lookup case this generalizes.
- [Role-Scoped Capabilities](../patterns/role-scoped-capabilities.md) — capabilities are generic; adapters map them to tools.
- [adapters/mirai/references/capabilities.md](../../adapters/mirai/references/capabilities.md) — how the Mirai adapter wires opt-in capabilities.
