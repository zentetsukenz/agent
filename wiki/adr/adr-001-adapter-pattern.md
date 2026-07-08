---
type: ADR
title: Adapter pattern for framework consumption
status: Proposed
timestamp: 2026-07-07T00:00:00Z
tags: [adapter, cli, plugin, loom, v2]
---

# ADR-001: Adapter Pattern for Framework Consumption

## Context

The loom agent framework ships as content-only in v1: skills, wiki, agents, commands, and docs live in a git repository. Consuming tools (OpenCode, Claude, Cursor, Aider, and others) each have different discovery mechanics:

- **OpenCode**: Plugin system (TypeScript, MCP-aware, config-driven)
- **Claude**: Project context (file upload, @-mentions, custom instructions)
- **Cursor**: Codebase indexing (local file discovery, .cursor/rules)
- **Aider**: CLI-driven (stdin/stdout, file arguments, system prompts)

The framework currently requires manual setup: clone the repo, copy files, configure each tool individually. This creates friction for adoption and maintenance.

**Core problem**: How does the framework get INTO the tool? What's the distribution mechanism, discovery protocol, and sync strategy?

## Design Space Enumeration

### Path X: TypeScript OpenCode Plugin

**Mechanism**: Distribute framework as an OpenCode plugin (TypeScript, published to npm or local registry).

**Discovery**: Plugin loads `loom.toml` from project root, reads paths, indexes skills/wiki/agents/commands, and registers them with OpenCode's plugin API.

**Sync**: On startup, plugin checks `loom.lock.toml` against upstream hashes. If mismatch, pulls fresh content from `~/.loom/config.toml` upstream path.

**Strengths**:
- Matches OMO idiom (OpenCode-native, TypeScript)
- Auto-sync at startup (zero manual refresh)
- Tight integration with OpenCode's skill/command registration
- Single distribution channel (npm)

**Weaknesses**:
- OpenCode-only (Cursor, Claude, Aider users excluded)
- Requires npm/TypeScript toolchain
- Plugin API surface may lag framework evolution
- Dependency on OpenCode's plugin stability

### Path Y: Rust CLI + Adapter Renderers

**Mechanism**: Distribute framework as a standalone Rust CLI (`loom` binary). Adapters are renderer modules that output tool-specific formats.

**Discovery**: `loom init` scaffolds `loom.toml` + `loom.lock.toml`. `loom sync` pulls content. `loom export --format=opencode` renders to OpenCode plugin format; `--format=cursor` renders to `.cursor/rules`; `--format=aider` renders to system prompt; etc.

**Sync**: `loom sync` runs on demand or via cron. Lockfile tracks per-item upstream hashes.

**Strengths**:
- Tool-agnostic day 1 (any tool can consume rendered output)
- Standalone operation (no npm/TypeScript required)
- Extensible renderer architecture (new tools = new renderer)
- Explicit sync control (user decides when to refresh)

**Weaknesses**:
- Higher complexity (Rust, CLI, multiple renderers)
- Distribution burden (binary builds for macOS/Linux/Windows)
- Manual sync (no auto-refresh at tool startup)
- Requires learning `loom` CLI commands

### Path Z: Hybrid

**Mechanism**: Rust CLI as primary distribution. OpenCode plugin wraps the CLI, calling `loom export --format=opencode` on startup.

**Discovery**: Plugin detects `loom` binary in PATH or `~/.loom/bin/`. Falls back to bundled binary if not found.

**Sync**: Plugin delegates to CLI. CLI handles all sync logic.

**Strengths**:
- Best of both: tool-agnostic (CLI) + OpenCode-native (plugin)
- Single source of truth (CLI logic, not duplicated per renderer)
- Gradual adoption (CLI works standalone; plugin adds convenience)
- Extensible (new tools = new renderer, no plugin changes)

**Weaknesses**:
- Moderate complexity (Rust CLI + TypeScript plugin)
- Distribution complexity (binary + npm package)
- Dependency chain (plugin depends on CLI)
- Potential version mismatch (plugin vs CLI)

## Tradeoff Table

| Axis | Path X (Plugin) | Path Y (CLI) | Path Z (Hybrid) |
|------|-----------------|--------------|-----------------|
| **Complexity** | Low (TypeScript, single target) | High (Rust, multiple renderers) | Moderate (both, but clear separation) |
| **Distribution** | Simple (npm) | Complex (binaries + checksums) | Complex (npm + binaries) |
| **Tool-agnostic day 1** | No (OpenCode only) | Yes (any tool via renderer) | Yes (CLI works standalone) |
| **Auto-sync at startup** | Yes (plugin hook) | No (manual `loom sync`) | Yes (plugin calls CLI) |
| **Standalone operation** | No (requires OpenCode) | Yes (CLI works offline) | Yes (CLI works offline) |
| **Runtime features** | Limited (plugin API surface) | Extensible (renderer architecture) | Extensible (renderer architecture) |
| **Matches OMO idiom** | Yes (TypeScript, plugin-native) | No (Rust, unfamiliar to OMO team) | Partial (hybrid, requires both) |

