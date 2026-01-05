# Build stage
FROM node:20-alpine AS builder

# Install required build tools for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies with increased timeout
RUN npm ci --workspace=load-tester-backend --workspace=load-tester-frontend --fetch-timeout=600000 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000

# Copy source
COPY . .

# Build frontend
RUN npm run build --workspace=load-tester-frontend

# Generate Prisma client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies for Prisma
RUN apk add --no-cache openssl

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
