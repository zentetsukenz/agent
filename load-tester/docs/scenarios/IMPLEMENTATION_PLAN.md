# Scenario Feature - Implementation Plan

> **Purpose**: Define HOW we're building the feature. This document covers the approach, phase order, and technical strategy. Reference the SPEC.md for what we're building.

---

## Development Approach

### Frontend-First Strategy

We're using a **frontend-first** approach:

1. **Build UI first** with mock data/services
2. **Discover exact API needs** from frontend requirements
3. **Build backend** to match what frontend actually needs
4. **Connect** frontend to real API

**Benefits**:
- API design emerges from real usage
- Avoid over-engineering backend
- Faster iteration on UX
- Clearer requirements for backend

### Vertical Slices

Each phase delivers **end-to-end functionality** where possible, rather than building all of backend then all of frontend.

---

## Implementation Phases

### Phase 1: Frontend - Scenario List & Templates Display

**Goal**: Display scenarios and built-in templates in UI (with mock data)

**Scope**:
- Scenarios service with mock data
- ScenarioCard component
- ScenarioList page (`/scenarios`)
- Scenario detail view (`/scenarios/:id`)
- Navigation updates
- Built-in templates as mock data

**Mock Data Structure**:
```javascript
const mockScenarios = [
  { id: 1, name: 'Smoke Test', isTemplate: true, phases: [...] },
  { id: 2, name: 'Average Load Test', isTemplate: true, phases: [...] },
  // ...
];
```

**Deliverable**: Users can view list of scenarios and see template details

**Estimated effort**: 1 day

---

### Phase 2: Frontend - Phase Builder

**Goal**: Create and edit load phases (the core of simple mode)

**Scope**:
- PhaseEditor component (add/edit/remove phases)
- PhaseTimeline visualization
- LoadProfileGraph (Recharts)
- ScenarioForm (name, description, phases)
- Create scenario page (`/scenarios/new`)
- Edit scenario page (`/scenarios/:id/edit`)
- Form validation
- Save to mock service (localStorage for persistence)

**Deliverable**: Users can create scenarios with custom load phases

**Estimated effort**: 2 days

---

### Phase 3: Frontend - Workflow Builder

**Goal**: Build setup, workflow, and teardown steps

**Scope**:
- Mode toggle (simple vs workflow)
- SetupStepEditor component
- WorkflowStepEditor component
- TeardownStepEditor component
- VariableExtractor component
- VariableAutocomplete component
- Step reordering
- Variable scope visualization

**Deliverable**: Users can create complex workflow scenarios

**Estimated effort**: 2-3 days

---

### Phase 4: Frontend - Test Integration

**Goal**: Select and use scenarios when running tests

**Scope**:
- ScenarioSelector component
- Modify ConfigureTest page
- Scenario preview in test config
- Mock test execution with scenario

**Deliverable**: Users can select a scenario when configuring a test

**Estimated effort**: 1 day

---

### Phase 5: Backend - Database & API

**Goal**: Persist scenarios and provide real API

**Scope**:
- Prisma migration for Scenario model
- Add scenarioId to Test model
- scenarios.service.js (CRUD)
- scenarios.controller.js (HTTP handlers)
- Validation middleware
- Database seed for templates
- Unit tests
- Integration tests
- Connect frontend to real API

**API Endpoints**:
- GET /api/scenarios
- GET /api/scenarios/:id
- POST /api/scenarios
- PUT /api/scenarios/:id
- DELETE /api/scenarios/:id
- POST /api/scenarios/:id/duplicate

**Deliverable**: Scenarios persist in database, frontend uses real API

**Estimated effort**: 2 days

---

### Phase 6: Backend - Execution Engine (Phases)

**Goal**: Execute scenarios with load phases

**Scope**:
- scenarioExecutor.js
- Phase timing and management
- Dynamic connection adjustment with autocannon
- Per-phase result collection
- Result aggregation
- Modify tests.service.js for scenarioId
- Store phaseResults in Test model
- Unit tests
- Integration tests

**Deliverable**: Tests execute with varying load over phases

**Estimated effort**: 2-3 days

---

### Phase 7: Backend - Execution Engine (Workflow)

**Goal**: Execute setup, workflow steps, and teardown

**Scope**:
- Add jsonata dependency
- Variable interpolation utility
- JSONata extraction utility
- Setup executor (sequential, shared context)
- Teardown executor
- Per-connection workflow executor
- Error handling (abort/retry/ignore)
- Cookie/session persistence
- Unit tests
- Integration tests

**Deliverable**: Full workflow scenarios execute correctly

**Estimated effort**: 2-3 days

---

### Phase 8: Frontend - Results Display

**Goal**: Show phase-by-phase results

**Scope**:
- Modify TestResults page
- Phase results tabs/sections
- Per-phase metrics display
- Aggregate results section
- Timeline with phase markers
- Phase comparison visualization

**Deliverable**: Users see detailed per-phase results

**Estimated effort**: 1-2 days

---

### Phase 9: Polish & Documentation

