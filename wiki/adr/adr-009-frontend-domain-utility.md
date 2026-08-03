---
type: ADR
title: Frontend is a domain-specialized utility agent that delegates pixel-looking
status: Accepted
timestamp: 2026-07-27T00:00:00Z
tags: [agent, role, frontend, utility, domain, visual, isolation, mirai, loom]
---

# ADR-009: Frontend as a Domain-Specialized Utility Agent

## Context

A Mirai frontend-debugging session needed to dispatch a subagent to debug a running frontend, but
the only frontend-flavored agent available was `visual-qa` — a verify-only agent scoped to
pixel-level review (`edit: deny`). It got grabbed as the nearest thing and was the wrong tool.

Two structural gaps caused this:

- The `frontend-runtime-debugging` skill ([SKILLS/implementation/frontend-runtime-debugging/](../../SKILLS/implementation/frontend-runtime-debugging/SKILL.md))
  is complete but **no agent wired it**. A session that wanted to *debug* a running frontend had
  no agent home for the skill.
- The Mirai adapter's utility roster ([STAGES.md](../../adapters/mirai/STAGES.md),
  [MAPPING.md](../../adapters/mirai/MAPPING.md)) lists only intelligence-tiered utilities
  (`explore`/`quick`/`deep`/`verifier`/`writing`). `visual-qa` exists in `agents/` but is **absent
  from the roster**, so setup never emits it.

Underlying both: the utility roster is differentiated only by **intelligence tier**, while
[docs/wisdom.md](../../docs/wisdom.md) says agents should *"specialize by problem domain, not
technology."* Frontend development + runtime debugging is a distinct problem domain needing a
distinct skill cluster — different from the generic `quick`/`deep` executors.

## Decision

Add a **`frontend`** agent as loom's first **domain-specialized utility** — a
[utility (dispatched) agent](../glossary/index.md#utility-dispatched-agent) scoped to a problem
domain rather than a difficulty tier — and keep pixel-looking on a separate isolation seam:

1. **`frontend` is a domain-specialized utility.** It owns frontend development *and* runtime
   debugging. Capabilities (deep-shaped): `read`, `edit`, `search`, `shell`, `delegate`,
   `persist`, `tasks` (+ `docs-lookup` if opted). It wires five skills:
   `frontend-runtime-debugging` (primary), `diagnosing-bugs`,
   `server-operations`, `tdd`, and `visual-verification`.

2. **Two agents, not one — the isolation seam is preserved.** `visual-qa` stays unchanged as the
   vision-capable, `edit`-free mechanism that looks at screenshots and returns text only. `frontend`
   **delegates** pixel-looking to it rather than loading image bytes into its own edit-capable,
   long-lived context. An edit-heavy agent holding screenshots reintroduces exactly the byte-bloat
   the [visual-verification](../../SKILLS/verification/visual-verification/SKILL.md) ISOLATE
   strategy exists to prevent.

3. **`delegate` is granted, but narrow.** `frontend` holds `delegate` solely to hand pixels to
   `visual-qa` inside a fix→verify loop — a purposeful sub-tasking need, not general routing. It
   does not collapse into the "Swiss-army" anti-pattern
   ([role-scoped-capabilities](../patterns/role-scoped-capabilities.md)) because its purpose stays
   execution in one domain. Precedent: the `deep` utility already holds both `edit` and `delegate`.

4. **The roster gains a domain axis.** Both `frontend` and the previously-unexposed `visual-qa`
   join the Mirai adapter's utility roster as domain-specialized utilities alongside the
   intelligence tiers, so setup emits them.

5. **The capture substrate is shared.** The browser-drive knowledge both frontend skills need
   (reach the app, choose the automation tool, isolate/capture) is factored into
   [wiki/patterns/browser-capture.md](../patterns/browser-capture.md); each skill keeps only its
   own lens (pixels vs. runtime channels).

## Considered options

| Option | Verdict |
|---|---|
| **A. Broaden `visual-qa`** to also develop/debug (grant `edit`) | Rejected — an `edit`-capable agent that holds screenshots reintroduces byte-bloat; collapses the verify-only isolation seam. |
| **B. Let `deep` handle frontend** | Rejected — `deep` is a generic difficulty tier with no frontend skill cluster; violates "specialize by domain." |
| **C. One `frontend` agent that also looks at pixels itself** | Rejected — same byte-bloat as A, now in an edit-heavy long-lived context. |
| **D. `frontend` domain utility + delegate pixels to unchanged `visual-qa`** | **Chosen** — dev/debug in a domain-scoped executor; pixel-looking stays on the isolation seam; `delegate` narrow and purposeful. |

## Consequences

- The utility roster is no longer purely intelligence-tiered: it gains a **domain-specialized**
  kind, named in the glossary ([Domain-specialized utility](../glossary/index.md#domain-specialized-utility)).
- `frontend-runtime-debugging` finally has an agent home; frontend work stops mis-routing to
  `visual-qa`.
- `visual-qa` is now emitted by setup (it was defined but never rostered).
- The browser-capture contract lives in one pattern; the two skills stop drifting.
- Slightly more agents; accepted as the cost of matching agents to problem domains.

## Related

- [ADR-006](adr-006-capability-based-roles.md) — capability-based role discipline; `frontend`'s grant (incl. narrow `delegate`) follows it.
- [ADR-008](adr-008-delivery-dispatchers.md) — the utility tier `frontend` joins; same "two consumers = a real seam" reasoning applied to the shared capture substrate.
- [wiki/patterns/role-scoped-capabilities.md](../patterns/role-scoped-capabilities.md) — dispatcher vs. utility, the "Swiss-army" anti-pattern this avoids.
- [wiki/patterns/browser-capture.md](../patterns/browser-capture.md) — the shared substrate the two frontend skills specialize.
- [agents/frontend.md](../../agents/frontend.md) — the agent this ADR introduces.
- [agents/visual-qa.md](../../agents/visual-qa.md) — the unchanged pixel-isolation seam it delegates to.
- [docs/wisdom.md](../../docs/wisdom.md) — "specialize by problem domain, not technology," the principle this closes on.
