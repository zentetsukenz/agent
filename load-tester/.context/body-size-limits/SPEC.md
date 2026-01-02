# Body Size Limits

**Priority**: 🔴 Critical  
**Effort**: 30 minutes  
**Standard**: Node.js Security Best Practices

---

## Objective

Add explicit request body size limits to prevent DoS attacks via large payload uploads.

---

## Current State

```javascript
// apps/backend/src/app.js - No size limits
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

Express defaults to 100KB which may be too large for this API.

---

## Implementation

### Target File

- `apps/backend/src/app.js`

### Required Changes

```javascript
// Add size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

### Rationale for 10KB

- Endpoint data: ~500 bytes typical
- Test config: ~1KB typical  
- Scenario with multiple endpoints: ~5KB typical
- 10KB provides headroom without risk

---

## Success Criteria

- [ ] JSON body limit set to 10KB
- [ ] URL-encoded body limit set to 10KB
- [ ] Requests over limit return 413 (Payload Too Large)
- [ ] Normal API operations unaffected
- [ ] Tests pass

---

## Verification

```bash
# Test with oversized payload
curl -X POST http://localhost:3000/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{"name": "'$(python3 -c "print('x'*20000)")'"}'

# Should return 413 status
```

---

## References

- [Express body-parser limits](https://expressjs.com/en/api.html#express.json)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
