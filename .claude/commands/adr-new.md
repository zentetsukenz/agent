---
description: Scaffold a conforming ADR — frontmatter, body skeleton, index row, and log entry.
argument-hint: "<short-slug> <one-line decision>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Draft a new ADR for: $ARGUMENTS

An ADR is not done when the file exists. It is done when it is **registered**. Produce all three:

1. **The file** — `wiki/adr/adr-<NNN>-<slug>.md`, where `<NNN>` is the next free number (check
   `ls wiki/adr/`). Frontmatter: `type: ADR`, a `title` that states the decision rather than naming
   the topic, `status: Proposed` (or `Accepted` if the human has already decided), `timestamp`,
   and `tags` ending in `loom`.

2. **The index row** — `wiki/adr/index.md`. Match the existing rows: link, a dense one-cell summary
   of what was decided and *why it was not the obvious alternative*, status, tags. Skim two
   neighbouring rows before writing; this repo's rows are substantive, not one-liners.

3. **The log entry** — `wiki/adr/log.md`, dated, leading with the ADR link and title, stating the
   problem, the **Decision:**, and what it supersedes or does not. Close with where it was
   registered.

Rules:

- If it supersedes another ADR, say so in a blockquote at the top of the body **and** state what is
  explicitly *not* reversed. Narrow supersessions are the norm here; blanket ones are suspect.
- Cite evidence, not intuition. Where a decision came from measurement, give the numbers.
- Never link to a path under `.loom/` — that tree is gitignored and ephemeral, and a permanent ADR
  citing it is exactly the defect issue #31 records.
- Run `bash scripts/validate.sh` before reporting done: a new ADR with no index row is an orphan and
  the gate will block it.

Ask the human before assigning `status: Accepted`. Recording a decision they have not made is the
one failure mode this command must never have.
