---
type: Log
title: Wiki Changelog
description: Version history and updates to the agent wiki
tags: [changelog, log, history]
timestamp: 2026-01-07T00:00:00Z
---

# Wiki Changelog

Version history and updates to the agent wiki.

---

## v0.1 — Initial Content

**2026-01-07**

Initial wiki structure and content created.

### Added

**Principles** (4 files):

- `wisdom.md` — Core principles merged from `agent/docs/wisdom.md`
- `context-first.md` — Context-first philosophy and best practices
- `rpi.md` — Research → Plan → Implement workflow
- `verification-culture.md` — Verification discipline and checklist

**Patterns** (4 files):

- `backend-api-patterns.md` — Backend API implementation patterns (relocated)
- `prisma-patterns.md` — Prisma ORM patterns (relocated)
- `backend-api-gotchas.md` — Common pitfalls (relocated)
- `deep-modules.md` — Deep module design pattern (summarized from tdd/deep-modules.md)

**Environments** (2 files):

- `fish-shell.md` — Fish shell syntax and operations (relocated from SKILLS/fish-shell.md)
- `dev-servers.md` — Development server operations (generalized from SKILLS/server-operations.md, ports removed)

**Glossary** (1 file):

- `glossary/index.md` — Key terms and concepts

**Wiki Structure** (2 files):

- `index.md` — Wiki homepage and navigation
- `log.md` — This changelog

### Notes

- All files use OKF frontmatter with `type:` field
- Hardcoded ports (3001, 5173) removed from `dev-servers.md`
- Deep modules pattern summarized for wiki format
- Fish shell documentation relocated from SKILLS for reference access

---

## Role-Scoped Capabilities

**2026-07-24**

### Added

- `patterns/role-scoped-capabilities.md` — a role is a scoped capability set; enforcement is
  by withholding capabilities (no-`edit` as a forcing function), with generic capability
  names the adapter maps to harness tool names.
- `adr/adr-006-capability-based-roles.md`, `adr/adr-007-docs-lookup-capability.md`,
  `adr/adr-008-delivery-dispatchers.md`.
- Glossary: **Capability**, **Role**, **Dispatcher**, **Utility (dispatched) agent**;
  sharpened **Agent** and **Orchestrator**.

### Changed

- Mirai adapter: role-scoped capability grants; Delivery split into Planner + Orchestrator
  dispatchers plus a Verifier utility; per-stage quick base agent (`plan` for Shaping) +
  stance line; optional `docs-lookup` capability. See per-subtree logs
  (`adr/log.md`, `patterns/log.md`, `glossary/log.md`) for detail.
