---
description: Run one macro-PM tick over the board — read the frontier, route, propose transitions, reconcile.
argument-hint: "[ticket number or 'next' — optional; default: whole frontier]"
allowed-tools: Bash(node scripts/loom/index.js board:*), Bash(gh issue view:*), Bash(gh issue list:*), Read, Grep, Glob, Task
---

Run one macro-PM tick: $ARGUMENTS

Delegate to the `pm` subagent. It reads `workflows/macro-pm/index.md` and
`SKILLS/planning/wayfinder/SKILL.md` (macro mode) first — those are the authority.

The tick is **stateless**: reconstruct everything from the board, carry nothing from a previous
tick. Shape:

1. `node scripts/loom/index.js board reconcile --dry-run` — drift before anything else.
2. `node scripts/loom/index.js board read --frontier --unmapped` — the takeable set plus anything
   untriaged and therefore invisible to the default payload.
3. Route each takeable ticket mechanically by label and status. No judgment about priority —
   the ticket's type decides.
4. Present proposed transitions to the human, batched, each with its reason. **Apply nothing
   unattended** — every `board apply` needs an explicit go.
5. Report what moved, by ticket **name**, never bare number.

If `gh` is older than 2.47 the board CLI dies on `Unknown JSON field: "blockedBy"`. Stop and report
that; do not improvise with raw `gh`.
