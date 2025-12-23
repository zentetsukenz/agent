# Scenario Feature - Task Tracking

> **Purpose**: Track implementation progress. Agents should update this document after completing tasks.
> 
> **Reference**: See `SPEC.md` for requirements, `IMPLEMENTATION_PLAN.md` for approach.

---

## Quick Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Frontend - List & Templates | 🟢 Complete | 100% |
| Phase 2: Frontend - Phase Builder | 🟢 Complete | 100% |
| Phase 3: Frontend - Workflow Builder | 🔴 Not Started | 0% |
| Phase 4: Frontend - Test Integration | 🔴 Not Started | 0% |
| Phase 5: Backend - Database & API | 🔴 Not Started | 0% |
| Phase 6: Backend - Execution (Phases) | 🔴 Not Started | 0% |
| Phase 7: Backend - Execution (Workflow) | 🔴 Not Started | 0% |
| Phase 8: Frontend - Results Display | 🔴 Not Started | 0% |
| Phase 9: Polish & Documentation | 🔴 Not Started | 0% |

**Legend**: 🔴 Not Started | 🟡 In Progress | 🟢 Complete

---

## Phase 1: Frontend - List & Templates

**Status**: 🟢 Complete  
**Started**: December 22, 2025  
**Completed**: December 23, 2025

### Tasks

- [x] Create `services/scenarios.js` with mock data
- [x] Create mock data for 5 built-in templates
- [x] Create `ScenarioCard.jsx` component
- [x] Create `ScenarioList.jsx` page
- [x] Create `ScenarioDetail.jsx` page (view only)
- [x] Add `/scenarios` route to App.jsx
- [x] Add `/scenarios/:id` route to App.jsx
- [x] Add "Scenarios" link to navigation
- [x] Implement loading states
- [x] Implement error states
- [x] Implement empty state
- [x] Write component tests for ScenarioCard
- [x] Write component tests for ScenarioList
- [x] Manual testing in browser

### Notes

**Session 1 (Dec 22, 2025)**:
- Created `scenarios.js` service with mock data for 5 templates (Smoke, Average, Stress, Spike, Soak)
- Created `ScenarioCard.jsx` with mini load profile SVG visualization
- Created `ScenarioList.jsx` with search, filter tabs (All/Templates/Custom), and sections
- Created `ScenarioDetail.jsx` with full load profile chart, phase cards, stats, and actions
- Added routes to App.jsx and navigation link to Header.jsx (desktop + mobile)
- All pages have loading skeletons, error states, and empty states
- Visual verification passed for both list and detail pages
- ScenarioCard tests: 18 tests passing

**Session 2 (Dec 23, 2025)**:
- Created `ScenarioList.test.jsx` with comprehensive tests (23 tests)
- Fixed ErrorMessage prop mismatch (`message` → `error` + `title`)
- All 41 scenario tests passing (ScenarioCard: 18 + ScenarioList: 23)

---

## Phase 2: Frontend - Phase Builder

**Status**: � Complete  
**Started**: December 23, 2025  
**Completed**: December 23, 2025

### Tasks

- [x] Create `PhaseEditor.jsx` component
- [x] Create `PhaseTimeline.jsx` visualization
- [x] Create `LoadProfileGraph.jsx` (Recharts)
- [x] Create `ScenarioForm.jsx` (name, description, mode, phases)
- [x] Create `ScenarioBuilder.jsx` page (new scenario)
- [x] Create `ScenarioEditor.jsx` page (edit scenario)
- [x] Add `/scenarios/new` route
- [x] Add `/scenarios/:id/edit` route
- [x] Implement phase add/edit/remove
- [x] Implement phase reordering
- [x] Implement form validation
- [x] Save to mock service (works with existing mock API)
- [ ] Duplicate scenario functionality (deferred - not critical path)
- [x] Write component tests for PhaseEditor
- [x] Write component tests for ScenarioForm
- [x] Manual testing in browser

### Notes

