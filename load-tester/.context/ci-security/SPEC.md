# CI Security Scanning

**Priority**: 🔴 Critical  
**Effort**: 1 hour  
**Standard**: OWASP (A08: Software & Data Integrity)

---

## Objective

Add npm audit to CI pipeline to block PRs with known vulnerabilities in dependencies.

---

## Current State

No `.github/workflows` directory exists. CI pipeline needs to be created.

---

## Implementation

### Target File

- `.github/workflows/ci.yml` (create)

### Required Workflow

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        working-directory: load-tester
      
      - name: Security audit
        run: npm audit --audit-level=high
        working-directory: load-tester

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        working-directory: load-tester
      
      - name: Run tests
        run: npm test
        working-directory: load-tester
```

### Audit Levels

- `--audit-level=critical` - Block only critical
- `--audit-level=high` - Block high and critical (recommended)
- `--audit-level=moderate` - Block moderate and above

---

## Success Criteria

- [ ] CI workflow runs on push to main
- [ ] CI workflow runs on pull requests
- [ ] `npm audit` runs with high severity threshold
- [ ] PR blocked if high/critical vulnerabilities found
- [ ] Tests run as part of CI

---

## Verification

1. Create PR with vulnerable dependency
2. Verify CI fails
3. Fix vulnerability
4. Verify CI passes

---

## References

- [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [GitHub Actions](https://docs.github.com/en/actions)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
