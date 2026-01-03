# Accessibility Implementation Plan

**Created**: 2026-01-02  
**Estimated Effort**: 4 hours  
**Target**: WCAG 2.2 Level AA

---

## Research Summary

### Current State Analysis

**Existing A11y Features:**

- ✅ `<html lang="en">` in [index.html](apps/frontend/index.html)
- ✅ `<main>` landmark in Layout (but missing `id`)
- ✅ Form labels using Radix Label component with `htmlFor` in most places
- ✅ Loading components have `role="status"` and `aria-label`
- ✅ Alert component has `role="alert"`
- ✅ Breadcrumb has proper ARIA attributes
- ✅ Mobile menu button has `aria-label="Toggle menu"`
- ✅ EndpointCard actions have `aria-label`

**Identified Gaps:**

| Gap | Severity | Files Affected |
|-----|----------|----------------|
| No skip navigation link | Medium | Layout.jsx |
| Desktop nav missing `<nav>` wrapper | Medium | Header.jsx |
| Desktop nav missing `aria-label` | Medium | Header.jsx |
| No `id="main-content"` on `<main>` | Medium | Layout.jsx |
| `react-hot-toast` lacks `aria-live` config | High | App.jsx |
| Heading hierarchy issues (h2 used as page title) | Low | Multiple pages |
| SVG icons missing `aria-hidden` | Low | Header.jsx, multiple |
| Logo link missing accessible name | Low | Header.jsx |
| Color contrast unverified | Unknown | All |

---

## Implementation Tasks

### Task 1: Skip Navigation Link

**File**: [apps/frontend/src/components/layout/Layout.jsx](apps/frontend/src/components/layout/Layout.jsx)  
**Effort**: 15 min  
**Verify**: Tab from page load, link visible on focus

**Changes:**

1. Add skip link as first child of container
2. Add `id="main-content"` to `<main>`

```jsx
// Before Header
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
             bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50
             focus:outline-none focus:ring-2 focus:ring-ring"
>
  Skip to main content
</a>

// Add id to main
<main id="main-content" className="...">
```

---

### Task 2: Navigation Landmarks

**File**: [apps/frontend/src/components/layout/Header.jsx](apps/frontend/src/components/layout/Header.jsx)  
**Effort**: 20 min  
**Verify**: Screen reader announces "Main navigation"

**Changes:**

1. Wrap desktop nav content with `<nav aria-label="Main navigation">`
2. Add `aria-label="Main navigation"` to mobile nav (already has `<nav>`)
3. Add `aria-hidden="true"` to decorative SVG icons
4. Add accessible name to logo link

```jsx
// Desktop nav wrapper
<nav aria-label="Main navigation" className="hidden md:flex items-center gap-2">
  {/* existing links */}
</nav>

// Mobile nav
<nav aria-label="Main navigation" className="md:hidden mt-4 ...">

// Logo link
<Link to="/" className="..." aria-label="Load Tester - Home">

// Decorative icons
<svg aria-hidden="true" className="w-4 h-4" ...>
```

---

### Task 3: Toast Accessibility  

**File**: [apps/frontend/src/App.jsx](apps/frontend/src/App.jsx)  
**Effort**: 15 min  
**Verify**: Screen reader announces toast messages

**Changes:**
Add `ariaProps` to Toaster configuration:

```jsx
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
    // ... existing options
  }}
/>
```

Note: `react-hot-toast` v2.4+ supports `ariaProps` in toastOptions.

---

### Task 4: Heading Hierarchy Audit

**Files**: Multiple page components  
**Effort**: 45 min  
**Verify**: Heading structure with browser extension

**Current Issues:**

| Page | Current | Should Be |
|------|---------|-----------|
| Dashboard | `<h2>` as page title | `<h1>` |
| ScenarioList | `<h1>` ✅ | OK |
| ScenarioBuilder | `<h1>` ✅ | OK |
| ScenarioDetail | `<h1>` ✅ | OK |
| ConfigureTest | `<h1>` ✅ | OK |
| CreateEndpoint | CardTitle (`<h3>`) | `<h1>` |
| EditEndpoint | CardTitle (`<h3>`) | `<h1>` |

**Strategy:**

- Header.jsx has `<h1>` for "Load Tester" brand → Should be brand only
- Each page should have its own `<h1>`
- Sections within pages use `<h2>`, subsections use `<h3>`

**Key Changes:**

1. Dashboard: Change `<h2>Dashboard</h2>` → `<h1>Dashboard</h1>`
2. CreateEndpoint: Add `<h1>` before Card or make CardTitle render as h1
3. EditEndpoint: Same as CreateEndpoint
4. Header: Consider making brand text a `<span>` not `<h1>` (or accept it)

