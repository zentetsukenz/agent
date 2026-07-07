# loom agent framework

loom is a content-only framework for reusable agent skills, knowledge wiki
pages, agent definitions, and command wrappers. It keeps implementation concerns
out of the root so downstream tools can adapt the same content model without
forking its language or runtime.

## What is included

- Lifecycle-bucketed skills that conform to the agentskills.io shape.
- OKF wiki pages for progressive-disclosure knowledge.
- Agent definitions that compose skills and wiki context.
- Slash command wrappers for repeatable entry points.
- Meta-documentation for framework conformance and release history.
- Placeholder adapter and script directories for later framework tooling.

## Directory structure

```text
agent/
├── skills/      # agent skills, grouped by lifecycle bucket
├── wiki/        # OKF knowledge wiki
├── agents/      # agent definitions
├── commands/    # slash command wrappers
├── docs/        # framework meta-documentation
├── adapters/    # v2 adapter implementation placeholders
├── scripts/     # validation and utility scripts
├── index.md     # OKF progressive-disclosure root
├── log.md       # OKF chronological framework log
├── CHANGELOG.md # semver release history
└── README.md    # framework overview
```

## How to use

1. Start at [index.md](index.md) to discover top-level framework content.
2. Load skills from `skills/` when a task matches their descriptions.
3. Use `wiki/` as the dogfooded OKF knowledge base for durable context.
4. Compose `agents/` from skills, wiki references, and tool contracts.
5. Expose common workflows through `commands/` wrappers.
6. Keep implementation-specific integration in `adapters/`, not framework docs.

## Conformance

[SPEC.md](SPEC.md) is forthcoming and will define framework rules for
agentskills.io skills, OKF files, adapters, and validation scripts.

## Release history

See [CHANGELOG.md](CHANGELOG.md) for semver release notes.
