# Load-Tester Backend Patterns

**Purpose**: Express.js and Prisma implementation patterns with examples

---

## Controller Patterns

### Basic CRUD Controller

**Pattern**: Route definitions that delegate to service layer

```javascript
const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const endpointService = require('./endpoints.service');

// List all
router.get('/', asyncHandler(async (req, res) => {
  const endpoints = await endpointService.getAll();
  res.json(endpoints);
}));

// Get by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const endpoint = await endpointService.getById(parseInt(req.params.id));
  res.json(endpoint);
}));

// Create
router.post('/', asyncHandler(async (req, res) => {
  const endpoint = await endpointService.create(req.body);
  res.status(201).json(endpoint);
}));

// Update
router.put('/:id', asyncHandler(async (req, res) => {
  const endpoint = await endpointService.update(parseInt(req.params.id), req.body);
  res.json(endpoint);
}));

// Delete
router.delete('/:id', asyncHandler(async (req, res) => {
  await endpointService.delete(parseInt(req.params.id));
  res.status(204).send();
}));

module.exports = router;
```

**Key points**:

- ✅ Use `asyncHandler` wrapper for all async routes
- ✅ Parse IDs to integers (`parseInt(req.params.id)`)
- ✅ Return appropriate status codes (200, 201, 204)
- ✅ Delegate all logic to service layer
- ❌ Don't access database directly in controllers
- ❌ Don't put validation logic in controllers

---

## Service Patterns

### Service Layer with Validation

**Pattern**: Business logic + validation + database access

```javascript
const { getPrismaClient } = require('../config/database');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');

class EndpointService {
  async getAll() {
    const prisma = getPrismaClient();
    return prisma.endpoint.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getById(id) {
    const prisma = getPrismaClient();
    const endpoint = await prisma.endpoint.findUnique({ 
      where: { id },
      include: { tests: true }  // Optional: include relations
    });
    
    if (!endpoint) {
      throw new NotFoundError('Endpoint');
    }
    
    return endpoint;
  }

  async create(data) {
    const prisma = getPrismaClient();
    
    // Validation
    if (!data.url || !data.method) {
      throw new ValidationError('URL and method are required');
    }
    
    try {
      return await prisma.endpoint.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {  // Prisma unique constraint error
        throw new ConflictError('Endpoint with this URL and method already exists');
      }
      throw error;
    }
  }

  async update(id, data) {
    const prisma = getPrismaClient();
    
    // Verify exists
    await this.getById(id);
    
    try {
      return await prisma.endpoint.update({
        where: { id },
        data
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictError('Endpoint with this URL and method already exists');
      }
      throw error;
    }
  }

  async delete(id) {
    const prisma = getPrismaClient();
    
    // Verify exists
    await this.getById(id);
    
    await prisma.endpoint.delete({ where: { id } });
  }
}

module.exports = new EndpointService();
```

**Key points**:

- ✅ Use custom error classes (`NotFoundError`, `ConflictError`, etc.)
- ✅ Check existence before update/delete
- ✅ Handle Prisma errors and translate to custom errors
- ✅ Export singleton instance
- ❌ Don't return database errors directly
- ❌ Don't expose Prisma client outside service

---

## Error Handling Patterns

### Custom Error Classes

**Pattern**: Type-specific errors with automatic HTTP status mapping

```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

class TimeoutError extends AppError {
  constructor(message = 'Request timeout') {
    super(message, 408);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  TimeoutError
};
```

### Global Error Handler Middleware

```javascript
// middleware/errorHandler.js
const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  // Default to 500 internal server error
  let statusCode = 500;
  let message = 'Internal server error';
  
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  
  // Log errors (but not operational errors like 404)
  if (statusCode === 500 || !err.isOperational) {
    console.error('Error:', err);
  }
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
```

### Async Handler Wrapper

```javascript
// utils/asyncHandler.js
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
```

**Usage**:

```javascript
// ✅ GOOD: Errors automatically caught and passed to error handler
router.get('/:id', asyncHandler(async (req, res) => {
  const endpoint = await endpointService.getById(parseInt(req.params.id));
  res.json(endpoint);
}));

// ❌ BAD: Unhandled promise rejection
router.get('/:id', async (req, res) => {
  const endpoint = await endpointService.getById(parseInt(req.params.id));
  res.json(endpoint);
});
```

---

## Validation Patterns

### Express Validator

**Pattern**: Validation middleware with custom sanitization

```javascript
const { body, param, validationResult } = require('express-validator');

// Validation rules
const endpointValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 255 }).withMessage('Name must be less than 255 characters'),
  
  body('url')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL().withMessage('Must be a valid URL'),
  
  body('method')
    .trim()
    .notEmpty().withMessage('Method is required')
    .isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).withMessage('Invalid HTTP method'),
  
  body('headers')
    .optional()
    .custom((value) => {
      if (value) {
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error('Headers must be valid JSON');
        }
      }
      return true;
    })
];

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Usage
router.post('/', endpointValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const endpoint = await endpointService.create(req.body);
  res.status(201).json(endpoint);
}));
```

---

## Prisma Patterns

For detailed Prisma patterns, see `docs/prisma-patterns.md` in workspace root.

### Basic CRUD

```javascript
const { getPrismaClient } = require('../config/database');

const prisma = getPrismaClient();

// Create
const endpoint = await prisma.endpoint.create({
  data: { name, url, method }
});

// Read all
const endpoints = await prisma.endpoint.findMany({
  orderBy: { createdAt: 'desc' }
});

// Read one
const endpoint = await prisma.endpoint.findUnique({
  where: { id }
});

// Update
const updated = await prisma.endpoint.update({
  where: { id },
  data: { name, url }
});

// Delete
await prisma.endpoint.delete({
  where: { id }
});
```

