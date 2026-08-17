# Hermes macro-PM binding — the resident daemon & altitude seam

> **This is the genuinely new part of the Hermes adapter** — binding loom's macro
> project-management *protocol* to a resident Hermes daemon. The protocol itself is **complete and
> validated in loom core** ([ADR-018](../../../wiki/adr/adr-018-macro-project-management.md),
> [wayfinder macro mode](../../../SKILLS/planning/wayfinder/SKILL.md#macro-mode-dispatching-into-sdlc-runs),
> [seam-artifact-protocol macro section](../../../wiki/patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant));
> this file **references** it and only supplies the Hermes **wiring**
> ([ADR-013](../../../wiki/adr/adr-013-shared-adapter-contract-core.md) — reference, never restate).
> Decision #8 of ADR-018 made the resident daemon an **adapter concern** precisely so it could be
> wired here without touching the protocol. Consulted by [setup.md](../setup.md) when the project
> opts into macro PM (interview [§4f](../../../contract/interview.md#4f-macro-project-management-optional)).

## What macro PM needs, and what Hermes brings

The protocol needs four things bound to the harness; Hermes has a native mechanism for each:

| Protocol need (ADR-018) | Hermes mechanism |
|---|---|
| A **networked source of truth** (the board) that distributes across agents/servers | The chosen networked tracker (GitHub Issues+Projects / Notion / Linear) over Hermes **MCP** (`mcp-<tracker>` toolset) |
| A **resident agent** running the loop unattended | A Hermes **profile** with an always-on **`gateway`** (`hermes gateway install`, systemd/launchd) |
| A **mechanical, restart-safe router** (label+status → dispatch) | A Hermes **`cron`** job firing on an interval, each run a **fresh stateless session** |
| A **HITL surface** for `wayfinder:grilling`/`prototype` tickets | The Hermes **messaging gateway** (Telegram/Discord/Slack/…) + the native `clarify` tool |

## The macro substrate — an external networked tracker

Per the project's setup choice, the **default macro source of truth is a networked tracker**, not
Hermes's own local Kanban board. This is deliberate: [ADR-018](../../../wiki/adr/adr-018-macro-project-management.md)
requires a substrate that **distributes across agents on different servers**, and Hermes's native
Kanban is explicitly **single-host** (`~/.hermes/kanban.db` is local SQLite; a shared board across
two hosts is not supported). A networked tracker also carries **native labels**, which the two
vocabularies (`wayfinder:*` down, `sdlc:*` up) need.

- **Default:** GitHub Issues + Projects (native issues, labels, dependencies) over an
  `mcp-github` server. Notion and Linear are equally valid (both have MCP servers and native
  labels/status) — the user chooses at §4f.
- **Native-Kanban alternative (local-only):** if the effort is solo/single-host and never needs
  cross-server distribution, Hermes's native Kanban *can* be the substrate — the daemon then uses
  the native dispatcher instead of cron-polling, and the two vocabularies map onto Kanban's fixed
  statuses + a comment/label convention (Kanban has no arbitrary label field). Offer this only when
  the user explicitly accepts the single-host limitation; it is **not** the default because it
  breaks the distribution property macro mode was designed for. When used, **disable Hermes's LLM
  `auto_decompose`** (`kanban.auto_decompose: false`) so routing stays the *mechanical* wayfinder
  table, not Hermes's own judgment-based decomposer — determinism is what keeps the board
  authoritative and the loop restart-safe (ADR-018 #5).

The chosen tracker is named in the **macro section of the communication protocol document** (the
`{{MACRO_SECTION}}` in [write-format.md](write-format.md), the handoff template), guarded by the
**one-source-of-truth invariant**: exactly one registered tracker for macro state; a second,
unregistered one (a stray `TODO.md`, an off-board list, *and in particular* an accidental use of
the local Kanban board alongside the external tracker) is a violation whatever substrate was chosen.

## The micro dispatch target — a separate per-invocation harness

Hermes is a **[resident](../../../wiki/patterns/harness-archetypes.md) thin-macro** adapter
([ADR-019](../../../wiki/adr/adr-019-loom-hermes-setup.md), [model (a)](../setup.md#what-this-adapter-renders-and-what-it-does-not)):
it renders **only** the macro layer and does **not** render loom's SDLC stage agents. When a
buildable leaf is dispatched down, the SDLC run therefore executes in a **separate,
headless-dispatchable per-invocation harness** (e.g. an [OpenCode](../../opencode/setup.md) CLI
install) — the project's **micro dispatch target**, chosen at setup and recorded in the protocol
document as **prose**, never a hardcoded command. loom holds the prose ("dispatch into the project's
configured SDLC harness"); which concrete harness and how it is invoked is a setup choice, not
baked into loom ([ADR-005](../../../wiki/adr/adr-005-harness-agnostic-setup.md)).

Two consequences follow, and both are load-bearing:

- **The micro ledger is a shared, on-disk, gitignored substrate — not Hermes memory.** Because the
  SDLC run happens in a *different* harness process, the two harnesses cannot share the baton through
  Hermes's own `memory` tool (memory is intra-harness only). The `shaping/`/`delivery/` seam
  artifacts must live in a directory **both** harnesses read — on disk, and **gitignored** because
  ephemeral coordination is never version-controlled (durable knowledge goes to the wiki). See the
  [seam-artifact protocol substrate section](../../../wiki/patterns/seam-artifact-protocol.md#substrate-is-also-altitude-scoped).
- **HITL ticket outputs go to a networked artifact ref, not the on-disk micro ledger.** A macro
  `grilling`/`prototype`/`research` ticket resolved *at the macro altitude* produces bulky content a
  dispatched SDLC run must later reach across the harness boundary. It publishes to a networked
  **[artifact ref](../../../wiki/glossary/index.md#artifact-ref)** — an orphan branch
  `loom-artifacts/<map-slug>` on the git host ([ADR-022](../../../wiki/adr/adr-022-reachable-artifact-substrate.md)) —
  and the ticket links the URL; the dispatched run's `shaping/<milestone>/` seam artifact carries that
  URL and the run **fetches on demand**. This is the networked class's *second instrument* (beside the
  tracker), distinct from the gitignored on-disk micro ledger above: keeping bulky content out of both
  the working tree and the tracker is what lets the focused SDLC run stay lean. A ticket that links a
  local-only path is a [reachability-invariant](../../../wiki/patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant)
  violation — the run cannot follow it.
- **No dispatch target ⇒ macro mode has nowhere to go.** If the project has not configured a
  headless-dispatchable SDLC harness, setup must surface that as a **prerequisite** (see
  [setup.md](../setup.md#what-this-adapter-renders-and-what-it-does-not)), not silently render SDLC
  agents into Hermes.

## §4f — gauge fit and provision labels

Render interview [§4f](../../../contract/interview.md#4f-macro-project-management-optional) — this
reuses the [`capability→tool` port](../../../contract/PORTS.md) discipline (discover/confirm the
tracker's concrete operations over MCP), so **no new port** is added (ADR-018).

1. **Gauge fit.** Confirm the chosen tracker (over its MCP server) can express: **map-as-index** (a
   parent issue whose children are the tickets), **linked-not-embedded artifacts** (attach
   PR/commit/doc links, don't paste bodies), **native blocking/dependencies** (so the frontier
   renders), and the **two label vocabularies**. If it can't express native blocking/labels, fall
   back to the [Issue Tracker](../../../wiki/environments/issue-tracker.md) body conventions and
   warn the frontier won't render natively.
2. **Provision the labels** on the tracker (via the `mcp-<tracker>` tools):
   - **Down:** `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, `wayfinder:task`.
   - **Up:** `sdlc:in-progress`, `sdlc:done`, `sdlc:needs-recharter`, `sdlc:needs-clarification`.
   If the project already runs a different label scheme, **map onto it and record the mapping** in
   the macro section rather than forcing loom's names.

## The resident daemon — a profile + gateway + cron

loom writes a **`wayfinder-macro` profile** (a front-door, resident role) into the distribution:

- **Identity (`SOUL.md`):** the wayfinder macro-mode behavior by reference — it runs the
  [mechanical dispatch table](../../../SKILLS/planning/wayfinder/SKILL.md#dispatch-is-mechanical--the-ticket-decides-not-the-agent)
  (`wayfinder:*` down / `sdlc:*` up), **routing by label + status only, never by its own judgment**.
  Its `SOUL.md` carries the `{{ROLE_ONE_SOURCE_NOTE}}` directive: *private memory holds
  persona/continuity/skills only, **never** project state* — the test is "if this agent died and a
  fresh one booted on another server, would the project stall without this datum?" If yes, it
  belongs on the tracker.
- **Capabilities (`config.yaml` `toolsets:`):** the `mcp-<tracker>` toolset (read/route the board),
  `memory` (its own continuity only), `clarify` (HITL tickets), `delegation` (dispatch a leaf into
  an SDLC run), and `cronjob` (manage its own schedule). It does **not** hold `file` write — it
  routes and translates, it does not build (the build happens one altitude down, in the SDLC run).
- **Resident surface:** `hermes gateway install` for the `wayfinder-macro` profile — an always-on
  service that also receives Telegram/Discord/etc. messages, giving the human a `wayfinder:grilling`
  HITL channel and `/`-style board control from their phone.
- **The mechanical loop:** a **`cron`** job (created via the `cronjob` tool / `hermes cron create`)
  that fires every N minutes. Each run is a **fresh, stateless session** — it reads the board's
  frontier, applies the dispatch table, and acts. Statelessness is the restart-safety property
  (ADR-018 #5): a fresh session on the same board routes identically, because all state is on the
  board, none in the session. The interval and the deliver channel are user choices at setup.

## The altitude seam — the translator

The resident profile is the [altitude-seam](../../../wiki/glossary/index.md#altitude-seam)
**translator**, reusing the existing PRODUCE/DISCOVER contract across the boundary — it wires
**both** altitudes and the crossing between them (not just the single micro ledger a normal adapter
wires):

- **Down (dispatch a buildable leaf).** For a `wayfinder:task` ticket, translate the ticket + its
  linked artifacts into a `shaping/<milestone>/` [seam artifact](../../../wiki/glossary/index.md#seam-artifact)
  written into the SDLC run's **micro** ledger — a **shared, on-disk, gitignored** substrate
  ([capabilities.md](capabilities.md#persist--the-native-memory-tool-macro-continuity-only)), which
  Planning's DISCOVER gate already expects. Under [model (a)](#the-micro-dispatch-target)
  the SDLC run executes in a **separate per-invocation harness** (e.g. OpenCode CLI), so the ledger
  **cannot** be Hermes's own memory — memory does not cross a harness boundary; both harnesses must
  read the same on-disk files. Set the leaf `sdlc:in-progress` on the tracker and `delegate_task`
  the run; the macro loop does **not** follow it into the inner loop. (A
  `wayfinder:research`/`grilling`/`prototype` ticket is *not* a buildable leaf — resolve it as a
  decision first, HITL over the gateway or via the research subagent.)
- **Up (a run returns).** Read the `sdlc:*` status the run wrote back and apply the
  [return table](../../../SKILLS/planning/wayfinder/SKILL.md#the-two-vocabulary-seam): `sdlc:done` →
  close the leaf, record the PR/commit link in the map's Decisions-so-far, advance the frontier;
  `sdlc:needs-recharter` → graduate the leaf to a sub-map; `sdlc:needs-clarification` → open a
  `wayfinder:grilling` ticket and surface it to the human. The run's
  `delivery/<milestone>/verified-change` (in the shared on-disk ledger) becomes the board update.

The **micro** inner loop runs entirely in the dispatched SDLC harness against the shared on-disk
ledger, oblivious to the board; only this translator crosses between the networked macro substrate
and the on-disk micro substrate. The two never touch directly
([ADR-018](../../../wiki/adr/adr-018-macro-project-management.md) #4).

## Restart-safety & the one-source-of-truth invariant (what to verify)

- **Restart-safe:** each cron run is a fresh session; the router reads the whole frontier from the
  tracker each tick. Kill the daemon, boot a fresh one on another server pointed at the same
  tracker — it resumes identically. Verify the `wayfinder-macro` profile's `SOUL.md` does **not**
  instruct it to cache project state in memory.
- **One source of truth:** verify no second tracker is created — in particular, that the local
  Hermes Kanban board is **not** silently used for project state when an external tracker is the
  registered source of truth. Every participating profile's `SOUL.md` references the communication
  protocol document (the macro section), which is how such drift is caught.

## What NOT to do

- **Do not change the macro-PM protocol** — the vocabularies, dispatch table, recursion, returns,
  and §4f questions are complete in loom core. If a real gap surfaces (e.g. a tracker that can't
  express a needed operation), that is a **new decision** — raise it, don't silently edit the
  protocol.
- **Do not bake the daemon into the protocol** — a human or a cron job could run the same prose;
  this file only supplies the Hermes binding, keeping [ADR-005](../../../wiki/adr/adr-005-harness-agnostic-setup.md)'s
  harness-agnostic stance.

## Related

- [ADR-018](../../../wiki/adr/adr-018-macro-project-management.md) — the macro-PM protocol this file binds (read in full; it is the spec).
- [wayfinder macro mode](../../../SKILLS/planning/wayfinder/SKILL.md#macro-mode-dispatching-into-sdlc-runs) — the behavior the daemon runs.
- [seam-artifact-protocol](../../../wiki/patterns/seam-artifact-protocol.md#substrate-is-also-altitude-scoped) — altitude-scoped substrate + the one-source-of-truth invariant.
- [contract/interview.md §4f](../../../contract/interview.md#4f-macro-project-management-optional) — the macro setup questions this file renders.
- Glossary: [Altitude](../../../wiki/glossary/index.md#altitude), [Substrate](../../../wiki/glossary/index.md#substrate), [Altitude seam](../../../wiki/glossary/index.md#altitude-seam), [Resident agent](../../../wiki/glossary/index.md#resident-agent).
- [MAPPING.md §7](../MAPPING.md#7-communication-protocol-document--the-two-altitude-ledgers) — the two-altitude ledger wiring.
- [capabilities.md](capabilities.md) — the toolsets the resident profile is granted.
- [write-format.md](write-format.md) — the `{{MACRO_SECTION}}` / `{{ROLE_ONE_SOURCE_NOTE}}` placeholders.
- [wiki/environments/hermes.md](../../../wiki/environments/hermes.md) — Hermes gateway/cron/kanban/MCP reference.
