---
type: ADR
title: The explore utility gains read-only shell so recon can run gh/git reads — edit stays withheld to hold the read-only line
status: Accepted
timestamp: 2026-08-18T00:00:00Z
tags: [agent, role, explore, utility, capability, shell, recon, dispatch, opencode, mirai, loom]
---

# ADR-023: `explore` Is a Read-Only Shell Recon Tier

> Extends [ADR-021](adr-021-shaping-research-orchestrator.md) (which made Shaping a read-only
> research orchestrator dispatching recon to the cheap `explore` tier) and
> [ADR-006](adr-006-capability-based-roles.md) (capability-based roles, withhold-as-forcing-
> function). It adds **no new primitive and no new port** — it widens one utility's generic
> capability set by one capability and states why that stays read-only. ADR-021's body is
> unchanged; this ADR supersedes its narrower "`explore` is `read`+`search` only" render note.

## Context

[ADR-021](adr-021-shaping-research-orchestrator.md) made Shaping a read-only research
orchestrator that **dispatches recon reading to the cheap Utility-tier
[`explore`](../../contract/primitives.md#utility-agents-cross-stage)** so the expensive
Communicator context stays lean. But `explore`'s generic capability set was `read`, `search`
only — **no `shell`**. That is narrower than the recon it is dispatched to do:

- `gh` is the project's tracker-access mechanism ([macro-PM](adr-018-macro-project-management.md)
  handoff protocol). An `explore` that cannot run `gh` cannot read issues, PRs, or CI runs — the
  *most common* recon task during wayfinder/grilling sessions.
- Git history queries (`git log`, `git diff`, `git blame`, `git show`) are standard recon.
- Project read commands (`mix test --failed`, `mix credo`, `cat`, `ls`) are recon, not mutation.

Observed in practice: a dispatched `explore` reported it had no shell tool and bounced the work
back to the parent (Shaping) agent, which then ran the commands itself — **defeating the
delegation contract** ADR-021 set up (the expensive tier absorbs raw recon output the cheap tier
was supposed to distill). The role's **interface (capability set) was again narrower than its
implementation (the recon it is handed) demanded** — the same leaky-seam shape ADR-021 closed for
Shaping's `delegate`, one tier down.

## Decision

**Grant `explore` a read-only `shell`.** Its generic capability set becomes:

```
read, search, shell   — no edit, no delegate, no persist
```

- **`shell` is for read-only recon** — `gh`/`git` read commands and project read commands. The
  cheap tier can now do the reading it is dispatched to do, and return **distilled evidence, not
  raw context** (the ADR-021 / Arbor isolation the dispatch exists for).
- **`edit` stays withheld — that is the read-only forcing function**, not the absence of `shell`.
  loom already treats **`shell` + withheld `edit`** as the safe read-only tier: the `verifier`
  (`read`, `search`, `shell`, `persist` — **no `edit`**) and `visual-qa` (`read`, `search`,
  `shell` — **no `edit`**) both run shell to gather evidence while `edit: deny` guarantees they
  verify, they don't fix. `explore` now matches that idiom, minus `persist`/`delegate` (it reports
  back, it neither writes the ledger nor dispatches).
- **Render bindings.** OpenCode: `permission: { edit: deny, bash: allow }` on the emitted
  `.opencode/agents/explore.md`. Mirai: list the `execute` tool (Mirai withholds by omission);
  `edit` remains unlisted. Both resolve through the existing
  [`capability→tool` port](../../contract/PORTS.md#port-1--capabilitytool) — no port change.

## Consequences

- The delegation contract holds: recon `gh`/`git` reads run on the cheap Utility tier instead of
  bouncing to the expensive Communicator — the ADR-021 cost win is realized, not just intended.
- The read-only guarantee is intact: `explore` still cannot write code or the ledger (`edit`,
  `persist`, `delegate` all withheld).
- One more utility joins the `shell` + `edit: deny` read-only pattern (`verifier`, `visual-qa`,
  now `explore`) — the convention is now explicit, not incidental.

## Alternatives considered

- **Document the limitation instead; route shell recon to `quick`/`deep`.** The issue's option
  (b). Rejected: it pushes recon reading into the expensive edit-capable tiers, the opposite of
  ADR-021's cost goal, and leaves the leaky seam open.
- **Per-command `bash` allow-listing (e.g. only `gh`/`git`/`cat`).** Rejected: fragile,
  harness-specific (OpenCode supports pattern gating; the generic model does not), and redundant —
  the withheld `edit` already holds the read-only line without enumerating shell commands.
- **A new "read-only shell" capability variant.** Rejected: over-engineered. `shell` + withheld
  `edit` already expresses it, per the `verifier`/`visual-qa` precedent.

## Related

- [contract/primitives.md](../../contract/primitives.md#utility-agents-cross-stage) — the amended `explore` capability row.
- [ADR-021](adr-021-shaping-research-orchestrator.md) — the research-orchestrator dispatch this completes at the `explore` tier (its "`read`+`search` only" render note is superseded here).
- [ADR-006](adr-006-capability-based-roles.md) — capability-based roles; withhold-as-forcing-function (`edit: deny` is the read-only line).
- [ADR-008](adr-008-delivery-dispatchers.md) / [ADR-009](adr-009-frontend-domain-utility.md) — the `verifier` and `visual-qa` `shell` + no-`edit` read-only precedents this mirrors.
- [adapters/opencode/STAGES.md](../../adapters/opencode/STAGES.md), [adapters/opencode/references/verify.md](../../adapters/opencode/references/verify.md), [adapters/mirai/STAGES.md](../../adapters/mirai/STAGES.md) — the render notes + verify checklist.
