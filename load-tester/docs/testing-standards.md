# Load-Tester Testing Standards

**Purpose**: Testing patterns, coverage requirements, and quality expectations

---

## Testing Philosophy

**Tests enable confidence.** Good tests let you refactor fearlessly and ship reliably.

### Core Principles

- **Test behavior, not implementation** - What users experience, not internal wiring
- **Tests must actually run** - Tests in CI/CD that don't run locally are worthless
- **Error paths need tests too** - Happy path catches 50% of bugs
- **Verify data, not assumptions** - Check what's stored in database, not what you think you stored

---

## Backend Testing (Jest + Supertest)

### Coverage Requirement

**80%+ line coverage** for backend code.

Check with:

```fish
cd ~/workspace/agent/load-tester/apps/backend
npm run test -- --coverage
```

### Unit Tests (Service Layer)

**Purpose**: Test business logic in isolation

**Pattern**: Mock dependencies, test pure logic

```javascript
// tests/unit/endpoints/endpoints.service.test.js
const endpointService = require('../../../src/features/endpoints/endpoints.service');
const { getPrismaClient } = require('../../../src/config/database');
const { NotFoundError, ConflictError } = require('../../../src/utils/errors');

jest.mock('../../../src/config/database');

describe('EndpointService', () => {
  let mockPrisma;
  
  beforeEach(() => {
    mockPrisma = {
      endpoint: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }
    };
    getPrismaClient.mockReturnValue(mockPrisma);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getById', () => {
    it('returns endpoint when found', async () => {
      const mockEndpoint = { id: 1, name: 'Test', url: 'http://test.com', method: 'GET' };
      mockPrisma.endpoint.findUnique.mockResolvedValue(mockEndpoint);
      
      const result = await endpointService.getById(1);
      
      expect(result).toEqual(mockEndpoint);
    });
    
    it('throws NotFoundError when not found', async () => {
      mockPrisma.endpoint.findUnique.mockResolvedValue(null);
      
      await expect(endpointService.getById(999))
        .rejects
        .toThrow(NotFoundError);
    });
  });
  
  describe('create', () => {
    it('creates endpoint successfully', async () => {
      const data = { name: 'Test', url: 'http://test.com', method: 'GET' };
      const mockCreated = { id: 1, ...data };
      mockPrisma.endpoint.create.mockResolvedValue(mockCreated);
      
      const result = await endpointService.create(data);
      
      expect(result.id).toBe(1);
      expect(mockPrisma.endpoint.create).toHaveBeenCalledWith({ data });
    });
    
    it('throws ConflictError on duplicate', async () => {
      const data = { name: 'Test', url: 'http://test.com', method: 'GET' };
      mockPrisma.endpoint.create.mockRejectedValue({ code: 'P2002' });
      
      await expect(endpointService.create(data))
        .rejects
        .toThrow(ConflictError);
    });
  });
});
```

**What to test**:

- ✅ Happy path (success case)
- ✅ Error cases (not found, duplicates, validation failures)
- ✅ Edge cases (empty data, null values)
- ✅ Business logic (calculations, transformations)
- ❌ Don't test Prisma internals
- ❌ Don't test library code

---

### Integration Tests (API Layer)

**Purpose**: Test HTTP routes with real database

**Pattern**: Use test database, test full request/response cycle

```javascript
// tests/integration/endpoints.test.js
const request = require('supertest');
const app = require('../../src/app');
const { getPrismaClient } = require('../../src/config/database');

describe('Endpoints API', () => {
  let prisma;
  
  beforeAll(() => {
    prisma = getPrismaClient();
  });
  
  beforeEach(async () => {
    // Clean database before each test
    await prisma.test.deleteMany();
    await prisma.endpoint.deleteMany();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  describe('POST /api/endpoints', () => {
    it('creates endpoint successfully', async () => {
      const data = {
        name: 'Test API',
        url: 'https://api.test.com/users',
        method: 'GET'
      };
      
      const response = await request(app)
        .post('/api/endpoints')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toMatchObject(data);
      expect(response.body.id).toBeDefined();
      
      // Verify in database
      const endpoint = await prisma.endpoint.findUnique({
        where: { id: response.body.id }
      });
      expect(endpoint).toBeTruthy();
      expect(endpoint.name).toBe(data.name);
    });
    
    it('returns 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/endpoints')
        .send({ name: 'Test' }) // Missing url and method
        .expect(400);
      
      expect(response.body.error).toBeDefined();
    });
    
    it('returns 409 for duplicate endpoint', async () => {
      const data = {
        name: 'Test API',
        url: 'https://api.test.com/users',
        method: 'GET'
      };
      
      // Create first
      await request(app).post('/api/endpoints').send(data).expect(201);
      
      // Try duplicate
      const response = await request(app)
        .post('/api/endpoints')
        .send(data)
        .expect(409);
      
      expect(response.body.error).toContain('already exists');
    });
  });
  
  describe('GET /api/endpoints/:id', () => {
    it('returns endpoint when found', async () => {
      const created = await prisma.endpoint.create({
        data: { name: 'Test', url: 'http://test.com', method: 'GET' }
      });
      
      const response = await request(app)
        .get(`/api/endpoints/${created.id}`)
        .expect(200);
      
      expect(response.body.id).toBe(created.id);
    });
    
    it('returns 404 when not found', async () => {
      await request(app)
        .get('/api/endpoints/999')
        .expect(404);
    });
  });
});
```

**What to test**:

