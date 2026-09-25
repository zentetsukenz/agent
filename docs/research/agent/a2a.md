---
type: Research
title: A2A — the Agent2Agent protocol
description: Whether A2A is the right protocol for Jacquard's agents to talk to each other — what it standardises, how mature and secure it is, and where a shared written substrate serves better
tags: [research, agent, a2a, protocol, interoperability, security]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://a2a-protocol.org/latest/, title: A2A protocol specification }
  - { resource: https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year, title: A2A surpasses 150 organizations (Linux Foundation), last_modified: 2026-04-09 }
  - { resource: https://arxiv.org/abs/2609.10871, title: "A2ABreak: Systematic Security Analysis of the A2A Protocol", last_modified: 2026-09-09 }
  - { resource: https://arxiv.org/abs/2606.31498, title: Governance Gaps in Agent Interoperability Protocols, last_modified: 2026-06 }
---

# A2A — the Agent2Agent protocol

*As of 2026-09-25: specification v1.0 (2026-03-12); Apache-2.0; Linux Foundation.* Part of the
[Agent](index.md) pillar.

**Hypothesis under test** (the user's): *"At some point, I want an agent to be able to talk
together. Having this research on hand could proof to be useful."*

**Verdict: partly.** A2A is the mature, vendor-neutral answer for agents that cross a boundary —
another team's agent, a vendor's agent, a different runtime on a different machine. Inside one
project, the vision already has a channel that satisfies "knowledge lives in the project": written
artifacts on a shared substrate. A2A messages are transient; anything decided in one has to land in
the project anyway.

## What it is

An open protocol for agent-to-agent communication ([specification](https://a2a-protocol.org/latest/)):
agents publish an **Agent Card** describing what they can do, and exchange **tasks**, **messages**
and **artifacts** over JSON-RPC 2.0 on HTTPS, with streaming and push notifications. It complements
MCP: MCP connects an agent to tools, A2A connects agents to each other ([standards](../harness/standards.md)).

| Fact | As of | Source |
|---|---|---|
| v1.0 released 2026-03-12; Agent Cards can be signed (JWS, RFC 7515, over JCS, RFC 8785) | 2026-04-09 | [Linux Foundation](https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year) |
| 150+ supporting organisations, 22k+ GitHub stars, production SDKs for Python, JavaScript, Java, Go and .NET; production use at Microsoft, AWS, Salesforce, SAP and ServiceNow | 2026-04-09 | same |

## Security and governance

| Source | Date | Key point |
|---|---|---|
| Lotfi et al., [*A2ABreak*](https://arxiv.org/abs/2609.10871) | 2026-09-09 | First systematic security analysis: a 37-state model of the protocol yields 11 new exploitable vulnerabilities, including cross-client context injection, credential harvesting through delegation, and exfiltration through unattested capability claims. *Preprint.* |
| Kang & Diponegoro, [*Governance Gaps in Agent Interoperability Protocols*](https://arxiv.org/abs/2606.31498) | 2026-06 | Across MCP, A2A, ACP, ANP and ERC-8004: "Voting and dissent preservation are universally absent across all five protocols, deliberation is absent or at most partial"; none encodes the full set of governance primitives, human escalation included. *Preprint.* |

## Bearing on Jacquard

- **Within one project, write it down.** CONSTITUTION already says what crosses between workflows is a
  [seam artifact](../../../CONTEXT.md#seam-artifact) on a shared substrate, "never harness memory".
  That satisfies "a fresh agent anywhere can rebuild the whole picture from it"; a message between
  two agents does not.
- **Across a boundary, A2A.** When a Jacquard agent must work with an agent it does not control, a
  signed Agent Card and a standard task lifecycle beat a bespoke integration.
- **Humans decide.** No interoperability protocol encodes human escalation. Jacquard's "where
  nothing can [check], a human decides" has to sit above A2A, not in it.
- **Security.** A2A delegation is an attack surface (A2ABreak). An agent that reads another agent's
  output is reading untrusted content — see the [Agent](index.md#security-for-an-agent-that-never-stops) pillar.

## Caveats

- A reported merger of IBM's Agent Communication Protocol (ACP) into A2A in 2025 could not be
  confirmed from a primary source on 2026-09-25. (That ACP is not the Agent *Client* Protocol in
  [standards](../harness/standards.md).)
