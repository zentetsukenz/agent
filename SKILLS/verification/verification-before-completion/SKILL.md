---
name: verification-before-completion
description: The procedure for producing fresh evidence before any completion claim — a phased, adversarial checklist (functional, structural, automated tests, success-criteria, manual/boundary, regression) plus failure forensics and an evidence-handoff shape. Operationalizes the verification-culture iron law. Use before marking a task complete, before any success claim, or when asked to "verify", "QA this", or "validate completion".
---

# Verification Before Completion

> **Strategy**: Trust but verify — this skill is the _procedure_ that operationalizes the
> [verification-culture](../../../wiki/principles/verification-culture.md) **iron law**
> (_no completion claim without fresh evidence_). The principle is the _law_; this skill is the
> _how_.

The law itself, its gate function, and its rationalization table live in the principle — this skill
does not restate them. What lives here is the **procedure**: what to actually run, in what order,
how to probe adversarially, and how to hand off a failure.

## Trigger

- After implementing any change, before marking a task complete or saying "done".
- Before committing / opening a PR / advancing to the next task, or before trusting an agent report.
- When the human says "verify task", "QA this", "check my work", or "validate completion".

## Resolve the commands, harness-agnostically

This skill names _what kind_ of evidence to gather; the **concrete commands come from the project**,
never hardcoded here. Resolve them from the project's
[quality baseline](../../../wiki/patterns/quality-baseline.md) and its committed scripts
(lint / typecheck / test / build / e2e), and its server coordinates from project config or env —
never assume ports or package-manager names. If servers must be running and are not, use
[server-operations](../../implementation/server-operations/SKILL.md) first.

## The phased procedure

Run in order. **Any phase fails → STOP** and produce the failure handoff — do not spend context on
later phases.

1. **Functional** — run it and _see_ it work. Not "I added the code" / "it should work", but
   "I ran it and observed `<expected outcome>`".
2. **Structural** — the project's lint + typecheck are clean; no debug/leftover code; follows
   project patterns. Zero errors (intentional warnings excepted).
3. **Automated tests** — run targeted tests first, then the broader suite. All green; coverage meets
   the project's floor; no silently-skipped tests. For a regression test, prove the red→green cycle
   (it must fail without the fix), not just a single pass.
4. **Success criteria (adversarial)** — treat the work as guilty until proven innocent. Re-read the
   plan/criteria, check each line-by-line, and attack: what input or state breaks this? Stated
   criteria are the _minimum_, not the maximum.
5. **Manual + boundary** — exercise the happy path, the error paths, loading/empty states, and the
   edges: empty (`""`,`[]`,`{}`,null), max length, negative, zero, overflow, and special chars
   (`<script>`, quotes, newlines, unicode/emoji).
6. **Visual (if UI changed)** — delegate to [visual-verification](../visual-verification/SKILL.md)
   so screenshot bytes never enter this context.
7. **Runtime (if frontend)** — no console errors, framework warnings, or failed requests; debug via
   [frontend-runtime-debugging](../../implementation/frontend-runtime-debugging/SKILL.md).
8. **Regression** — run the suite over affected areas to catch collateral damage; confirm any
   migrations applied and integration with the rest of the system.

## Confidence rating

Rate each verified criterion — a pass is not automatically "correct":

| Score      | Meaning                                                                         |
| ---------- | ------------------------------------------------------------------------------- |
| **HIGH**   | Proven via automated test **and** logic review.                                 |
| **MEDIUM** | Passes checks but has caveats (unclear edge cases, or logic review shows risk). |
| **LOW**    | Cannot fully verify — no test, or only indirect/circumstantial evidence.        |

Any LOW-confidence criterion must be flagged in the report **even if it appears to pass**.

## Document the evidence (out of context)

Record what was verified as short, checkable lines (command → result). Keep large outputs _out_ of
context: pipe through `tail`/`head`/`grep`, and save full logs to the project's evidence directory
rather than dumping them inline.

## Failure forensics

When a phase fails, investigate — don't just report "FAILED":

1. **Isolate** — narrow to the smallest failing scope.
2. **Minimize** — strip to the smallest reproduction; record the exact command.
3. **Classify** — compilation / assertion / runtime / timeout / flaky / environment.
4. **Root cause (brief)** — best hypothesis + supporting evidence + what to check first.
5. **Impact** — blocker / minor / edge case / pre-existing-and-unrelated.

Escalate after ~3 distinct approaches fail: try the obvious fix, then a different angle, then hand
off to the human with what was tried and why each failed.

## Failure handoff shape

```markdown
# Verification Failure: <task>

**Status**: ❌ FAILED at Phase <N> (<phase name>)

## Summary <1–2 sentences: what's broken>

## Reproduction <exact command to see the failure>

## Evidence <10–20 lines of the relevant error only, truncated>

## Analysis root-cause hypothesis · confidence (H/M/L) · impact

## Context files involved · related code · phases that passed before failure

## Fix direction most-likely fix · alternative · what to check if neither works

## Re-verify with <the command that will prove the fix>
```

## Related

- [verification-culture](../../../wiki/principles/verification-culture.md) — the iron law this procedure serves.
- [quality-baseline](../../../wiki/patterns/quality-baseline.md) — supplies the concrete lint/test/coverage commands and floor.
- [visual-verification](../visual-verification/SKILL.md) — the isolated visual check phase 6 delegates to.
- [frontend-runtime-debugging](../../implementation/frontend-runtime-debugging/SKILL.md) — runtime symptom diagnosis for phase 7.
- [derive-e2e-coverage](../derive-e2e-coverage/SKILL.md) — turns discovered coverage gaps into durable e2e guards (the former "gap analysis" step, now its own judgment).
- [server-operations](../../implementation/server-operations/SKILL.md) — bring servers up before functional/manual phases.
