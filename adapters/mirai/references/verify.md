# Verify checklist

Run every item after step 5 (Write), before reporting Done in [setup.md](../setup.md).
This is a *manual* checklist for the writing agent to walk — it complements the
repo-level `scripts/validate.sh` (which link-checks framework docs, not a target
project's generated `.mirai/`).

## Frontmatter

- [ ] Every written `.mirai/skills/<slug>/SKILL.md` opens with `---`/`---` YAML
      frontmatter and has non-empty `name` + `description`.
- [ ] Every `name` field equals its folder name exactly (kebab-case, lowercase).
- [ ] Every written `.mirai/agents/*.agent.md` has a non-empty `description`.
- [ ] Every written `.mirai/prompts/*.prompt.md` has a `description` (recommended, not
      strictly required by Mirai, but omitting it hurts discoverability).
- [ ] No unescaped colons inside unquoted YAML string values (a common silent-failure
      cause — see [wiki/environments/mirai.md](../../../wiki/environments/mirai.md)'s
      pitfalls section).

## File placement

- [ ] Exactly one of root `AGENTS.md` or `.mirai/mirai-instructions.md` exists — never
      both.
- [ ] No file was duplicated for the same purpose (check provenance markers from
      [write-format.md](write-format.md) — a patch should have replaced, not appended).
- [ ] Any `.claude/`/`.agents/` content that predates this run is still present and
      untouched, unless the interview explicitly asked for migration.

## Cross-references

- [ ] Every skill referenced by a `.mirai/prompts/*.prompt.md` body actually exists at
      `.mirai/skills/<slug>/SKILL.md`.
- [ ] Every `.mirai/agents/*.agent.md`'s `agents:` restriction list (if present) names
      agents that actually exist in `.mirai/agents/`.
- [ ] No leftover `{{PLACEHOLDER}}` tokens in any written file (see
      [write-format.md](write-format.md)).

## Model fallback arrays

- [ ] Every `model:` field written is either a plain string or a well-formed YAML array
      of strings — never a bare unquoted string with a colon inside it.
- [ ] The model names used were confirmed against the user's actual Mirai model picker
      during the interview, not guessed.

## Report

After the checklist passes, report to the user:

- Paths created vs. paths patched (two short lists, not a diff dump).
- Anything skipped or deferred from the interview (e.g. "utility agents skipped").
- Any checklist item that failed and how it was resolved (or, if unresolved, flagged to
  the user explicitly rather than silently shipped).
</content>
