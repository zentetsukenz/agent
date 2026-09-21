# CLAUDE.md

@AGENTS.md

<!-- loom:claude-code:begin — generated during harness onboarding 2026-09-20; edit inside the markers -->

## Claude Code specifics

Everything above is harness-neutral (`AGENTS.md`). This section is the Claude Code **delta** only —
per [ADR-013](wiki/adr/adr-013-shared-adapter-contract-core.md), reference, never restate.

### The gate runs itself

`scripts/validate.sh` is wired to two hooks (`.claude/settings.json`), both calling
`.claude/hooks/validate-gate.sh`:

- **PostToolUse** — after any `Write`/`Edit`/`Bash`, re-runs the gate. Markdown-only for file edits;
  unconditional for `Bash`, which can author Markdown without a `file_path`.
- **Stop** — before control returns to the human. Catches deletes, renames, and anything the
  PostToolUse pass missed.

The gate blocks on **new** violations only. `.claude/hooks/validate-baseline.txt` records known
breaks, and every line there must cite an open issue — a baseline entry is an accepted debt, never a
silencer. Do not add to it to get unblocked; fix the break or file the issue first.

### Who does what

| Actor | Model | Role |
|---|---|---|
| **main session** (this one) | Opus | Front door. The human talks here first. Architecture, judgment, trade-offs, review. |
| `editor` | Sonnet / Haiku | Mechanical application of specified edits — code and prose. |
| `explore` | Haiku | Read-only locator — broad fan-out search, returns paths and a short answer. |
| `pm` | Opus | The macro-PM resident agent, rendered onto Claude Code. Owns the board. Pulled by `/tick`, never scheduled. |
| `thoth` | Sonnet | Wiki scribe — OKF curation, crosslinks, audits, queries. |
| `adapter-conformance` | Sonnet | Read-only reviewer: four ports answered, nothing restated that should be linked. |
| `corpus-cartographer` | Sonnet | Graphify operator — builds and reads the knowledge graph. |

**Standing delegation rule.** Route by default: decide *what* changes here, hand the *application*
to `editor`, hand bulk searching to `explore` — this repo's Haiku locator, which shadows Claude
Code's built-in `Explore`. Do it inline only when the edit is trivial (under ~5 lines) or when the
right wording only emerges while writing it — a subagent round-trip costs more context than it saves
on small prose, and prose is what this repo is made of. Say which path was taken.

### Altitude

This repo runs both altitudes in one harness ([ADR-018](wiki/adr/adr-018-macro-project-management.md)):
`pm` holds the macro loop, the main session and `editor` do micro work. The
[altitude seam](wiki/glossary/index.md#altitude-seam) is therefore **in-harness**, not cross-harness —
the shared-on-disk substrate constraint in
[seam-artifact-protocol](wiki/patterns/seam-artifact-protocol.md#substrate-is-also-altitude-scoped)
is not forced here, though `.loom/` remains the convention.

Claude Code's archetype is not yet recorded in
[harness-archetypes](wiki/patterns/harness-archetypes.md): it is per-invocation *and*
headless-dispatchable *and* resident-capable (scheduled routines), which is a cell that taxonomy does
not yet have. See `.claude/README.md`.

### Environment facts that bite

- **`gh` must be ≥ 2.47.** `scripts/loom/board/gh.js` requests the `blockedBy`/`blocking`/`parent`
  JSON fields; older `gh` fails with `Unknown JSON field: "blockedBy"` and the whole board CLI dies.
- **SSH to GitHub does not work in the sandbox** — no `~/.ssh`, no keys, credential injection is
  HTTPS-only. `origin` is an SSH remote, so `git fetch origin` fails; fetch from
  `https://github.com/zentetsukenz/agent.git` explicitly.

### Skills

`.claude/skills/*` are **symlinks** into `SKILLS/<bucket>/<slug>/`. Editing a skill and invoking it
are the same file. Never replace a symlink with a copy.

<!-- loom:claude-code:end -->
