# The opt-in OMO model-tiering layer

> **This is the opt-in half of OpenCode's answer to the [`archetype→model` port](../../../contract/PORTS.md#port-2--archetypemodel).**
> The three model archetypes + working styles + role→archetype assignment are **generic**
> ([contract/primitives.md](../../../contract/primitives.md#the-model-archetypes)); this file states
> only how loom renders them to [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)
> (OMO) config **when the user opts in** ([references/interview.md](interview.md#omo-opt-in-opencode)).
> A bare-OpenCode project uses inline `model:` fields instead (MAPPING.md §5) and writes no OMO
> config. **OMO is strictly opt-in — never force a bare-OpenCode project into it.**

## Why OMO exists (and why loom borrowed its framing)

OMO's core idea — "**models are developers**": assign each agent a model matching its *working
style* — is exactly loom's three-archetype model ([ADR-004](../../../wiki/adr/adr-004-loom-mirai-setup.md)
borrowed it). So when a project already runs OMO (or wants tier-wide model management from one
file), loom renders its archetypes onto OMO's config rather than scattering inline `model:` fields.

## The config file

- **Filename:** `omo.json` (or `omo.jsonc`). **Not** `oh-my-openagent.json` — that name is legacy /
  migration-only.
- **Location:** project `.omo/` or global `~/.omo/` — harness-spanning (OMO can front several
  harnesses; here it fronts OpenCode).
- **Three sections:**
  - `models` — a catalog of model aliases → concrete `provider/model-id` (+ per-model options).
  - `categories` — the **task tiers** (loom's archetypes) → which model alias each tier uses,
    with a canonical `reasoning` field for reasoning effort.
  - `agents` — per-agent **overlays** on OMO's own builtins (Sisyphus, Hephaestus, Explore, …).

## Canonical fields

- Use **`reasoning`** for reasoning effort — **not** the deprecated `variant`.
- Model references in `categories`/`agents` point at a `models` alias, so a model swap is a
  one-line edit in `models`.

## Archetype → OMO mapping

loom's three archetypes map onto OMO's tiers/agents. loom's roster **overlays** OMO's builtins
(overrides the model on the matching OMO agent) rather than redefining loom's own agent set:

| loom archetype | Working style | OMO builtin / tier | Render |
|---|---|---|---|
| **Communicator** | Interviews, planning, writing, sociable lead | **Sisyphus** (sociable orchestrator) | `categories.<communicator-tier>` → the Communicator model alias; overlay Sisyphus |
| **Deep Specialist** | Architecture, hard debugging, high-stakes correctness | **Hephaestus** (deep specialist) | `categories.deep` → the Deep model alias; overlay Hephaestus |
| **Utility** | Cheap/fast, mechanical, high-volume | **Explore** (utility) | `categories.<utility-tier>` → the cheap/fast model alias; overlay Explore |
| Deep Specialist — **extended-thinking** (the Verifier) | Long-context verification | Deep tier + higher `reasoning` | `categories.deep` variant with elevated `reasoning` |

Exact model-name strings and tier names are project/subscription-specific — collect them in the
interview and confirm against the user's OMO/provider config; never hardcode a guessed string.

## Skeleton (fill from the interview)

```jsonc
// omo.json  — written ONLY if OMO was opted in
{
  "models": {
    "communicator": "anthropic/claude-sonnet-4-20250514",
    "deep":         "opencode/gpt-5.1-codex",
    "utility":      "opencode/grok-code"
  },
  "categories": {
    "communicator": { "model": "communicator" },
    "deep":         { "model": "deep", "reasoning": "high" },
    "utility":      { "model": "utility" }
  },
  "agents": {
    // overlay OMO builtins onto loom's archetypes — do NOT redefine loom's roster here
    "sisyphus":    { "model": "communicator" },
    "hephaestus":  { "model": "deep", "reasoning": "high" },
    "explore":     { "model": "utility" }
  }
}
```

When OMO is opted in, **omit** inline `model:` from every generated `.opencode/agents/*.md` and
`.opencode/commands/*.md` (see [write-format.md](write-format.md#omo-layer-opt-in)) — the model
for each role comes from its archetype's `categories` tier.

## Verify

The OMO branch of the verify checklist is in [verify.md §Model layer](verify.md#model-layer-opencode):
an `omo.json` exists with all three sections, agents/commands carry no inline `model:`, and the
`agents` block overlays OMO builtins rather than redefining loom's roster.

## Related

- [MAPPING.md §5](../MAPPING.md#5-model-archetype-render-target) — the two render targets (inline vs OMO).
- [interview.md](interview.md#omo-opt-in-opencode) — the opt-in question that branches here.
- [write-format.md](write-format.md#omo-layer-opt-in) — how the opt-in changes what gets written.
- [contract/primitives.md](../../../contract/primitives.md#the-model-archetypes) — the generic archetypes this file renders.
- [wiki/environments/opencode.md](../../../wiki/environments/opencode.md#omo--the-opt-in-model-tiering-layer) — OMO in the harness reference.
