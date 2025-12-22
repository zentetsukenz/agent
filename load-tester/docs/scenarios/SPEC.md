# Scenario Feature - Specification

> **Purpose**: Define WHAT we're building. This is the reference document for feature requirements, data models, and designs. Should rarely change once finalized.

---

## 1. Feature Overview

### What is a Scenario?

A **Scenario** is a reusable test configuration that defines:
1. **Setup** (optional): One-time global setup steps that run before the load test
2. **Workflow** (optional): Request sequence that each connection executes during the load test
3. **Phases**: Load pattern over time (ramp-up, sustain, spike, cooldown, etc.)
4. **Teardown** (optional): Cleanup steps that run after the load test

### Why Scenarios?

Current limitation: Tests can only hit a single endpoint with fixed load parameters.

Scenarios enable:
- Variable load patterns (ramp up, spike, soak testing)
- Multi-step workflows (login → create resource → load test API)
- Shared setup (create one resource, hammer it with many connections)
- Reusable test configurations
- Industry-standard testing patterns (smoke, stress, spike, soak)

### Example Use Case: Ledger API Load Test

```
Setup (runs once globally):
  1. POST /api/books → extract bookUid
  2. POST /api/accounts → extract accountUid

Load Test (50 connections):
  Phase 1: Ramp 0→50 connections over 30s
  Phase 2: Sustain 50 connections for 120s
  Phase 3: Cooldown 50→0 connections over 30s
  
  Each connection loops:
    POST /api/transactions { bookUid, accountUid, amount }

Teardown (runs once globally):
  1. DELETE /api/books/{{bookUid}}
```

---

## 2. Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Create, read, update, delete scenarios | Must |
| F2 | Define load phases (ramp, constant, spike) | Must |
| F3 | Global setup steps with variable extraction | Must |
| F4 | Workflow steps with variable interpolation | Must |
| F5 | Teardown steps for cleanup | Should |
| F6 | Built-in scenario templates (non-editable, duplicatable) | Must |
| F7 | Execute scenario against endpoint (simple mode) | Must |
| F8 | Execute scenario with workflow (advanced mode) | Must |
| F9 | Results per-phase and aggregated | Must |
| F10 | Configurable error handling for setup/teardown | Should |
| F11 | Variable autocomplete in frontend | Should |

### Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NF1 | Maintain 80%+ test coverage for backend |
| NF2 | Mobile-responsive frontend |
| NF3 | Loading states for all async operations |
| NF4 | User-friendly error messages |

---

## 3. Data Model

### Prisma Schema

```prisma
model Scenario {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String?
  
  // Execution mode
  mode        String    @default("simple")  // "simple" | "workflow"
  
  // Simple mode: reference existing endpoint
  endpointId  Int?
  endpoint    Endpoint? @relation(fields: [endpointId], references: [id], onDelete: SetNull)
  
  // Workflow mode: setup, workflow, teardown
  setup       String?   // JSON array of SetupStep
  workflow    String?   // JSON array of WorkflowStep
  teardown    String?   // JSON array of TeardownStep
  
  // Load pattern (required for all modes)
  phases      String    // JSON array of Phase
  
  // Error handling configuration
  setupErrorHandling    String @default("abort")  // "abort" | "retry" | "ignore"
  setupRetryCount       Int    @default(3)
  teardownErrorHandling String @default("ignore") // "abort" | "retry" | "ignore"
  teardownRetryCount    Int    @default(3)
  
  // Template flag
  isTemplate  Boolean   @default(false)
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  tests       Test[]
  
  @@index([name])
  @@index([isTemplate])
  @@index([mode])
}

// Update existing Test model
model Test {
  // ... existing fields ...
  
  scenarioId  Int?
  scenario    Scenario? @relation(fields: [scenarioId], references: [id], onDelete: SetNull)
  
  // Store phase results separately
  phaseResults String?  // JSON array of PhaseResult
}
```

### JSON Structures

#### Phase

```typescript
interface Phase {
  name: string;           // "Ramp Up", "Sustain", "Spike"
  duration: number;       // seconds
  connections: number;    // target connections at end of phase
  rps?: number;           // optional: target requests per second
  type: "ramp" | "constant" | "spike";
}
```

#### SetupStep / TeardownStep

```typescript
interface SetupStep {
  name: string;           // "Create Book"
  method: string;         // "POST", "GET", "DELETE", etc.
  path: string;           // "/api/books" (can use {{variables}})
  headers?: Record<string, string>;  // Can use {{variables}}
  body?: string;          // JSON string, can use {{variables}}
  
  // Variable extraction from response
  extractors?: Array<{
    name: string;         // Variable name: "bookUid"
    source: "body" | "header" | "cookie";
    path?: string;        // JSONata expression: "uid" or "data.items[0].id"
  }>;
}

// TeardownStep is identical to SetupStep
type TeardownStep = SetupStep;
```

#### WorkflowStep

