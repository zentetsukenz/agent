---
type: ADR
title: The shared adapter-contract core is a prose contract of named port-obligations in a top-level contract/ directory
status: Accepted
timestamp: 2026-07-31T00:00:00Z
tags: [setup, adapter, contract, harness, ports, prose-first, reference-not-restate, loom]
---

# ADR-013: The Shared Adapter-Contract Core

## Context

[ADR-005](adr-005-harness-agnostic-setup.md) made `SETUP.md` a harness-agnostic entrypoint
and named a universal five-step **setup contract** that every adapter implements, but it
left the contract's *body* undefined: the contract lived only as prose inside `SETUP.md`
and the sole adapter's `setup.md`. With **Mirai the only adapter**, generic content
(stage groupings, skill rosters, capability-per-role sets, model archetypes, interview
questions, the five steps, init/update semantics, invariant-checks) sat physically inside
`adapters/mirai/` — indistinguishable from Mirai-specific detail. A second adapter would
have to **copy** that generic content, drifting from the first: the "one adapter is a
hypothetical seam, two make it real" moment.

The seam classification ticket ([#4](https://github.com/zentetsukenz/agent/issues/4))
established that the recurring shape is **generic vocabulary/obligation + a per-adapter
render-binding port**, occurring 3× (model, capability, seam-artifact) — proving the seam
is real. The interface-design ticket
([#7](https://github.com/zentetsukenz/agent/issues/7)) then decided *what exact contract an
adapter implements*, expressed as a small deep interface. This ADR **records** that
decision. It does not perform the migration — hoisting the generic content out of
`adapters/mirai/` into the new core is the foundation-build ticket
([#9](https://github.com/zentetsukenz/agent/issues/9)).

## Decision

The shared adapter-contract layer is a **prose contract that enumerates named
port-obligations**, living in a **new top-level `contract/` directory**. An adapter
**references** the generic content and **supplies four named obligations** — it MUST NOT
restate what it could link to.

### Prose obligations, not a template pack (Design B over Design A)

Two interface shapes were sketched (design-it-twice):

- **Design A — "adapter = a filled-in template pack":** the core ships skeleton templates
  with `{{PLACEHOLDER}}` holes; an adapter supplies filled-in values. Concrete and
  mechanically diffable, but **templates *are* harness layout** — the core would have to
  anticipate every hole's shape, leaking harness assumptions upward.
- **Design B — "adapter = a set of named prose tables the contract enumerates":** the core
  names each port by its **obligation** ("an adapter MUST supply X answering Y"); the
  adapter answers however the harness needs. Templates stay adapter-private.

**Design B is chosen**, because the [SPEC](../../SPEC.md)'s Setup-contract conformance
already mandates *"harness detail MUST NOT leak into shared documents"* — templates are
harness detail, so Design A violates that rule. B also reuses #4's own vocabulary: the
ports *are* obligations answered by render-bindings. B may *point at* an optional starter
template, but the template lives in the adapter and only the obligation is mandated.

### What the core PROVIDES (generic, in `contract/`)

- The **five-step setup contract** prose (explore → interview → present & confirm →
  generate → verify), the **init/update** semantics, and the **universal safety rules**.
- The **six loom primitives** and their generic content: stage groupings, skill rosters,
  capability-set-per-role, generic interview questions, provenance/idempotency discipline,
  and generic invariant-checks.
- Enumerated across `contract/index.md` + `contract/PORTS.md` (progressive disclosure).

### What an adapter MUST SUPPLY — four named obligations

Kept deliberately minimal: the contract **states obligations** and does **not** prescribe
file count or doc layout — an adapter answers each however the harness needs.

1. **`capability→tool` port** — resolve each generic capability to the harness's tool
   name(s) or withhold mechanism (Mirai: `execute`/`agent`/… aliases; OpenCode:
   `permission:{edit:deny}` withholds).
2. **`archetype→model` port** — resolve each of the three model archetypes to a render
   target (Mirai: inline `model:` per file; OpenCode/OMO: central `omo.json` entry).
3. **`seam-obligation→wiring` port** — resolve the [ADR-011](adr-011-seam-artifact-protocol.md)
   PRODUCE@exit / DISCOVER@entry handoff obligation to harness wiring (Mirai: `handoffs:`
   object schema; OpenCode: committed-folder pointer, since no memory tool per
   [#5](https://github.com/zentetsukenz/agent/issues/5)).
4. **`primitive→file` manifest** — the render bindings for primitives 1–3 (skill,
   stage-agent, stage-prompt): native names, frontmatter/config format, output locations,
   base-agent names, templates, and format-checks. One port, because it answers a single
   concern — *"how does a primitive become a file in this harness, and where."*

Ports 1–3 are #4's three render-bindings (attached to the capability, instruction, and
model-archetype primitives); port 4 covers the remaining "render to disk" concern.
`verify.md` splits along the same seam — generic invariants sourced from `contract/`,
specific format-checks in the adapter.

Each port's **shape is a prose table an agent reads** (prose-first,
[ADR-002](adr-002-workflow-as-adapter-seed.md) — no schema, no DSL). The core names the
obligation; the adapter answers with whatever table/checklist fits.

### Consumption = reference, never copy

An adapter **links into** `contract/` for generic content and supplies only the four port
answers — it **MUST NOT restate** generic content it could link to. This operationalizes
#4's deletion test: everything that passed as "generic" is *deleted from the adapter and
sourced from `contract/`*. `setup.md` becomes thin — it orchestrates the five steps,
points at `contract/` for the generic body, and points at its own port docs for the
harness specifics. (Remote setup `curl`s both the adapter files and the `contract/` files.)

### Where it lives

A **new top-level `contract/` directory** with its own `index.md`:

- **Not under `adapters/`** — the core is what every adapter *implements*, not itself an
  adapter (and an `adapters/_contract/` leading-underscore hack is a smell).
- **Not folded into `workflows/`** — that owns the SDLC phase prose
  ([ADR-002](adr-002-workflow-as-adapter-seed.md)), a different concern.
- `SETUP.md` stays the harness-agnostic front door and gains a Step-2 pointer into
  `contract/`; the harness table is unchanged.

### Wiring

- **`SETUP.md`** Step 2 gains a pointer to `contract/` as the home of the generic five-step
  body + the four port obligations. Front door and harness table unchanged.
- **SPEC "Setup contract conformance"** gains one bullet: *"Supplies the four port
  obligations enumerated in `contract/PORTS.md` (three render-binding ports + the
  primitive-render manifest) and references — never restates — the generic content in
  `contract/`."* This makes "reference the core" a checkable conformance rule.

### Why this earns an ADR

The domain-model ADR test holds on all three counts:

- **Hard to reverse** — the `contract/` directory, the four-obligation split, and the
  reference-not-restate rule are structural; every future adapter is written against them,
  so unwinding means rewriting all adapters and the SPEC.
- **Surprising without context** — "the shared core is *not* under `adapters/`" and
  "templates are forbidden from the core" both read as arbitrary until the SPEC's
  no-leak rule and the deletion test are known.
- **Real trade-off** — prose obligations lose Design A's mechanical template-diffing;
  top-level `contract/` adds a directory over the simpler nested option; both were paid
  deliberately for a cheaper-to-redraw seam.

## Considered options

| Option | Verdict |
|---|---|
| **Leave the contract as prose in `SETUP.md` + each adapter's `setup.md`** (status quo) | Rejected — a second adapter copies the generic body; the copies drift. No single source of generic truth. |
| **Design A — core ships `{{PLACEHOLDER}}` template pack, adapter fills holes** | Rejected — templates are harness layout; the core would leak harness assumptions upward, violating the SPEC's no-leak rule. |
| **Core under `adapters/_contract/`** | Rejected — the core is implemented *by* adapters, not itself an adapter; the leading-underscore folder is a smell. |
| **Fold the core into `workflows/`** | Rejected — `workflows/` owns SDLC phase prose (ADR-002), an orthogonal concern. |
| **A machine-parseable manifest/schema for the ports** | Rejected — contradicts ADR-002's prose-first stance; ports are prose tables an agent reads. |
| **Prescribe a fixed per-adapter file layout for the four obligations** | Rejected — over-specifies; the contract states obligations, not structure, so the seam stays cheap to redraw. |
| **Design B — prose contract of four named port-obligations in top-level `contract/`, referenced not restated** | **Chosen.** |

## Consequences

- The generic content graduates to a single home: the `contract/` directory
  (`index.md` + `PORTS.md` + generic-content docs). Its concrete files and the actual
  hoist of generic content out of `adapters/mirai/` are the **foundation-build ticket**
  ([#9](https://github.com/zentetsukenz/agent/issues/9)) — this ADR is design-only.
- Every adapter (Mirai today, OpenCode next) becomes a **thin rendering layer**: four port
  answers plus links into the core, no restated generic body. `adapters/mirai/setup.md`
  shrinks.
- **Minimality is a feature.** Because the contract *states obligations* rather than
  *prescribing structure*, if "four obligations" turns out wrong it is one prose contract
  to edit — not an unwound template system.
- **Cost:** setup gains one more indirection (an adapter now references a separate `contract/`
  tree), and conformance carries a new "reference, never restate" rule the SPEC must
  enforce. Accepted, and recorded here so a future contributor doesn't collapse the core
  back into `adapters/` or inline the generic content into each adapter.

## Related

- [ADR-005](adr-005-harness-agnostic-setup.md) — the harness-agnostic entrypoint and setup
  contract this ADR extends by defining the contract's shared body.
- [ADR-002](adr-002-workflow-as-adapter-seed.md) — the prose-first principle the port shape honors.
- [ADR-004](adr-004-loom-mirai-setup.md) — the Mirai adapter, first implementer, refactored to
  reference the core in the foundation-build ticket.
- [ADR-011](adr-011-seam-artifact-protocol.md) — the PRODUCE/DISCOVER seam obligation the
  `seam-obligation→wiring` port resolves per harness.
- [SETUP.md](../../SETUP.md) — the entrypoint that gains the Step-2 pointer into `contract/`.
- [SPEC.md](../../SPEC.md) — Setup contract conformance, which gains the four-port + reference-not-restate bullet.
- Design ticket [#7](https://github.com/zentetsukenz/agent/issues/7) and seam-classification ticket [#4](https://github.com/zentetsukenz/agent/issues/4) — the decisions this ADR records.
