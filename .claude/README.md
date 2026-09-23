# `.claude/` — the Claude Code harness config

Generated during harness onboarding, 2026-09-20. Committed deliberately: it is reviewable, it
reproduces for anyone cloning loom, and it is the empirical source material for a future
`adapters/claude-code/`.

**This is not an adapter.** It is one harness configured by hand, on the repo that defines what
adapters are. Turning it into `adapters/claude-code/` means answering the five
[port obligations](../contract/PORTS.md) properly and recording a setup ADR — see *Open questions*.

## What is here

| Path | What it does |
|---|---|
| `settings.json` | Model, permission allowlist, and the two gate hooks |
| `hooks/validate-gate.sh` | Runs `scripts/validate.sh`; blocks on **new** violations only |
| `hooks/validate-baseline.txt` | Known, ticketed breaks. Every line cites an open issue |
| `agents/` | `editor` · `explore` · `pm` · `thoth` · `adapter-conformance` · `corpus-cartographer` |
| `commands/` | `/validate` · `/tick` · `/adr-new` |
| `skills/` | **Symlinks** into `SKILLS/<bucket>/<slug>/` — never copies |

## Who does what

| Actor | Model | Role |
|---|---|---|
| **main session** | Opus | Front door. The human talks here first. Architecture, judgment, trade-offs, review. |
| `editor` | Sonnet / Haiku | Mechanical application of specified edits — code and prose. |
| `explore` | Haiku | Read-only locator — broad fan-out search, returns paths and a short answer. |
| `pm` | Opus | The macro-PM resident agent. Owns the board. Pulled by `/tick`, never scheduled. |
| `thoth` | Sonnet | Wiki scribe — OKF curation, crosslinks, audits, queries. |
| `adapter-conformance` | Sonnet | Read-only reviewer: five ports answered, nothing restated that should be linked. |
| `corpus-cartographer` | Sonnet | Graphify operator — builds and reads the knowledge graph. |

**Standing delegation rule.** Route by default: decide *what* changes in the main session, hand
the *application* to `editor`, hand bulk searching to `explore` — this repo's Haiku locator,
which shadows Claude Code's built-in `Explore`. Do it inline only when the edit is trivial
(under ~5 lines) or when the right wording only emerges while writing it — a subagent
round-trip costs more context than it saves on small prose, and prose is what this repo is made
of. Say which path was taken.

## The gate

Two hooks, one script. `PostToolUse` fires after every `Write`/`Edit`/`Bash`; `Stop` fires before
control returns to the human, catching deletes, renames, and Bash-authored changes. A full sweep is
~200ms, so the gate runs unconditionally rather than trying to be clever about scope.

It blocks on violations *not* in the baseline. The baseline is an accepted-debt register, not a mute
button: no issue, no entry.

Verified failing (per `REGISTRY.md` discipline): with the baseline in place and a deliberate broken
link added to `docs/wisdom.md`, the gate exited **2** and reported only the new violation; with the
link reverted, it exited **0** while ADR-029's baselined break was still present.

## Why skills are symlinks

An adapter *copies* `SKILLS/` into the harness directory. Here the harness directory and the source
are the same repo, so a copy would be a second copy drifting from the first — precisely the
restatement ADR-013 forbids. Editing a skill and invoking it are the same file.

**A real `adapters/claude-code/` must still emit copies** for target projects. The symlink is a
dogfooding affordance of loom-on-loom, not the port answer.

## Open questions this config raises

1. **Claude Code's archetype is not in the taxonomy.**
   [harness-archetypes](../wiki/patterns/harness-archetypes.md) has two axes: who holds the loop,
   and headless-dispatchability. Claude Code is per-invocation *and* headless-dispatchable *and*
   resident-capable (scheduled routines can hold a loop). That is a cell the table does not have.
   The pattern says the resident inversion is worth generalizing into the core only when a *second*
   resident harness needs it — Claude Code may be that second member, which would make this a real
   seam rather than a hypothetical one.

2. **The altitude seam is in-harness here.** `pm` holds the macro loop and the main session does
   micro work, both in Claude Code. The cross-harness substrate constraint in
   [seam-artifact-protocol](../wiki/patterns/seam-artifact-protocol.md#substrate-is-also-altitude-scoped)
   is not forced. Whether that changes the port answers is unrecorded.

3. **The resident loop is human-pulled.** `/tick` replaces a scheduler. Faithful to the seed's
   statelessness, but it is a deliberate deviation from "the agent holds the loop" and belongs in a
   setup ADR.

## Environment prerequisites

- **`gh` ≥ 2.47** — `scripts/loom/board/gh.js` needs the `blockedBy`/`blocking`/`parent` JSON
  fields. The distro's 2.46 fails with `Unknown JSON field: "blockedBy"` and takes the whole board
  CLI down with it. This is [recall slop](../wiki/patterns/ratchet.md) — a forgotten environment
  fact — and by that pattern's first-occurrence rule it should be ratcheted into a Mechanism
  (a preflight check), not left as prose in this file.
- **Graphify** — `uv tool install graphifyy`. Output goes to `graphify-out/`, gitignored.
