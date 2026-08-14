# The four port obligations

> Part of the shared adapter-contract core — see [index.md](index.md). This is the
> **contract an adapter implements**: the four things every adapter MUST supply. The core
> [PROVIDES](primitives.md) the generic content; an adapter MUST SUPPLY the four **ports**
> below and **references — never restates** — the generic content
> ([ADR-013](../wiki/adr/adr-013-shared-adapter-contract-core.md)).
>
> **Each port is a prose table an agent reads** — prose-first, no schema, no DSL
> ([ADR-002](../wiki/adr/adr-002-workflow-as-adapter-seed.md)). The core **names the
> obligation**; the adapter answers with whatever table/checklist/template fits its harness.
> The contract **states obligations** and **does not prescribe** an adapter's file count or
> doc layout — an adapter answers each port however it likes, so the seam stays cheap to
> redraw. (A port answer MAY *point at* an optional starter template, but the template lives
> in the adapter and only the obligation is mandated.)

## Why four

Three of the ports are the **render-binding ports** — they attach to primitives 4, 5, 6
(capability, instruction, model-archetype) discovered in seam ticket
[#4](https://github.com/zentetsukenz/agent/issues/4). The same seam shape (generic
vocabulary/obligation + per-adapter render-binding) recurring three times is what proved the
interface is **real**. The fourth port covers the remaining "render to disk" concern for
primitives 1–3. Kept deliberately minimal — if "four" turns out wrong, one prose contract is
edited, not an unwound template system.

## Port 1 — `capability→tool`

**Obligation:** resolve each generic [capability](primitives.md#per-stage-skill-rosters--capability-sets--workflow-prose-sourcing)
that loom grants a role to the harness's concrete **tool name(s)** — or to the harness's
**withhold mechanism** for a capability a role is *denied*.

- The generic capability vocabulary (`read` `edit` `search` `shell` `delegate` `web`
  `tasks` `persist` `interview` `docs-lookup`) and the "discover, don't guess" discipline
  are the core's ([primitives.md](primitives.md)). The **mapping** to tool names is the
  adapter's.
- A capability may resolve to a stable alias, a specific tool name that must be
  **discovered/confirmed** against the user's actual tool list (never guessed — same
  discipline as model-name strings), or an MCP server glob (for `docs-lookup`, opt-in).
- The port must cover **withholding**: a role denied `edit` must render to whatever the
  harness uses to withhold it (an omitted tool, a `permission: deny`, etc.) — the withheld
  capability is load-bearing.

*Examples:* Mirai renders `shell→execute` as a tool alias and withholds by omitting the
tool; OpenCode withholds via `permission: { edit: deny }`.

## Port 2 — `archetype→model`

**Obligation:** resolve each of the three [model archetypes](primitives.md#the-model-archetypes)
(+ the Verifier's extended-thinking variant) to a **render target** — where and how the
archetype becomes a concrete model in this harness.

- The archetypes, working styles, and role→archetype assignment are the core's. The
  **render target** is the adapter's.
- The exact model-name strings are always collected in the interview and confirmed against
  the harness, never hardcoded; the port defines the *shape* the resolved model is written
  in.

*Examples:* Mirai writes an inline `model:` (string or fallback array) per agent file;
OpenCode/OMO writes a central `omo.json` `models` catalog + `categories`/`agents` entry.

## Port 3 — `seam-obligation→wiring`

**Obligation:** resolve the [ADR-011](../wiki/adr/adr-011-seam-artifact-protocol.md)
PRODUCE/DISCOVER seam-artifact obligation to the harness's **wiring** — how a producing
stage agent hands off to the receiving one, and where the ledger substrate physically lives.

- The protocol obligation (namespaced ledger, manifest, PRODUCE at exit / DISCOVER at entry,
  mandatory at the two stage seams) is the core's ([primitives.md](primitives.md#the-communication-protocol-document-cross-stage)).
  The **wiring primitive** is the adapter's.
- Must cover both the **handoff transition** (Shaping → Delivery, Delivery → Closing) and the
  **`persist` substrate** the ledger writes to.

*Examples:* Mirai wires the transition via a `handoffs:` object-array in agent frontmatter
and persists to repo memory and/or a gitignored on-disk folder; OpenCode has no `handoffs:`
primitive (renders as a gitignored on-disk-folder pointer, since it has no memory tool). The
on-disk ledger is **gitignored by default** — ephemeral coordination, not version-controlled
([ADR-014](../wiki/adr/adr-014-loom-opencode-setup.md) Option A). Which substrate an adapter can
even offer follows from its [harness archetype](../wiki/patterns/harness-archetypes.md): a resident
harness that dispatches SDLC runs into a *different* harness **must** use a shared on-disk folder
(memory cannot cross a harness boundary), while a per-invocation harness may also offer memory.

## Port 4 — the `primitive→file` manifest

**Obligation:** the render bindings for primitives **1–3** (skill, stage-agent,
stage-prompt) — *"how does a primitive become a file in this harness, and where."* One port
because it answers one concern: rendering to disk. It must state:

- **Native primitive names** — what the harness calls a skill / agent / prompt / instruction,
  and the file extension + frontmatter/config format for each.
- **Output locations** — the directory each primitive is written to.
- **Base-agent names** — the harness built-ins a quick prompt targets (e.g. a read-only mode
  for Shaping, a general mode otherwise).
- **Invocation-surface flags** — how `front-door` vs `dispatched` (derived per
  [ADR-012](../wiki/adr/adr-012-invocation-surface.md)) map to the harness's flags.
- **Templates** — optional starter skeletons (adapter-private) for the generated files.
- **Format-checks** — the harness-specific half of the verify step (frontmatter parses,
  `name==folder`, instruction-file XOR rules), complementing the generic invariant-checks in
  [discipline.md](discipline.md).

*Examples:* Mirai renders skills to `.mirai/skills/<slug>/SKILL.md` (`name==folder`), agents
to `.mirai/agents/*.agent.md`, prompts to `.mirai/prompts/*.prompt.md`, and the instruction
to a description-triggered `.mirai/instructions/*.instructions.md`.

## Conformance

An adapter conforms when it (a) supplies all four ports above, (b) **references** the generic
content in the core rather than restating it, and (c) is registered in
[SETUP.md](../SETUP.md)'s harness table. This is the checkable rule in
[SPEC.md](../SPEC.md)'s "Setup contract conformance".

## Related

- [index.md](index.md) — the contract these ports complete.
- [primitives.md](primitives.md) — the six primitives (ports 1–3 attach to primitives 4–6; port 4 renders 1–3).
- [discipline.md](discipline.md) — the generic invariant-checks port 4's format-checks complement.
- [ADR-013](../wiki/adr/adr-013-shared-adapter-contract-core.md) — prose-obligations-over-templates, reference-over-copy.
- [ADR-002](../wiki/adr/adr-002-workflow-as-adapter-seed.md) — the prose-first stance (no schema/DSL).
