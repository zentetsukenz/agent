---
description: Run the loom gate (scripts/validate.sh) and explain any failure in loom's own vocabulary.
allowed-tools: Bash(bash scripts/validate.sh:*), Bash(cat:*), Read, Grep
---

Run `bash scripts/validate.sh` and report the result.

- If it passes clean, give the summary line and stop. No commentary.
- If it fails, separate **new** violations from those already recorded in
  `.claude/hooks/validate-baseline.txt` (each baselined line cites an open issue — name the issue).
  New violations are yours to fix; baselined ones are not, unless asked.
- Name what each violation actually breaks: a missing `type:` is OKF non-conformance, a dangling
  relative link breaks `SPEC.md`'s cross-linking rule, an orphan means no page routes to the file.
- `preservation.validate-passes` in `GATE.md` is an `executable` criterion grounded by this script
  (`REGISTRY.md`). If the gate is red, that criterion is failing — say so.

Never edit `.claude/hooks/validate-baseline.txt` to make a failure disappear. A baseline entry
requires an open issue first.