### Relations

```javascript
// Include related data
const endpoint = await prisma.endpoint.findUnique({
  where: { id },
  include: {
    tests: true  // Include all tests for this endpoint
  }
});

// Include with filtering
const endpoint = await prisma.endpoint.findUnique({
  where: { id },
  include: {
    tests: {
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 10  // Limit to 10 most recent
    }
  }
});
```

### Transactions

```javascript
// Multiple operations atomically
const result = await prisma.$transaction(async (tx) => {
  const endpoint = await tx.endpoint.create({ data: endpointData });
  const test = await tx.test.create({
    data: {
      endpointId: endpoint.id,
      duration,
      connections
    }
  });
  return { endpoint, test };
});
```

---

## Testing Patterns

### Unit Tests (Service Layer)

**Pattern**: Mock Prisma client, test business logic

```javascript
const endpointService = require('../features/endpoints/endpoints.service');
const { getPrismaClient } = require('../config/database');
const { NotFoundError, ConflictError } = require('../utils/errors');

jest.mock('../config/database');

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
  
  describe('getById', () => {
    it('returns endpoint when found', async () => {
      const mockEndpoint = { id: 1, name: 'Test', url: 'http://test.com', method: 'GET' };
      mockPrisma.endpoint.findUnique.mockResolvedValue(mockEndpoint);
      
      const result = await endpointService.getById(1);
      
      expect(result).toEqual(mockEndpoint);
      expect(mockPrisma.endpoint.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { tests: true } });
    });
    
    it('throws NotFoundError when not found', async () => {
      mockPrisma.endpoint.findUnique.mockResolvedValue(null);
      
      await expect(endpointService.getById(999))
        .rejects.toThrow(NotFoundError);
    });
  });
  
  describe('create', () => {
    it('creates endpoint successfully', async () => {
      const data = { name: 'Test', url: 'http://test.com', method: 'GET' };
      mockPrisma.endpoint.create.mockResolvedValue({ id: 1, ...data });
      
      const result = await endpointService.create(data);
      
      expect(result.id).toBe(1);
      expect(mockPrisma.endpoint.create).toHaveBeenCalledWith({ data });
    });
    
    it('throws ConflictError on duplicate', async () => {
      const data = { name: 'Test', url: 'http://test.com', method: 'GET' };
      mockPrisma.endpoint.create.mockRejectedValue({ code: 'P2002' });
      
      await expect(endpointService.create(data))
        .rejects.toThrow(ConflictError);
    });
  });
});
```

### Integration Tests (API Layer)

**Pattern**: Real database, test HTTP layer

```javascript
const request = require('supertest');
const app = require('../app');
const { getPrismaClient } = require('../config/database');

describe('Endpoints API', () => {
  let prisma;
  
  beforeAll(() => {
    prisma = getPrismaClient();
  });
  
  beforeEach(async () => {
    // Clean database
    await prisma.test.deleteMany();
    await prisma.endpoint.deleteMany();
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
        .expect(201);
      
      expect(response.body).toMatchObject(data);
      expect(response.body.id).toBeDefined();
      
      // Verify in database
      const endpoint = await prisma.endpoint.findUnique({
        where: { id: response.body.id }
      });
      expect(endpoint).toBeTruthy();
    });
    
    it('returns 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/endpoints')
        .send({ name: 'Test' })  // Missing url and method
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
});
```

---

## Middleware Patterns

### Order Matters

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Security (first)
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));

// 2. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Routes
app.use('/api/endpoints', require('./features/endpoints/endpoints.controller'));
app.use('/api/tests', require('./features/tests/tests.controller'));

// 4. Error handler (last)
app.use(errorHandler);
```

**Critical**: Error handler must be **last** middleware

---

## Database Connection Pattern

### Singleton Pattern

```javascript
// config/database.js
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSQLite } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

let prisma;

function getPrismaClient() {
  if (!prisma) {
    const db = new Database(process.env.DATABASE_URL || 'file:./prisma/dev.db');
    const adapter = new PrismaBetterSQLite(db);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

module.exports = { getPrismaClient, disconnectPrisma };
```

**Why singleton**:

- Prevents connection pool exhaustion
- Enables graceful shutdown
- Consistent across app

---

## Common Gotchas

See also: [docs/backend-api-gotchas.md](../../docs/backend-api-gotchas.md) in framework

### ❌ Not using asyncHandler

```javascript
// BAD: Unhandled promise rejection
app.get('/api/endpoints', async (req, res) => {
  const endpoints = await endpointService.getAll();
  res.json(endpoints);
});

// GOOD: Errors caught and handled
app.get('/api/endpoints', asyncHandler(async (req, res) => {
  const endpoints = await endpointService.getAll();
  res.json(endpoints);
}));
```

### ❌ Not verifying database writes

```javascript
// BAD: Assuming write succeeded
await endpointService.create(data);
console.log('Created!');

// GOOD: Verify actual data
const endpoint = await endpointService.create(data);
const verified = await endpointService.getById(endpoint.id);
expect(verified.name).toBe(data.name);
```

### ❌ Wrong middleware order

```javascript
// BAD: Error handler before routes
app.use(errorHandler);
app.use('/api/endpoints', endpointsRouter);

// GOOD: Error handler last
app.use('/api/endpoints', endpointsRouter);
app.use(errorHandler);
```

---

**Last Updated**: January 1, 2026
