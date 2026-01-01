# Load-Tester Tech Stack

**Purpose**: Package versions and dependencies reference

---

## Root Monorepo

**Package Manager**: npm with workspaces  
**Version**: 2.0.0

| Package | Version | Purpose |
|---------|---------|---------|
| concurrently | ^8.2.2 | Run backend + frontend simultaneously |

---

## Backend (`apps/backend`)

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework for REST APIs |
| node | 20+ | Runtime environment |

### Database & ORM

| Package | Version | Purpose |
|---------|---------|---------|
| @prisma/client | ^7.0.0 | Database ORM client |
| prisma | ^7.0.0 | CLI and migration tools |
| @prisma/adapter-better-sqlite3 | ^7.1.0 | SQLite adapter (Prisma 7 requirement) |
| better-sqlite3 | ^12.5.0 | SQLite database driver |

**Note**: Prisma 7 requires adapter pattern (no direct DATABASE_URL in schema)

### Security & Middleware

| Package | Version | Purpose |
|---------|---------|---------|
| helmet | ^8.1.0 | Security headers middleware |
| cors | ^2.8.5 | Cross-origin resource sharing |
| express-validator | ^7.3.1 | Request validation and sanitization |
| express-rate-limit | ^8.2.1 | Rate limiting middleware |
| validator | ^13.15.23 | String validation utilities |

### Load Testing

| Package | Version | Purpose |
|---------|---------|---------|
| autocannon | ^7.14.0 | Load testing engine |

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| jest | ^29.7.0 | Testing framework |
| supertest | ^6.3.3 | HTTP assertion library |

**Coverage requirement**: 80%+ for backend

---

## Frontend (`apps/frontend`)

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI framework |
| react-dom | ^19.2.0 | React DOM renderer |

**Note**: React 19 has breaking changes from React 18. Check compatibility.

### Routing

| Package | Version | Purpose |
|---------|---------|---------|
| react-router-dom | ^7.10.1 | Client-side routing |

**Note**: React Router 7 has new APIs compared to v6

### Forms & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| react-hook-form | ^7.68.0 | Form state management |

### UI/UX

| Package | Version | Purpose |
|---------|---------|---------|
| react-hot-toast | ^2.6.0 | Toast notifications |
| recharts | ^3.5.1 | Data visualization charts |

### HTTP Client

| Package | Version | Purpose |
|---------|---------|---------|
| axios | ^1.13.2 | HTTP requests to backend |

### Styling

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^4.1.17 | Utility-first CSS framework |
| postcss | (version) | CSS processor |

**Note**: Tailwind 4 changed configuration. Check migration guide.

### Build Tool

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^7.2.4 | Fast build tool with HMR |

**Note**: Vite 7 is bleeding-edge. Check compatibility with plugins.

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | ^4.0.15 | Unit test runner (Vite-native) |
| @testing-library/react | ^16.3.0 | React component testing |
| @testing-library/user-event | (version) | User interaction simulation |
| msw | ^2.12.4 | API mocking for tests |

**Note**: MSW v2 has different setup than v1

---

## Development Tools

### Linting & Formatting

| Tool | Config File | Purpose |
|------|-------------|---------|
| ESLint | `eslint.config.js` | JavaScript linting |
| Prettier | (if configured) | Code formatting |

---

## Version Compatibility Notes

### Prisma 5 → 7 Migration

**What changed**:

- No `url` in `datasource db` block
- Requires adapter pattern in code
- `@prisma/adapter-better-sqlite3` package required

**Migration completed**: December 2024

### React 18 → 19 Migration

**Breaking changes**:

- New Server Components (not used in this project)
- `useEffect` behavior changes
- Some hooks deprecated

**Check**: Official React 19 upgrade guide for patterns

### Tailwind 3 → 4 Migration

**What changed**:

- Configuration format different
- Some utility classes renamed
- New features (container queries, etc.)

**Verify**: Tailwind 4 compatibility before using new features

### Vite 6 → 7 Migration

**What changed**:

- Performance improvements
- Plugin API updates
- Some breaking changes in config

**Note**: Vite 7 is very recent, may have edge cases

---

## Adding Dependencies

### Before Adding

1. **Check compatibility** - Verify version works with existing stack
2. **Research alternatives** - Is this the best solution?
3. **Check bundle size** - Will it bloat the frontend?
4. **Verify maintenance** - Is the package actively maintained?

### Adding Process

```fish
# Backend dependency
cd ~/workspace/agent/load-tester/apps/backend
npm install package-name

# Frontend dependency
cd ~/workspace/agent/load-tester/apps/frontend
npm install package-name

# Dev dependency
npm install -D package-name

# Update this file after adding
```

### Common Additions

**Backend**:

- Authentication: `jsonwebtoken`, `bcrypt`
- Logging: `winston`, `pino`
- Validation: Already have `express-validator`

**Frontend**:

- UI components: `shadcn/ui` (already configured)
- Date handling: `date-fns`, `dayjs`
- State management: `zustand`, `jotai` (if needed beyond Context API)

---

## Package Scripts

### Root (`package.json`)

```fish
npm run dev           # Start both apps concurrently
npm run backend       # Start backend only
npm run frontend      # Start frontend only
npm run test:all      # Run all tests
npm run backend:test  # Backend tests only
npm run frontend:test # Frontend tests only
```

### Backend (`apps/backend/package.json`)

```fish
npm run dev              # Start dev server (port 3001)
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run db:setup         # Migrate + generate Prisma client
npm run prisma:migrate   # Create migration
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Visual database browser
```

### Frontend (`apps/frontend/package.json`)

```fish
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run test     # Run Vitest tests
npm run lint     # Run ESLint
```

---

## Environment Variables

### Backend (`.env` in `apps/backend/`)

```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV="development"
PORT=3001
```

### Frontend

No `.env` file needed currently. API URL hardcoded to `http://localhost:3001`.

---

## References

- Architecture → [architecture.md](architecture.md)
- Backend patterns → [backend-patterns.md](backend-patterns.md)
- Frontend patterns → [frontend-patterns.md](frontend-patterns.md)
- Environment setup → [environment.md](environment.md)

---

**Last Updated**: January 1, 2026
