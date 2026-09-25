---
type: Research
title: Standards — knowledge that outlives a vendor
description: The portable formats and protocols a harness can read — AGENTS.md, Agent Skills, MCP, ACP, A2A, OKF — their governance, adoption and status, and how this repository diverges from OKF
tags: [research, harness, standards, agents-md, skills, mcp, acp, okf, portability]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://agents.md, title: AGENTS.md }
  - { resource: https://agentskills.io, title: Agent Skills, last_modified: 2025-12-18 }
  - { resource: https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/, title: MCP joins the Agentic AI Foundation, last_modified: 2025-12-09 }
  - { resource: https://zed.dev/acp, title: Agent Client Protocol }
  - { resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md, title: Open Knowledge Format v0.2 }
  - { resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md, title: OKF (frozen copy in knowledge-catalog) }
  - { resource: https://dev.to/alexmercedcoder/open-standards-for-agentic-harnesses-5824, title: Open Standards for Agentic Harnesses }
---

# Standards — knowledge that outlives a vendor

*As of 2026-09-25.* Part of the [Harness](index.md) pillar.

"Knowledge lives in the project. Never inside a model, a vendor or a runtime, so it outlives all
three." That is only practical if the files the project writes are read by every harness it might
run in. In 2026 they largely are — which is why the vision states tool-independence as the *reason*
for keeping knowledge in the project rather than as its headline.

## The standards

| Standard | Governs | Status | Adoption | Source |
|---|---|---|---|---|
| **AGENTS.md** | Agent instructions for a repository — plain Markdown, no required fields, no version number | Stewarded by the Agentic AI Foundation (Linux Foundation) since 2025-12-09 | 60,000+ projects (2025-12); read by every coding harness profiled here | [agents.md](https://agents.md) |
| **Agent Skills** (`SKILL.md`) | A skill as a folder: `SKILL.md` (name, description, instructions) plus optional scripts, references, assets; loaded progressively | Originated at Anthropic; open specification published 2025-12-18 | ~40 products listed by mid-2026 | [agentskills.io](https://agentskills.io) |
| **MCP** | Agent ↔ tools and data sources | Joined the Agentic AI Foundation 2025-12-09 | 97M monthly SDK downloads and 10,000+ active servers (2025-12) | [MCP blog](https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/) |
| **ACP** (Agent Client Protocol) | Agent ↔ editor, JSON-RPC over stdio | Zed, August 2025; JetBrains support from October 2025 | OpenCode, Hermes, OpenHands, Devin Desktop, Kimi Code among others | [zed.dev/acp](https://zed.dev/acp) |
| **A2A** | Agent ↔ agent | v1.0, 2026-03-12; Linux Foundation | See [A2A](../agent/a2a.md) | — |
| **OKF** | Knowledge as Markdown files with YAML frontmatter; only `type` required; v0.2 adds provenance, trust (`generated`, `verified`) and lifecycle (`status`, `stale_after`) | v0.2; canonical repository is now `GoogleCloudPlatform/open-knowledge-format` | — | [SPEC](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md) |

An overview of the first two, from before the Agentic AI Foundation existed, is
[Merced](https://dev.to/alexmercedcoder/open-standards-for-agentic-harnesses-5824) (*secondary*,
2025-08-31); the primary sources above supersede its figures.

## What each harness reads

| Harness | `AGENTS.md` | `SKILL.md` | MCP | Where its own state lives |
|---|---|---|---|---|
| [Claude Code](claude-code.md) | yes | yes | yes | local files |
| [Codex](codex.md) | yes | yes | yes | not documented on the pages read |
| [Cursor](cursor.md) | yes | listed | listed | `.cursor/rules/` in the repository |
| [Kiro](kiro.md) | yes | yes | yes | `.kiro/steering/` in the repository |
| [OpenCode](opencode.md) | yes | yes | yes | local sessions |
| [pi](pi.md) | yes | yes | **no, by design** | the session |
| [Hermes](hermes-agent.md) | yes | yes | yes | `~/.hermes/` — outside the repository |
| [Paperclip](paperclip.md) | yes (agent instructions) | yes | — | **PostgreSQL** |
| [dsh](deepseek-harness.md) | not confirmed | not confirmed | yes | the dsh session log |

The formats have converged. Where harnesses still differ is the last column — and that is the one
conviction 4 is about.

## OKF and this repository

The wiki's frontmatter convention is OKF. Where this repository currently diverges from the
specification, for the OKF pass:

- **The canonical specification moved.** The copy under `knowledge-catalog/okf/` "is a frozen
  snapshot, no longer maintained"
  ([okf/ README](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf); the frozen
  [SPEC](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) still reads v0.2);
  link `open-knowledge-format` instead.
- [SPEC.md](../../../SPEC.md)'s wiki section names it "Open Knowledge *Framework* v0.1"; the research
  section added 2026-09-25 already uses v0.2's date fields.
- OKF `type` values are **not** a fixed list ("not registered centrally"); the repository's closed
  list is a local restriction.
- OKF makes `index.md` and `log.md` **optional**; the repository requires both per wiki subtree.
- OKF consumers must tolerate broken links; the repository's gate deliberately does not.
