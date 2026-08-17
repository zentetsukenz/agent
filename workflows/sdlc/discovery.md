---
type: Pattern
title: SDLC — Discovery Phase
description: Policy governing how the Discovery phase performs — understand the problem space and de-risk assumptions before committing to a solution
---

# Discovery Phase

> **Bucket:** `discovery/` · **Position:** 1 of 6 · **Stage:** Shaping · **Precedes:** [Design](design.md)

## 1. Intent

Understand the problem space and its constraints — and burn down the riskiest
assumptions — **before** committing to any solution.

## 2. Gates

**Entry gate**

- A raw request or problem statement exists.
- Session context is loaded ([session-bootstrap](../../SKILLS/discovery/session-bootstrap/SKILL.md)).

**Exit gate**

- Problem, constraints, and success criteria are explicit and agreed.
- Glossary terms are sharpened and free of contradiction with existing domain language.
- Open questions are **surfaced, not buried** — every material unknown is either resolved
  or explicitly flagged with a plan to resolve it.
- Riskiest assumptions have been probed (by research or a throwaway spike).

## 3. Recommended skills

Referenced by intent — an interpreting agent maps these onto the target environment.

1. [session-bootstrap](../../SKILLS/discovery/session-bootstrap/SKILL.md) — load prior context.
2. [research-recommend](../../SKILLS/discovery/research-recommend/SKILL.md) — find prior art and back unknowns with evidence.
3. [grill-with-docs](../../SKILLS/discovery/grill-with-docs/SKILL.md) — interrogate the human and the docs relentlessly, walking the decision tree in rounds over a settled-prerequisite frontier.
4. [zoom-out](../../SKILLS/discovery/zoom-out/SKILL.md) — sanity-check the framing against the bigger picture.
5. [prototype](../../SKILLS/implementation/prototype/SKILL.md) — used here as a **throwaway de-risking spike** to test an assumption and then discard. *(Cross-bucket reference by intent: a Discovery prototype is learning-oriented and disposable, distinct from an Implementation prototype that may evolve toward the real thing.)*

Codebase architecture interrogation ([improve-codebase-architecture](../../SKILLS/design/improve-codebase-architecture/SKILL.md)) is a [Design](design.md) activity — Discovery decides *whether* to change the architecture; Design shapes *how*.

## 4. Agent-effort policy

- **High-judgment → higher-intelligence agent:** interrogation, clarification, framing,
  and deciding whether an unknown is material.
- **Delegable → small agent:** context loading, literature/prior-art search, collecting
  reference material.

## 5. Shift-left obligation

- **Define how success will be verified — here, at the very start.** Testable success
  criteria are a *Discovery output*, not a Verification afterthought.
- **Back every unknown with evidence.** Per
  [architecture-first](../../wiki/principles/architecture-first.md), any decision resting on
  an unknown requires research or a spike before it is allowed to drive the plan. The
  riskiest assumptions are burned down first (Spiral, risk-driven).
- **Start the documentation trail** — capture problem framing and findings as they emerge.

## 6. Artifacts

- A shared problem statement, constraints, and **testable success criteria**.
- Sharpened glossary terms.
- Spike findings and the evidence backing each resolved unknown.
- A list of surfaced open questions (with a resolution plan for each).

## Notes

- **Autonomy:** human grilling is *not* mandatory every time. When the problem is already
  well-specified, the agent may proceed autonomously — but the exit gate still applies.
- Discovery feeds [Design](design.md): its success criteria and constraints bound the
  solution shape, and its "is an architecture change needed?" verdict tells Design whether to
  run [improve-codebase-architecture](../../SKILLS/design/improve-codebase-architecture/SKILL.md). Together they form the **Shaping** stage.
</content>
