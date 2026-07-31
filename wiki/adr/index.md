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
