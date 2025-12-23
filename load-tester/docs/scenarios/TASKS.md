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
| Phase 3: Frontend - Workflow Builder | � Complete | 100% |
| Phase 4: Frontend - Test Integration | � Complete | 100% |
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

**Status**: � Complete  
**Started**: December 23, 2025  
**Completed**: December 23, 2025

### Tasks

- [x] Add mode toggle to ScenarioForm (simple/workflow)
- [x] Create `SetupStepEditor.jsx` component
- [x] Create `WorkflowStepEditor.jsx` component
- [x] Create `TeardownStepEditor.jsx` component (reuses SetupStepEditor with stepType prop)
- [x] Create `VariableExtractor.jsx` component
- [x] Create `VariableAutocomplete.jsx` component
- [x] Implement step add/edit/remove for setup
- [x] Implement step add/edit/remove for workflow
- [x] Implement step add/edit/remove for teardown
- [x] Implement step reordering (move up/down buttons)
- [x] Implement variable scope tracking
- [x] Implement autocomplete trigger on `{{`
- [x] Implement error handling config UI
- [x] Update scenario constants for workflow data
- [x] Write component tests
- [x] Manual testing in browser

### Notes

**Session 1 (Dec 23, 2025)**:
- Added mode toggle with Simple/Workflow visual buttons
- Created `SetupStepEditor.jsx` for setup/teardown steps (shared with stepType prop)
- Created `WorkflowStepEditor.jsx` with Loop/Once toggle for runOnce behavior
- Created `VariableExtractor.jsx` for extracting variables from responses
- Created `VariableAutocomplete.jsx` with dropdown on `{{` trigger
- Added collapsible and switch UI components from shadcn
- Updated `scenarioConstants.js` with HTTP_METHODS, ERROR_HANDLING_OPTIONS, etc.
- Workflow mode shows Setup Steps, Workflow Steps, Teardown Steps sections
- Variable scope tracking: setup vars available everywhere, workflow vars in subsequent steps
- Error handling config: abort/retry/ignore options with retry count
- Tests: SetupStepEditor (28), WorkflowStepEditor (24), VariableExtractor (17)
- Total: 163 frontend tests passing
- Visual verification passed via browser testing

---

## Phase 4: Frontend - Test Integration

**Status**: � Complete  
**Started**: December 24, 2025  
**Completed**: December 24, 2025

### Tasks

- [x] Create `ScenarioSelector.jsx` component
- [x] Modify `ConfigureTest.jsx` - add scenario selection
- [x] Implement toggle: "Quick Config" vs "Use Scenario"
- [x] Show scenario preview when selected
- [x] Update mock test execution to accept scenarioId
- [x] Write component tests for ScenarioSelector
- [x] Manual testing in browser

### Notes

**Session 1 (Dec 24, 2025)**:
- Created `ScenarioSelector.jsx` component with:
  - Loading state with skeletons
  - Error handling
  - Search functionality (by name and description)
  - Filter dropdown (All/Templates/Custom)
  - Expandable scenario cards with "Use This Scenario" button
  - Selected scenario preview with phase badges, duration, max connections
  - Change button to clear selection
- Modified `ConfigureTest.jsx` with:
  - Mode toggle: "Quick Config" (default) vs "Use Scenario"
  - Conditional rendering of request templates (Quick mode) or scenario selector (Scenario mode)
  - `handleScenarioSubmit` function for scenario-based test execution
  - Cancel and Run Test buttons for scenario mode
- Added `executeWithScenario` method to tests service
- ScenarioSelector tests: 25 tests passing
- Visual verification passed:
  - Mode toggle visible and functional
  - Quick Config shows templates and form
  - Use Scenario shows searchable scenario list
  - Scenario selection flow works correctly
  - Selected scenario preview displays with Change button
- Total: 188 frontend tests passing

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

### 2025-12-23 - Session 2

**Started**: Phase 3 - Frontend Workflow Builder
**Completed**: 
- Mode toggle (Simple/Workflow) with visual selection buttons
- SetupStepEditor.jsx for setup and teardown steps
- WorkflowStepEditor.jsx with Loop/Once toggle
- VariableExtractor.jsx for response variable extraction
- VariableAutocomplete.jsx with `{{` trigger dropdown
- Setup/Workflow/Teardown sections in ScenarioForm
- Step add/edit/remove/reorder for all step types
- Variable scope tracking (setup vars global, workflow vars scoped)
- Error handling configuration UI (abort/retry/ignore)
- Added shadcn collapsible and switch components
- Updated scenarioConstants.js with workflow-related constants
- SetupStepEditor tests (28 passing)
- WorkflowStepEditor tests (24 passing)
- VariableExtractor tests (17 passing)
- Total: 163 frontend tests passing

**In Progress**: None
**Blockers**: None
**Notes**: 
- Reused SetupStepEditor for teardown with stepType prop
- WorkflowStepEditor has unique Loop/Once toggle for runOnce behavior
- Variable autocomplete shows scope badges (setup=purple, workflow=blue)
- Error handling appears when steps are added to setup/teardown
- Visual verification confirmed all workflow mode features working
**Next**: Phase 4 - Test Integration

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
**Updated By**: Phase 3 completion
