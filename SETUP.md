# Setting up loom in Mirai

You're an AI coding agent running inside the **Mirai** VS Code harness. A human has
pointed you at this file because they want loom's SDLC framework (skills, agents,
prompts) wired up for their project.

**Paste this whole file's instructions to yourself** (or have the human paste it into a
fresh Mirai chat) to bootstrap the setup.

## What to do

1. Open [SKILLS/meta/setup-loom/SKILL.md](SKILLS/meta/setup-loom/SKILL.md) and follow it
   exactly. It is a **user-invocable, interview-driven** skill — it will explore the
   target project, interview the human one question at a time (always leading with a
   recommended default), present a proposed `.mirai/` configuration, wait for
   confirmation, write it in Mirai's exact format, and verify the result.
2. If this is the **first time** setting up loom for this project, run it in `init` mode.
   If a `.mirai/` config already exists from a prior loom setup, run it in `update` mode
   instead — see the skill's "Mode: `init` vs `update`" section for how to tell which
   applies.
3. Do not skip the interview to save time. A mechanical copy of loom's skills produces
   bloat and irrelevant triggers — the interview is what makes the result fit the actual
   project. See [ADR-004](wiki/adr/adr-004-loom-mirai-setup.md) for why.

## What you'll produce

A `.mirai/` tree tailored to the target project:

- `.mirai/agents/*.agent.md` — per-stage deep-workflow agents, plus any utility agents
  the human wants.
- `.mirai/prompts/*.prompt.md` — per-stage quick-combo prompts.
- `.mirai/skills/<slug>/SKILL.md` — the subset of loom's `SKILLS/` the project adopted.
- Root `AGENTS.md` (or `.mirai/mirai-instructions.md` — never both) — the project's own
  conventions, plus a short pointer to what loom wired up.

## Reference material the skill will consult

You do not need to read these up front — the skill points you at each one exactly when
it's needed:

- [wiki/environments/mirai.md](wiki/environments/mirai.md) — Mirai's six customization
  primitives and their exact frontmatter.
- [adapters/mirai/MAPPING.md](adapters/mirai/MAPPING.md) — the SKILLS→`.mirai/skills`
  table and the model-archetype table.
- [adapters/mirai/STAGES.md](adapters/mirai/STAGES.md) — the Shaping/Delivery/Closing
  stage rosters and workflow-prose sourcing.

## If you're not sure this is the right tool

This file only sets up the **Mirai** harness. If the target project uses a different
tool (Cursor, Aider, plain Claude, OpenCode), there is no adapter for it yet — see
[ADR-001](wiki/adr/adr-001-adapter-pattern.md). Say so rather than improvising a
non-Mirai config with this skill.
</content>
