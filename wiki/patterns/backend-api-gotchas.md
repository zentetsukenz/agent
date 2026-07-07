# Backend API Common Pitfalls & Anti-Patterns

> **Type**: Knowledge (gotchas and anti-patterns)  
> **Purpose**: Learn from common mistakes in Express.js, Prisma, and REST API development  
> **Last Updated**: January 1, 2026

---

## Overview

This document catalogs common mistakes and anti-patterns in backend API development, particularly with Express.js, Prisma ORM, and REST design. Each pitfall includes:

- ❌ **Wrong**: What NOT to do
- ✅ **Correct**: The right approach
- **Key Principle**: Why it matters

**CRITICAL**: Learn from these mistakes to avoid repeating them.

---

## Sanitization & Validation

### 🚫 Sanitization Without Understanding Library Behavior

**❌ WRONG**: Assuming you need separate sanitization middleware

```javascript
// express-validator already sanitizes!
router.post(
  '/api/endpoints',
  validateEndpoint,    // Already includes .trim(), .escape()
  sanitizeInput,       // ❌ Redundant and harmful!
  createEndpoint
);

// This sanitizes URLs: "https://api.com" → "https:&#x2F;&#x2F;api.com" ❌
```

**✅ CORRECT**: Use built-in sanitization in validation chains

```javascript
// express-validator approach
const validateEndpoint = [
  body('name')
    .trim()                              // ← Sanitize whitespace
    .notEmpty()                          // ← Validate presence
    .isLength({ min: 1, max: 255 })     // ← Validate length
    .escape(),                           // ← Sanitize HTML (safe for text)
  
  body('url')
    .trim()                              // ← Sanitize whitespace only
    .notEmpty()                          // ← Validate presence
    .isURL({ protocols: ['http', 'https'] }), // ← Validate format
    // NO .escape() - URLs shouldn't be HTML-escaped!
  
  body('headers')
    .optional()
    .custom((value) => {                 // ← Custom validation
      try {
        JSON.parse(value);
        return true;
      } catch {
        throw new Error('Invalid JSON');
      }
    }),
    // NO .escape() - JSON shouldn't be HTML-escaped!
];

router.post(
  '/api/endpoints',
  validateEndpoint,
  handleValidationErrors,  // Check validation results
  createEndpoint
);
```

**Key Principles:**

- Validation libraries include sanitization methods
- Use context-appropriate sanitization (text vs URLs vs JSON)
- Don't create generic "sanitize everything" middleware
- Test what actually gets stored in the database

---

### 🚫 Generic Sanitization Middleware Corrupts Data

**❌ WRONG**: Blanket HTML-escaping all input

```javascript
// This corrupts URLs, JSON, and structured data
function sanitizeAll(req, res, next) {
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = escapeHtml(req.body[key]); // ❌ Corrupts everything!
    }
  });
  next();
}
```

**✅ CORRECT**: Context-specific sanitization

```javascript
// Text fields only
body('name').trim().escape(),      // ✅ Safe for display
body('description').trim().escape(), // ✅ Safe for display

// URLs - no HTML escaping
body('url').trim().isURL(),        // ✅ Validation only

// JSON - no HTML escaping
body('headers').custom(value => {
  JSON.parse(value); // Validate only
  return true;
}),
```

**Key Principle**: Not all data needs HTML escaping. URLs, JSON, and structured data should NOT be escaped.

---

## Testing

### 🚫 Not Running Tests After Changes

**❌ WRONG**: Make changes, assume tests pass, move on

```bash
# Make changes to validation middleware
git add .
git commit -m "Add validation"  # ❌ No test run!
```

**✅ CORRECT**: Run tests after EVERY change

```bash
# After EVERY change to middleware, validation, or business logic:
npm test

# Verify tests actually pass:
# - Check exit code
# - Review test output
# - Fix failures immediately

# Only commit after tests pass
npm test && git add . && git commit -m "Add validation"
```

**Key Principle**: Comprehensive tests mean nothing if you don't run them.

---

### 🚫 Not Verifying Actual Data in Database

