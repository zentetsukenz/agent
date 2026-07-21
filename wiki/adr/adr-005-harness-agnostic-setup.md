---
type: ADR
title: Harness-agnostic setup entrypoint and universal setup contract
status: Accepted
timestamp: 2026-07-21T00:00:00Z
tags: [setup, adapter, harness, entrypoint, prose-first, loom]
---

# ADR-005: Harness-Agnostic Setup Entrypoint and Universal Setup Contract

## Context

loom installs itself into a project by having an agent read `SETUP.md` and generate
harness-native config. The target tool — the **harness** (Mirai, Claude Code, Cursor,
Aider, OpenCode, …) — varies, and each stores customization in its own native format and
location.

[ADR-001](adr-001-adapter-pattern.md) established *that* loom needs a per-harness adapter
layer (deferred to v2). [ADR-004](adr-004-loom-mirai-setup.md) then delivered the **Mirai**
setup, but framed it as "*the* setup approach" — so Mirai-specific detail (`.mirai/` paths,
its six primitives, the setup-loom file list) leaked into what should be the shared,
top-level entrypoint. In practice this repeatedly pulled `SETUP.md` toward being a
Mirai-only document, which is wrong for any other harness and re-leaks every time it's
edited.

The question this ADR settles: **what is the shape of loom's setup entrypoint, and where
does harness-specific knowledge live?**

## Decision

`SETUP.md` is a **harness-agnostic entrypoint** — a deep module with a small interface.
It knows only how to (1) identify the harness, (2) select that harness's **adapter**, and
(3) run a universal **setup contract**. All harness-specific knowledge lives **behind the
seam**, inside the adapter (`adapters/<harness>/` plus its setup entrypoint skill).

The **setup contract** every adapter implements:

```text
explore → interview → present & confirm → generate (harness-native) → verify
```

The entrypoint owns the contract and the universal safety rules (never overwrite, no
app/CI/runtime changes, ask for models, confirm before writing). Each adapter owns only
the harness-specific "generate" and "verify" steps. Adding a harness = adding an adapter,
never editing the entrypoint's core.

Setup runs **by an agent reading `SETUP.md` remotely** (e.g. `curl` from the canonical
repo) — no repo clone, and **no slash-command surface**. `init` (first-time) and `update`
(idempotent re-run) are **modes** of the same contract, both entered through `SETUP.md`,
not separate command wrappers.

The vocabulary is baked into the glossary: **Harness**, **Adapter** (loom's harness-adapter
sense), **Setup contract**.

This refines, not replaces, ADR-004: the Mirai setup becomes **the first adapter
implementing this contract**, not "the setup."

## Considered options

- **A per-harness entrypoint each** (`SETUP-mirai.md`, `SETUP-claude.md`, …). Rejected:
  duplicates the contract and safety rules N times; they drift.
- **A Mirai-specific `SETUP.md`** (what was shipped first). Rejected: wrong for every other
  harness; leaks implementation into the interface (fails the deletion test — remove the
  Mirai lines and setup still works via the adapter).
- **Slash-command wrappers** (`/setup-loom`, `/update-loom`) as the trigger. Rejected:
  they force a repo clone and duplicate the entrypoint's logic with harness-specific
  content — the same leakage in a second place. Reading `SETUP.md` remotely is enough.
- **A machine-parseable adapter manifest** instead of a prose contract. Rejected:
  contradicts [ADR-002](adr-002-workflow-as-adapter-seed.md)'s prose-first stance; the
  contract is interpreted by an agent, not executed by a schema.

## Consequences

- New harnesses plug in by adding an adapter under `adapters/<harness>/` that implements
  the contract — the entrypoint and glossary need no change.
- ADR-004 is reframed as the Mirai adapter (first implementer), not the setup itself.
- The contract is prose an agent interprets; loom stays content-only and harness-agnostic,
  installable by remote read with no clone.
- Cost: the entrypoint is one indirection removed from "just do it" — an agent must select
  an adapter before acting. Acceptable, and the reason is recorded here so the next
  contributor doesn't collapse it back into a single-harness file or re-add command wrappers.

## Related

- [ADR-001](adr-001-adapter-pattern.md) — the adapter layer this contract operationalizes.
- [ADR-002](adr-002-workflow-as-adapter-seed.md) — prose-first principle the contract honors.
- [ADR-004](adr-004-loom-mirai-setup.md) — the Mirai adapter: first implementation of this contract.
- [SETUP.md](../../SETUP.md) — the entrypoint this ADR describes.
- Glossary: [Harness, Adapter, Setup contract](../glossary/index.md).
