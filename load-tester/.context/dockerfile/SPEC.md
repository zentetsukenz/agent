# Dockerfile

**Priority**: 🔴 Critical  
**Effort**: 2 hours  
**Standard**: 12-Factor App, Node.js Security

---

## Objective

Create a production Dockerfile with security best practices: non-root user, multi-stage build, minimal image.

---

## Current State

No Dockerfile exists. Application cannot be containerized.

---

## Implementation

### Target Files

- `load-tester/Dockerfile` (create)
- `load-tester/.dockerignore` (create)

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies
RUN npm ci --workspace=apps/backend --workspace=apps/frontend

# Copy source
COPY . .

# Build frontend
RUN npm run build --workspace=apps/frontend

# Generate Prisma client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Production stage
FROM node:20-alpine AS production

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend ./apps/backend
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "apps/backend/src/server.js"]
```

### .dockerignore

```
node_modules
.git
.env
.env.*
*.log
coverage
.context
docs
tests
*.md
```

---

## Success Criteria

- [ ] Multi-stage build (smaller image)
- [ ] Non-root user (nodejs:nodejs)
- [ ] NODE_ENV=production set
- [ ] Only production files included
- [ ] Image builds successfully
- [ ] Container runs and serves API

---

## Verification

```bash
# Build image
docker build -t load-tester .

# Run container
docker run -p 3000:3000 load-tester

# Test health endpoint
curl http://localhost:3000/api/health

# Verify non-root user
docker run load-tester whoami
# Should output: nodejs
```

---

## References

- [Docker Node.js Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Dockerfile Security](https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/)
