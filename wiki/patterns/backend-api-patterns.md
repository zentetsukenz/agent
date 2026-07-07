# Backend API Implementation Patterns

> **Type**: Knowledge (implementation patterns)  
> **Purpose**: Reference implementations for Express.js, Prisma, and REST API development  
> **Last Updated**: January 1, 2026

---

## Overview

This document provides reference implementations for common backend API patterns using Express.js, Node.js, and Prisma ORM. Use these as templates when implementing new features.

**Pattern Categories:**

- Controller patterns (thin routing layer)
- Service patterns (business logic)
- Error handling patterns
- Prisma query patterns
- Testing patterns

---

## Controller Patterns

### Basic CRUD Controller

**Purpose**: Thin routing layer that delegates to services

```javascript
// features/endpoints/endpoints.controller.js
const endpointsService = require('./endpoints.service');
const { validateEndpoint } = require('../../middleware/validation');

/**
 * Create new endpoint
 * POST /api/endpoints
 */
async function createEndpoint(req, res, next) {
  try {
    const endpoint = await endpointsService.create(req.body);
    res.status(201).json({ data: endpoint });
  } catch (error) {
    next(error); // Pass to error handler
  }
}

/**
 * Get endpoint by ID
 * GET /api/endpoints/:id
 */
async function getEndpoint(req, res, next) {
  try {
    const endpoint = await endpointsService.findById(req.params.id);
    res.json({ data: endpoint });
  } catch (error) {
    next(error);
  }
}

/**
 * Update endpoint
 * PUT /api/endpoints/:id
 */
async function updateEndpoint(req, res, next) {
  try {
    const endpoint = await endpointsService.update(req.params.id, req.body);
    res.json({ data: endpoint });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete endpoint
 * DELETE /api/endpoints/:id
 */
async function deleteEndpoint(req, res, next) {
  try {
    await endpointsService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * List endpoints with filtering
 * GET /api/endpoints?method=GET&status=active
 */
async function listEndpoints(req, res, next) {
  try {
    const { method, status, page = 1, limit = 20 } = req.query;
    const result = await endpointsService.findMany({
      method,
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json({ data: result.items, total: result.total, page, limit });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEndpoint,
  getEndpoint,
  updateEndpoint,
  deleteEndpoint,
  listEndpoints
};
```

### Route Definition with Middleware

```javascript
// features/endpoints/endpoints.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./endpoints.controller');
const { validateEndpoint, validateEndpointUpdate } = require('../../middleware/validation');

// Create endpoint with validation
router.post('/', validateEndpoint, controller.createEndpoint);

// Get single endpoint
router.get('/:id', controller.getEndpoint);

// List endpoints with query params
router.get('/', controller.listEndpoints);

// Update endpoint with validation
router.put('/:id', validateEndpointUpdate, controller.updateEndpoint);

// Delete endpoint
router.delete('/:id', controller.deleteEndpoint);

module.exports = router;
```

---

## Service Patterns

### Service Class with Dependency Injection

**Purpose**: Reusable, testable business logic

```javascript
// features/endpoints/endpoints.service.js
const { PrismaClient } = require('@prisma/client');
const { ValidationError, NotFoundError } = require('../../utils/errors');

class EndpointsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create new endpoint
   */
  async create(data) {
    // Validation
    if (!data.url || !data.method) {
      throw new ValidationError('URL and method are required');
    }

    // Check for duplicates
    const existing = await this.prisma.endpoint.findFirst({
      where: {
        url: data.url,
        method: data.method
      }
    });

    if (existing) {
      throw new ValidationError('Endpoint with this URL and method already exists');
    }

    // Create endpoint
    return await this.prisma.endpoint.create({
      data: {
        url: data.url,
        method: data.method,
        name: data.name,
        description: data.description,
        headers: data.headers || {}
      }
    });
  }

  /**
   * Find endpoint by ID
   */
  async findById(id) {
    const endpoint = await this.prisma.endpoint.findUnique({
      where: { id: parseInt(id) },
      include: {
        tests: {
          orderBy: { createdAt: 'desc' },
          take: 5  // Last 5 tests
        }
      }
    });

    if (!endpoint) {
      throw new NotFoundError(`Endpoint with id ${id} not found`);
    }

    return endpoint;
  }

  /**
   * Find many with filtering and pagination
   */
  async findMany(filters) {
    const { method, status, page = 1, limit = 20 } = filters;
    
    const where = {};
    if (method) where.method = method;
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.endpoint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.endpoint.count({ where })
    ]);

    return { items, total, page, limit };
  }

  /**
   * Update endpoint
   */
  async update(id, data) {
    // Verify exists
    await this.findById(id);

    // Update
    return await this.prisma.endpoint.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description,
        headers: data.headers,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Delete endpoint
   */
  async delete(id) {
    // Verify exists
    await this.findById(id);

    await this.prisma.endpoint.delete({
      where: { id: parseInt(id) }
    });
  }
}

// Export singleton instance
module.exports = new EndpointsService(new PrismaClient());
```