**Session 1 (Dec 23, 2025)**:
- Created `scenarioConstants.js` for shared constants (PHASE_TYPES, DEFAULT_PHASE, etc.)
- Created `PhaseEditor.jsx` with name, type, duration, connections inputs and move/delete buttons
- Created `PhaseTimeline.jsx` with clickable proportional segments and phase legend
- Created `LoadProfileGraph.jsx` using Recharts AreaChart with phase boundaries
- Created `ScenarioForm.jsx` with react-hook-form for basic info and manual state for phases
- Created `ScenarioBuilder.jsx` page at /scenarios/new with breadcrumb navigation
- Created `ScenarioEditor.jsx` page at /scenarios/:id/edit with template edit protection
- PhaseEditor tests: 26 tests passing
- ScenarioForm tests: 21 tests passing
- Visual verification passed for create and edit flows
- Total: 88 frontend tests passing

---

## Phase 3: Frontend - Workflow Builder

**Status**: 🔴 Not Started  
**Started**: -  
**Completed**: -

### Tasks

- [ ] Add mode toggle to ScenarioForm (simple/workflow)
- [ ] Create `SetupStepEditor.jsx` component
- [ ] Create `WorkflowStepEditor.jsx` component
- [ ] Create `TeardownStepEditor.jsx` component (or reuse SetupStepEditor)
- [ ] Create `VariableExtractor.jsx` component
- [ ] Create `VariableAutocomplete.jsx` component
- [ ] Implement step add/edit/remove for setup
- [ ] Implement step add/edit/remove for workflow
- [ ] Implement step add/edit/remove for teardown
- [ ] Implement step reordering (drag and drop or buttons)
- [ ] Implement variable scope tracking
- [ ] Implement autocomplete trigger on `{{`
- [ ] Implement error handling config UI
- [ ] Update mock service for workflow data
- [ ] Write component tests
- [ ] Manual testing in browser

### Notes

_Add notes during implementation_

---

## Phase 4: Frontend - Test Integration

**Status**: 🔴 Not Started  
**Started**: -  
**Completed**: -

### Tasks

- [ ] Create `ScenarioSelector.jsx` component
- [ ] Modify `ConfigureTest.jsx` - add scenario selection
- [ ] Implement toggle: "Quick Config" vs "Use Scenario"
- [ ] Show scenario preview when selected
- [ ] Update mock test execution to accept scenarioId
- [ ] Write component tests for ScenarioSelector
- [ ] Manual testing in browser

### Notes

_Add notes during implementation_

---

## Phase 5: Backend - Database & API

**Status**: 🔴 Not Started  
**Started**: -  
**Completed**: -

### Tasks

- [ ] Create Prisma migration for Scenario model
- [ ] Add scenarioId field to Test model
- [ ] Add phaseResults field to Test model
- [ ] Run migration
- [ ] Create `features/scenarios/` folder
- [ ] Create `scenarios.service.js` (CRUD operations)
- [ ] Create `scenarios.controller.js` (HTTP handlers)
- [ ] Create `scenarios.validation.js` (express-validator rules)
- [ ] Register routes in app.js
- [ ] Create `prisma/seed.js` for templates
- [ ] Add seed script to package.json
- [ ] Run seed to create templates
- [ ] Write unit tests for scenarios.service
- [ ] Write integration tests for scenarios API
- [ ] Switch frontend from mock to real API
- [ ] Test frontend with real backend
- [ ] Update KNOWLEDGE.md with new endpoints

### Notes

_Add notes during implementation_

---

## Phase 6: Backend - Execution (Phases)

**Status**: 🔴 Not Started  
**Started**: -  
**Completed**: -

### Tasks

- [ ] Research autocannon dynamic connection adjustment
- [ ] Document chosen approach in Implementation Plan
- [ ] Create `scenarioExecutor.js`
- [ ] Implement phase timing management
- [ ] Implement connection ramping (ramp type)
- [ ] Implement constant load (constant type)
- [ ] Implement spike pattern (spike type)
- [ ] Implement per-phase result collection
- [ ] Implement result aggregation across phases
- [ ] Modify `tests.service.js` to accept scenarioId
- [ ] Store phase results in Test.phaseResults
- [ ] Write unit tests for scenarioExecutor
- [ ] Write integration tests for scenario execution
- [ ] Manual testing with built-in templates

### Notes

_Add notes during implementation_

---

## Phase 7: Backend - Execution (Workflow)

**Status**: 🔴 Not Started  
**Started**: -  
**Completed**: -

### Tasks

