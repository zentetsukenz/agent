# Accessibility Improvements

**Priority**: 🟡 Important  
**Effort**: 4 hours  
**Standard**: WCAG 2.2 Level AA

---

## Objective

Improve accessibility to WCAG 2.2 AA compliance, ensuring the app is usable by people with disabilities.

---

## Implementation Phases

| Phase | Context | Effort | Status |
|-------|---------|--------|--------|
| 1 | [Landmarks & Navigation](phase1-landmarks.md) | 30 min | Not started |
| 2 | [Toast Accessibility](phase2-toast.md) | 15 min | ✅ Complete |
| 3 | [Heading Hierarchy](phase3-headings.md) | 45 min | Not started |
| 4 | [Decorative Icons](phase4-icons.md) | 20 min | Not started |
| 5 | [Verification](phase5-verification.md) | 60 min | Not started |

**Full Analysis**: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

---

## Current State

**Score**: 4/10

### ✅ Already Implemented

- `<html lang="en">` present
- `<main>` landmark in Layout
- Focus rings via Tailwind
- Some ARIA labels on buttons
- `sr-only` class for screen readers
- Form labels with Radix UI Label component

### ❌ Gaps

- No skip navigation link
- Missing `<nav>` landmark
- Toast notifications not announced
- Heading hierarchy issues (h2 as page title)
- Decorative icons not hidden
- Color contrast unaudited

---

## Implementation Tasks

### 1. Skip Navigation Link

```jsx
// Layout.jsx - Add at top of body
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
             bg-primary text-primary-foreground px-4 py-2 rounded z-50"
>
  Skip to main content
</a>

// Add id to main
<main id="main-content" className="...">
```

### 2. Navigation Landmark

```jsx
// Header.jsx - Wrap nav items
<nav aria-label="Main navigation">
  {/* Navigation links */}
</nav>
```

### 3. Form Label Audit

Every input needs either:

- Visible `<label htmlFor="id">`
- `aria-label` attribute
- `aria-labelledby` reference

### 4. Toast Accessibility

```jsx
// Toast component
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
>
  {message}
</div>
```

### 5. Color Contrast

Run Lighthouse audit and fix any contrast issues. Minimum ratios:

- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1

### 6. Heading Hierarchy

Ensure logical heading order:

- One `<h1>` per page
- No skipped levels (h1 → h3)
- Headings describe content

---

## Target Files

- `apps/frontend/src/components/layout/Layout.jsx`
- `apps/frontend/src/components/layout/Header.jsx`
- `apps/frontend/src/components/ui/toast.jsx`
- All form components
- All page components

---

## Success Criteria

- [ ] Skip navigation link functional
- [ ] `<nav>` landmark with aria-label
- [ ] All form inputs have labels
- [ ] Toasts announced to screen readers
- [ ] Lighthouse accessibility score > 90
- [ ] No contrast violations
- [ ] Logical heading hierarchy

---

## Verification

### Lighthouse Audit

```bash
# Run in Chrome DevTools
# Lighthouse > Accessibility

# Target: 90+ score
```

### Manual Testing

1. Tab through entire app - all interactive elements reachable
2. Screen reader test (VoiceOver on Mac)
3. Skip link works on focus
4. Forms announce errors

### Keyboard Navigation Checklist

- [ ] Can reach all interactive elements with Tab
- [ ] Can activate all buttons with Enter/Space
- [ ] Can navigate dropdowns with arrows
- [ ] Focus visible at all times
- [ ] No keyboard traps

---

## References

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