---

## Error Handling Patterns

### Custom Error Classes

```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
};
```

### Global Error Handler Middleware

```javascript
// middleware/errorHandler.js
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      statusCode = 400;
      message = 'A record with this data already exists';
    } else if (err.code === 'P2025') {
      // Record not found
      statusCode = 404;
      message = 'Record not found';
    } else if (err.code === 'P2003') {
      // Foreign key constraint failed
      statusCode = 400;
      message = 'Invalid reference to related record';
    }
  }

  // Log server errors (500+)
  if (statusCode >= 500) {
    console.error('Server error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body
    });
  }

  // Send response
  res.status(statusCode).json({
    error: {
      message: message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err 
      })
    }
  });
}

module.exports = { errorHandler };
```

---

## Validation Patterns

### Express-Validator Chains

```javascript
// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

/**
 * Validate endpoint creation
 */
const validateEndpoint = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 1, max: 255 }).withMessage('Name must be 1-255 characters')
    .escape(),  // Sanitize HTML for text fields
  
  body('url')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'] }).withMessage('Must be valid HTTP(S) URL'),
    // No .escape() - URLs should not be HTML-escaped
  
  body('method')
    .trim()
    .notEmpty().withMessage('Method is required')
    .isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).withMessage('Invalid HTTP method'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description max 1000 characters')
    .escape(),  // Sanitize HTML for text fields
  
  body('headers')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch {
        throw new Error('Headers must be valid JSON');
      }
    }),
    // No .escape() - JSON should not be HTML-escaped
  
  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }
    next();
  }
];

/**
 * Validate endpoint update
 */
const validateEndpointUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid endpoint ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .escape(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .escape(),
  
  body('headers')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch {
        throw new Error('Headers must be valid JSON');
      }
    }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }
    next();
  }
];

module.exports = {
  validateEndpoint,
  validateEndpointUpdate
};
```

---

## Prisma Query Patterns

### Basic CRUD Operations

```javascript
// Create
const endpoint = await prisma.endpoint.create({
  data: {
    url: 'https://api.example.com',
    method: 'GET',
    name: 'Example API'
  }
});

// Find unique (by ID or unique field)
const endpoint = await prisma.endpoint.findUnique({
  where: { id: 1 }
});

// Find many with filtering
const endpoints = await prisma.endpoint.findMany({
  where: {
    method: 'GET',
    status: 'active'
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: 0
});

// Update
const updated = await prisma.endpoint.update({
  where: { id: 1 },
  data: { name: 'New Name' }
});

// Delete
await prisma.endpoint.delete({
  where: { id: 1 }
});
```

### Relations and Includes

```javascript
// Include related data (eager loading)
const endpoint = await prisma.endpoint.findUnique({
  where: { id: 1 },
  include: {
    tests: {
      orderBy: { createdAt: 'desc' },
      take: 10
    }
  }
});

// Select specific fields only
const endpoints = await prisma.endpoint.findMany({
  select: {
    id: true,
    name: true,
    url: true,
    method: true
  }
});

// Nested includes
const test = await prisma.test.findUnique({
  where: { id: 1 },
  include: {
    endpoint: {
      select: {
        id: true,
        name: true,
        url: true
      }
    }
  }
});
```

### Transactions

```javascript
// Interactive transaction
const result = await prisma.$transaction(async (tx) => {
  // Create test
  const test = await tx.test.create({
    data: {
      endpointId: 1,
      duration: 150,
      status: 'success'
    }
  });
  
  // Update endpoint stats
  await tx.endpoint.update({
    where: { id: 1 },
    data: {
      lastTestedAt: new Date(),
      testCount: { increment: 1 }
    }
  });
  
  return test;
});

// Sequential operations transaction
const [test, endpoint] = await prisma.$transaction([
  prisma.test.create({ data: testData }),
  prisma.endpoint.update({
    where: { id: 1 },
    data: { lastTestedAt: new Date() }
  })
]);
```

### Aggregation and Counting

```javascript
// Count records
const total = await prisma.endpoint.count({
  where: { method: 'GET' }
});

// Aggregations
const stats = await prisma.test.aggregate({
  where: { endpointId: 1 },
  _avg: { duration: true },
  _min: { duration: true },
  _max: { duration: true },
  _count: true
});

// Group by
const byMethod = await prisma.endpoint.groupBy({
  by: ['method'],
  _count: {
    id: true
  }
});
```

---

## Testing Patterns