---

### Task 5: Form Accessibility Audit

**Files**: Various form components  
**Effort**: 30 min  
**Verify**: All inputs have accessible names

**Already Good:**

- EndpointForm: All inputs have `<Label htmlFor="...">` ✅
- TestConfigForm: All inputs have `<Label htmlFor="...">` ✅
- ScenarioForm: Has labels ✅
- PhaseEditor: Has labels ✅

**To Check/Fix:**

1. Method Select in EndpointForm - has `<Label>` but no `htmlFor` (Select from Radix handles internally)
2. Search input in DashboardStats - verify has accessible name
3. Sort dropdown - verify accessible

---

### Task 6: Icon Accessibility

**Files**: Header.jsx, multiple components  
**Effort**: 20 min  
**Verify**: Icons don't confuse screen readers

**Changes:**
Add `aria-hidden="true"` to decorative icons that accompany text:

```jsx
// Icons next to text labels should be hidden
<svg aria-hidden="true" className="w-4 h-4" ...>
  Dashboard
</svg>

// Icon-only buttons need aria-label (already present on mobile menu)
```

**Files to update:**

- Header.jsx: Nav link icons, logo icon
- EndpointCard.jsx: Action icons (some already have aria-label)
- Dashboard.jsx: Plus icon (button has text, so hide icon)

---

### Task 7: Color Contrast Verification

**Tool**: Lighthouse, axe DevTools  
**Effort**: 30 min  
**Verify**: Score > 90, no contrast failures

**Process:**

1. Run Lighthouse accessibility audit
2. Document any contrast failures
3. Fix issues (likely in CSS/Tailwind config)

**Known Risk Areas:**

- `text-gray-500` on light backgrounds
- `text-primary-100` / `text-primary-200` in header
- Muted foreground text

---

### Task 8: Keyboard Navigation Testing

**Effort**: 30 min  
**Verify**: Full app navigable by keyboard

**Checklist:**

- [ ] Tab through entire app
- [ ] All interactive elements reachable
- [ ] Focus visible at all times
- [ ] No keyboard traps
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys work in dropdowns

---

## File Change Summary

| File | Changes |
|------|---------|
| Layout.jsx | Skip link, main id |
| Header.jsx | Nav landmarks, aria-labels, aria-hidden on icons |
| App.jsx | Toast ariaProps |
| Dashboard.jsx | h2 → h1, aria-hidden on icons |
| CreateEndpoint.jsx | Page heading |
| EditEndpoint.jsx | Page heading |
| DashboardStats.jsx | Verify search input label |
| Various | aria-hidden on decorative icons |

---

## Implementation Order

1. **Layout.jsx + Header.jsx** — Landmarks and skip link (30 min)
2. **App.jsx** — Toast accessibility (15 min)
3. **Heading audit** — All pages (45 min)
4. **Icon audit** — aria-hidden additions (20 min)
5. **Lighthouse audit** — Color contrast (30 min)
6. **Keyboard testing** — Manual verification (30 min)

---

## Verification Plan

### Automated Testing

```bash
# Run Lighthouse in Chrome DevTools
# Accessibility tab → Run audit
# Target: 90+ score
```

### Manual Testing

1. **Keyboard-only navigation**: Complete all major flows without mouse
2. **Screen reader test** (VoiceOver on Mac):
   - Navigate by landmarks
   - Navigate by headings
   - Complete form submission
   - Verify toast announcements
3. **Skip link test**: Tab from fresh page load

### Acceptance Criteria

- [ ] Skip navigation link visible on focus, jumps to main content
- [ ] `<nav>` landmark with `aria-label="Main navigation"`
- [ ] All form inputs have accessible names (label or aria-label)
- [ ] Toasts announced to screen readers
- [ ] Lighthouse accessibility score > 90
- [ ] No color contrast violations
- [ ] Logical heading hierarchy (one h1 per page, no skipped levels)
- [ ] All interactive elements keyboard accessible

---

## Notes

### react-hot-toast Accessibility

The library supports `ariaProps` since v2.4. Check current version:

```bash
npm list react-hot-toast
```

If older version, consider:

- Upgrading react-hot-toast
- Or switching to sonner (already in codebase but unused)

### Heading in Header

The `<h1>Load Tester</h1>` in Header.jsx is technically valid as site branding, but violates "one h1 per page" guideline. Options:

1. Keep as h1, use h2+ for page content (current approach)
2. Change to `<span>` or `<p>` with aria-label on link
3. Visually style as h1 but semantically use span

Recommendation: Option 2 — brand should be link text, not heading.

---

## Dependencies

- react-hot-toast >= 2.4.0 (for ariaProps)
- No new packages required
- Tailwind's sr-only class already available
