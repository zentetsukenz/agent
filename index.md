---
type: Index
title: loom agent framework
description: Progressive-disclosure root for the loom content-only agent framework
---
# loom

Top-level directories:

- [skills/](skills/) — lifecycle-bucketed agent skills (agentskills.io conformant)
- [workflows/](workflows/) — prose-first orchestration seeds compiled into harnesses by adapters (SDLC + others)
- [wiki/](wiki/) — dogfooded OKF knowledge wiki
- [agents/](agents/) — agent definitions (Thoth + others)
- [commands/](commands/) — slash command wrappers
- [docs/](docs/) — framework meta-documentation
- [adapters/](adapters/) — adapter content; `mirai/` ships the first concrete target (see [ADR-004](wiki/adr/adr-004-loom-mirai-setup.md)), the general v2 adapter layer remains deferred
- [scripts/](scripts/) — validation and utility scripts

See [SPEC.md](SPEC.md) for conformance rules and [CHANGELOG.md](CHANGELOG.md) for release history.

To install loom into a project, start at [SETUP.md](SETUP.md) — the harness-agnostic
entrypoint an agent reads to run the setup contract for whatever harness the project uses
(see [ADR-005](wiki/adr/adr-005-harness-agnostic-setup.md)). Mirai is the first supported
harness ([ADR-004](wiki/adr/adr-004-loom-mirai-setup.md)).
