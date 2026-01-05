# Docker Containerization Guide

**Purpose**: Docker setup, deployment, security best practices, and troubleshooting

---

## Overview

The load-tester application uses a production-optimized Docker configuration featuring:

- **Multi-stage builds** — Separate build and runtime environments
- **Non-root user** — Enhanced security with nodejs:nodejs (UID/GID 1001)
- **Alpine Linux** — Minimal base image (~976MB final size)
- **Security hardening** — OpenSSL, restricted permissions, production defaults

---

## Quick Start

### Build Image

```fish
cd ~/workspace/agent/load-tester
docker build -t load-tester .
```

Build time: ~60 seconds (after first run)

### Run Container

```fish
# Minimal run
docker run -d -p 3000:3000 \
  -e DATABASE_URL="file:./prisma/dev.db" \
  --name load-tester-app \
  load-tester

# With all environment variables
docker run -d -p 3000:3000 \
  -e DATABASE_URL="file:./prisma/dev.db" \
  -e NODE_ENV="production" \
  -e PORT="3000" \
  -e BLOCK_PRIVATE_IPS="true" \
  --name load-tester-app \
  load-tester
```

### Verify

```fish
# Check health
curl http://localhost:3000/api/health

# Verify non-root user
docker exec load-tester-app whoami
# Should output: nodejs

# View logs
docker logs load-tester-app

# Stop container
docker stop load-tester-app && docker rm load-tester-app
```

---

## Dockerfile Architecture

### Multi-Stage Build

The Dockerfile uses two stages to minimize final image size:

**Stage 1: Builder** (node:20-alpine)

- Installs all dependencies (dev + prod)
- Builds frontend (Vite production build)
- Generates Prisma client
- Result: Compiled artifacts ready for production

**Stage 2: Production** (node:20-alpine)

- Copies only runtime files from builder
- Creates non-root user (nodejs:nodejs)
- Sets secure permissions
- Result: Minimal production image

### Image Layers

```dockerfile
# Build stage
FROM node:20-alpine AS builder
├── Install OpenSSL (Prisma requirement)
├── Copy package files
├── npm ci (install dependencies)
├── Copy source code
├── Build frontend (vite build)
└── Generate Prisma client

# Production stage
FROM node:20-alpine AS production
├── Install OpenSSL (runtime)
├── Create nodejs user (1001:1001)
├── Copy production files from builder
├── Set file ownership (nodejs:nodejs)
├── Switch to nodejs user
└── Configure environment (NODE_ENV, PORT)
```

---

## File Structure

### Dockerfile

Located at: `load-tester/Dockerfile`

Key features:

- **Workspace-aware npm commands** — Uses `--workspace=load-tester-backend` and `--workspace=load-tester-frontend`
- **Increased timeouts** — `--fetch-timeout=600000` for reliable Prisma engines download
- **OpenSSL dependency** — Required for Prisma on Alpine Linux
- **Security** — Non-root user, minimal permissions

### .dockerignore

Located at: `load-tester/.dockerignore`

Excludes from build context:

- `node_modules` — Rebuilt during image build
- `.git`, `.env*` — Secrets and version control
- `coverage`, `tests` — Dev-only artifacts
- `docs`, `*.md` — Documentation
- `.context` — Agent context files

**Why important**: Reduces build context from ~50MB to ~20MB, faster builds

---

## Environment Variables

### Required

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | *(none)* | Prisma database connection string |

**Example**: `file:./prisma/dev.db` (SQLite) or `postgresql://user:pass@host:5432/db` (PostgreSQL)

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Runtime environment (set by Dockerfile) |
| `PORT` | `3000` | Server port (set by Dockerfile) |
| `BLOCK_PRIVATE_IPS` | `true` | Enable SSRF protection in production |
| `SSRF_ALLOWLIST` | *(none)* | Comma-separated allowed internal hosts |

### Setting Environment Variables

**Docker run**:

```fish
docker run -e DATABASE_URL="file:./prisma/dev.db" -e PORT="8080" load-tester
```

**Docker Compose**:

```yaml
services:
  load-tester:
    image: load-tester
    environment:
      DATABASE_URL: "file:./prisma/dev.db"
      PORT: "3000"
```

**Env file**:

```fish
# .env.production
DATABASE_URL=postgresql://user:pass@db:5432/loadtester
BLOCK_PRIVATE_IPS=true

# Run with env file
docker run --env-file .env.production load-tester
```

---

## Security Best Practices

### Non-Root User

The container runs as `nodejs:nodejs` (UID 1001, GID 1001), not root.

**Why**: Limits damage if container is compromised

**Verification**:

