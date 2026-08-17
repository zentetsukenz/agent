---
type: Index
title: Architecture Decision Records
description: Catalog of architectural decisions for the loom framework
---

# ADR Index

Architectural decisions for the loom framework, organized chronologically.

| ADR | Title | Status | Tags |
|-----|-------|--------|------|
| [ADR-001](adr-001-adapter-pattern.md) | Adapter pattern for framework consumption | Proposed | adapter, cli, plugin, loom, v2 |
| [ADR-002](adr-002-workflow-as-adapter-seed.md) | Workflows are prose-first adapter seeds | Accepted | workflow, adapter, prose-first, sdlc, loom |
| [ADR-003](adr-003-architecture-first-ordering.md) | Architecture and constitutional changes land before dependent code | Accepted | architecture, sequencing, research, sdlc, loom |
| [ADR-004](adr-004-loom-mirai-setup.md) | loom setup approach for the Mirai harness | Accepted | mirai, setup, adapter, agent, skill, model-matching, loom |
| [ADR-005](adr-005-harness-agnostic-setup.md) | Harness-agnostic setup entrypoint and universal setup contract | Accepted | setup, adapter, harness, entrypoint, prose-first, loom |
| [ADR-006](adr-006-capability-based-roles.md) | Capability-based role discipline | Accepted | agent, role, capability, enforcement, mirai, adapter, loom |
| [ADR-007](adr-007-docs-lookup-capability.md) | Optional up-to-date documentation-lookup capability | Accepted | capability, docs-lookup, mcp, adapter, mirai, loom |
| [ADR-008](adr-008-delivery-dispatchers.md) | Delivery dispatchers delegate execution and verification to the utility tier | Accepted | agent, role, delivery, orchestrator, planner, verifier, dispatch, sdlc, mirai, loom |
| [ADR-009](adr-009-frontend-domain-utility.md) | Frontend is a domain-specialized utility agent that delegates pixel-looking | Accepted | agent, role, frontend, utility, domain, visual, isolation, mirai, loom |
| [ADR-010](adr-010-keyless-by-default-recommendations.md) | Recommendations are keyless by default; API-key tools are opt-in | Accepted | capability, tool-agnostic, opt-in, mcp, api-key, degradation, skill, loom |
| [ADR-011](adr-011-seam-artifact-protocol.md) | Seam artifacts cross stage boundaries through a namespaced, manifest-indexed ledger | Accepted | handoff, seam, artifact, ledger, communication, multi-agent, sdlc, persist, mirai, loom |
| [ADR-012](adr-012-invocation-surface.md) | Invocation surface is a role facet; stage agents are front doors, utilities are dispatched | Accepted | agent, role, invocation, user-invocable, dispatch, handoff, autopilot, mirai, loom |
| [ADR-013](adr-013-shared-adapter-contract-core.md) | The shared adapter-contract core is a prose contract of named port-obligations in a top-level contract/ directory | Accepted | setup, adapter, contract, harness, ports, prose-first, reference-not-restate, loom |
| [ADR-014](adr-014-loom-opencode-setup.md) | loom setup approach for the OpenCode harness, with an opt-in OMO model-tiering layer | Accepted | opencode, omo, setup, adapter, agent, skill, model-matching, permissions, loom |
| [ADR-015](adr-015-communication-line-refinement.md) | Context-passing is three named lanes over one ledger home — rename handoff to stage-handoff, add an unregistered within-stage lane | Accepted | handoff, seam, artifact, ledger, checkpoint, dispatch-context, communication, multi-agent, sdlc, loom |
| [ADR-016](adr-016-embedded-review-gate.md) | Code review is an embedded SDLC quality gate, not a standalone skill — with a commit-often principle | Accepted | code-review, quality-gate, commit-often, sdlc, planning, implementation, verification, skill, loom |
| [ADR-017](adr-017-quality-baseline.md) | A per-project quality baseline (lint, code-quality, security, coverage) chosen at setup and enforced at every quality gate | Accepted | quality, quality-gate, quality-baseline, lint, security, coverage, code-quality, ratchet, keyless, setup, sdlc, loom |
| [ADR-018](adr-018-macro-project-management.md) | Macro project-management is a recursive wayfinding layer over SDLC runs, bound by an altitude-scoped substrate and a two-vocabulary label seam (amended by ADR-019: it is a peer *reactive-lifecycle* workflow, not a peer phase-pipeline) | Accepted | project-management, macro, wayfinder, sdlc, seam, altitude, substrate, tracker, resident-agent, router, communication, loom |
| [ADR-019](adr-019-loom-hermes-setup.md) | loom setup approach for the Hermes harness — the first resident-archetype adapter, compiling the reactive macro-PM lifecycle and dispatching SDLC runs into a per-invocation harness | Accepted | hermes, resident, macro-pm, reactive-lifecycle, setup, adapter, altitude, dispatch, cron, gateway, memory, keyless, loom |
| [ADR-020](adr-020-system-scoped-qa.md) | System-scoped QA is a coverage judgment (`derive-e2e-coverage`) feeding wayfinder effort-map destinations, not a new workflow — the verification iron law becomes a principle, e2e execution stays in CI, and regressions seed fresh terminating maps | Accepted | qa, verification, e2e, coverage, regression, macro-pm, wayfinder, sdlc, principle, skill, altitude, loom |
| [ADR-021](adr-021-shaping-research-orchestrator.md) | Shaping is a read-only research orchestrator — grants `delegate` (keeps `edit` withheld) so it dispatches recon/research to the cheap `explore` tier and spikes to `quick`/`deep`; pins OpenCode's `explore` model; folds in Arbor's evidence-isolation + prior-art-before-spike; drops the opt-in OMO layer (amends ADR-008, ADR-012, ADR-014) | Accepted | agent, role, shaping, dispatcher, delegate, research, cost, explore, opencode, arbor, loom |
