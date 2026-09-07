---
type: Index
title: Agent Wiki
description: Centralized knowledge repository for the agent framework
tags: [wiki, reference, documentation]
timestamp: 2026-01-07T00:00:00Z
---

# Agent Wiki

Centralized knowledge repository for the agent framework — principles, patterns,
environments, ADRs, and terminology, each subtree progressively disclosed via its own
`index.md` and `log.md`.

- **[Principles](principles/index.md)** — decision-making philosophy (wisdom,
  context-first, RPI, verification culture, architecture-first, commit-often,
  keyless-by-default)
- **[Patterns](patterns/index.md)** — reusable design patterns (deep modules, role-scoped
  capabilities, seam artifact protocol, quality baseline, ratchet routing, harness
  archetypes, browser capture, backend API patterns)
- **[Environments](environments/index.md)** — dev-environment references, including the
  authoritative per-adapter primitive docs (Mirai, OpenCode, Hermes)
- **[ADRs](adr/index.md)** — chronological architectural decision records; the highest-signal
  source for *why* loom is shaped the way it is
- **[Glossary](glossary/index.md)** — the ubiquitous language every other subtree assumes

## How to use this wiki

- **Design choice?** Check Principles and search ADRs first — most non-obvious shapes are
  already decided and reasoned about there.
- **Implementing?** Check Patterns for the reusable shape before inventing a new one.
- **Unfamiliar term?** Check Glossary.
- **Setting up a harness adapter?** Start at Environments' per-harness page.

## Contributing

1. Pick the right subtree — Principles (philosophy) / Patterns (reusable shape) /
   Environments (setup reference) / ADR (a recorded decision) / Glossary (a term).
2. Every file opens with OKF frontmatter (`type:`, `title:`, `description:`).
3. One concept per document; link, don't duplicate, content that exists elsewhere.
4. Update the subtree's `index.md` and append to its `log.md`.
