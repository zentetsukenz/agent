# Scenario Feature - Task Tracking

> **Purpose**: Track implementation progress. Agents should update this document after completing tasks.
> 
> **Reference**: See `SPEC.md` for requirements, `IMPLEMENTATION_PLAN.md` for approach.

---

## Quick Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Frontend - List & Templates | 🔴 Not Started | 0% |
| Phase 2: Frontend - Phase Builder | 🔴 Not Started | 0% |
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

**Status**: 🔴 Not Started  
**Started**: -  
**Completed**: -

### Tasks

- [ ] Create `services/scenarios.js` with mock data
- [ ] Create mock data for 5 built-in templates
- [ ] Create `ScenarioCard.jsx` component
- [ ] Create `ScenarioList.jsx` page
- [ ] Create `ScenarioDetail.jsx` page (view only)
- [ ] Add `/scenarios` route to App.jsx
- [ ] Add `/scenarios/:id` route to App.jsx
- [ ] Add "Scenarios" link to navigation
- [ ] Implement loading states
- [ ] Implement error states
- [ ] Implement empty state
- [ ] Write component tests for ScenarioCard
- [ ] Write component tests for ScenarioList
- [ ] Manual testing in browser

### Notes

_Add notes during implementation_

---

## Phase 2: Frontend - Phase Builder

**Status**: 🔴 Not Started  
**Started**: -  
**Completed**: -

### Tasks

- [ ] Create `PhaseEditor.jsx` component
- [ ] Create `PhaseTimeline.jsx` visualization
- [ ] Create `LoadProfileGraph.jsx` (Recharts)
- [ ] Create `ScenarioForm.jsx` (name, description, mode, phases)
- [ ] Create `ScenarioBuilder.jsx` page (new scenario)
- [ ] Create `ScenarioEditor.jsx` page (edit scenario)
- [ ] Add `/scenarios/new` route
- [ ] Add `/scenarios/:id/edit` route
- [ ] Implement phase add/edit/remove
- [ ] Implement phase reordering
- [ ] Implement form validation
- [ ] Save to mock service (localStorage)
- [ ] Duplicate scenario functionality
- [ ] Write component tests for PhaseEditor
- [ ] Write component tests for ScenarioForm
- [ ] Manual testing in browser

### Notes

_Add notes during implementation_

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

_No sessions yet._

<!-- 
Example entry:

### 2025-12-23 - Session 1

**Started**: Phase 1
**Completed**: ScenarioCard, ScenarioList page
**In Progress**: ScenarioDetail page
**Blockers**: None
**Notes**: Using existing Card component from shadcn. Mock data working well.
**Next**: Finish ScenarioDetail, add routes, then navigation link.
-->

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

**Last Updated**: December 22, 2025  
**Updated By**: Initial creation