## Loom Product Identity Spec

### Binary Name
`loom` — short, memorable, evokes weaving framework content into tools.

### Lockfile
`loom.lock.toml` — tracks per-item upstream hashes for sync verification.

### User Config
`~/.loom/config.toml` — global upstream paths and preferences.

### Project Spec
`loom.toml` — project-level configuration (paths, skills, agents, commands, adapters).

## Configuration Schemas

### `loom.toml` Schema

```toml
[adapter]
# Which adapter(s) to use: "opencode", "cursor", "aider", "claude", etc.
enabled = ["opencode"]

# Adapter-specific overrides
[adapter.opencode]
plugin_version = "^1.0.0"  # Optional: pin plugin version

[paths]
# Paths to framework content (relative to project root or absolute)
adr = "agent/wiki/adr"
glossary = "agent/wiki/glossary"
wiki = "agent/wiki"

# Legacy fallbacks (if paths not found, try these)
adr_legacy = ["docs/adr", "adr"]
glossary_legacy = ["docs/glossary", "glossary"]
wiki_legacy = ["docs/wiki", "wiki"]

[skills]
# Which skills to enable
enabled = ["research-recommend", "systematic-debugging", "tdd"]

# Skill-specific overrides
[skills.tdd]
description = "Custom TDD workflow for this project"
disabled = false

[agents]
# Agent definitions
[agents.researcher]
description = "Research agent for this project"
model = "claude-opus"

[commands]
# Slash command definitions
[commands.research]
description = "Run research workflow"
skill = "research-recommend"
```

### `loom.lock.toml` Schema

```toml
# Per-item upstream hashes for sync verification
[items]
"agent/wiki/adr/adr-001-adapter-pattern.md" = "sha256:abc123..."
"agent/skills/tdd/SKILL.md" = "sha256:def456..."
"agent/wiki/glossary/index.md" = "sha256:ghi789..."

# Metadata
[metadata]
upstream = "/path/to/agent"
synced_at = "2026-07-07T12:00:00Z"
version = "0.1.0"
```

### `~/.loom/config.toml` Schema

```toml
# Global upstream paths
[upstreams]
default = "/path/to/agent"
external = "/path/to/external-skills"

# Global preferences
[preferences]
auto_sync = false  # Manual sync by default
sync_interval = 3600  # If auto_sync enabled, sync every hour
verbose = false

# Adapter defaults
[adapters]
opencode_plugin_version = "^1.0.0"
cursor_rules_format = "v1"
aider_prompt_format = "v1"
```

## Consequences Per Path

### Path X: TypeScript OpenCode Plugin

**If chosen**:
- OpenCode becomes primary distribution channel
- Framework adoption limited to OpenCode users initially
- Plugin API becomes critical dependency (framework evolution constrained by plugin API stability)
- Sync logic lives in TypeScript (maintainability risk if team unfamiliar with TS)
- Other tools (Cursor, Claude, Aider) require separate integrations later

**Deferred decisions**:
- How to handle non-OpenCode tools (separate plugins? manual setup?)
- Plugin versioning strategy (semver? feature flags?)
- Fallback behavior if plugin fails to load

### Path Y: Rust CLI + Adapter Renderers

**If chosen**:
- CLI becomes primary distribution channel
- Framework adoption tool-agnostic from day 1
- Renderer architecture becomes critical (each new tool = new renderer)
- Rust becomes required skill for framework maintainers
- Distribution complexity increases (binary builds, checksums, CI/CD)

**Deferred decisions**:
- Renderer plugin architecture (how do third parties add renderers?)
- Binary distribution strategy (GitHub releases? Homebrew? Cargo?)
- Fallback behavior if renderer not available

### Path Z: Hybrid

**If chosen**:
- CLI + plugin coexist (both maintained)
- OpenCode users get auto-sync convenience; CLI users get standalone operation
- Renderer architecture extensible (new tools = new renderer, no plugin changes)
- Maintenance burden moderate (both TypeScript and Rust required)
- Distribution complexity moderate (npm + binaries, but clear separation)

**Deferred decisions**:
- Plugin-CLI version compatibility (how to handle mismatches?)
- Fallback if CLI not found (plugin bundles CLI? downloads on first run?)
- Renderer registration (how does plugin discover available renderers?)

## Implementation Deferral

This ADR documents the design space and tradeoffs. **No path is recommended.** Implementation is deferred to v2 pending:

1. User feedback on tool adoption patterns (which tools matter most?)
2. Team capacity assessment (Rust expertise available?)
3. Distribution infrastructure readiness (binary hosting, CI/CD)
4. Plugin API stability assessment (OpenCode plugin surface mature?)

## Status

**Proposed** — Design documented, tradeoffs enumerated, implementation deferred.

Next steps: Gather user feedback on tool preferences, assess team capacity, then revisit for v2 implementation decision.
