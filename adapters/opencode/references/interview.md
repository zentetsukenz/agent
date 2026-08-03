# OpenCode interview resolution steps

> The **generic interview questions** (Scope, delivery tiers, model matching, utility agents,
> docs-lookup, handoff / communication protocol, quality baseline) are harness-agnostic and live once in the core:
> [contract/interview.md](../../../contract/interview.md). Walk them via
> [grill-with-docs](../../../SKILLS/discovery/grill-with-docs/SKILL.md) — one question at a time,
> leading with the recommended default. This file adds only the **OpenCode-specific resolution
> steps** that fold into that same interview pass ([ADR-013](../../../wiki/adr/adr-013-shared-adapter-contract-core.md);
> seam ticket [#4](https://github.com/zentetsukenz/agent/issues/4) classified harness-specific
> resolution as the adapter's).

## Model format resolution (OpenCode)

Not a preference — a resolution step for the [`archetype→model` port](../../../contract/PORTS.md#port-2--archetypemodel).
loom collects the user's available model list in the generic Model Matching question
([contract/interview.md §3](../../../contract/interview.md#3-model-matching)); OpenCode then needs
each written in its **`provider/model-id`** format (e.g. `anthropic/claude-sonnet-4-20250514`,
`opencode/gpt-5.1-codex`). Confirm the exact provider prefix + model id against the user's
OpenCode provider config — never emit a bare model name (it won't resolve).

## OMO opt-in (OpenCode)

A resolution step unique to OpenCode: whether to render model matching to a central **`omo.json`**
(the opt-in OMO layer) or inline `model:` fields.

| Question | Recommended default | Signal to deviate |
|---|---|---|
| "Do you use oh-my-openagent (OMO) for model tiering, or want loom to manage it?" | **No** — inline `model:` per agent (keeps a bare-OpenCode project self-contained; no extra dependency) | User already runs OMO, or wants tier-wide model fallback/swapping from one file → render `omo.json` per [omo.md](omo.md) |

**OMO is strictly opt-in** — never force a bare-OpenCode project into it. If the user opts in,
omit inline `model:` from every agent/command and write `omo.json`; the OMO layer **overlays** OMO's
own builtins rather than redefining loom's roster.

## `interview` capability — native, no resolution needed

Unlike Mirai (where the ask-user tool name is harness/version-specific and must be discovered),
OpenCode has a **first-class `question` tool**. loom's `interview` capability resolves directly to
`permission: { question: allow }` — no discover-or-ask step.

## docs-lookup — prefer built-in `scout` (OpenCode)

If the project opted into `docs-lookup` (core interview 4b), OpenCode has a **keyless default**:
the built-in **`scout`** subagent researches external docs and dependency source without any MCP
server or API key. Recommend `scout` first; only wire an MCP docs server (e.g. Context7) if the
user explicitly wants one — then confirm the exact server name against the user's tool list and
grant its wildcard in `permission:` (the server *config* lives in `opencode.json`'s `mcp` block;
treat its exact shape as verify-later). See [capabilities.md](capabilities.md).

## Project-context placement (OpenCode)

The generic "project-context file" question ([contract/interview.md](../../../contract/interview.md#project-context--instruction-file))
resolves in OpenCode to root **`AGENTS.md`** (OpenCode reads it natively):

- If root `AGENTS.md` exists → edit its loom-owned section (add markers if adopting a hand-written
  one, per the core discipline). Never write `CLAUDE.md`.
- Else → create root `AGENTS.md`.
- Extra rule files (including loom's `.loom/handoffs/protocol.md` pointer) go in `opencode.json`'s
  `instructions:` array — added idempotently, preserving the user's existing entries.

## Existing `.claude/` / `.agents/` content (OpenCode)

OpenCode reads `.opencode/`, `.claude/`, and `.agents/` skills, so pre-existing content from those
tools can coexist. The generic "leave other tools' config alone" rule
([contract/interview.md](../../../contract/interview.md#existing-agent-config-from-other-tools))
resolves as:

| Situation | Recommended default | Signal to deviate |
|---|---|---|
| Project already has `.claude/skills/` or `.agents/skills/` content | Leave it; add loom skills to `.opencode/skills/` alongside it (OpenCode reads all three) | User wants everything under `.opencode/` — ask before moving/deleting anything, never move silently |
| Project already has a `CLAUDE.md` | Leave it as the compat fallback; write loom's context into `AGENTS.md` (which takes precedence) | User wants a single file — ask before consolidating |

## Related

- [contract/interview.md](../../../contract/interview.md) — the generic questions this file resolves for OpenCode.
- [capabilities.md](capabilities.md) — the `capability→permission` mapping the resolution above feeds.
- [omo.md](omo.md) — the OMO layer the opt-in question branches to.
- [write-format.md](write-format.md) — how the resolved values are written into `.opencode/`.
- [../setup.md](../setup.md) — step 2 walks the core questions, then folds in these OpenCode steps.