```typescript
interface WorkflowStep {
  name: string;
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: string;
  
  // Per-connection behavior
  runOnce?: boolean;      // true = setup step (run once per connection)
                          // false = load test step (loop continuously)
  
  extractors?: Array<{
    name: string;
    source: "body" | "header" | "cookie";
    path?: string;
  }>;
}
```

#### PhaseResult

```typescript
interface PhaseResult {
  phaseName: string;
  duration: number;
  requests: {
    total: number;
    average: number;
    sent: number;
  };
  latency: {
    min: number;
    max: number;
    mean: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  throughput: {
    average: number;
    total: number;
  };
  errors: number;
  timeouts: number;
}
```

---

## 4. API Design

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scenarios` | List all scenarios |
| GET | `/api/scenarios/:id` | Get scenario details |
| POST | `/api/scenarios` | Create scenario |
| PUT | `/api/scenarios/:id` | Update scenario (not templates) |
| DELETE | `/api/scenarios/:id` | Delete scenario (not templates) |
| POST | `/api/scenarios/:id/duplicate` | Duplicate scenario |

### Request/Response Examples

#### Create Scenario (Simple Mode)

```json
POST /api/scenarios
{
  "name": "Stress Test - User API",
  "description": "Progressive load increase to find breaking point",
  "mode": "simple",
  "endpointId": 5,
  "phases": [
    { "name": "Warm Up", "duration": 30, "connections": 10, "type": "ramp" },
    { "name": "Load 1", "duration": 60, "connections": 50, "type": "ramp" },
    { "name": "Load 2", "duration": 60, "connections": 100, "type": "ramp" },
    { "name": "Cool Down", "duration": 30, "connections": 0, "type": "ramp" }
  ]
}
```

#### Create Scenario (Workflow Mode)

```json
POST /api/scenarios
{
  "name": "Ledger Transaction Load Test",
  "description": "Create book and account, then load test transactions",
  "mode": "workflow",
  "setup": [
    {
      "name": "Create Book",
      "method": "POST",
      "path": "/api/books",
      "body": "{\"name\": \"Load Test Ledger\"}",
      "extractors": [
        { "name": "bookUid", "source": "body", "path": "uid" }
      ]
    },
    {
      "name": "Create Account",
      "method": "POST",
      "path": "/api/accounts",
      "body": "{\"bookUid\": \"{{bookUid}}\", \"name\": \"Cash\"}",
      "extractors": [
        { "name": "accountUid", "source": "body", "path": "uid" }
      ]
    }
  ],
  "workflow": [
    {
      "name": "Create Transaction",
      "method": "POST",
      "path": "/api/transactions",
      "body": "{\"bookUid\": \"{{bookUid}}\", \"accountUid\": \"{{accountUid}}\", \"amount\": 100}",
      "runOnce": false
    }
  ],
  "teardown": [
    {
      "name": "Delete Book",
      "method": "DELETE",
      "path": "/api/books/{{bookUid}}"
    }
  ],
  "phases": [
    { "name": "Ramp Up", "duration": 30, "connections": 50, "type": "ramp" },
    { "name": "Sustain", "duration": 120, "connections": 50, "type": "constant" },
    { "name": "Cool Down", "duration": 30, "connections": 0, "type": "ramp" }
  ],
  "setupErrorHandling": "retry",
  "setupRetryCount": 3,
  "teardownErrorHandling": "ignore"
}
```

#### Execute Test with Scenario

```json
POST /api/endpoints/:id/test
{
  "scenarioId": 5
}
```

---

## 5. Execution Engine Design

### Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     SCENARIO EXECUTION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SETUP PHASE (if setup exists)                              │
│     ├── Execute setup steps sequentially (single connection)    │
│     ├── Extract variables to shared context                     │
│     ├── On error: abort / retry / ignore (configurable)        │
│     └── Store setup results                                     │
│                                                                 │
│  2. LOAD TEST PHASE                                            │
│     ├── Initialize autocannon with first phase connections      │
│     ├── Pass shared context to all connections                  │
│     │                                                           │
│     │   For each phase:                                         │
│     │   ├── Adjust connections (ramp/constant/spike)            │
│     │   ├── Execute workflow steps per connection               │
│     │   ├── Collect metrics                                     │
│     │   └── Store phase results                                 │
│     │                                                           │
│     └── Aggregate all phase results                             │
│                                                                 │
│  3. TEARDOWN PHASE (if teardown exists)                        │
│     ├── Execute teardown steps sequentially                     │
│     ├── On error: abort / retry / ignore (configurable)        │
│     └── Store teardown results                                  │
│                                                                 │
│  4. FINALIZE                                                   │
│     ├── Combine all results                                     │
│     ├── Update test status to completed/failed                  │
│     └── Save to database                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Variable System

**Interpolation Syntax**: `{{variableName}}`

```javascript
// Example: interpolate("Hello {{name}}", { name: "World" })
// Result: "Hello World"
```

**Extraction**: Using JSONata expressions

```javascript
// Response: { "data": { "user": { "id": 123 } } }
// Path: "data.user.id"
// Result: 123
```

---

## 6. Frontend Design

### New Pages

| Page | Route | Description |
|------|-------|-------------|
| Scenario List | `/scenarios` | Grid of scenario cards |
| Scenario Detail | `/scenarios/:id` | View scenario configuration |
| Scenario Builder | `/scenarios/new` | Create new scenario |
| Scenario Editor | `/scenarios/:id/edit` | Edit existing scenario |

### New Components

```
components/scenarios/
├── ScenarioCard.jsx          # Card for list view
├── ScenarioList.jsx          # Grid of cards
├── ScenarioForm.jsx          # Main form component
├── PhaseEditor.jsx           # Phase timeline builder
├── PhaseTimeline.jsx         # Visual timeline display
├── SetupStepEditor.jsx       # Setup/teardown step form
├── WorkflowStepEditor.jsx    # Workflow step form
├── VariableExtractor.jsx     # Extractor configuration
├── VariableAutocomplete.jsx  # Autocomplete for {{var}}
├── LoadProfileGraph.jsx      # Recharts visualization
└── ScenarioSelector.jsx      # Dropdown for test config
```

### Modified Pages

| Page | Changes |
|------|---------|
| ConfigureTest | Add scenario selector, toggle simple/scenario mode |
| TestResults | Show scenario info, phase-by-phase results |
| Dashboard | Add link to Scenarios |

### Variable Autocomplete UX

When user types `{{` in any text field, show dropdown with available variables:

```
┌─────────────────────────────────────────────────────────────────┐
│  Body:                                                          │
│  {"bookUid": "{{                                                │
│                 ┌──────────────────────┐                        │
│                 │ bookUid    (setup)   │                        │
│                 │ accountUid (setup)   │                        │
│                 │ sessionId  (step 1)  │                        │
│                 └──────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Built-in Templates

### Smoke Test
```json
{
  "name": "Smoke Test",
  "description": "Minimal load to verify endpoint works correctly",
  "phases": [
    { "name": "Smoke", "duration": 60, "connections": 2, "type": "constant" }
  ]
}
```

### Average Load Test
```json
{
  "name": "Average Load Test",
  "description": "Simulate typical production traffic with ramp-up and cooldown",
  "phases": [
    { "name": "Ramp Up", "duration": 30, "connections": 50, "type": "ramp" },
    { "name": "Sustain", "duration": 120, "connections": 50, "type": "constant" },
    { "name": "Cool Down", "duration": 30, "connections": 0, "type": "ramp" }
  ]
}
```

### Stress Test
```json
{
  "name": "Stress Test",
  "description": "Progressive load increase to find system limits",
  "phases": [
    { "name": "Baseline", "duration": 60, "connections": 50, "type": "ramp" },
    { "name": "Stress 1", "duration": 60, "connections": 100, "type": "ramp" },
    { "name": "Stress 2", "duration": 60, "connections": 200, "type": "ramp" },
    { "name": "Stress 3", "duration": 60, "connections": 300, "type": "ramp" },
    { "name": "Recovery", "duration": 60, "connections": 0, "type": "ramp" }
  ]
}
```

### Spike Test
```json
{
  "name": "Spike Test",
  "description": "Sudden traffic spike to test system resilience",
  "phases": [
    { "name": "Normal", "duration": 30, "connections": 20, "type": "constant" },
    { "name": "Spike Up", "duration": 10, "connections": 200, "type": "ramp" },
    { "name": "Spike Hold", "duration": 30, "connections": 200, "type": "constant" },
    { "name": "Spike Down", "duration": 10, "connections": 20, "type": "ramp" },
    { "name": "Recovery", "duration": 30, "connections": 20, "type": "constant" }
  ]
}
```

### Soak Test
```json
{
  "name": "Soak Test",
  "description": "Extended duration test to detect memory leaks and degradation",
  "phases": [
    { "name": "Ramp Up", "duration": 60, "connections": 30, "type": "ramp" },
    { "name": "Soak", "duration": 1800, "connections": 30, "type": "constant" },
    { "name": "Cool Down", "duration": 60, "connections": 0, "type": "ramp" }
  ]
}
```

---

## 8. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Feature name | Scenario | Industry standard (k6, Gatling) |
| Variable syntax | `{{variableName}}` | Handlebars-style, widely recognized |
| JSON extraction library | jsonata | Actively maintained, cleaner syntax than jsonpath |
| Template editing | Duplicate only | Prevents accidental modification of standards |
| Setup error handling | Configurable (abort/retry/ignore) | Flexibility for different use cases |
| Result storage | Per-phase + aggregate | Maximum flexibility for analysis |

---

**Document Version**: 1.0  
**Created**: December 22, 2025  
**Last Updated**: December 22, 2025