**Goal**: Production-ready quality

**Scope**:
- Mobile responsive testing
- Accessibility review
- Error message review
- Console/terminal warning cleanup
- Update README.md
- Update API_DESIGN.md
- Update KNOWLEDGE.md
- Final test coverage check (80%+)
- End-to-end manual testing

**Deliverable**: Feature is production-ready

**Estimated effort**: 1 day

---

## Phase Dependencies

```
Phase 1 (List/View)
    ↓
Phase 2 (Phase Builder)
    ↓
Phase 3 (Workflow Builder)
    ↓
Phase 4 (Test Integration) ──────┐
    ↓                            │
Phase 5 (Backend API) ←──────────┘
    ↓
Phase 6 (Execution - Phases)
    ↓
Phase 7 (Execution - Workflow)
    ↓
Phase 8 (Results Display)
    ↓
Phase 9 (Polish)
```

---

## Technical Strategy

### Mock Service Pattern (Phases 1-4)

```javascript
// services/scenarios.js
const USE_MOCK = true; // Toggle when backend ready

const mockScenarios = [...];

export const scenariosAPI = {
  getAll: () => USE_MOCK 
    ? Promise.resolve(mockScenarios)
    : api.get('/api/scenarios'),
  
  getById: (id) => USE_MOCK
    ? Promise.resolve(mockScenarios.find(s => s.id === id))
    : api.get(`/api/scenarios/${id}`),
  
  // ... etc
};
```

### Autocannon Phase Management (Phase 6)

Research needed on best approach:
1. **Option A**: Multiple sequential autocannon runs (one per phase)
2. **Option B**: Single run with dynamic adjustment via events
3. **Option C**: Custom connection pool management

Will determine during Phase 6 implementation.

### Variable System (Phase 7)

```javascript
// Interpolation
function interpolate(template, context) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
}

// Extraction with jsonata
const jsonata = require('jsonata');
function extract(responseBody, path) {
  const expression = jsonata(path);
  return expression.evaluate(JSON.parse(responseBody));
}
```

---

## Libraries to Add

| Library | Purpose | Phase |
|---------|---------|-------|
| jsonata | JSON query/extraction | Phase 7 |

No new frontend libraries needed - using existing Recharts for graphs.

---

## File Structure (After Implementation)

```
apps/backend/
├── prisma/
│   ├── schema.prisma              # + Scenario model
│   └── seed.js                    # + Template seeding
├── src/features/
│   └── scenarios/
│       ├── scenarios.controller.js
│       ├── scenarios.service.js
│       ├── scenarios.validation.js
│       └── scenarioExecutor.js
└── tests/
    ├── unit/scenarios/
    │   ├── scenarios.service.test.js
    │   └── scenarioExecutor.test.js
    └── integration/
        └── scenarios.test.js

apps/frontend/
├── src/
│   ├── services/
│   │   └── scenarios.js
│   ├── pages/
│   │   ├── ScenarioList.jsx
│   │   ├── ScenarioDetail.jsx
│   │   ├── ScenarioBuilder.jsx
│   │   └── ScenarioEditor.jsx
│   └── components/
│       └── scenarios/
│           ├── ScenarioCard.jsx
│           ├── ScenarioForm.jsx
│           ├── PhaseEditor.jsx
│           ├── PhaseTimeline.jsx
│           ├── LoadProfileGraph.jsx
│           ├── SetupStepEditor.jsx
│           ├── WorkflowStepEditor.jsx
│           ├── VariableExtractor.jsx
│           ├── VariableAutocomplete.jsx
│           └── ScenarioSelector.jsx
```

---

## Estimated Timeline

| Phase | Effort | Cumulative |
|-------|--------|------------|
| Phase 1 | 1 day | 1 day |
| Phase 2 | 2 days | 3 days |
| Phase 3 | 2-3 days | 5-6 days |
| Phase 4 | 1 day | 6-7 days |
| Phase 5 | 2 days | 8-9 days |
| Phase 6 | 2-3 days | 10-12 days |
| Phase 7 | 2-3 days | 12-15 days |
| Phase 8 | 1-2 days | 13-17 days |
| Phase 9 | 1 day | 14-18 days |

**Total**: ~2.5-3.5 weeks

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Autocannon doesn't support dynamic connections | Research in Phase 6; fallback to sequential runs |
| Complex workflow UI is confusing | User testing after Phase 3; iterate on UX |
| JSONata learning curve | Provide examples in UI; documentation |
| Scope creep | Stick to SPEC.md; defer enhancements |

---

## Session Handoff Protocol

When starting a new session:
1. Read `SPEC.md` for feature requirements
2. Read this `IMPLEMENTATION_PLAN.md` for approach
3. Read `TASKS.md` for current progress
4. Continue from last incomplete phase

When ending a session:
1. Update `TASKS.md` with completed items
2. Add notes in `TASKS.md` Session Notes section
3. Commit changes

---

**Document Version**: 1.0  
**Created**: December 22, 2025  
**Last Updated**: December 22, 2025
