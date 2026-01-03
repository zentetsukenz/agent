# Phase 1: Landmarks & Navigation

**Effort**: 30 min | **Priority**: High

---

## Objective

Add skip navigation and proper nav landmarks for screen reader users.

---

## Tasks

### 1.1 Skip Navigation Link

**File**: `apps/frontend/src/components/layout/Layout.jsx`

```jsx
// Add BEFORE <Header />
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
             bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50
             focus:outline-none focus:ring-2 focus:ring-ring"
>
  Skip to main content
</a>

// Add id to <main>
<main id="main-content" className="flex-1 container ...">
```

### 1.2 Navigation Landmarks

**File**: `apps/frontend/src/components/layout/Header.jsx`

```jsx
// Desktop nav - wrap with <nav>
<nav aria-label="Main navigation" className="hidden md:flex items-center gap-2">
  {/* existing Link elements */}
</nav>

// Mobile nav - add aria-label
<nav aria-label="Main navigation" className="md:hidden mt-4 pt-4 ...">

// Logo link - add accessible name
<Link to="/" className="..." aria-label="Load Tester - Home">
```

---

## Verification

- [ ] Tab from fresh page load → skip link visible
- [ ] Press Enter on skip link → focus moves to main content
- [ ] Screen reader announces "Main navigation" landmark
- [ ] Logo link announces "Load Tester - Home"

---

## Files

| File | Change |
|------|--------|
| Layout.jsx | Skip link + main id |
| Header.jsx | Nav wrappers + aria-labels |
