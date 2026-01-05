# Load-Tester Documentation Library

**Purpose**: Selective context loading guide for agents. Load only what you need for the task at hand.

---

## Quick Load Guides

### For Backend Implementation Tasks

Load these files in order:

```fish
cat load-tester/docs/architecture.md      # System design, patterns
cat load-tester/docs/database-schema.md   # Prisma models
cat load-tester/docs/backend-patterns.md  # Express/Prisma patterns
cat load-tester/docs/environment.md       # Fish shell, ports, gotchas
```

Before claiming done:

```fish
cat load-tester/docs/quality-standards.md
```

**Use when**: Implementing APIs, database changes, backend logic

---

### For Frontend Implementation Tasks

Load these files in order:

```fish
cat load-tester/docs/architecture.md       # System design, patterns
cat load-tester/docs/tech-stack.md         # Frontend dependencies
cat load-tester/docs/frontend-patterns.md  # React/Vite/Tailwind patterns
cat load-tester/docs/ui-ux-standards.md    # UI polish requirements
cat load-tester/docs/environment.md        # Vite server, ports, Fish
```

Before claiming done:

```fish
cat load-tester/docs/quality-standards.md
```

**Use when**: Implementing UI components, pages, frontend features

---

### For Full-Stack Feature Tasks

Load these files in order:

```fish
cat load-tester/docs/architecture.md       # System design
cat load-tester/docs/database-schema.md    # Data models
cat load-tester/docs/api-reference.md      # API contracts
cat load-tester/docs/backend-patterns.md   # Backend implementation
cat load-tester/docs/frontend-patterns.md  # Frontend implementation
cat load-tester/docs/ui-ux-standards.md    # UI polish
cat load-tester/docs/environment.md        # Environment setup
```

Before claiming done:

```fish
cat load-tester/docs/quality-standards.md
```

**Use when**: Adding complete features (schema → API → UI)

---

### For API Design Tasks

Load these files in order:

```fish
cat load-tester/docs/architecture.md      # System design
cat load-tester/docs/database-schema.md   # Data models
cat load-tester/docs/api-reference.md     # Existing endpoints
cat load-tester/docs/API_DESIGN.md        # Design principles
```

**Use when**: Designing new APIs, refactoring endpoints

---

### For Testing Tasks

Load these files in order:

```fish
cat load-tester/docs/architecture.md       # Understand structure
cat load-tester/docs/testing-standards.md  # Testing patterns
cat load-tester/docs/environment.md        # Running tests
```

**Use when**: Writing tests, debugging test failures

---

### For Docker/Deployment Tasks

Load these files in order:

```fish
cat load-tester/docs/architecture.md  # System structure
cat load-tester/docs/docker.md        # Docker setup, deployment
cat load-tester/docs/environment.md   # Environment variables
```

**Use when**: Building Docker images, deploying to production, containerization

---

### For Debugging / Troubleshooting

Load these files in order:

```fish
cat load-tester/docs/architecture.md  # System structure
cat load-tester/docs/environment.md   # Common issues, fixes
```

Check relevant patterns:

```fish
cat load-tester/docs/backend-patterns.md   # If backend issue
cat load-tester/docs/frontend-patterns.md  # If frontend issue
```

**Use when**: Fixing bugs, investigating issues, debugging

---

## Library Contents

| File | Purpose | Size | Load When |
|------|---------|------|-----------|
| `architecture.md` | System design, monorepo structure, design patterns | ~80 lines | Always (core context) |
| `tech-stack.md` | Package versions, dependencies | ~120 lines | When adding dependencies |
| `database-schema.md` | Prisma models, relationships | ~100 lines | Backend + API design |
| `api-reference.md` | API endpoints, contracts | ~60 lines | Backend + frontend integration |
| `backend-patterns.md` | Express/Prisma implementation patterns | ~150 lines | Backend tasks |
| `frontend-patterns.md` | React/Vite/Tailwind patterns | ~120 lines | Frontend tasks |
| `quality-standards.md` | Definition of done, checklists | ~100 lines | Before claiming done (always) |
| `ui-ux-standards.md` | UI polish requirements | ~80 lines | Frontend UI tasks |
| `testing-standards.md` | Testing patterns, coverage | ~70 lines | Writing tests |
| `environment.md` | Fish shell, ports, gotchas | ~100 lines | Always (critical setup) |
| `docker.md` | Docker setup, deployment, security | ~400 lines | Containerization, deployment |
| `API_DESIGN.md` | API design principles | Existing | API design tasks |

---

## Loading Strategy

### Minimize Context Usage

**Don't load everything** — Select only what's needed:

- Backend task? Skip frontend-patterns.md and ui-ux-standards.md
- Frontend task? Skip backend-patterns.md and database-schema.md
- Simple fix? Just architecture.md + environment.md

### Always Load (Core Context)

These two files provide critical context for any task:

1. `architecture.md` — Understand system structure
2. `environment.md` — Fish shell, ports, common issues

### Before Claiming Done (Quality Gate)

Always load before reporting completion:

- `quality-standards.md` — Verify all criteria met

---

## Migration from Legacy Files

**Old approach** (deprecated):

- `load-tester/KNOWLEDGE.md` (376 lines) — Monolithic
- `load-tester/STANDARDS.md` (267 lines) — Monolithic
- **Problem**: Load 23KB for any task

**New approach** (current):

- 12 focused documents in `load-tester/docs/`
- Load 6-10KB per task (~60% reduction)
- Selective context based on task type

**Status**: KNOWLEDGE.md and STANDARDS.md deprecated but kept temporarily for reference.

---

## Adding New Documentation

When adding new docs to this library:

1. Keep files focused (single responsibility)
2. Target 60-150 lines per file
3. Make self-contained (readable without other docs)
4. Update this index with loading guidance
5. Add to appropriate quick load guide above

---

**Last Updated**: January 5, 2026