### Unit Test Structure (Services)

```javascript
// tests/unit/endpoints/endpoints.service.test.js
const EndpointsService = require('../../../src/features/endpoints/endpoints.service');
const { ValidationError, NotFoundError } = require('../../../src/utils/errors');

describe('EndpointsService', () => {
  let service;
  let mockPrisma;

  beforeEach(() => {
    // Create mock Prisma client
    mockPrisma = {
      endpoint: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
      }
    };
    
    service = new EndpointsService(mockPrisma);
  });

  describe('create', () => {
    it('should create endpoint with valid data', async () => {
      const data = { 
        url: 'https://api.example.com', 
        method: 'GET', 
        name: 'Test' 
      };
      
      mockPrisma.endpoint.findFirst.mockResolvedValue(null);
      mockPrisma.endpoint.create.mockResolvedValue({ id: 1, ...data });

      const result = await service.create(data);

      expect(result).toEqual({ id: 1, ...data });
      expect(mockPrisma.endpoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining(data)
      });
    });

    it('should throw ValidationError if URL missing', async () => {
      await expect(
        service.create({ method: 'GET' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate endpoint', async () => {
      const data = { url: 'https://api.example.com', method: 'GET' };
      mockPrisma.endpoint.findFirst.mockResolvedValue({ id: 1 });

      await expect(service.create(data)).rejects.toThrow(ValidationError);
    });
  });

  describe('findById', () => {
    it('should return endpoint if found', async () => {
      const endpoint = { id: 1, name: 'Test', url: 'https://api.example.com' };
      mockPrisma.endpoint.findUnique.mockResolvedValue(endpoint);

      const result = await service.findById(1);

      expect(result).toEqual(endpoint);
    });

    it('should throw NotFoundError if not found', async () => {
      mockPrisma.endpoint.findUnique.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundError);
    });
  });
});
```

### Integration Test Structure (Routes)

```javascript
// tests/integration/endpoints.test.js
const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Endpoints API', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.endpoint.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean slate for each test
    await prisma.endpoint.deleteMany();
  });

  describe('POST /api/endpoints', () => {
    it('should create endpoint with valid data', async () => {
      const data = {
        url: 'https://api.example.com',
        method: 'GET',
        name: 'Test Endpoint'
      };

      const response = await request(app)
        .post('/api/endpoints')
        .send(data)
        .expect(201);

      expect(response.body.data).toMatchObject(data);
      expect(response.body.data.id).toBeDefined();

      // Verify in database
      const stored = await prisma.endpoint.findUnique({
        where: { id: response.body.data.id }
      });
      expect(stored).toMatchObject(data);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/endpoints')
        .send({ method: 'GET' }) // Missing URL
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for duplicate endpoint', async () => {
      const data = {
        url: 'https://api.example.com',
        method: 'GET',
        name: 'Test'
      };

      // Create first
      await request(app).post('/api/endpoints').send(data).expect(201);

      // Try duplicate
      const response = await request(app)
        .post('/api/endpoints')
        .send(data)
        .expect(400);

      expect(response.body.error.message).toContain('already exists');
    });
  });

  describe('GET /api/endpoints/:id', () => {
    it('should return endpoint by ID', async () => {
      // Create endpoint
      const created = await prisma.endpoint.create({
        data: {
          url: 'https://api.example.com',
          method: 'GET',
          name: 'Test'
        }
      });

      const response = await request(app)
        .get(`/api/endpoints/${created.id}`)
        .expect(200);

      expect(response.body.data.id).toBe(created.id);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app)
        .get('/api/endpoints/99999')
        .expect(404);
    });
  });
});
```

---

## Prisma Schema Patterns

### Basic Model with Relations

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Endpoint {
  id          Int      @id @default(autoincrement())
  url         String
  method      String
  name        String?
  description String?
  headers     Json?
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  tests       Test[]

  // Constraints
  @@unique([url, method], name: "unique_endpoint")
  
  // Indexes for common queries
  @@index([method, status])
  @@index([createdAt])
}

model Test {
  id          Int       @id @default(autoincrement())
  endpointId  Int
  duration    Int
  status      String
  results     Json?
  createdAt   DateTime  @default(now())
  
  // Relations
  endpoint    Endpoint  @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  
  // Indexes
  @@index([endpointId, createdAt])
  @@index([status])
}
```

---

## Success Criteria

Use these patterns when:

- [ ] Implementing new CRUD endpoints
- [ ] Creating service layer business logic
- [ ] Setting up error handling
- [ ] Writing validation middleware
- [ ] Querying database with Prisma
- [ ] Writing unit or integration tests
- [ ] Designing Prisma schemas

**Remember**: Adapt these patterns to your specific needs. They're templates, not rigid rules.
