# Accessibility Tasks

**Status**: Ready for Implementation  
**Estimated**: 4 hours

---

## Tasks

### Phase 1: Landmarks & Navigation (30 min)

- [ ] **1.1 Skip Navigation Link**
  - File: `apps/frontend/src/components/layout/Layout.jsx`
  - Add skip link before Header
  - Add `id="main-content"` to main element
  - Verify: Tab from page load shows skip link

- [ ] **1.2 Navigation Landmarks**
  - File: `apps/frontend/src/components/layout/Header.jsx`
  - Wrap desktop nav with `<nav aria-label="Main navigation">`
  - Add `aria-label` to mobile nav
  - Add `aria-label="Load Tester - Home"` to logo link
  - Verify: Screen reader announces navigation landmark

### Phase 2: Toast Accessibility (15 min)

- [ ] **2.1 Configure Toast ARIA**
  - File: `apps/frontend/src/App.jsx`
  - Add `ariaProps: { role: 'status', 'aria-live': 'polite' }`
  - Verify: Trigger toast, screen reader announces

### Phase 3: Heading Hierarchy (45 min)

- [ ] **3.1 Dashboard Page**
  - File: `apps/frontend/src/pages/Dashboard.jsx`
  - Change `<h2>Dashboard</h2>` to `<h1>Dashboard</h1>` (2 locations)
  - Verify: Heading structure is h1 → h3

- [ ] **3.2 CreateEndpoint Page**
  - File: `apps/frontend/src/pages/CreateEndpoint.jsx`
  - Add visually hidden h1 or make CardTitle h1
  - Verify: Page has h1

- [ ] **3.3 EditEndpoint Page**
  - File: `apps/frontend/src/pages/EditEndpoint.jsx`
  - Same as CreateEndpoint
  - Verify: Page has h1

- [ ] **3.4 Header Brand**
  - File: `apps/frontend/src/components/layout/Header.jsx`
  - Consider: Change `<h1>Load Tester</h1>` to `<span>`
  - Note: This is optional, current approach is valid

### Phase 4: Decorative Icons (20 min)

- [ ] **4.1 Header Icons**
  - File: `apps/frontend/src/components/layout/Header.jsx`
  - Add `aria-hidden="true"` to nav link icons
  - Verify: Icons not announced by screen reader

- [ ] **4.2 Page Icons**
  - Files: Dashboard.jsx, various buttons
  - Add `aria-hidden="true"` to icons with adjacent text
  - Verify: Only text announced, not icons

### Phase 5: Verification (60 min)

- [ ] **5.1 Lighthouse Audit**
  - Run Chrome DevTools Lighthouse
  - Document score
  - Fix any contrast issues found
  - Target: 90+

- [ ] **5.2 Keyboard Navigation**
  - Tab through entire app
  - All elements reachable
  - Focus always visible
  - No keyboard traps

- [ ] **5.3 Screen Reader Test**
  - VoiceOver on Mac
  - Navigate by landmarks
  - Navigate by headings
  - Complete a form submission
  - Verify toast announcements

---

## Quick Reference

### Files to Modify

1. `apps/frontend/src/components/layout/Layout.jsx`
2. `apps/frontend/src/components/layout/Header.jsx`
3. `apps/frontend/src/App.jsx`
4. `apps/frontend/src/pages/Dashboard.jsx`
5. `apps/frontend/src/pages/CreateEndpoint.jsx`
6. `apps/frontend/src/pages/EditEndpoint.jsx`

### Testing Commands

```bash
# Check react-hot-toast version
cd apps/frontend && npm list react-hot-toast

# Run dev server for manual testing
npm run dev
```

### Success Criteria

- [ ] Lighthouse score > 90
- [ ] Skip link functional
- [ ] Nav landmark present
- [ ] All inputs labeled
- [ ] Toasts announced
- [ ] Valid heading hierarchy
- [ ] No contrast violations
