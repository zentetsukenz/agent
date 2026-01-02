# OpenAPI Documentation

**Priority**: 🟡 Important  
**Effort**: 4 hours  
**Standard**: REST API Best Practices

---

## Objective

Generate OpenAPI 3.0 specification for the API, enabling Swagger UI documentation and client SDK generation.

---

## Current State

No API documentation exists. Developers must read code to understand endpoints.

---

## Implementation Options

### Option A: swagger-jsdoc (Recommended)

Document inline with JSDoc comments, generate spec automatically.

### Option B: Manual spec file

Write openapi.yaml by hand.

### Option C: swagger-autogen

Auto-generate from Express routes.

---

## Recommended: swagger-jsdoc + swagger-ui-express

### Install Dependencies

```bash
npm install swagger-jsdoc swagger-ui-express --workspace=apps/backend
```

### Target Files

- `apps/backend/src/config/swagger.js` (create)
- `apps/backend/src/app.js` (modify)
- Controller files (add JSDoc)

### Swagger Config

```javascript
// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Load Tester API',
      version: '1.0.0',
      description: 'API for managing load test endpoints and scenarios',
    },
    servers: [
      { url: '/api/v1', description: 'API v1' }
    ],
  },
  apis: ['./src/features/**/*.controller.js'],
};

module.exports = swaggerJsdoc(options);
```

### Controller Documentation

```javascript
/**
 * @openapi
 * /endpoints:
 *   get:
 *     summary: List all endpoints
 *     tags: [Endpoints]
 *     responses:
 *       200:
 *         description: List of endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Endpoint'
 */
exports.index = async (req, res, next) => {...};
```

### Mount Swagger UI

```javascript
// app.js
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Serve API docs (non-production or with flag)
if (config.isDevelopment || process.env.ENABLE_SWAGGER) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
}
```

---

## API Schemas

### Endpoint

```yaml
components:
  schemas:
    Endpoint:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        url:
          type: string
          format: uri
        method:
          type: string
          enum: [GET, POST, PUT, DELETE, PATCH]
        headers:
          type: object
        body:
          type: string
        createdAt:
          type: string
          format: date-time
```

---

## Success Criteria

- [ ] OpenAPI 3.0 spec generated
- [ ] Swagger UI available at `/api/docs`
- [ ] All endpoints documented
- [ ] Request/response schemas defined
- [ ] Error responses documented
- [ ] Spec exportable as JSON/YAML

---

## Verification

```bash
# Access Swagger UI
open http://localhost:3000/api/docs

# Download spec
curl http://localhost:3000/api/docs.json
```

---

## References

- [OpenAPI 3.0 Spec](https://swagger.io/specification/)
- [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc)
- [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)
