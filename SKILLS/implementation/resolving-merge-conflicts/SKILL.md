---
name: resolving-merge-conflicts
description: 'Resolve an in-progress git merge or rebase conflict by recovering each side''s original intent, preserving both where possible, running the project''s checks, and finishing the merge/rebase. Use when a merge/rebase/cherry-pick stops with conflicts, a commit at a quality gate hits a conflict, or the user says "resolve conflicts", "fix the merge", "the rebase is stuck".'
---

# Resolving Merge Conflicts

Resolve an **in-progress** merge, rebase, or cherry-pick that has stopped on conflicts. The goal
is to preserve the _intent_ behind each side, not to mechanically pick a hunk. **Always resolve;
never `--abort`** unless the user explicitly asks to bail out.

This is the recovery path for a commit that collides at a
[quality gate](../../../workflows/sdlc/implementation.md#quality-gates): when
[commit-often](../../../wiki/principles/commit-often.md) says "commit the slice" but the branch has
moved underneath you, resolve the conflict here, then complete the commit and continue the gate.

## Process

### 1. See the current state

Establish what operation is in flight and what actually conflicts before touching anything.

```sh
git status                 # merge? rebase? cherry-pick? which files conflict?
git log --oneline -5        # recent history on this branch
git diff                    # the conflict hunks in context
```

Identify the operation (`MERGING`, `REBASE`, `CHERRY-PICKING`) — it changes how you finish in
step 5. Note every file listed as "both modified" / "unmerged".

### 2. Find the primary sources for each conflict

For **each** conflicting hunk, understand _why_ each side made its change and what the original
intent was. Do not guess from the diff alone.

- Read the commit messages on both sides (`git log --merge -p <file>`).
- Check the originating PRs, issues, or tickets where they exist.
- If the project has a domain glossary or ADRs in the area you're touching, read them — a conflict
  often reflects two readings of the same concept, and the glossary settles which is canonical.

### 3. Resolve each hunk

- **Preserve both intents where possible** — most conflicts are two independent changes to nearby
  lines, not genuine contradictions. Keep both.
- **Where genuinely incompatible**, pick the side matching the merge's stated goal (the feature
  you're merging in, or the base you're rebasing onto) and note the trade-off you made.
- **Do NOT invent new behaviour** to bridge the two sides — resolving a conflict is not the moment
  to redesign. If neither side is right, that is a finding to raise, not a thing to freelance.
- Remove every conflict marker (`<<<<<<<`, `=======`, `>>>>>>>`) and stage each resolved file.

### 4. Run the project's automated checks

Discover the project's checks (don't assume `npm`) and run them in this order, fixing anything the
merge broke:

1. **Typecheck / compile** — the merge may have combined two type-valid sides into an invalid whole.
2. **Tests** — run the relevant suite; a clean textual merge can still be behaviourally wrong.
3. **Format / lint** — normalise before committing.

A conflict resolved to green text but red tests is **not** resolved. This is the same
evidence-before-done bar as [verification-culture](../../../wiki/principles/verification-culture.md).

### 5. Finish the merge/rebase

Complete the operation you identified in step 1:

- **Merge:** stage everything and `git commit` (the merge message is pre-populated — keep it).
- **Rebase:** `git add` the resolved files, then `git rebase --continue`. **Repeat steps 1–4 for
  each subsequent commit** the rebase stops on, until all commits are replayed.
- **Cherry-pick:** `git add`, then `git cherry-pick --continue`.

Confirm the operation is done (`git status` is clean, no `REBASE`/`MERGING` state left).

## Anti-patterns

- ❌ `git merge --abort` / `git rebase --abort` to escape — resolve, don't run away (unless asked).
- ❌ Picking a whole side (`--theirs` / `--ours`) blindly without reading why each changed.
- ❌ Inventing new behaviour to reconcile the two intents.
- ❌ Committing the resolution without running the project's typecheck/tests.
- ❌ Leaving conflict markers or unmerged paths behind.
- ❌ On a rebase, resolving only the first stop and assuming the rest replay cleanly.

## Related Skills

- [tdd](../tdd/SKILL.md) — the suite you re-run in step 4 to prove the resolution is behaviourally sound.
- [diagnosing-bugs](../diagnosing-bugs/SKILL.md) — when a resolved-but-broken merge needs root-causing.
- [commit-often](../../../wiki/principles/commit-often.md) — the principle whose gate-commit this skill unblocks.
- [verification-culture](../../../wiki/principles/verification-culture.md) — the evidence bar the step-4 checks satisfy.