```fish
docker exec <container-name> whoami
# Output: nodejs (not root)

docker exec <container-name> id
# Output: uid=1001(nodejs) gid=1001(nodejs)
```

### File Permissions

All application files are owned by `nodejs:nodejs`:

```dockerfile
RUN chown -R nodejs:nodejs /app
USER nodejs
```

**Result**: App can read/write its own files but cannot modify system files

### Read-Only Root Filesystem (Optional)

For maximum security, run with read-only root:

```fish
docker run --read-only \
  -v /tmp \
  -e DATABASE_URL="file:/tmp/dev.db" \
  load-tester
```

**Note**: Requires writable volume for SQLite database

### Secrets Management

**Never** include secrets in the image:

❌ **Bad**:

```dockerfile
ENV DATABASE_URL="postgresql://user:password@host/db"  # Exposed in image
```

✅ **Good**:

```fish
docker run -e DATABASE_URL="$DATABASE_URL" load-tester  # Inject at runtime
```

Use Docker secrets, environment variables, or secret management tools.

---

## Troubleshooting

### Build Failures

**Problem**: Prisma engines download timeout

```
npm error code 1
npm error path /app/node_modules/@prisma/engines
npm error command failed
npm error Error: aborted
npm error code: 'ECONNRESET'
```

**Solution**: Dockerfile already includes increased timeouts. If still failing:

```fish
# Retry build (network issue may be transient)
docker build -t load-tester .

# Check network connectivity
docker run --rm node:20-alpine wget -O- https://binaries.prisma.sh/

# Use cache from previous successful build
docker build --cache-from load-tester -t load-tester .
```

**Problem**: Case-sensitivity errors (missing component files)

```
Could not resolve "../components/ui/Button" from "src/pages/Dashboard.jsx"
```

**Solution**: All UI component files use lowercase names (Alpine Linux is case-sensitive):

- ✅ `button.jsx`, `card.jsx`, `input.jsx`
- ❌ `Button.jsx`, `Card.jsx`, `Input.jsx`

Fixed in repository. If adding new components, use lowercase filenames.

**Problem**: Out of disk space

```
ERROR: failed to build: no space left on device
```

**Solution**:

```fish
# Remove unused images
docker image prune -a

# Remove build cache
docker builder prune

# Check disk usage
docker system df
```

### Runtime Failures

**Problem**: Container exits immediately

```fish
docker ps -a
# STATUS: Exited (1) 2 seconds ago
```

**Solution**: Check logs for the error:

```fish
docker logs <container-name>

# Common causes:
# 1. Missing DATABASE_URL
#    Error: Missing required environment variables: DATABASE_URL
#    Fix: docker run -e DATABASE_URL="file:./prisma/dev.db" load-tester

# 2. Port already in use
#    Error: listen EADDRINUSE: address already in use :::3000
#    Fix: docker run -p 8080:3000 load-tester (change host port)

# 3. Invalid DATABASE_URL
#    Error: Can't reach database server at...
#    Fix: Verify connection string format
```

**Problem**: Health check fails

```fish
curl http://localhost:3000/api/health
# curl: (7) Failed to connect
```

**Solution**:

```fish
# Check container is running
docker ps

# Check logs for startup errors
docker logs <container-name>

# Verify port mapping
docker port <container-name>
# Should show: 3000/tcp -> 0.0.0.0:3000

# Try from inside container
docker exec <container-name> wget -O- http://localhost:3000/api/health
```

**Problem**: Permission denied errors

```
Error: EACCES: permission denied, open '/app/prisma/dev.db'
```

**Solution**: Use volume with correct permissions:

```fish
# Create volume with nodejs user ownership
docker run -v load-tester-data:/app/data \
  -e DATABASE_URL="file:/app/data/dev.db" \
  load-tester
```

---

## Production Deployment

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  load-tester:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "file:./prisma/prod.db"
      NODE_ENV: "production"
      BLOCK_PRIVATE_IPS: "true"
    volumes:
      - load-tester-data:/app/apps/backend/prisma
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  load-tester-data:
```

Run:

```fish
docker-compose up -d
docker-compose logs -f
```

### Health Checks

Add health check to Dockerfile (optional):

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1
```

### Persistent Data

For SQLite, mount volume for database:

```fish
docker run -d \
  -v load-tester-db:/app/apps/backend/prisma \
  -e DATABASE_URL="file:./prisma/prod.db" \
  load-tester
```

For PostgreSQL (recommended for production):

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: loadtester
      POSTGRES_USER: loadtester
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    secrets:
      - db_password

  load-tester:
    depends_on:
      - db
    environment:
      DATABASE_URL: "postgresql://loadtester:password@db:5432/loadtester"

