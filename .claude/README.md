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
| `agents/` | Subagent definitions — identity, capabilities, and wired skills per actor |
| `commands/` | `/validate` · `/tick` · `/adr-new` |
| `skills/` | **Symlinks** into `SKILLS/<bucket>/<slug>/` — never copies |

## Who does what

Each actor's model, permissions, and role are defined in its own file under
[`agents/`](agents/) — read the frontmatter, not this README.

**main session** (no agent file — it is the harness default): Front door. The human talks here
first. Architecture, judgment, trade-offs, review.

**Standing delegation rule.** Inline only when the edit is trivial (under ~5 lines) or when the
right wording only emerges while writing it — a subagent round-trip costs more context than it
saves on small prose, and prose is what this repo is made of. Say which path was taken. This
repo's `explore` shadows Claude Code's built-in `Explore`.

## The gate

Two hooks, one script. `PostToolUse` fires after every `Write`/`Edit`/`MultiEdit`/`NotebookEdit`/
`Bash`; `Stop` fires before control returns to the human, catching deletes, renames, and anything
`PostToolUse` missed. `post-edit` mode skips non-Markdown file edits but always runs for `Bash`,
which can author Markdown without a `file_path` — a full sweep is ~200ms either way.

It blocks on violations *not* in the baseline. What belongs in the baseline is governed by the
rule in [`hooks/validate-baseline.txt`](hooks/validate-baseline.txt)'s own header comment.

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

Three, each now on the board rather than drifting here:

- [#54](https://github.com/zentetsukenz/agent/issues/54) — Claude Code's archetype is a cell
  `harness-archetypes` does not have.
- [#55](https://github.com/zentetsukenz/agent/issues/55) — the altitude seam is in-harness here;
  are the port answers unchanged?
- [#56](https://github.com/zentetsukenz/agent/issues/56) — the resident loop is human-pulled, and
  that belongs in a setup ADR.

## Environment prerequisites

- **`gh` ≥ 2.47** — see [#36](https://github.com/zentetsukenz/agent/issues/36), which exists to
  ratchet this into a preflight Mechanism. Prose is the destination that ticket rejects, so this
  line is a pointer, not a third copy.
- **Graphify** — `uv tool install graphifyy`.
