---
type: Research
title: System One models — TypeSafe Jev
description: Whether a "System One" model — typed outputs with calibrated confidence, built for fast classify, route and decide steps — fits the decision points of a semi-automated project
tags: [research, model, system-one, classifier, routing, jev, typesafe]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://typesafe.ai/blog/introducing-system-one-models-and-jev, title: Introducing System One Models and Jev, last_modified: 2026-09-15 }
  - { resource: https://www.latent.space/p/jev, title: "Jev: System One models for Prod, not God", last_modified: 2026-09-15 }
---

# System One models — TypeSafe Jev

*As of 2026-09-25.* Part of the [Model](index.md) pillar.

**Hypothesis under test** (the user's): *"A system one model. Could be useful for decision making,
classifier, etc."*

**Verdict: partly — promising, unproven.** The design fits the decision points a semi-automated
project is full of, and its calibrated confidence is exactly the signal "autonomy is earned by
checks" needs. Every performance number is the vendor's own, and the model is in early access.

## What it is

TypeSafe AI's [announcement](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
(2026-09-15) names a class of models for automation rather than chat, after Kahneman's fast "System 1".
Jev is the first. Instead of free text it returns a **typed value** — a choice among up to 255
options, a yes/no, a position on a scale — with a **calibrated probability**, and "never makes type
errors". TypeSafe is led by Diogo Almeida (ex-OpenAI), interviewed at launch by
[Latent Space](https://www.latent.space/p/jev).

| Claim | Marker |
|---|---|
| 70–500 ms end to end; 40–200x faster than frontier LLMs at comparable intelligence | *vendor-reported* |
| Input $0.042 per million tokens; output free | *vendor-reported* |
| Beats frontier models (GPT-6 Astra, Claude Fable 5.1) on TypeSafe's "workflow evals" — which TypeSafe says were built by its own model-capabilities team | *vendor-reported*; no independent evaluation found |
| Availability: early access from a waitlist | as of 2026-09-15 |

## Bearing on Jacquard

- **Where it would sit.** The resident loop is mostly small decisions: which lane does this issue
  belong to, is this ticket buildable, does this change need a human, which reviewer. Those are
  choices from a set the project has written down — the shape Jev is built for.
- **Calibration is a check.** "An agent acts alone exactly where a check can catch it being wrong;
  where nothing can, a human decides" (VISION, conviction 2). A calibrated probability gives the
  harness a threshold: act above it, ask a human below it — and the threshold is data the project can
  tune.
- **The options are the project's job.** A typed model can only choose among the labels it is given;
  it cannot invent the lane nobody defined. Conviction 1 again: written first, then cheap.

## Caveats

- Early access, one vendor, vendor-built evals. Treat as a candidate to trial against the project's
  own labelled decisions, not as evidence.
- Nothing here says a small general model with a constrained output schema could not do the same job;
  that comparison is the trial to run.
