# Production Polish Contexts

Quick reference for all production readiness improvements.

---

## 🔴 Critical (Before Production)

| Context | Effort | Description |
|---------|--------|-------------|
| [graceful-shutdown](graceful-shutdown/SPEC.md) | 1h | SIGTERM/SIGINT handlers for clean process exit |
| [body-size-limits](body-size-limits/SPEC.md) | 30m | Request body size limits to prevent DoS |
| [ci-security](ci-security/SPEC.md) | 1h | npm audit in CI pipeline |
| [dockerfile](dockerfile/SPEC.md) | 2h | Production container with non-root user |
| [ssrf-protection](ssrf-protection/SPEC.md) | 2h | URL validation for load test targets |

---

## 🟡 Important (Soon After Launch)

| Context | Effort | Description |
|---------|--------|-------------|
| [compression](compression/SPEC.md) | 30m | gzip/brotli response compression |
| [api-versioning](api-versioning/SPEC.md) | 2h | /api/v1/ URL prefix for future compatibility |
| [openapi-docs](openapi-docs/SPEC.md) | 4h | Swagger UI and OpenAPI spec |
| [accessibility](accessibility/SPEC.md) | 4h | WCAG 2.2 AA compliance |

---

## 🟢 Quick Wins

| Context | Effort | Description |
|---------|--------|-------------|
| [frontend-meta](frontend-meta/SPEC.md) | 30m | Title, description, Open Graph tags |

---

## Implementation Order

Recommended sequence based on dependencies and impact:

1. **body-size-limits** — Quick security win
2. **graceful-shutdown** — Enables safe deployments
3. **frontend-meta** — Quick branding fix
4. **compression** — Easy performance gain
5. **ci-security** — Ongoing protection
6. **dockerfile** — Enables containerized deployment
7. **ssrf-protection** — Security hardening
8. **api-versioning** — Before going public
9. **openapi-docs** — Developer experience
10. **accessibility** — Inclusive design

---

## Status Tracking

- [ ] graceful-shutdown
- [ ] body-size-limits
- [ ] ci-security
- [ ] dockerfile
- [ ] ssrf-protection
- [ ] compression
- [ ] api-versioning
- [ ] openapi-docs
- [ ] accessibility
- [ ] frontend-meta
