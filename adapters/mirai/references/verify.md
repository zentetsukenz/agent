# Mirai verify — format-checks

> The verify step (setup contract step 5) splits along the generic/specific seam
> ([ADR-013](../../../wiki/adr/adr-013-shared-adapter-contract-core.md); seam ticket
> [#4](https://github.com/zentetsukenz/agent/issues/4)). **Run the generic invariant-checks
> first** — capability withholding, invocation surface, handoff PRODUCE/DISCOVER, and
> structure — from the core: [contract/discipline.md](../../../contract/discipline.md#generic-invariant-checks-the-verify-step-generic-half).
> Those verify *loom's* invariants independent of any harness. **This file adds the Mirai
> format-checks** that complete the [`primitive→file` port](../../../contract/PORTS.md#port-4--the-primitivefile-manifest).
> Both halves are a *manual* checklist the writing agent walks; they complement the repo-level
> `scripts/validate.sh` (which link-checks framework docs, not a target's generated `.mirai/`).

## Frontmatter (Mirai format)

- [ ] Every written `.mirai/skills/<slug>/SKILL.md` opens with `---`/`---` YAML frontmatter and
      has non-empty `name` + `description`.
- [ ] Every `name` field equals its folder name exactly (kebab-case, lowercase) — the Mirai
      requirement.
- [ ] Every written `.mirai/agents/*.agent.md` has a non-empty `description`.
- [ ] Every written `.mirai/prompts/*.prompt.md` has a `description` (recommended; omitting it
      hurts discoverability).
- [ ] No unescaped colons inside unquoted YAML string values (a common silent-failure cause —
      see [wiki/environments/mirai.md](../../../wiki/environments/mirai.md)'s pitfalls section).

## File placement (Mirai)

- [ ] Exactly one of root `AGENTS.md` or `.mirai/mirai-instructions.md` exists — never both.
- [ ] No file was duplicated for the same purpose (check the Mirai provenance markers from
      [write-format.md](write-format.md#provenance-marking-for-idempotent-patching) — a patch
      should have replaced, not appended). *(Generic idempotency discipline:
      [contract/discipline.md](../../../contract/discipline.md#idempotency-rule).)*
- [ ] No leftover `{{PLACEHOLDER}}` tokens in any written file (see [write-format.md](write-format.md)).

## Model fallback arrays (Mirai render target)

- [ ] Every `model:` field is either a plain string or a well-formed YAML array of strings —
      never a bare unquoted string with a colon inside it.
- [ ] The model names used were confirmed against the user's actual Mirai model picker during
      the interview, not guessed.
- [ ] The `verifier` (if generated) uses the extended-thinking / long-context model the user
      named — not the default Deep Specialist model unless the user chose so.

## Mirai capability/invocation rendering

> The *invariant* (which roles withhold `edit`, which surface is `front-door` vs `dispatched`)
> is checked generically in [contract/discipline.md](../../../contract/discipline.md#generic-invariant-checks-the-verify-step-generic-half).
> These checks confirm the invariant was **rendered correctly into Mirai frontmatter**.

- [ ] `persist`/`interview` capabilities were written as the **actual** Mirai tool names
      (confirmed against the tool list), not a guessed alias.
- [ ] `docs-lookup` (`<server>/*`) appears in `tools:` **only** if the interview opted in.
- [ ] Stage agents (`shaping`, `planner`, `orchestrator`, `closing`) carry
      `user-invocable: true` **and** `disable-model-invocation: true`; every utility carries
      `user-invocable: false` **and** `disable-model-invocation: false`.
- [ ] No `{{ROLE_INVOCATION_SURFACE}}` token remains, and no utility carries a stale
      `user-invocable: true` from a pre-ADR-012 run (the `update` reconcile must have flipped
      it — see [write-format.md](write-format.md#role-invocation-surface)).

## Quick prompts (Mirai)

- [ ] Each `.mirai/prompts/*.prompt.md` has a non-empty **stance** line in its body.
- [ ] Each quick prompt's `agent:` is the correct base agent — `Plan` for `shape.prompt.md`,
      `agent` for `deliver.prompt.md` / `close.prompt.md` — not a stale `agent: "agent"` on the
      Shaping prompt.

## Handoff wiring (Mirai `handoffs:` schema)

- [ ] `.mirai/instructions/handoff.instructions.md` exists, has a non-empty `description`, and
      **no** `applyTo` (description-triggered, not always-on).
- [ ] If the ledger substrate includes an **on-disk folder**, it is **gitignored by default** — a
      `.gitignore` entry ignores the per-milestone artifact dirs, **unless** the user opted to
      commit them for reviewable diffs ([ADR-014](../../../wiki/adr/adr-014-loom-opencode-setup.md)
      Option A). (A memory-only substrate has nothing to gitignore.)
- [ ] Stage agents' `handoffs:` point at the next stage's agent (`shaping → planner`,
      `orchestrator → closing`), written as an **array of objects** — each entry has `label`,
      `agent`, and `prompt` (optional `send`), **never** a bare array of agent-name strings. (A
      bare array fails Mirai validation: *"Each handoff … must be an object with 'label',
      'agent', 'prompt' and optional 'send'."*)

## Report

Follow the generic [report guidance](../../../contract/discipline.md#report-after-the-checklist-passes):
created vs. patched paths (two short lists), anything deferred, and any check that failed and how
it was resolved — or, if unresolved, flagged to the user explicitly rather than silently shipped.

## Related

- [contract/discipline.md](../../../contract/discipline.md) — the generic invariant-checks to run first.
- [write-format.md](write-format.md) — the Mirai write mechanics these checks verify.
- [../setup.md](../setup.md) — step 6 runs the generic checks then these format-checks.