**❌ WRONG**: Assume data stored correctly based on response

```javascript
// Just check HTTP response
const response = await request(app)
  .post('/api/endpoints')
  .send({ url: 'https://api.example.com' });
  
expect(response.status).toBe(201); // ❌ Doesn't verify stored data!
```

**✅ CORRECT**: Query database to verify format

```javascript
// Create test record
const response = await request(app)
  .post('/api/endpoints')
  .send({ url: 'https://api.example.com', method: 'GET', name: 'Test' });

// Query database directly to verify format
const stored = await prisma.endpoint.findUnique({
  where: { id: response.body.id }
});

console.log('Stored URL:', stored.url);
expect(stored.url).toBe('https://api.example.com'); // ✅ Not escaped!
```

**Key Principle**: Verify data integrity by checking what's actually stored in the database.

---

## Research & Learning

### 🚫 Guessing at Library Behavior

**❌ WRONG**: "I think express-validator needs separate sanitization middleware"

**✅ CORRECT**: Research first!

```bash
# Use web-search to verify
# - "express-validator sanitization best practices 2025"
# - "OWASP input validation order 2025"
# - "{library name} validation vs sanitization"

# Learn from authoritative sources:
# - Official library documentation
# - OWASP security guidelines
# - Framework maintainers' recommendations
```

**Key Principle**: Don't assume library behavior. Research from authoritative sources.

---

### 🚫 Defending Assumptions Without Evidence

**❌ WRONG**: When corrected, defend assumptions without verification

```
User: "That's not how express-validator works"
You: "I believe separate sanitization is needed based on my understanding"
```

**✅ CORRECT**: Research to verify when corrected

```
User: "That's not how express-validator works"
You: "Let me research the official documentation..."
[Use web-search to verify]
You: "You're correct. express-validator includes built-in sanitization. I'll update the implementation."
```

**Key Principle**: Intellectual honesty over defending mistakes. When wrong, research and correct.

---

## Middleware

### 🚫 Middleware Order Violations

**❌ WRONG**: Validation before body parsing

```javascript
app.use(validateInput);      // ❌ req.body doesn't exist yet!
app.use(express.json());     // Body parser comes too late
app.use(routes);
```

**✅ CORRECT**: Proper middleware ordering

```javascript
// 1. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Logging/monitoring
app.use(requestLogger);

// 3. Authentication (if global)
app.use(authenticate);

// 4. Routes (with route-specific validation)
app.use('/api', routes);

// 5. Error handling (ALWAYS LAST)
app.use(errorHandler);
```

**Key Principle**: Middleware order matters critically. Body parsing → auth → validation → routes → error handling.

---

### 🚫 Business Logic in Middleware

**❌ WRONG**: Complex operations in middleware

```javascript
function checkEndpointExists(req, res, next) {
  const endpoint = await prisma.endpoint.findUnique({
    where: { id: req.params.id }
  });
  
  if (!endpoint) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // ❌ Doing business logic in middleware
  if (endpoint.status === 'archived') {
    // Complex archival logic...
  }
  
  req.endpoint = endpoint;
  next();
}
```

**✅ CORRECT**: Middleware for cross-cutting concerns only

```javascript
// Middleware: Attach resource
async function loadEndpoint(req, res, next) {
  try {
    const endpoint = await endpointsService.findById(req.params.id);
    req.endpoint = endpoint;
    next();
  } catch (error) {
    next(error); // Let error handler deal with it
  }
}

// Controller: Business logic
async function updateEndpoint(req, res, next) {
  try {
    // Business logic in controller/service
    const updated = await endpointsService.update(
      req.endpoint.id,
      req.body
    );
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
}
```

**Key Principle**: Middleware for cross-cutting concerns (auth, logging, loading). Business logic in services.

---

## Prisma ORM

### 🚫 N+1 Query Problems

**❌ WRONG**: Loading relations in a loop

```javascript
// Get all tests
const tests = await prisma.test.findMany();

// ❌ N+1: One query per test to load endpoint
for (const test of tests) {
  const endpoint = await prisma.endpoint.findUnique({
    where: { id: test.endpointId }
  });
  test.endpoint = endpoint;
}
```

