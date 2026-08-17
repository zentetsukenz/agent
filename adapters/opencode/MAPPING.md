# loom → OpenCode Mapping

> **OpenCode's answers to the four [port obligations](../../contract/PORTS.md).** The generic
> content — the SKILLS→skills copy rule, stage groupings, utility roster, model archetypes,
> capability vocabulary, protocol obligation — lives once in the shared
> [`contract/`](../../contract/index.md) core; this file **references** it and states only the
> OpenCode-specific render bindings ([ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md)).
> See [ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md) for why this mapping exists,
> [wiki/environments/opencode.md](../../wiki/environments/opencode.md) for OpenCode's primitives,
> and [STAGES.md](STAGES.md) for the per-stage rosters/capability-sets these bindings feed.

The four ports (all defined generically in [contract/PORTS.md](../../contract/PORTS.md)):

| Port | Section |
|---|---|
| `primitive→file` manifest (skill, agent, command) | §1 (skills), §2 (stages), §3 (utilities), and the [manifest in setup.md](setup.md#harness-manifest) |
| `archetype→model` | §5 |
| `capability→tool` | §6 |
| `seam-obligation→wiring` | §7 |

## 1. skill primitive → `.opencode/skills/`

Every loom skill a project adopts is copied (and lightly tailored during the interview) from
`SKILLS/<bucket>/<slug>/SKILL.md` to `.opencode/skills/<slug>/SKILL.md`. **The copy/tailor rule
itself is generic** — see [contract/primitives.md](../../contract/primitives.md#the-six-primitives-the-core-renders)
and the [skill copy rules](references/write-format.md#skill-copy-rules). OpenCode-specific render
bindings only:

| loom source | `.opencode/` target | OpenCode rule |
|---|---|---|
| `SKILLS/<bucket>/<slug>/SKILL.md` | `.opencode/skills/<slug>/SKILL.md` | `name` in frontmatter **must equal** `<slug>` (OpenCode requirement) — already enforced by loom. `SKILL.md` must be all-caps. |
| `SKILLS/<bucket>/<slug>/references/*` · `scripts/*` · `assets/*` | `.opencode/skills/<slug>/…` | Copied verbatim, one level deep. |
| `SKILLS/meta/*` referenced by an adopted skill | `.opencode/skills/<slug>/` | Copied alongside the referencing skill so relative links resolve. |

**Unknown frontmatter fields are ignored by OpenCode** — so loom's skill frontmatter
(`argument-hint`, `user-invocable`, `disable-model-invocation`) copies in as-is; OpenCode reads
only `name` + `description` and ignores the rest. **Output location** is `.opencode/skills/`.
**The setup instruction itself is not copied** — `setup.md` *writes* `.opencode/`, it is not
content that ships inside it.

## 2. stage-agent + stage-command primitives → `.opencode/` files

The stage groupings, the two-tier (command = quick combo / agent = deep workflow) model, and
the Delivery dispatcher split are **generic** — see
[contract/primitives.md](../../contract/primitives.md#stage-groupings-six-phases--three-stages)
and [STAGES.md](STAGES.md). OpenCode's render bindings for those primitives:

| Stage | Command file (quick) | Deep agent file(s) |
|---|---|---|
| Shaping | `.opencode/commands/shape.md` | `.opencode/agents/shaping.md` |
| Delivery | `.opencode/commands/deliver.md` | `.opencode/agents/planner.md` + `.opencode/agents/orchestrator.md`; verification → `verifier` subagent |
| Closing | `.opencode/commands/close.md` | `.opencode/agents/closing.md` |

- A **command**'s `agent:` field names an **OpenCode base agent** — `plan` (built-in read-only)
  for Shaping, `build` otherwise — **not** the deep stage agent. Read-only stages inherit
  OpenCode's no-edit guarantee from `plan` mode
  ([ADR-006](../../wiki/adr/adr-006-capability-based-roles.md)).
- A **deep agent** carries the phase workflow prose + role capability set (as `permission:`) +
  a `front-door` [invocation surface](../../wiki/glossary/index.md#invocation-surface)
  ([ADR-012](../../wiki/adr/adr-012-invocation-surface.md)): `mode: primary`.
- **Delivery is split** ([ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md)); the old
  single `delivery.md` is retired (migration: [write-format.md](references/write-format.md#delivery-split-migration-deliverymd--dispatchers)).

See [STAGES.md](STAGES.md) for the exact skill roster, capability set, and workflow-prose
sourcing per role (all generic, sourced from the core).

## 3. utility agents → `.opencode/agents/*.md` (`mode: subagent`)

The utility roster (`explore`/`quick`/`deep`/`verifier`/`writing`) and the domain-specialized
utilities (`frontend`/`visual-qa`) are **generic** — see
[contract/primitives.md](../../contract/primitives.md#utility-agents-cross-stage). OpenCode render
bindings: each is a plain `.opencode/agents/<name>.md` with **`mode: subagent`** (the
`dispatched` surface) so a [Dispatcher](../../wiki/glossary/index.md#dispatcher) can `@mention`/delegate
to it but the `Tab` cycle hides it. The per-utility capability sets live in
[STAGES.md](STAGES.md#utility-agents-cross-stage); resolve them to `permission:` keys via §6.

- **`explore`/`deep`/`scout` overlap with built-ins — but always pin `explore`'s model:**
  OpenCode ships built-in `explore` (fast read-only recon), `scout` (external-docs research), and
  `general` (full-access) subagents. loom reuses the built-in's *behavior* but **always emits a
  thin `.opencode/agents/explore.md`** carrying the **Utility** archetype `model:` — because the
  bare built-in runs on OpenCode's *default* model, and relying on it silently forfeits the cheap
  dispatch tier ([ADR-021](../../wiki/adr/adr-021-shaping-research-orchestrator.md)). `scout` covers
  keyless dependency-source research, so `docs-lookup` (MCP) stays off by default.
- Source agents for the domain utilities: [agents/frontend.md](../../agents/frontend.md),
  [agents/visual-qa.md](../../agents/visual-qa.md).

## 4. project-context primitive → `AGENTS.md`

The role of the always-on context file (per-project conventions, **not** workflow steering) is
generic — see [contract/interview.md](../../contract/interview.md#project-context--instruction-file).
OpenCode render binding: it is root `AGENTS.md` (OpenCode reads it natively; `CLAUDE.md` is a
read-only compat fallback loom does not write). Written at `init`, kept current by `update`. Extra
rule files (including loom's on-demand handoff protocol pointer) are listed in `opencode.json`'s
`instructions:` array, which OpenCode combines with `AGENTS.md`.

## 5. Model-archetype render target

The three archetypes + working styles + role→archetype assignment are **generic**
([contract/primitives.md](../../contract/primitives.md#the-model-archetypes)). OpenCode's
answer to the [`archetype→model` port](../../contract/PORTS.md#port-2--archetypemodel) is **an
inline `model:` field per generated agent/command**, written in OpenCode's `provider/model-id`
format (e.g. `anthropic/claude-sonnet-4-20250514`, `opencode/gpt-5.1-codex`). One archetype
resolves per file, like Mirai but provider-prefixed.

Exact model-name strings are project/subscription-specific: collect them in the interview
([contract/interview.md §3](../../contract/interview.md#3-model-matching)) and confirm against
the user's actual OpenCode provider/model list — never hardcode a guessed string. OpenCode's
`model:` takes a single `provider/model-id` (not a native fallback array); loom's per-agent
`model:` fields already give per-role tiering, so no external tiering layer is needed
([ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md)).

## 6. Capability → OpenCode permission mapping

The capability vocabulary + the "discover, don't guess" discipline are **generic**
([contract/primitives.md](../../contract/primitives.md)). OpenCode's answer to the
[`capability→tool` port](../../contract/PORTS.md#port-1--capabilitytool) — full detail in
[references/capabilities.md](references/capabilities.md):

| Capability | OpenCode permission key(s) | Kind | Notes |
|---|---|---|---|
| `read` | `read` | permission | stable |
| `edit` | `edit` | permission | gates `write`/`edit`/`apply_patch` |
| `shell` | `bash` | permission | stable |
| `delegate` | `task` | permission | dispatch subagents |
| `web` | `webfetch`, `websearch` | permission | stable |
| `tasks` | `todowrite` | permission | gates `todowrite`/`todoread` |
| `search` | `grep`, `glob`, `list` | permission | file/text search family |
| `persist` | **GAP** — on-disk `.loom/handoffs/` folder (gitignored by default) | no native tool | no harness memory tool (§7) |
| `interview` | `question` | permission | **native** — OpenCode has a `question` tool; no discovery needed |
| `docs-lookup` | MCP wildcard (e.g. `context7_*`) | permission | **opt-in** ([ADR-007](../../wiki/adr/adr-007-docs-lookup-capability.md)); built-in `scout` covers keyless dependency research |

**Withhold mechanism (OpenCode):** a role *denied* a capability sets its permission key to
**`deny`** in the agent's `permission:` frontmatter (e.g. a Shaping agent gets
`permission: { edit: deny }`). The withheld capability is load-bearing — a role with `edit: deny`
cannot write code. This differs from Mirai (which omits the tool alias); OpenCode grants tools by
default and gates them via `permission:`. `tools:` is deprecated — always use `permission:`.

## 7. Communication protocol document → `.loom/handoffs/`

The seam-artifact protocol obligation (ledger, manifest, PRODUCE/DISCOVER, mandatory at the
two stage seams) is **generic**
([contract/primitives.md](../../contract/primitives.md#the-communication-protocol-document-cross-stage),
[ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md)). OpenCode's answer to the
[`seam-obligation→wiring` port](../../contract/PORTS.md#port-3--seam-obligationwiring) — OpenCode
has **neither a `handoffs:` primitive nor a memory tool**, so both resolve to an on-disk folder
(gitignored by default):

| Generic obligation | OpenCode wiring |
|---|---|
| Communication protocol document | `.loom/handoffs/protocol.md` — a **committed** Markdown file, pointed at from `opencode.json`'s `instructions:` array (so it merges into always-on context) and referenced from `AGENTS.md`. (The protocol *document* is committed loom config; the *ledger* it describes is gitignored — see the next row.) |
| [Ledger](../../wiki/glossary/index.md#ledger) substrate → `persist` target | A **`.loom/handoffs/`** on-disk folder — OpenCode has no harness memory tool, so the folder *is* the persistence. **Gitignored by default**: the ledger is ephemeral coordination, not version-controlled ([ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md) Option A; durable knowledge → wiki/ADRs). A project may opt to **commit** it for reviewable handoff diffs. This on-disk substrate is also what lets OpenCode serve as a **micro dispatch target** for a resident macro agent (a [dispatch-target harness](../../wiki/patterns/harness-archetypes.md) — the folder is the shared ground both harnesses read, since memory cannot cross a harness boundary). |
| Ledger manifest | `.loom/handoffs/index.md` — seeded empty at setup; producers register rows. |
| PRODUCE / DISCOVER handoff | No native transition. The producing primary agent writes the seam artifact + manifest row at its exit gate; the human then `Tab`-selects the next stage's primary agent, whose body instructs it to **DISCOVER** the ledger at its entry gate. Every agent carries no `edit`-free `persist` tool (there is none) — instead the ledger is plain files, so PRODUCE/DISCOVER roles need `read` + `edit` **scoped to `.loom/handoffs/`** (via a `permission: { edit: { "*": deny, ".loom/handoffs/**": allow } }` glob) so they can write the ledger without gaining general code-edit. See [STAGES.md §protocol](STAGES.md#the-communication-protocol-document-cross-stage). |

The protocol document is **always generated**; only its root/namespace (and the commit-vs-gitignore
opt-in) are user choices — the gitignored default should also seed a `.gitignore` entry for the
ledger root. Template: [assets/templates/handoff.md.template](assets/templates/handoff.md.template).

## Related

- [contract/PORTS.md](../../contract/PORTS.md) — the four obligations this file answers for OpenCode.
- [contract/primitives.md](../../contract/primitives.md) — the generic primitives/rosters/archetypes referenced above.
- [ADR-013](../../wiki/adr/adr-013-shared-adapter-contract-core.md) — the shared-core split (reference, never restate).
- [ADR-014](../../wiki/adr/adr-014-loom-opencode-setup.md) — the OpenCode adapter decision this mapping implements.
- [ADR-011](../../wiki/adr/adr-011-seam-artifact-protocol.md) — the seam-artifact handoff protocol (§7).
- [ADR-006](../../wiki/adr/adr-006-capability-based-roles.md) — capability-based role discipline (§6).
- [ADR-007](../../wiki/adr/adr-007-docs-lookup-capability.md) — the optional `docs-lookup` capability.
- [ADR-008](../../wiki/adr/adr-008-delivery-dispatchers.md) — the Delivery dispatcher split (§2, §3).
- [ADR-012](../../wiki/adr/adr-012-invocation-surface.md) — the invocation-surface facet → `mode` (§2, §3).
- [wiki/environments/opencode.md](../../wiki/environments/opencode.md) — OpenCode primitive reference.
- [references/capabilities.md](references/capabilities.md) — full capability→permission mapping and docs-lookup wiring.
- [STAGES.md](STAGES.md) — stage groupings, skill rosters, capability sets, workflow-prose sourcing.
- [setup.md](setup.md) — the OpenCode adapter setup instruction that reads this file.
