---
description: Refresh an existing loom-in-Mirai setup — idempotent, targeted re-interview scoped to what changed in loom or the project since the last run.
---

Update loom for Mirai: $ARGUMENTS

Use the `setup-loom` skill in `update` mode. Diff the existing `.mirai/` config against loom's current `SKILLS/`, `workflows/sdlc/`, and `adapters/mirai/*` per the "Detecting drift" section of `SKILLS/meta/setup-loom/SKILL.md`, run a targeted interview covering only what changed, present the proposed patch, confirm, write in place (never duplicate), verify, and report patched paths.
</content>
