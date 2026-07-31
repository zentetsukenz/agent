# Provenance / idempotency discipline + generic invariant-checks

> Part of the shared adapter-contract core — see [index.md](index.md). This doc holds the
> two harness-agnostic disciplines every adapter inherits: **provenance/idempotency** (how a
> write stays patchable and never duplicates) and the **generic invariant-checks** the
> verify step runs (setup contract step 5). An adapter **references** these and adds only its
> **harness-specific format-checks** (frontmatter parses, native naming rules) — its
> `verify` doc splits along this seam. Classification authority: seam ticket
> [#4](https://github.com/zentetsukenz/agent/issues/4) ("provenance/idempotency discipline is
> universal; `verify` splits into generic invariant-checks + specific format-checks").

## Provenance marking (for idempotent patching)

Every file a setup run writes gets a provenance marker so a later `update` run can find and
replace the loom-authored section without touching user additions. The comment syntax is
whatever the target file format supports (e.g. an HTML comment in Markdown):

```markdown
<!-- loom:begin -->
...loom-authored content...
<!-- loom:end -->
```

- For files that are **entirely** loom-authored (e.g. a copied skill), the marker wraps the
  whole body — a patch replaces everything between the markers.
- For a **mixed** file (loom-authored + project-specific content, e.g. the always-on
  project-context file), the marker wraps only the sections loom owns (e.g. a "loom SDLC"
  section listing the available stage prompts/agents) — never the human's own
  Architecture/Build/Conventions sections.
- If a file has no markers yet (hand-written before loom existed), **do not** silently
  rewrite it. Ask the human whether to adopt it (wrap it in markers, migrating its content
  into the loom-authored section) or leave it untouched and write alongside it.

An adapter may namespace the marker to its own setup instruction (e.g.
`<!-- loom:<adapter>:begin -->`); the discipline — wrap loom-owned content, patch between
markers, never duplicate — is the generic part.

## Idempotency rule

If a target file already exists for a given purpose, **patch it in place** — never write a
second file for the same purpose. Preserve any user-added content outside the loom-owned,
provenance-marked sections.

### Frontmatter reconcile (for `update`)

Provenance markers wrap only the **body**. A file's frontmatter/config header sits *above*
the markers, so a body-only patch **will not** fix stale frontmatter. On `update`, after
replacing the marked body, **reconcile the loom-owned header fields** against what the core
and the adapter's ports now say they should be — capability sets, model archetypes,
invocation surface, handoff wiring. Preserve genuinely user-added header fields (a model the
user swapped in, an extra tool they added on purpose); reconcile only the fields loom owns,
and if in doubt, show the diff and ask. (The exact header field names are harness-specific;
the reconcile *discipline* is generic.)

## Generic invariant-checks (the verify step, generic half)

The verify step (contract step 5) runs these harness-agnostic checks — they verify **loom's
own invariants**, independent of any harness's file format. An adapter's verify doc adds its
format-checks (frontmatter parses, native `name==folder` rules, etc.) on top.

### Role capabilities ([ADR-006](../wiki/adr/adr-006-capability-based-roles.md), [ADR-008](../wiki/adr/adr-008-delivery-dispatchers.md))

- [ ] The `shaping`, `planner`, `orchestrator`, and `verifier` roles do **not** hold `edit`
      — a role that jumped to code is the failure this prevents.
- [ ] The `orchestrator` holds `delegate`; the `planner` does **not** (it plans, it doesn't
      dispatch).
- [ ] The executor utilities (`quick`, `deep`) **do** hold `edit`.
- [ ] Delivery emitted **two** dispatcher roles (Planner, Orchestrator) — no single
      edit-capable Delivery stage agent remains (an `update` must have retired it).
- [ ] The `verifier` is in the **utility** roster, not presented as a Delivery stage agent.
- [ ] `docs-lookup` appears **only** if the interview opted in; absent otherwise, and only
      on Shaping / `planner` / `deep`.

### Invocation surface ([ADR-012](../wiki/adr/adr-012-invocation-surface.md))

- [ ] The stage agents (`shaping`, `planner`, `orchestrator`, `closing`) are **`front-door`**.
- [ ] Every utility (`explore`, `quick`, `deep`, `verifier`, `writing`, `frontend`,
      `visual-qa`) is **`dispatched`** — no utility appears in the agent picker.
- [ ] No utility carries a stale `front-door` surface from a pre-ADR-012 run (the `update`
      reconcile must have flipped it).

### Handoff / communication protocol ([ADR-011](../wiki/adr/adr-011-seam-artifact-protocol.md))

- [ ] The communication protocol document exists and is on-demand (not always-on).
- [ ] The ledger **manifest** (`<ledger-root>/index.md`) was seeded (header present).
- [ ] The PRODUCE/DISCOVER roles (`shaping`, `planner`, `orchestrator`, `closing`) carry
      `persist` and reference the protocol document in their body (not a restated convention).
- [ ] The stage seams are wired (`shaping → planner`, `orchestrator → closing`) via the
      harness's handoff mechanism (the [`seam-obligation→wiring` port](PORTS.md)).

### Structure

- [ ] Every skill referenced by a stage prompt/agent body actually exists in the generated
      config.
- [ ] No loom-owned content was duplicated for the same purpose (provenance markers show a
      patch replaced, not appended).
- [ ] Pre-existing agent config from other tools is still present and untouched, unless the
      interview explicitly asked for migration.
- [ ] No leftover template placeholder tokens remain in any written file.

## Report (after the checklist passes)

- Paths created vs. paths patched (two short lists, not a diff dump).
- Anything skipped or deferred from the interview (e.g. "utility agents skipped").
- Any check that failed and how it was resolved — or, if unresolved, flagged to the human
  explicitly rather than silently shipped.

## Related

- [index.md](index.md) — the setup contract (step 5 is verify) and the safety rules this discipline enforces.
- [primitives.md](primitives.md) — the roles/capabilities/surfaces the invariant-checks assert.
- [PORTS.md](PORTS.md) — the harness-specific format-checks that complete an adapter's verify step.
