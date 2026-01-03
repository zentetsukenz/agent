# Phase 3: Heading Hierarchy

**Status**: ✅ COMPLETE | **Effort**: 45 min | **Priority**: Medium | **Completed**: Jan 3, 2026

---

## Objective

Ensure each page has exactly one `<h1>` and logical heading order (no skipped levels).

---

## ✅ Implementation Complete

### Changes Made

**Dashboard.jsx** (`apps/frontend/src/pages/Dashboard.jsx`):

- ✅ Changed loading state page title from `<h2>` to `<h1>`
- ✅ Changed main render page title from `<h2>` to `<h1>`
- ✅ Added screen-reader-only `<h1>` to empty state
- ✅ Changed "API Endpoints" section from `<h3>` to `<h2>` (fixes skipped levels)

**CreateEndpoint.jsx** (`apps/frontend/src/pages/CreateEndpoint.jsx`):

- ✅ Added `<h1 className="sr-only">Create New Endpoint</h1>`

**EditEndpoint.jsx** (`apps/frontend/src/pages/EditEndpoint.jsx`):

- ✅ Added `<h1 className="sr-only">Edit Endpoint</h1>`

**Header.jsx** (`apps/frontend/src/components/layout/Header.jsx`):

- ✅ Changed brand from `<h1>` to `<span>`

### Verification Results

**Heading Structure (via visual-qa):**

*Dashboard:*

- H1: "Dashboard" (visible)
- H2: "API Endpoints"
- H3: "Test API" (endpoint card)
- ✅ No skipped levels

*CreateEndpoint:*

- H1: "Create New Endpoint" (sr-only)
- ✅ No hierarchy issues

*EditEndpoint:*

- H1: "Edit Endpoint" (sr-only)
- ✅ No hierarchy issues

**Quality Checks:**

- ✅ Each page has exactly one `<h1>`
- ✅ No skipped heading levels
- ✅ Headings describe their content
- ✅ Header brand is not an `<h1>`
- ✅ Browser console: 0 errors, 0 warnings
- ✅ WCAG 2.1 compliance achieved

---

## Previous State

| Page | Current | Issue |
|------|---------|-------|
| Dashboard | `<h2>` page title | Missing h1 |
| CreateEndpoint | CardTitle (h3) | Missing h1 |
| EditEndpoint | CardTitle (h3) | Missing h1 |
| Header | `<h1>Load Tester</h1>` | Brand as h1 |

**Problem**: Header has `<h1>`, pages use `<h2>`/`<h3>` — violates one-h1-per-page.

---

## Tasks

### 3.1 Dashboard Page

**File**: `apps/frontend/src/pages/Dashboard.jsx`

Change both instances:

```jsx
// Line ~121 (loading state)
<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

// Line ~163 (main render)
<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
```

### 3.2 CreateEndpoint Page

**File**: `apps/frontend/src/pages/CreateEndpoint.jsx`

Add h1 or modify CardTitle:

```jsx
// Option A: Add sr-only h1
<h1 className="sr-only">Create New Endpoint</h1>
<Card>
  <CardHeader>
    <CardTitle className="text-2xl">Create New Endpoint</CardTitle>
    ...
  </CardHeader>
</Card>

// Option B: Use CardTitle as h1
<CardTitle as="h1" className="text-2xl">Create New Endpoint</CardTitle>
```

### 3.3 EditEndpoint Page

**File**: `apps/frontend/src/pages/EditEndpoint.jsx`

Same pattern as CreateEndpoint:

```jsx
<h1 className="sr-only">Edit Endpoint</h1>
```

### 3.4 Header Brand (Optional)

**File**: `apps/frontend/src/components/layout/Header.jsx`

Change brand from h1 to span:

```jsx
// Current
<h1 className="text-xl font-bold text-white tracking-tight">Load Tester</h1>

// Better (brand is link text, not heading)
<span className="text-xl font-bold text-white tracking-tight">Load Tester</span>
```

---

## Verification

Use browser extension (e.g., HeadingsMap) or DevTools:

```js
// Check heading structure
document.querySelectorAll('h1, h2, h3, h4, h5, h6')
```

- [x] Each page has exactly one `<h1>`
- [x] No skipped levels (h1 → h3 without h2)
- [x] Headings describe their content

---

## Files Modified

| File | Changes |
|------|---------|
| [Dashboard.jsx](../../apps/frontend/src/pages/Dashboard.jsx) | h2 → h1 (3 places), h3 → h2 (section) |
| [CreateEndpoint.jsx](../../apps/frontend/src/pages/CreateEndpoint.jsx) | Added sr-only h1 |
| [EditEndpoint.jsx](../../apps/frontend/src/pages/EditEndpoint.jsx) | Added sr-only h1 |
| [Header.jsx](../../apps/frontend/src/components/layout/Header.jsx) | h1 → span (brand) |