- [ ] Add jsonata dependency
- [ ] Create `utils/interpolate.js` (variable interpolation)
- [ ] Create `utils/extractor.js` (JSONata extraction)
- [ ] Implement setup phase executor
- [ ] Implement shared context passing
- [ ] Implement teardown phase executor
- [ ] Implement per-connection workflow executor
- [ ] Implement runOnce logic for workflow steps
- [ ] Implement error handling: abort
- [ ] Implement error handling: retry with count
- [ ] Implement error handling: ignore
- [ ] Implement cookie/session persistence
- [ ] Write unit tests for interpolate
- [ ] Write unit tests for extractor
- [ ] Write unit tests for executors
- [ ] Write integration tests for workflow execution
- [ ] Manual testing with workflow scenario

### Notes

_Add notes during implementation_

---

## Phase 8: Frontend - Results Display

**Status**: 🔴 Not Started  
**Started**: -  
**Completed**: -

### Tasks

- [ ] Modify `TestResults.jsx` for phase results
- [ ] Create phase results section/tabs
- [ ] Display per-phase metrics
- [ ] Display aggregate results
- [ ] Create timeline with phase markers
- [ ] Show scenario name and config used
- [ ] Handle tests without scenarios (backward compat)
- [ ] Write component tests
- [ ] Manual testing in browser

### Notes

_Add notes during implementation_

---

## Phase 9: Polish & Documentation

**Status**: 🔴 Not Started  
**Started**: -  
**Completed**: -

### Tasks

- [ ] Mobile responsive testing - Scenario list
- [ ] Mobile responsive testing - Scenario builder
- [ ] Mobile responsive testing - Results display
- [ ] Accessibility review
- [ ] Review all error messages (user-friendly)
- [ ] Check browser console for warnings
- [ ] Check terminal for warnings
- [ ] Run full test suite
- [ ] Verify 80%+ backend coverage
- [ ] Update README.md
- [ ] Update docs/API_DESIGN.md
- [ ] Update KNOWLEDGE.md
- [ ] End-to-end manual testing
- [ ] Create demo scenario for testing

### Notes

_Add notes during implementation_

---

## Session Notes

> **Instructions**: Add dated entries when starting/ending sessions. Include context that helps the next session.

### Session Log

### 2025-12-22 - Session 1

**Started**: Phase 1 - Frontend List & Templates
**Completed**: 
- services/scenarios.js with mock data
- ScenarioCard.jsx component with tests (18 passing)
- ScenarioList.jsx page
- ScenarioDetail.jsx page
- Routes in App.jsx
- Navigation link in Header.jsx
- Loading/error/empty states

**In Progress**: Write component tests for ScenarioList
**Blockers**: None
**Notes**: 
- Using existing Card, Badge, Button components from shadcn/ui
- Mock data service uses USE_MOCK flag for easy switch to real API
- Visual verification passed via subagent screenshots
**Next**: Complete ScenarioList tests, then start Phase 2 (Phase Builder)

### 2025-12-23 - Session 1

**Started**: Phase 2 - Frontend Phase Builder
**Completed**: 
- scenarioConstants.js with shared constants
- PhaseEditor.jsx component with tests (26 passing)
- PhaseTimeline.jsx visualization
- LoadProfileGraph.jsx with Recharts AreaChart
- ScenarioForm.jsx with react-hook-form and phase management
- ScenarioBuilder.jsx page (/scenarios/new)
- ScenarioEditor.jsx page (/scenarios/:id/edit)
- ScenarioForm tests (21 passing)
- Total: 88 frontend tests passing

**In Progress**: None
**Blockers**: None
**Notes**: 
- Created separate constants file to avoid Fast Refresh lint error
- LoadProfileGraph shows connections over time with phase boundaries
- Template scenarios protected from editing (redirects to detail page)
- Visual verification passed for create and edit flows
**Next**: Phase 3 - Workflow Builder

---

## Blockers & Issues

> Track any blockers or issues that need resolution.

_No blockers._

<!-- 
Example:

| Issue | Status | Resolution |
|-------|--------|------------|
| Recharts not rendering on mobile | Open | Investigating responsive options |
-->

---

**Last Updated**: December 23, 2025  
**Updated By**: Phase 2 completion
