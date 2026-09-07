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
- [contract/](contract/index.md) — the shared adapter-contract core: the generic setup-contract body every adapter references and the five port obligations each must supply (see [ADR-013](wiki/adr/adr-013-shared-adapter-contract-core.md))
- [adapters/](adapters/) — per-harness adapters answering the `contract/` core's ports: `mirai/` ([ADR-004](wiki/adr/adr-004-loom-mirai-setup.md)), `opencode/` ([ADR-014](wiki/adr/adr-014-loom-opencode-setup.md)), `hermes/` ([ADR-019](wiki/adr/adr-019-loom-hermes-setup.md))
- [scripts/](scripts/) — validation and utility scripts

See [SPEC.md](SPEC.md) for conformance rules and [CHANGELOG.md](CHANGELOG.md) for release history.

To install loom into a project, start at [SETUP.md](SETUP.md) — the harness-agnostic
entrypoint an agent reads to run the setup contract for whatever harness the project uses
(see [ADR-005](wiki/adr/adr-005-harness-agnostic-setup.md)). Mirai, OpenCode, and Hermes are
supported today.