volumes:
  postgres-data:

secrets:
  db_password:
    file: ./db_password.txt
```

### Container Registry

Push to registry for deployment:

```fish
# Tag for registry
docker tag load-tester registry.example.com/load-tester:1.0.0

# Login to registry
docker login registry.example.com

# Push
docker push registry.example.com/load-tester:1.0.0
```

---

## Performance Optimization

### Image Size

Current size: **~976MB**

Breakdown:

- Base (node:20-alpine): ~180MB
- Dependencies: ~700MB
- Application code: ~96MB

**Optimization strategies**:

1. **Use .dockerignore** (already implemented)
   - Excludes tests, docs, dev files
   - Reduces build context

2. **Multi-stage build** (already implemented)
   - Separates build and runtime
   - Only production files in final image

3. **Further reduction** (optional):
   - Use `npm ci --production` in final stage (removes dev dependencies)
   - Prune Prisma engines for specific DB only
   - Consider distroless base image for even smaller size

### Build Cache

Docker caches layers to speed up rebuilds:

```dockerfile
# These layers change rarely → cached
COPY package*.json ./
RUN npm ci

# These layers change often → rebuilt
COPY . .
RUN npm run build
```

**Strategy**: Order Dockerfile commands from least to most frequently changing

### Build Speed

**First build**: ~60-120 seconds
**Incremental builds**: ~3-10 seconds (cached layers)

Speed up builds:

```fish
# Use BuildKit (faster, better caching)
DOCKER_BUILDKIT=1 docker build -t load-tester .

# Parallel builds (BuildKit)
docker buildx build -t load-tester .
```

---

## Testing Docker Image

### Automated Testing

Test the Docker image before deployment:

```fish
# Build image
docker build -t load-tester:test .

# Run container
docker run -d --name test-container \
  -e DATABASE_URL="file:./prisma/test.db" \
  load-tester:test

# Wait for startup
sleep 3

# Run tests
curl -f http://localhost:3000/api/health || exit 1
docker exec test-container whoami | grep -q nodejs || exit 1

# Cleanup
docker stop test-container && docker rm test-container
```

### Integration Tests

Test container with backend tests:

```fish
# Run tests inside container
docker run --rm \
  -e DATABASE_URL="file:./prisma/test.db" \
  load-tester:test \
  npm run backend:test
```

---

## Comparison: Local vs Docker

| Aspect | Local Development | Docker Container |
|--------|-------------------|------------------|
| **Port** | Backend: 3001, Frontend: 5173 | Unified: 3000 (serves both) |
| **Database** | `apps/backend/prisma/dev.db` | Configurable via DATABASE_URL |
| **User** | Your user | nodejs (UID 1001) |
| **File system** | Case-insensitive (macOS) | Case-sensitive (Alpine) |
| **Environment** | Fish shell, macOS | sh shell, Alpine Linux |
| **Hot reload** | ✅ (Vite, nodemon) | ❌ (production build) |
| **Purpose** | Development | Production/staging |

**Key difference**: Docker serves pre-built frontend from backend (production mode), not separate dev servers.

---

## Advanced Topics

### Custom Base Image

For air-gapped environments, create custom base:

```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache openssl

FROM base AS builder
# ... rest of Dockerfile
```

### Debugging Container

Enter running container:

```fish
docker exec -it <container-name> /bin/sh
```

Debug stopped container:

```fish
# Start with shell instead of app
docker run -it --entrypoint /bin/sh load-tester

# Inside container:
/ $ node apps/backend/src/server.js
```

### Resource Limits

Limit container resources:

```fish
docker run \
  --memory="512m" \
  --cpus="0.5" \
  load-tester
```

Docker Compose:

```yaml
services:
  load-tester:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

---

## Checklist: Pre-Deployment

Before deploying to production:

- [ ] Build completes without errors
- [ ] Image size acceptable (~976MB)
- [ ] Health endpoint responds (200 OK)
- [ ] Container runs as non-root (nodejs)
- [ ] DATABASE_URL configured (not hardcoded)
- [ ] Secrets managed securely (env vars, not in image)
- [ ] Volume mounted for persistent data (if using SQLite)
- [ ] Resource limits set (memory, CPU)
- [ ] Logging/monitoring configured
- [ ] Health checks enabled
- [ ] Restart policy configured

---

## Related Documentation

- [environment.md](environment.md) — Local development setup, Fish shell
- [architecture.md](architecture.md) — Application structure, design patterns
- [quality-standards.md](quality-standards.md) — Production readiness criteria
- [backend-patterns.md](backend-patterns.md) — Express/Prisma implementation

---

**Last Updated**: January 5, 2026
