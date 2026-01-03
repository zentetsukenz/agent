# Production Polish Contexts

Quick reference for all production readiness improvements.

**Progress**: 3/10 complete ✅

---

## ✅ Completed

| Context | Completed | Description |
|---------|-----------|-------------|
| [body-size-limits](body-size-limits/COMPLETE.md) | 2026-01-02 | Request body size limits (10KB) to prevent DoS |
| [compression](compression/IMPLEMENTATION_COMPLETE.md) | 2026-01-02 | gzip/brotli response compression (60-80% reduction) |
| [frontend-meta](frontend-meta/DONE.md) | 2026-01-02 | Title, description, Open Graph tags |

---

## 🔴 Critical (Before Production)

| Context | Effort | Description |
|---------|--------|-------------|
| [graceful-shutdown](graceful-shutdown/SPEC.md) | 1h | SIGTERM/SIGINT handlers for clean process exit |
| [ci-security](ci-security/SPEC.md) | 1h | npm audit in CI pipeline |
| [dockerfile](dockerfile/SPEC.md) | 2h | Production container with non-root user |
| [ssrf-protection](ssrf-protection/SPEC.md) | 2h | URL validation for load test targets |

---

## 🟡 Important (Soon After Launch)

| Context | Effort | Description |
|---------|--------|-------------|
| [api-versioning](api-versioning/SPEC.md) | 2h | /api/v1/ URL prefix for future compatibility |
| [openapi-docs](openapi-docs/SPEC.md) | 4h | Swagger UI and OpenAPI spec |
| [accessibility](accessibility/SPEC.md) | 4h | WCAG 2.2 AA compliance |

---

## 🧹 Tech Debt

| Context | Effort | Description |
|---------|--------|-------------|
| [remove-legacy-app](remove-legacy-app/SPEC.md) | 1h | Remove legacy src/ app replaced by monorepo |

---

## Implementation Order

Recommended sequence based on dependencies and impact:

1. ~~**body-size-limits** — Quick security win~~ ✅
2. **graceful-shutdown** — Enables safe deployments
3. ~~**frontend-meta** — Quick branding fix~~ ✅
4. ~~**compression** — Easy performance gain~~ ✅
5. **ci-security** — Ongoing protection
6. **dockerfile** — Enables containerized deployment
7. **ssrf-protection** — Security hardening
8. **api-versioning** — Before going public
9. **openapi-docs** — Developer experience
10. **accessibility** — Inclusive design

---

## Status Tracking

- [ ] graceful-shutdown
- [x] body-size-limits ✅
- [ ] ci-security
- [ ] dockerfile
- [ ] ssrf-protection
- [x] compression ✅
- [ ] api-versioning
- [ ] openapi-docs
- [ ] accessibility
- [x] frontend-meta ✅
