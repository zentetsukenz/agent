# OpenCode verify — format-checks

> The verify step (setup contract step 5) splits along the generic/specific seam
> ([ADR-013](../../../wiki/adr/adr-013-shared-adapter-contract-core.md); seam ticket
> [#4](https://github.com/zentetsukenz/agent/issues/4)). **Run the generic invariant-checks
> first** — capability withholding, invocation surface, handoff PRODUCE/DISCOVER, and structure —
> from the core: [contract/discipline.md](../../../contract/discipline.md#generic-invariant-checks-the-verify-step-generic-half).
> Those verify *loom's* invariants independent of any harness. **This file adds the OpenCode
> format-checks** that complete the [`primitive→file` port](../../../contract/PORTS.md#port-4--the-primitivefile-manifest).
> Both halves are a *manual* checklist the writing agent walks; they complement the repo-level
> `scripts/validate.sh` (which link-checks framework docs, not a target's generated `.opencode/`).

## Frontmatter (OpenCode format)

- [ ] Every written `.opencode/skills/<slug>/SKILL.md` opens with `---`/`---` YAML frontmatter and
      has non-empty `name` + `description`; the file is named `SKILL.md` (all caps).
- [ ] Every `name` field equals its folder name exactly (kebab-case, lowercase) — the OpenCode
      requirement.
- [ ] Every written `.opencode/agents/*.md` has a non-empty `description` and a `mode`
      (`primary` or `subagent`).
- [ ] Every written `.opencode/commands/*.md` has a `description` and an `agent`.
- [ ] No unescaped colons inside unquoted YAML string values.
- [ ] Every `model:` value (where present) is in `provider/model-id` format — never a bare name.
- [ ] The deprecated `tools:` field is **not** used — capability control is via `permission:`.

## File placement (OpenCode)

- [ ] Root `AGENTS.md` exists (loom writes it); no `CLAUDE.md` was written (it is only a read
      fallback).
- [ ] No file was duplicated for the same purpose (check the loom provenance markers from
      [write-format.md](write-format.md#provenance-marking-for-idempotent-patching) — a patch
      should have replaced, not appended). *(Generic idempotency discipline:
      [contract/discipline.md](../../../contract/discipline.md#idempotency-rule).)*
- [ ] No leftover `{{PLACEHOLDER}}` tokens in any written file.

## Capability / invocation rendering (OpenCode)

> The *invariant* (which roles withhold `edit`, which surface is `front-door` vs `dispatched`)
> is checked generically in [contract/discipline.md](../../../contract/discipline.md#generic-invariant-checks-the-verify-step-generic-half).
> These checks confirm the invariant was **rendered correctly into OpenCode config**.

- [ ] Stage agents that withhold `edit` (`shaping`, `planner`, `orchestrator`) and the `verifier`
      utility carry `permission: { edit: deny }` (or the scoped-ledger glob for PRODUCE roles) —
      not a granted or absent `edit`.
- [ ] PRODUCE/DISCOVER roles (`shaping`, `orchestrator`, `closing`) that write the ledger carry the
      scoped-edit glob (`edit: { "*": deny, ".loom/handoffs/**": allow }`), letting them persist the
      seam artifact without general code-edit. DISCOVER-only (`planner` entry) needs only `read`.
- [ ] Roles that interview the human carry `question: allow` (the native ask-user tool).
- [ ] `docs-lookup` (MCP wildcard) appears in `permission:` **only** if the interview opted in;
      otherwise the built-in `scout` subagent covers dependency research (no MCP entry).
- [ ] Stage agents (`shaping`, `planner`, `orchestrator`, `closing`) carry `mode: primary`; every
      utility carries `mode: subagent`.
- [ ] No `{{ROLE_MODE}}` token remains, and no utility carries a stale `mode: primary` from an
      older run (the `update` reconcile must have flipped it — see
      [write-format.md](write-format.md#role-invocation-surface)).

## Quick commands (OpenCode)

- [ ] Each `.opencode/commands/*.md` has a non-empty **stance** line in its body.
- [ ] Each quick command's `agent:` is the correct base agent — `plan` for `shape.md`, `build` for
      `deliver.md` / `close.md` — not a stale `agent: build` on the Shaping command.
- [ ] No command re-embeds a deep agent's full workflow prose (it references skills to invoke).

## Handoff wiring (OpenCode on-disk ledger)

- [ ] `.loom/handoffs/protocol.md` exists and `.loom/handoffs/index.md` (the manifest) was seeded
      with the table header.
- [ ] The ledger is **gitignored by default** — a `.gitignore` entry ignores the per-milestone
      artifact dirs (keeping `protocol.md` + `index.md` tracked), **unless** the user opted to
      commit the ledger for reviewable diffs ([ADR-014](../../../wiki/adr/adr-014-loom-opencode-setup.md)
      Option A). The protocol *document* is always committed; the *ledger artifacts* are not.
- [ ] `opencode.json`'s `instructions:` array contains `.loom/handoffs/protocol.md` (added
      idempotently, other entries preserved) and `AGENTS.md` references the protocol.
- [ ] The stage agents' bodies instruct PRODUCE at exit / DISCOVER at entry against the ledger —
      there is **no** `handoffs:` frontmatter (OpenCode has no such primitive); the transition is
      the human `Tab`-selecting the next primary agent.

## Model layer (OpenCode)

- [ ] If OMO was **not** opted in: every agent/command carries an inline `model:` in
      `provider/model-id` format, confirmed against the user's actual provider/model list; no
      `omo.json` was written.
- [ ] If OMO **was** opted in: an `omo.json` exists with a `models` catalog + `categories` + an
      `agents` overlay; agents/commands carry **no** inline `model:`; the OMO layer overlays OMO
      builtins rather than redefining loom's roster (see [omo.md](omo.md)).

## Report

Follow the generic [report guidance](../../../contract/discipline.md#report-after-the-checklist-passes):
created vs. patched paths (two short lists), anything deferred, and any check that failed and how it
was resolved — or, if unresolved, flagged to the user explicitly rather than silently shipped.

## Related

- [contract/discipline.md](../../../contract/discipline.md) — the generic invariant-checks to run first.
- [write-format.md](write-format.md) — the OpenCode write mechanics these checks verify.
- [capabilities.md](capabilities.md) — the permission withholds these checks assert.
- [omo.md](omo.md) — the opt-in OMO layer the model checks branch on.
- [../setup.md](../setup.md) — step 6 runs the generic checks then these format-checks.
