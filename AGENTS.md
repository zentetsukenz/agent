# Agent Instructions — loom framework

## What this is

loom is a **content-only** agent framework. No runtime, no build step—just Markdown files organized into skills, wiki pages, agent definitions, commands, and docs. Everything lives under this repo root.

## Project structure

```
skills/       — Reusable agent skills, bucketed by lifecycle phase
workflows/    — Prose-first orchestration seeds (SDLC + others) compiled by adapters
wiki/         — OKF v0.1 knowledge base (progressive-disclosure)
agents/       — Agent definition files (identity + wired skills)
commands/     — Slash command wrappers
docs/         — Framework meta-documentation
adapters/     — Placeholder for v2 adapter layer
scripts/      — Validation utilities
```

## Key files

| File | Purpose |
|------|---------|
| [SPEC.md](SPEC.md) | Conformance rules — read this before creating any file |
| [index.md](index.md) | Progressive-disclosure root |
| [scripts/validate.sh](scripts/validate.sh) | Validates frontmatter and links |
| [docs/wisdom.md](docs/wisdom.md) | Core principles guiding all agents |

## Validation

Run before committing:

```sh
bash scripts/validate.sh
```

This checks:

- SKILL.md files have valid `name` (kebab-case, ≤64 chars) and `description` (≤1024 chars) in YAML frontmatter
- Wiki `.md` files have `type:` in YAML frontmatter
- All relative Markdown links resolve to existing files

## Conventions

### Skill files (`SKILLS/<bucket>/<slug>/SKILL.md`)

- **Must** open with YAML frontmatter containing `name` and `description`
- `name`: kebab-case, lowercase, ≤64 chars, no leading/trailing hyphens
- Lifecycle buckets: `discovery`, `planning`, `implementation`, `verification`, `preservation`, `meta`
- Each bucket has an `index.md` cataloging its skills

### Wiki files (`wiki/**/*.md`)

- **Must** have YAML frontmatter with `type:` (Principle | Pattern | Environment | Term | Index | Log | ADR)
- Progressive disclosure: `index.md` at each level summarizes children
- Each subtree has a `log.md` for chronological changes

### Cross-linking

- Always use **relative paths** from repo root (e.g., `wiki/patterns/deep-modules.md`)
- No absolute paths, no `../` escaping the repo
- No duplicating content that exists elsewhere—link to it

### Agent files (`agents/<name>.md`)

- YAML frontmatter with `description`, `mode`, `model`, `permission`
- Compose behavior by wiring skills and referencing wiki context

## Common pitfalls

1. **Forgetting frontmatter** — Every skill and wiki file needs it. The validator will catch this.
2. **Broken links** — `validate.sh` checks all relative links. Add new files to the relevant `index.md`.
3. **Duplicating content** — Link, don't embed. If knowledge exists in `wiki/` or `docs/`, reference it.
4. **Wrong lifecycle bucket** — Check [SPEC.md](SPEC.md) bucket definitions before placing a skill.
5. **Non-kebab-case names** — Skill `name` field must be strict kebab-case (`my-skill`, not `mySkill`).
