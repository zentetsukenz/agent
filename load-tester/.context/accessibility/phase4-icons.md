# Phase 4: Decorative Icons

**Effort**: 20 min | **Priority**: Low

---

## Objective

Hide decorative icons from screen readers to reduce noise.

---

## Rule

- **Icon + Text** → Icon gets `aria-hidden="true"`
- **Icon only** → Button/link needs `aria-label`

---

## Tasks

### 4.1 Header Icons

**File**: `apps/frontend/src/components/layout/Header.jsx`

Nav link icons (decorative, text present):

```jsx
<Link to="/">
  <span className="flex items-center gap-2">
    <svg aria-hidden="true" className="w-4 h-4" ...>
      {/* Dashboard icon */}
    </svg>
    Dashboard
  </span>
</Link>
```

Logo icon:

```jsx
<div className="bg-white/10 p-2 rounded-lg ...">
  <Logo aria-hidden="true" />
</div>
```

### 4.2 Dashboard Icons

**File**: `apps/frontend/src/pages/Dashboard.jsx`

Button icons with text:

```jsx
<Button asChild>
  <Link to="/endpoints/new">
    <Plus aria-hidden="true" className="w-4 h-4" />
    Add Endpoint
  </Link>
</Button>
```

### 4.3 Other Pages

Pattern for any icon + text:

```jsx
// lucide-react icons
<Plus aria-hidden="true" className="w-4 h-4" />

// SVG icons
<svg aria-hidden="true" className="w-4 h-4" ...>
```

---

## Verification

1. Open screen reader
2. Navigate to buttons/links
3. Should hear text only, not "image" or icon description

---

## Files

| File | Change |
|------|--------|
| Header.jsx | aria-hidden on nav icons |
| Dashboard.jsx | aria-hidden on button icons |
| Various | Same pattern where needed |