- ✅ Status codes (200, 201, 400, 404, 409)
- ✅ Response body structure
- ✅ Database changes (verify data stored correctly)
- ✅ Validation errors
- ✅ Authorization (when implemented)

---

## Frontend Testing (Vitest + Testing Library)

### Component Tests

**Purpose**: Test component behavior and rendering

**Pattern**: Render component, simulate user interaction, assert results

```javascript
// src/components/endpoints/EndpointList.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EndpointList } from './EndpointList';
import endpointService from '@/services/endpoints';

// Mock the service
vi.mock('@/services/endpoints');

describe('EndpointList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('shows loading state initially', () => {
    endpointService.getAll.mockReturnValue(new Promise(() => {})); // Never resolves
    
    render(<EndpointList />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('shows endpoints when loaded', async () => {
    const mockEndpoints = [
      { id: 1, name: 'Test API', url: 'http://test.com', method: 'GET' }
    ];
    endpointService.getAll.mockResolvedValue(mockEndpoints);
    
    render(<EndpointList />);
    
    expect(await screen.findByText('Test API')).toBeInTheDocument();
  });
  
  it('shows error message on failure', async () => {
    endpointService.getAll.mockRejectedValue(new Error('Network error'));
    
    render(<EndpointList />);
    
    expect(await screen.findByText(/unable to load/i)).toBeInTheDocument();
  });
  
  it('shows empty state when no endpoints', async () => {
    endpointService.getAll.mockResolvedValue([]);
    
    render(<EndpointList />);
    
    expect(await screen.findByText(/no endpoints yet/i)).toBeInTheDocument();
  });
});
```

### User Interaction Tests

**Pattern**: Use `@testing-library/user-event` for realistic interactions

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EndpointForm } from './EndpointForm';

describe('EndpointForm', () => {
  it('shows validation errors on submit', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    
    render(<EndpointForm onSave={onSave} />);
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Should show validation errors
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/url is required/i)).toBeInTheDocument();
    
    // Should not call onSave
    expect(onSave).not.toHaveBeenCalled();
  });
  
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({});
    
    render(<EndpointForm onSave={onSave} />);
    
    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'Test API');
    await user.type(screen.getByLabelText(/url/i), 'https://test.com');
    await user.selectOptions(screen.getByLabelText(/method/i), 'GET');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Should call onSave with data
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test API',
          url: 'https://test.com',
          method: 'GET'
        })
      );
    });
  });
});
```

### Hook Tests

**Pattern**: Test custom hooks with `renderHook`

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { useEndpoints } from './useEndpoints';
import endpointService from '@/services/endpoints';

vi.mock('@/services/endpoints');

describe('useEndpoints', () => {
  it('fetches endpoints on mount', async () => {
    const mockEndpoints = [{ id: 1, name: 'Test' }];
    endpointService.getAll.mockResolvedValue(mockEndpoints);
    
    const { result } = renderHook(() => useEndpoints());
    
    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    
    // After fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockEndpoints);
    expect(result.current.error).toBeNull();
  });
  
  it('handles errors', async () => {
    endpointService.getAll.mockRejectedValue(new Error('Failed'));
    
    const { result } = renderHook(() => useEndpoints());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Failed');
    expect(result.current.data).toEqual([]);
  });
});
```

---

## API Mocking with MSW

**Purpose**: Mock backend API for frontend tests

### Setup

```javascript
// src/test/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:3001/api/endpoints', () => {
    return HttpResponse.json([
      { id: 1, name: 'Test', url: 'http://test.com', method: 'GET' }
    ]);
  }),
  
  http.post('http://localhost:3001/api/endpoints', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ id: 2, ...data }, { status: 201 });
  }),
  
  http.get('http://localhost:3001/api/endpoints/:id', ({ params }) => {
    if (params.id === '999') {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      id: parseInt(params.id),
      name: 'Test',
      url: 'http://test.com',
      method: 'GET'
    });
  })
];
```

```javascript
// src/test/setup.js
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## What NOT to Test

### ❌ Third-Party Libraries

Don't test React, axios, react-hook-form, etc. Assume they work.

### ❌ Implementation Details

```javascript
// BAD: Testing implementation
expect(mockPrisma.endpoint.create).toHaveBeenCalledWith({ data });

// GOOD: Testing behavior
expect(result.id).toBe(1);
```

### ❌ Trivial Code

Don't test simple getters, setters, or pass-through functions.

### ❌ UI Styling

Don't test Tailwind classes. Test behavior, not appearance.

---

## Running Tests

### Backend

```fish
cd ~/workspace/agent/load-tester/apps/backend

# All tests
npm run test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode (during development)
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

### Frontend

```fish
cd ~/workspace/agent/load-tester/apps/frontend

# All tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage

# UI mode (interactive)
npm run test -- --ui
```

### Both

```fish
cd ~/workspace/agent/load-tester

npm run test:all
```

---

## Test Quality Standards

### Before Claiming Done

- [ ] All tests pass
- [ ] New code has tests
- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Backend coverage ≥ 80%
- [ ] No skipped tests (`.skip`, `x.test`, etc.)
- [ ] No focused tests (`.only`, `f.test`, etc.)
- [ ] Tests are readable and well-named

### Good Test Naming

```javascript
// ✅ GOOD: Describes behavior
it('throws NotFoundError when endpoint does not exist', ...)
it('disables submit button while form is submitting', ...)

// ❌ BAD: Describes implementation
it('calls mockPrisma.create', ...)
it('sets state to loading', ...)
```

---

**Last Updated**: January 1, 2026
