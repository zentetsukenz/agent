---
type: Index
title: Agent Wiki
description: Centralized knowledge repository for the agent framework
tags: [wiki, reference, documentation]
timestamp: 2026-01-07T00:00:00Z
---

# Agent Wiki

Centralized knowledge repository for the agent framework. Reference material for principles, patterns, environments, and terminology.

---

## Principles

Core philosophy and decision-making frameworks.

- **[Wisdom](principles/wisdom.md)** — Core principles that guide decisions across all agents
- **[Context-First Philosophy](principles/context-first.md)** — How to manage context as a first-class resource
- **[Research → Plan → Implement (RPI)](principles/rpi.md)** — Disciplined workflow for complex tasks
- **[Verification Culture](principles/verification-culture.md)** — Verify before claiming done

---

## Patterns

Reusable design patterns and best practices.

- **[Backend API Patterns](patterns/backend-api-patterns.md)** — Reference implementations for Express.js and REST APIs
- **[Prisma Patterns](patterns/prisma-patterns.md)** — ORM patterns and best practices
- **[Backend API Gotchas](patterns/backend-api-gotchas.md)** — Common pitfalls and how to avoid them
- **[Deep Modules](patterns/deep-modules.md)** — Design interfaces that hide complexity

---

## Environments

Development environment setup and tools.

- **[Fish Shell](environments/fish-shell.md)** — Fish shell syntax and common operations for macOS
- **[Development Servers](environments/dev-servers.md)** — Starting, stopping, and verifying development servers

---

## Glossary

Key terms and concepts.

- **[Glossary Index](glossary/index.md)** — Terminology and core concepts (skill, agent, wiki, adapter, plugin, ADR, lifecycle bucket, wrapper, core, dogfood)

---

## How to Use This Wiki

### For Learning

Start with **Principles** to understand the philosophy. Then explore **Patterns** for concrete examples.

### For Reference

Use **Glossary** to look up terminology. Use **Environments** to set up your development setup.

### For Decision-Making

When facing a design choice, check **Principles** first. They encode lessons learned and guide judgment.

### For Implementation

When implementing a feature, check **Patterns** for reference implementations. Follow the examples.

---

## Structure

```
agent/wiki/
├── principles/
│   ├── wisdom.md
│   ├── context-first.md
│   ├── rpi.md
│   └── verification-culture.md
├── patterns/
│   ├── backend-api-patterns.md
│   ├── prisma-patterns.md
│   ├── backend-api-gotchas.md
│   └── deep-modules.md
├── environments/
│   ├── fish-shell.md
│   └── dev-servers.md
├── glossary/
│   └── index.md
├── index.md (this file)
└── log.md (changelog)
```

---

## Contributing

When adding to the wiki:

1. **Choose the right category** — Principles (philosophy), Patterns (examples), Environments (setup), Glossary (terms)
2. **Use OKF frontmatter** — `type:`, `title:`, `description:`, `tags:`, `timestamp:`
3. **Keep it focused** — One concept per document
4. **Use examples** — Show, don't just tell
5. **Link to related content** — Use `mem:` references

---

## See Also

- `mem:principles/wisdom` — Core principles
- `mem:glossary/index` — Terminology
