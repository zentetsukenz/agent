---
type: Index
title: Patterns
description: Reusable design patterns and best practices
---

# Patterns Index

Reusable design patterns and best practices for agent framework development.

| Pattern | Summary |
|---------|---------|
| [Deep Modules](deep-modules.md) | Design interfaces that hide complexity |
| [Harness Archetypes](harness-archetypes.md) | A descriptive taxonomy of harness classes — per-invocation vs resident, and headless-dispatchable or not — so each adapter's invocation-surface and dispatch-target answers follow from its archetype |
| [Role-Scoped Capabilities](role-scoped-capabilities.md) | A role is a scoped capability set plus an invocation surface; enforce it by withholding — capabilities and entry points — not prose |
| [Seam Artifact Protocol](seam-artifact-protocol.md) | One deep contract for handing context across stage seams — namespaced ledger + manifest; produce@exit, discover@entry |
| [Quality Baseline](quality-baseline.md) | A per-project four-aspect quality floor (lint, code-quality, security, coverage) chosen at setup from keyless-first tools and re-checked at every quality gate so quality can't silently drop |
| [Browser Capture Substrate](browser-capture.md) | The shared deterministic browser-drive contract the visual and runtime-debug skills specialize — reach app, choose tool, isolate/capture |
| [Backend API Patterns](backend-api-patterns.md) | Reference implementations for Express.js, Prisma, and REST API development |
| [Backend API Gotchas](backend-api-gotchas.md) | Learn from common mistakes in Express.js, Prisma, and REST API development |
| [Prisma Patterns](prisma-patterns.md) | Prisma 7 patterns and best practices |
