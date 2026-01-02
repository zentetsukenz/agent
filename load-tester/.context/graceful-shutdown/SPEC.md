# Graceful Shutdown

**Priority**: 🔴 Critical  
**Effort**: 1 hour  
**Standard**: 12-Factor App (Factor IX: Disposability)

---

## Objective

Add SIGTERM and SIGINT signal handlers to enable graceful shutdown, allowing in-flight requests to complete before the process exits.

---

## Current State

```javascript
// apps/backend/src/server.js - No shutdown handling
app.listen(config.port, () => {
  logger.info(`🚀 Load Tester server running...`);
});
```

No handlers exist for process termination signals.

---

## Implementation

### Target File

- `apps/backend/src/server.js`

### Required Changes

1. Store server instance from `app.listen()`
2. Add SIGTERM handler (container orchestrators)
3. Add SIGINT handler (Ctrl+C)
4. Close server gracefully with timeout
5. Close Prisma connection
6. Log shutdown events

### Code Pattern

```javascript
const server = app.listen(config.port, () => {
  // startup logs
});

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

## Success Criteria

- [ ] `SIGTERM` triggers graceful shutdown
- [ ] `SIGINT` (Ctrl+C) triggers graceful shutdown
- [ ] In-flight requests complete before exit
- [ ] Database connection closes cleanly
- [ ] Forced exit after 10-second timeout
- [ ] Shutdown events logged

---

## Verification

```bash
# Start server
npm run dev

# Send SIGTERM
kill -TERM <pid>

# Verify logs show graceful shutdown
```

---

## References

- [12-Factor: Disposability](https://12factor.net/disposability)
- [Node.js Graceful Shutdown](https://nodejs.org/api/process.html#signal-events)
