# Mirai interview resolution steps

> The **generic interview questions** (Scope, delivery tiers, model matching, utility agents,
> docs-lookup, handoff / communication protocol) are harness-agnostic and live once in the core:
> [contract/interview.md](../../../contract/interview.md). Walk them via
> [grill-with-docs](../../../SKILLS/discovery/grill-with-docs/SKILL.md) — one question at a time,
> leading with the recommended default. This file adds only the **Mirai-specific resolution
> steps** that fold into that same interview pass ([ADR-013](../../../wiki/adr/adr-013-shared-adapter-contract-core.md);
> seam ticket [#4](https://github.com/zentetsukenz/agent/issues/4) classified §4c and the
> AGENTS.md filesystem check as harness-specific).

## Capability tool-name resolution (Mirai)

Not a preference — a resolution step for the [`capability→tool` port](../../../contract/PORTS.md#port-1--capabilitytool).
loom names capabilities generically; the adapter maps them via [capabilities.md](capabilities.md).
Most map to stable Mirai aliases; two do **not** and must be confirmed against the user's actual
tool list rather than guessed:

| Capability | Ask (only if not discoverable) | Note |
|---|---|---|
| `persist` (memory) | "What is your memory tool's exact name?" | e.g. `vscode/memory` — harness/version-specific; override the default if it differs |
| `interview` (ask-user) | "What is your ask-the-user tool's exact name?" | e.g. `vscode/askQuestions` — same caution |

If the project opted into `docs-lookup` (core interview 4b), also confirm the exact MCP server
name (e.g. `context7/*`) against the user's tool list; the server *config* lives outside the
agent file (see [capabilities.md](capabilities.md)) — treat its path/format as verify-later.

## AGENTS.md vs `mirai-instructions.md` (Mirai)

The generic "project-context file" question ([contract/interview.md](../../../contract/interview.md#project-context--instruction-file))
resolves in Mirai to a filesystem check with one exception:

- If root `AGENTS.md` exists → edit it. Never create `.mirai/mirai-instructions.md`.
- Else if `.mirai/mirai-instructions.md` exists → edit it. Never create root `AGENTS.md`.
- Else → **ask** which the user prefers (default: root `AGENTS.md` — the open, cross-editor
  standard loom itself uses).

## Existing `.claude/` / `.agents/` content (Mirai)

Mirai reads `.mirai/`, `.agents/`, and `.claude/`, so pre-existing content from those tools can
coexist. The generic "leave other tools' config alone" rule
([contract/interview.md](../../../contract/interview.md#existing-agent-config-from-other-tools))
resolves as:

| Situation | Recommended default | Signal to deviate |
|---|---|---|
| Project already has `.claude/skills/` or `.agents/skills/` content | Leave it; add loom skills to `.mirai/skills/` alongside it (Mirai reads all three) | User wants everything under `.mirai/` — ask before moving/deleting anything, never move silently |
| Project already has `.claude/settings.json` hooks | Leave as-is; add new hooks under `.mirai/hooks/` only if the interview calls for new deterministic enforcement | User wants hooks consolidated — same caution |

## Related

- [contract/interview.md](../../../contract/interview.md) — the generic questions this file resolves for Mirai.
- [capabilities.md](capabilities.md) — the `capability→tool` mapping the resolution above feeds.
- [write-format.md](write-format.md) — how the resolved values are written into `.mirai/`.
- [../setup.md](../setup.md) — step 2 walks the core questions, then folds in these Mirai steps.
