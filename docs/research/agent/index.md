---
type: Research
title: Agent — how agents run, and how they work with humans
description: The Agent pillar — evidence on resident and ephemeral agents, single versus multi-agent work, agents in lanes beyond coding, where humans must decide, how humans keep the theory, and the security posture of an agent that never stops
tags: [research, agent, resident, ephemeral, multi-agent, autonomy, oversight, theory-building, security]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://www.langchain.com/blog/introducing-ambient-agents, title: Introducing ambient agents, last_modified: 2025-01-14 }
  - { resource: https://agenticmesh.substack.com/p/ambient-agents, title: Ambient agents (Broda) }
  - { resource: https://medium.com/@ericbroda/ambient-agents-always-on-always-on-always-working-387238d03e05, title: Ambient agents (Broda, Medium) }
  - { resource: https://tianpan.co/blog/2026-04-17-ambient-ai-architecture-always-on-agents, title: Ambient AI architecture, last_modified: 2026-04-17 }
  - { resource: https://www.anthropic.com/engineering/built-multi-agent-research-system, title: How we built our multi-agent research system, last_modified: 2025-06-13 }
  - { resource: https://cognition.ai/blog/dont-build-multi-agents, title: "Don't build multi-agents", last_modified: 2025-06-12 }
  - { resource: https://cognition.ai/blog/devin-can-now-manage-devins, title: Devin can now manage Devins, last_modified: 2026-03 }
  - { resource: https://arxiv.org/abs/2503.13657, title: Why do multi-agent LLM systems fail?, last_modified: 2025-10-26 }
  - { resource: https://learn.microsoft.com/en-us/azure/sre-agent/overview, title: Azure SRE Agent overview, last_modified: 2026-08-26 }
  - { resource: https://linear.app/docs/agents-in-linear, title: Agents in Linear }
  - { resource: https://arxiv.org/abs/2506.12469, title: Levels of Autonomy for AI Agents, last_modified: 2025-07-28 }
  - { resource: https://www.latent.space/p/s3, title: Software 3.0 (Karpathy), last_modified: 2025-06-17 }
  - { resource: https://artificialintelligenceact.eu/article/14/, title: EU AI Act Article 14 }
  - { resource: https://artificialintelligenceact.eu/implementation-timeline/, title: EU AI Act implementation timeline }
  - { resource: https://www.nist.gov/itl/ai-risk-management-framework, title: NIST AI Risk Management Framework }
  - { resource: https://doi.org/10.1016/0165-6074(85)90032-8, title: Programming as Theory Building (Naur), last_modified: 1985-05-01 }
  - { resource: https://inventwithpython.com/drafts/naur-programming-as-theory-building.html, title: Naur summary (Sweigart) }
  - { resource: https://en.wikipedia.org/wiki/Ironies_of_Automation, title: Ironies of Automation }
  - { resource: https://www.ufried.com/blog/ironies_of_ai_1/, title: AI and the ironies of automation (Friedrichsen), last_modified: 2025-11-21 }
  - { resource: https://www.anthropic.com/research/AI-assistance-coding-skills, title: How AI assistance impacts the formation of coding skills, last_modified: 2026-01-29 }
  - { resource: https://arxiv.org/abs/2506.08872, title: Your Brain on ChatGPT, last_modified: 2025-12-31 }
  - { resource: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/, title: METR early-2025 developer study, last_modified: 2025-07-10 }
  - { resource: https://metr.org/blog/2026-02-24-uplift-update/, title: METR uplift update, last_modified: 2026-02-24 }
  - { resource: https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/, title: The lethal trifecta for AI agents, last_modified: 2025-06-16 }
  - { resource: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/, title: OWASP Top 10 for Agentic Applications 2026, last_modified: 2025-12-09 }
---

# Agent — how agents run, and how they work with humans

*As of 2026-09-25.* One of the three [research](../index.md) pillars. An agent is a model in a
harness doing work; this pillar is about the *work*: how agents run, alone and together, and how they
share a project with the humans who decide.

The [VISION](../../../VISION.md) sentences under test — all from "The picture" and convictions 2
and 3:

- "It never stops. A resident agent holds the project's loop … Ephemeral agents each take one piece
  of work, start fresh from what the project has written, finish it, and write down what they did."
- "It is one project, in lanes."
- "Humans decide, agents do, checks verify."
- "*Semi*-automated is the design, not a stage on the way to full automation."
- "Humans keep the theory."

The protocol for agents talking to each other has its own page: [A2A](a2a.md).

## A resident agent that never stops

| Source | Date | Key point | Bears on |
|---|---|---|---|
| LangChain, [*Introducing ambient agents*](https://www.langchain.com/blog/introducing-ambient-agents) | 2025-01-14 | Agents that listen to event streams instead of waiting for a chat, with three human-in-the-loop patterns: **notify**, **question**, **review**. | "A resident agent holds the project's loop" — and the three ways it hands a decision to a human |
| Eric Broda, *Ambient agents* ([Substack](https://agenticmesh.substack.com/p/ambient-agents), [Medium](https://medium.com/@ericbroda/ambient-agents-always-on-always-on-always-working-387238d03e05)) | 2025 | Pull-based session agents vs event-driven daemons with persistent identity, service-account execution, least privilege, and survival across interruption. *The Substack copy returned 403 on 2026-09-25; the Medium copy was read.* | The resident/ephemeral split, with the security posture each needs |
| Tian Pan, [*Ambient AI architecture*](https://tianpan.co/blog/2026-04-17-ambient-ai-architecture-always-on-agents) | 2026-04-17 | The interrupt threshold is the failure mode: "within two weeks of launch the disable rate exceeds 60%". An activity log of what the agent observed and considered is what separates a trusted tool from an invasive one. | A loop that never stops must interrupt rarely, and show its work |

The resident harnesses themselves — [Hermes](../harness/hermes-agent.md),
[Paperclip](../harness/paperclip.md) — are in the Harness pillar.

## Ephemeral agents, and many agents at once

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Anthropic, [*How we built our multi-agent research system*](https://www.anthropic.com/engineering/built-multi-agent-research-system) | 2025-06-13 | A lead agent plans and spawns parallel subagents, each with a fresh context; 90.2% better than a single agent on Anthropic's internal research evaluation, at about 15× the tokens of a chat. *Vendor-reported.* | Fresh, isolated contexts work for breadth-first work — at a price |
| Walden Yan (Cognition), [*Don't build multi-agents*](https://cognition.ai/blog/dont-build-multi-agents) | 2025-06-12 | Subagents that do not share the full trace make conflicting assumptions: "actions carry implicit decisions, and conflicting decisions carry bad results". Default to one thread. | Why ephemeral agents must "start fresh from what the project has written" — the decisions have to be *in* what they read |
| Cognition, [*Devin can now manage Devins*](https://cognition.ai/blog/devin-can-now-manage-devins) | 2026-03 | Nine months later: a coordinator scopes the work, hands each piece to a managed Devin in its own VM, and compiles the results. *Vendor-reported.* | Even the sceptic converged on coordinator + isolated workers, once the scoping was explicit |
| Cemri et al., [*Why do multi-agent LLM systems fail?*](https://arxiv.org/abs/2503.13657) | 2025-03; rev. 2025-10-26 | MAST: 14 failure modes in three groups — system design, inter-agent misalignment, task verification — from 1,600+ annotated traces across 7 frameworks (κ = 0.88). *Preprint.* | Failures cluster at the seams and at verification — both harness concerns |

## One project, in lanes

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Microsoft, [Azure SRE Agent](https://learn.microsoft.com/en-us/azure/sre-agent/overview) | 2026-08-26 | An infrastructure-lane agent: investigates incidents, runs scheduled operations, proposes mitigations. "In Review mode, an SRE Agent Administrator approves the write actions that require approval before the agent runs them. In Autonomous mode, the agent applies them without waiting." Per-tool allow/ask/deny and hooks. It also "retains context from prior investigations" — inside the agent. | "infrastructure" is a lane; autonomy set per mode; and the knowledge-location question again |
| Linear, [*Agents in Linear*](https://linear.app/docs/agents-in-linear) | read 2026-09-25 | A project-management-lane surface: issues are delegated to agents by assignment, but "the human assignee remains responsible for the issue, even after delegation to an agent". | "accountability stays human", built into a product |

Agents that start from an issue — [GitHub Copilot coding agent, Jules, Devin](../harness/index.md#the-landscape)
— sit where the development and project-management lanes meet. Primary evidence for *product*-lane
agents was not found on 2026-09-25.

## Humans decide, agents do, checks verify

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Feng, McDonald, Zhang, [*Levels of Autonomy for AI Agents*](https://arxiv.org/abs/2506.12469) | 2025-06; rev. 2025-07-28 | Five levels by the user's role — operator, collaborator, consultant, approver, observer. "Autonomy is a deliberate design decision, separate from its capability and operational environment." | "*Semi*-automated is the design" |
| Andrej Karpathy, [*Software 3.0*](https://www.latent.space/p/s3) (YC AI Startup School) | 2025-06-17 | Partial autonomy, the "autonomy slider", "Iron Man suit, not Iron Man robot". | "*Semi*-automated is the design" |
| EU AI Act, [Article 14](https://artificialintelligenceact.eu/article/14/) and [timeline](https://artificialintelligenceact.eu/implementation-timeline/) | read 2026-09-25 | High-risk AI must be designed so natural persons can effectively oversee it, aware of the tendency to over-rely on its output. The implementation timeline (updated 2026-08-31) now has the high-risk obligations applying from 2027-12-02 (Annex III systems) and 2028-08-02 (Annex I). Breaches of high-risk obligations: up to €15M or 3% of turnover (Art. 99). | "accountability stays human" — now also a legal expectation for high-risk uses |
| NIST, [AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) | 1.0 released 2023-01-26 | The *Govern* function: clearly defined roles, decision authority and oversight come before measurement or incident response can work. | Humans decide *who* decides |

## Humans keep the theory

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Peter Naur, [*Programming as Theory Building*](https://doi.org/10.1016/0165-6074(85)90032-8), *Microprocessing and Microprogramming* 15(5) — [summary](https://inventwithpython.com/drafts/naur-programming-as-theory-building.html) | 1985 | The program is the theory in its builders' heads; code is a by-product; "program revival … merely from documentation is strictly impossible". | "Humans keep the theory" — and why the project must write down as much theory as can be written |
| Lisanne Bainbridge, [*Ironies of Automation*](https://en.wikipedia.org/wiki/Ironies_of_Automation) (1983); Uwe Friedrichsen, [*AI and the ironies of automation*](https://www.ufried.com/blog/ironies_of_ai_1/) | 1983; 2025-11-21 | Automation leaves humans the hardest residual tasks, erodes the skills those tasks need, and assigns monitoring, which humans sustain poorly. | "Keeping that theory is also what keeps a human able to judge work they no longer type" |
| Shen, Tamkin et al. (Anthropic), [*How AI assistance impacts the formation of coding skills*](https://www.anthropic.com/research/AI-assistance-coding-skills) | 2026-01-29 | In a randomised study learning a new library, the AI-assisted group scored 50% on a comprehension quiz against 67% for hand-coders; the largest gap was in debugging. "It is possible that AI both accelerates productivity on well-developed skills and hinders acquisition of new ones." | The skill to judge is built by doing; the human's retained work must keep building it |
| Kosmyna, Maes et al. (MIT), [*Your Brain on ChatGPT*](https://arxiv.org/abs/2506.08872) | 2025-06; rev. 2025-12-31 | Over four months, essay writers using an LLM showed the weakest brain connectivity, and 83% could not quote from essays they had just written. *Preprint.* | Delegated work is not understood work |

## Productivity — why the vision makes no speed claim

| Source | Date | Key point |
|---|---|---|
| METR, [2025 randomised trial](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) | 2025-07-10 | Experienced open-source developers were 19% *slower* with early-2025 AI, while believing they were 20% faster. |
| METR, [2026 uplift update](https://metr.org/blog/2026-02-24-uplift-update/) | 2026-02-24 | The follow-up's estimates had confidence intervals spanning both speed-up and slow-down; METR judged the signal unreliable because many developers declined to work without AI — it could no longer recruit a clean control group. |

## Security for an agent that never stops

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Simon Willison, [*The lethal trifecta for AI agents*](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) | 2025-06-16 | Private data + exposure to untrusted content + a way to communicate out = exfiltration. Models cannot reliably tell instructions from content; "95% prevention" guardrails are a failing grade in security. | A resident agent reading issues and pull requests reads untrusted content all day |
| OWASP, [*Top 10 for Agentic Applications 2026*](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) | 2025-12-09 | Ten risks for agents as actors — from ASI01 Agent Goal Hijack to ASI10 Rogue Agents — built from incidents in real systems. | The checklist a resident agent's permissions must answer |

## Against

- **One thread beats many** (Cognition, MAST): every hand-off loses context. The vision's answer —
  hand-offs through what the project has written — is only as good as what gets written.
- **Always-on agents get switched off** (Tian Pan): a resident loop that interrupts too often
  destroys the trust it runs on.
- **Humans lose the skill to judge** (Bainbridge, Anthropic, MIT): "humans decide" degrades if
  deciding is all the human does.
- **Knowledge drifts into the agent**: the Azure SRE Agent retains what it learns *inside the agent*;
  so do [Hermes](../harness/hermes-agent.md) and [Paperclip](../harness/paperclip.md). The industry
  default runs against "Knowledge lives in the project".

## Open for the how

- **The resident loop's contract:** notify, question, review (LangChain) — and an activity log, and
  an interrupt budget.
- **Ephemeral agents get the decision trail, not a summary of it.** Cognition's failure mode is a
  worker missing an implicit decision; the seam artifact must carry decisions explicitly.
- **Parallel only for breadth-first work;** one agent per piece of work otherwise.
- **Design the human's retained work to keep the theory alive** — reviewing designs and decisions,
  not rubber-stamping diffs.
- **Least privilege by lane**, and no resident agent holding all three legs of the trifecta without
  a check between them.
- **The lanes beyond development need evidence**, especially product.

## Checked and not used

- Drammeh, *Multi-Agent LLM Orchestration Achieves Deterministic, High-Quality Decision Support for
  Incident Response* (arXiv 2511.15755) — **withdrawn by its author on 2026-08-31**: the multi-agent
  arm's output was a hard-coded constant. Do not cite its results.
