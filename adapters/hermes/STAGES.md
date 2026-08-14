# loom Stages in Hermes — deliberately empty

> **Hermes renders no SDLC stage agents.** This file exists to document that *absence* and keep the
> adapter's file layout symmetric with [Mirai](../mirai/STAGES.md) and
> [OpenCode](../opencode/STAGES.md), whose `STAGES.md` files *do* map the stage/utility roster.

Hermes is a **resident** [harness archetype](../../wiki/patterns/harness-archetypes.md): it compiles
the **reactive** [macro-PM](../../workflows/macro-pm/index.md) lifecycle, not the **terminating**
[SDLC](../../workflows/sdlc/index.md) lifecycle. So the loom stages (Shaping / Delivery / Closing)
and their agents (`shaping`, `planner`, `orchestrator`, `closing`, `verifier`, `explore`, `quick`,
`deep`, `frontend`, `visual-qa`) are **not** rendered as Hermes profiles.

Under this adapter those stages run **one altitude down**, in a separate, headless-dispatchable
**per-invocation** harness (e.g. OpenCode) that the resident agent dispatches into across the
[altitude seam](../../wiki/glossary/index.md#altitude-seam). That harness has its own adapter and its
own `STAGES.md`; loom holds only **prose** for the dispatch — the concrete micro harness and its CLI
are a per-project setup choice ([ADR-019](../../wiki/adr/adr-019-loom-hermes-setup.md)).

What the Hermes adapter *does* render — the resident PM agent, the board wiring, the two label
vocabularies, and the altitude-seam translator — is in
[references/macro-pm.md](references/macro-pm.md); the primitive→file bindings are in
[MAPPING.md](MAPPING.md).

## Related

- [references/macro-pm.md](references/macro-pm.md) — the resident-agent / altitude-seam binding (what replaces a stage roster here).
- [workflows/macro-pm](../../workflows/macro-pm/index.md) — the reactive lifecycle Hermes compiles.
- [harness-archetypes](../../wiki/patterns/harness-archetypes.md) — why the resident archetype renders no stage agents.
- [ADR-019](../../wiki/adr/adr-019-loom-hermes-setup.md) — the decision behind this absence.
- [setup.md](setup.md) — the Hermes adapter setup instruction.
- [MAPPING.md](MAPPING.md) — the primitive→file bindings for what the resident profile *does* render.
