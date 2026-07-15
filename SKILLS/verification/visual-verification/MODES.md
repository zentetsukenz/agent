# Verification Modes

Pick one mode per dispatch. Mixing modes in one report muddies the verdict.

## Exploratory

**When**: No specific baseline or spec to compare against — you just need eyes on the current
state. Most common for "does this look right" after implementing something new.

**Procedure**: Capture per [CAPTURE.md](CAPTURE.md), then assess against the relevant
[DIMENSIONS.md](DIMENSIONS.md) categories. Report anything that looks wrong, inconsistent, or
unpolished, prioritized by severity.

**Report shape**:

```markdown
## Page Overview
[What page/view is shown, viewport used]

## Dimensions Checked
[Which categories from DIMENSIONS.md were in scope]

## Issues Found
- [Specific issue, with location, severity: blocking / minor / cosmetic]

## Recommendation
[Priority-ordered fixes]
```

## Baseline-regression

**When**: Confirming a change didn't break anything *unrelated* — comparing current state against
a prior known-good capture (a saved screenshot, a described prior state, or a git-adjacent
reference point).

**Procedure**: Capture the current state using the *exact same* URL, viewport, and interaction
steps used for the baseline (determinism matters more here than anywhere else — see
[CAPTURE.md](CAPTURE.md) step 7). Diff mentally or via tooling against the baseline. Only report
deltas — don't re-litigate pre-existing issues that aren't regressions.

**Report shape**:

```markdown
## Baseline
[What the baseline was — screenshot path, description, or commit reference]

## Current State
[What changed in the capture setup, if anything — should be "nothing, same steps"]

## Deltas Found
- [Specific visual difference vs baseline, with location]
- [Mark each as: intentional (expected from this change) / regression (unexpected)]

## Verdict
[PASS — no unintended regressions | FAIL — N regressions found, listed above]
```

## Spec-conformance

**When**: Checking implementation against a design mockup, Figma spec, design tokens, or written
design requirements.

**Procedure**: Capture per [CAPTURE.md](CAPTURE.md). Compare each relevant dimension against the
spec's stated values (spacing tokens, color tokens, typography scale, breakpoint behavior) rather
than a general aesthetic judgment. Where the spec is ambiguous or silent, say so rather than
inventing a requirement.

**Report shape**:

```markdown
## Spec Reference
[What spec/mockup/token set this was checked against]

## Conformance Check
| Dimension | Spec | Observed | Match? |
|---|---|---|---|
| [e.g. spacing between cards] | [e.g. 16px] | [e.g. 12px] | ❌ |

## Gaps Found
- [Each mismatch, with severity]

## Ambiguous / Unspecified
- [Anything the spec didn't cover, flagged rather than guessed]

## Verdict
[CONFORMS | N gaps found, listed above]
```
