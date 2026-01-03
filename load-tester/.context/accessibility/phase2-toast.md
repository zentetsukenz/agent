# Phase 2: Toast Accessibility

**Effort**: 15 min | **Priority**: High

---

## Objective

Make toast notifications announced by screen readers.

---

## Task

### 2.1 Configure Toast ARIA

**File**: `apps/frontend/src/App.jsx`

**Current** (no ARIA):

```jsx
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: { ... },
    // no ariaProps
  }}
/>
```

**Target**:

```jsx
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
    style: { ... },
    // rest unchanged
  }}
/>
```

---

## Verification

1. Open VoiceOver (Cmd+F5 on Mac)
2. Trigger a toast (e.g., create endpoint)
3. Screen reader should announce the toast message

---

## Notes

- `react-hot-toast` >= 2.4.0 required for `ariaProps`
- `role="status"` + `aria-live="polite"` = non-urgent announcements
- Error toasts could use `role="alert"` for urgency (optional enhancement)

---

## Files

| File | Change |
|------|--------|
| App.jsx | Add ariaProps to Toaster |
