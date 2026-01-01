# Session Notes

Persistent knowledge that survives context resets. Updated during sessions, consulted on resume.

---

## Active Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-27 | Adopt Context Engineering practices | Enable longer, more coherent AI-assisted sessions |
| 2025-12-27 | Manual checkpoint triggers (not automatic) | No self-monitoring of token usage available |

---

## Project Patterns

### Load Tester (apps/backend + apps/frontend)

- Express.js + Prisma backend
- React + Vite frontend
- See [KNOWLEDGE.md](load-tester/KNOWLEDGE.md) for details

---

## Discovered Limitations

### VS Code Copilot Context Visibility

- **Current**: Use `F1` → "Show Chat Debug View" to see token usage
- **Future**: Context window % indicator coming Dec/Jan 2026 ([#277871](https://github.com/microsoft/vscode/issues/277871))
- **Claude Opus 4.5 in Copilot**: 144k total, 128k prompt, 16k output

---

## Key Learnings

### Context Engineering Principles (2025-12-27)

1. Own your context window — curate strategically, don't accumulate
2. Compaction before summarization — reversible > lossy
3. Small focused agents > monolithic agents
4. Errors are learning signals — compact into context
5. Treat agent as stateless reducer

### Researcher Agent Design (2025-12-31)

1. **ISOLATE is the key pattern** — Research in subagent's context, return only synthesis
2. **~500 token return budget** — Hard limit to preserve calling agent's context
3. **Synthesis over aggregation** — Transform raw data into actionable insights
4. **Breadth-first tasks ideal for subagents** — Research benefits from parallel exploration
5. **Context compression at agent boundaries** — Summarize before returning to main agent
6. **80-95% context reduction** — Subagent isolation vs. doing research directly

**Key sources:**

- Anthropic multi-agent research system (subagents with isolated context)
- Manus: "Share memory by communicating, don't communicate by sharing memory"
- JetBrains: Observation masking beats LLM summarization for efficiency

---

## Open Questions

- [ ] Explore MCP Memory for cross-session persistence
- [ ] Test researcher agent with real tasks and refine based on results
- [ ] Define project-specific checkpoint templates

---

## Session Log

### 2025-12-27: Context Engineering Research

- Researched context engineering from Anthropic, 12-Factor Agents, Manus
- Established checkpoint protocol in CONTEXT-ENGINEERING.md
- Created this NOTES.md for persistent knowledge