**✅ CORRECT**: Use `include` to eager-load

```javascript
// Single query with join
const tests = await prisma.test.findMany({
  include: {
    endpoint: true  // ✅ Loaded in single query
  }
});
```

**Key Principle**: Use `include` to eager-load relations and avoid N+1 queries.

---

### 🚫 Not Using Transactions for Multi-Step Operations

**❌ WRONG**: Separate operations that must succeed/fail together

```javascript
// Create test
const test = await prisma.test.create({ data: testData });

// Update endpoint stats
await prisma.endpoint.update({
  where: { id: testData.endpointId },
  data: { lastTestedAt: new Date() }
});
// ❌ If this fails, test is created but endpoint not updated!
```

**✅ CORRECT**: Use transactions

```javascript
const result = await prisma.$transaction(async (tx) => {
  const test = await tx.test.create({ data: testData });
  
  await tx.endpoint.update({
    where: { id: testData.endpointId },
    data: { lastTestedAt: new Date() }
  });
  
  return test;
});
// ✅ Both succeed or both fail
```

**Key Principle**: Use transactions for operations that must succeed or fail together.

---

### 🚫 Fetching Full Models When Only Need Subset

**❌ WRONG**: Loading entire models

```javascript
const endpoints = await prisma.endpoint.findMany();
// ❌ Loads all fields including large descriptions, config JSON, etc.

return endpoints.map(e => ({ id: e.id, name: e.name }));
```

**✅ CORRECT**: Use `select` to fetch only needed fields

```javascript
const endpoints = await prisma.endpoint.findMany({
  select: {
    id: true,
    name: true
  }
});
// ✅ Only loads what you need
```

**Key Principle**: Select only what you need. Don't load unnecessary data.

---

## Error Handling

### 🚫 Swallowing Errors

**❌ WRONG**: Catching errors without handling

```javascript
try {
  await endpointsService.create(req.body);
} catch (error) {
  console.log('Error:', error); // ❌ Logged but not handled!
}
res.status(200).json({ success: true }); // ❌ Always returns success!
```

**✅ CORRECT**: Pass errors to error handler

```javascript
try {
  const endpoint = await endpointsService.create(req.body);
  res.status(201).json({ data: endpoint });
} catch (error) {
  next(error); // ✅ Pass to error handler
}
```

**Key Principle**: Don't swallow errors. Pass to centralized error handler.

---

### 🚫 Exposing Internal Errors to Clients

**❌ WRONG**: Sending stack traces to clients

```javascript
function errorHandler(err, req, res, next) {
  res.status(500).json({
    error: err.message,
    stack: err.stack  // ❌ Exposes internals!
  });
}
```

**✅ CORRECT**: Generic errors to clients, detailed logs internally

```javascript
function errorHandler(err, req, res, next) {
  // Log internally with full details
  if (err.statusCode >= 500) {
    console.error('Server error:', {
      message: err.message,
      stack: err.stack,
      url: req.url
    });
  }
  
  // Generic message to client
  res.status(err.statusCode || 500).json({
    error: err.isOperational ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
```

**Key Principle**: Never expose internal errors to clients in production.

---

## Success Criteria

You know you're avoiding these pitfalls when:

- [ ] Validation uses library's built-in sanitization (no redundant middleware)
- [ ] Data stored matches expected format (URLs are URLs, not escaped strings)
- [ ] All tests pass after every change
- [ ] Database queries are verified, not assumed
- [ ] Assumptions validated through research from authoritative sources
- [ ] When corrected, research and verify before defending
- [ ] Middleware order is correct (parsing → auth → validation → routes → errors)
- [ ] Business logic in services, not middleware
- [ ] Prisma queries optimized (no N+1, proper includes, select only needed)
- [ ] Transactions used for multi-step operations
- [ ] Errors passed to centralized handler, not swallowed
- [ ] Internal errors not exposed to clients

---

**Remember**: These patterns emerge from real mistakes. Learn from them, don't repeat them.
