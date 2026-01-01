# Load-Tester UI/UX Standards

**Purpose**: UI polish requirements and user experience guidelines

---

## Core Principle

**Production-ready UI**, not prototype quality. Every user-facing feature must be polished, intuitive, and provide clear feedback.

---

## Loading States (MANDATORY)

### Requirement

**Every async operation MUST show loading feedback.**

No silent waits. Users must always know when the app is working.

### Patterns

**API Calls**:

```jsx
function EndpointList() {
  const { data, loading, error } = useEndpoints();
  
  if (loading) {
    return <LoadingSpinner />;
    // OR
    return <EndpointSkeleton />;
  }
  
  // ... rest of component
}
```

**Form Submissions**:

```jsx
function EndpointForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
    >
      {isSubmitting ? 'Saving...' : 'Save'}
    </button>
  );
}
```

**Page Loads**:

```jsx
function TestPage() {
  const { test, loading } = useTest(id);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return <TestDetails test={test} />;
}
```

### Loading Indicators

| Context | Indicator | Example |
|---------|-----------|---------|
| Full page | Centered spinner | Loading page data |
| List items | Skeleton screens | Loading list of endpoints |
| Button action | Button text + disabled | "Saving...", "Deleting..." |
| Inline action | Small spinner | Refreshing data |

### ❌ Anti-Patterns

```jsx
// BAD: No loading state
function List() {
  const { data } = useEndpoints();
  return <ul>{data.map(...)}</ul>; // Blank screen while loading
}

// BAD: No feedback on submit
<button onClick={handleSave}>Save</button> // User clicks, nothing happens visibly
```

---

## Error Handling (MANDATORY)

### Requirement

**Every error MUST be user-friendly.**

No technical jargon. No stack traces. Clear, actionable messages.

### Message Translation

| Technical Error | User-Friendly Message |
|----------------|----------------------|
| "Network Error" | "Unable to connect. Check your internet connection." |
| "404 Not Found" | "This endpoint doesn't exist or was deleted." |
| "500 Internal Server Error" | "Something went wrong. Please try again." |
| "Validation failed" | Specific field-level errors (see below) |
| "ECONNREFUSED" | "Could not reach the server. Is it running?" |

### Patterns

**Page-Level Errors**:

```jsx
function EndpointList() {
  const { data, loading, error } = useEndpoints();
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800">
          Unable to load endpoints. Check your connection.
        </p>
        <button onClick={refetch} className="mt-2 text-red-600 underline">
          Try again
        </button>
      </div>
    );
  }
  
  // ... rest
}
```

**Toast Notifications**:

```jsx
import toast from 'react-hot-toast';

async function handleSave(data) {
  try {
    await endpointService.create(data);
    toast.success('Endpoint created successfully');
  } catch (error) {
    // ✅ GOOD: User-friendly
    toast.error('Could not create endpoint. Please try again.');
    
    // ❌ BAD: Technical error
    // toast.error(error.message);
  }
}
```

**Form Validation Errors**:

```jsx
<div>
  <input {...register('url', { required: 'URL is required' })} />
  {errors.url && (
    <p className="mt-1 text-sm text-red-600">
      {errors.url.message}
    </p>
  )}
</div>
```

### Error Recovery

Always provide a way to recover:

- **Retry button** for network errors
- **Clear error** button for persistent messages
- **Navigate back** for 404s
- **Contact support** for persistent issues

### ❌ Anti-Patterns

```jsx
// BAD: Raw error shown to user
toast.error(error.message); // "Request failed with status code 500"

// BAD: No error handling
async function save() {
  await api.post('/endpoints', data); // Fails silently
}

// BAD: Technical jargon
<ErrorMessage message="ECONNREFUSED: Connection refused" />
```

---

## Empty States (MANDATORY)

### Requirement

**Every list/collection MUST have an empty state.**

No blank pages. Guide users on what to do next.

### Pattern

```jsx
function EndpointList() {
  const { data, loading, error } = useEndpoints();
  
  if (loading) return <Loading />;
  if (error) return <ErrorMessage />;
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400">
          {/* Icon */}
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No endpoints yet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first API endpoint to test.
        </p>
        <button
          onClick={() => navigate('/endpoints/new')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Endpoint
        </button>
      </div>
    );
  }
  
  return <ul>{data.map(...)}</ul>;
}
```

### Components

**Empty state must include**:

1. Icon or illustration (optional but recommended)
2. Heading explaining what would appear here
3. Description of what the user can do
4. Call-to-action button (if applicable)

### ❌ Anti-Patterns

```jsx
// BAD: Blank page
if (!data.length) return null;

// BAD: Just text
if (!data.length) return <div>No data</div>;
```

---

## Form UX (MANDATORY)

### Real-Time Validation

**Validate on blur, not just on submit:**

```jsx
<input
  {...register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  })}
  onBlur={() => trigger('email')} // Validate on blur
/>
```

### Clear Error Messages

**Show errors near the field:**

```jsx
<div>
  <label htmlFor="url" className="block text-sm font-medium text-gray-700">
    URL
  </label>
  <input
    id="url"
    {...register('url', { required: 'URL is required' })}
    className={`mt-1 block w-full rounded ${errors.url ? 'border-red-500' : 'border-gray-300'}`}
  />
  {errors.url && (
    <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
  )}
</div>
```

### Submit Button States

**Disable while submitting, show progress:**

```jsx
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <>
      <Spinner className="inline mr-2" />
      Saving...
    </>
  ) : (
    'Save Endpoint'
  )}
</button>
```

### Prevent Double-Submission

```jsx
const { handleSubmit, formState: { isSubmitting } } = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  {/* Button automatically disabled during submission */}
  <button type="submit" disabled={isSubmitting}>Submit</button>
</form>
```

---

## Visual Consistency

### Color Scheme

**Use consistent colors throughout:**

| Purpose | Tailwind Classes |
|---------|-----------------|
| Primary action | `bg-blue-500 hover:bg-blue-600 text-white` |
| Secondary action | `bg-gray-200 hover:bg-gray-300 text-gray-800` |
| Danger action | `bg-red-500 hover:bg-red-600 text-white` |
| Success message | `bg-green-50 border-green-200 text-green-800` |
| Error message | `bg-red-50 border-red-200 text-red-800` |
| Warning message | `bg-yellow-50 border-yellow-200 text-yellow-800` |

### Button Styles

**Match existing button patterns:**

```jsx
// Primary button
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors">
  Primary Action
</button>

// Secondary button
<button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition-colors">
  Secondary Action
</button>

// Danger button
<button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors">
  Delete
</button>
```

### Card/Container Styles

**Consistent containers:**

```jsx
<div className="bg-white rounded-lg shadow p-6">
  {/* Content */}
</div>

// With border
<div className="bg-white rounded-lg border border-gray-200 p-6">
  {/* Content */}
</div>
```

---

## Responsive Design (MANDATORY)

### Mobile-First Approach

**Design for mobile, enhance for desktop:**

```jsx
// Grid that adapts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(...)}
</div>

// Text that scales
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Heading
</h1>

// Padding that adjusts
<div className="px-4 md:px-6 lg:px-8 py-4">
  {/* Content */}
</div>
```

### Breakpoints

| Breakpoint | Tailwind | Screen Width |
|-----------|----------|--------------|
| Mobile | (default) | < 768px |
| Tablet | `md:` | ≥ 768px |
| Desktop | `lg:` | ≥ 1024px |
| Large Desktop | `xl:` | ≥ 1280px |

### Mobile Navigation

**Hamburger menu for mobile, full nav for desktop:**

```jsx
<nav className="bg-white shadow">
  <div className="container mx-auto px-4">
    <div className="flex justify-between items-center h-16">
      <div className="flex items-center">
        <Logo />
        {/* Desktop nav */}
        <div className="hidden md:flex ml-10 space-x-4">
          <NavLink to="/endpoints">Endpoints</NavLink>
          <NavLink to="/tests">Tests</NavLink>
        </div>
      </div>
      {/* Mobile menu button */}
      <button className="md:hidden">
        <MenuIcon />
      </button>
    </div>
  </div>
</nav>
```

### Testing Responsive

**Always test on mobile**:

1. Open browser DevTools
2. Toggle device toolbar (Cmd+Shift+M)
3. Test on iPhone, iPad, Desktop sizes
4. Verify layout doesn't break

---

## Accessibility Guidelines

### Semantic HTML

```jsx
// ✅ GOOD: Semantic elements
<nav>
  <ul>
    <li><a href="/endpoints">Endpoints</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Page Title</h1>
  </article>
</main>

// ❌ BAD: All divs
<div className="nav">
  <div className="link">Endpoints</div>
</div>
```

### Labels and ARIA

```jsx
// ✅ GOOD: Proper labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ GOOD: ARIA for icons
<button aria-label="Delete endpoint">
  <TrashIcon />
</button>
```

### Keyboard Navigation

- All interactive elements focusable
- Visible focus states
- Logical tab order

```jsx
// Visible focus state
<button className="... focus:ring-2 focus:ring-blue-500 focus:outline-none">
  Click me
</button>
```

---

## Performance Considerations

### Code Splitting

```jsx
// Lazy load pages
const EndpointsPage = lazy(() => import('./pages/EndpointsPage'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/endpoints" element={<EndpointsPage />} />
  </Routes>
</Suspense>
```

### Image Optimization

- Use appropriate formats (WebP when possible)
- Provide `width` and `height` attributes
- Use responsive images (`srcset`)
- Lazy load images below fold

### Bundle Size

- Monitor bundle size with `npm run build`
- Keep dependencies minimal
- Remove unused code
- Use tree-shaking

---

## Success Checklist

Before claiming UI work is done:

- [ ] Loading states shown for all async operations
- [ ] Error messages are user-friendly (not technical)
- [ ] Success feedback provided (toast notifications)
- [ ] Empty states have helpful guidance
- [ ] Forms have real-time validation
- [ ] Submit buttons disabled while submitting
- [ ] Responsive layout works on mobile
- [ ] Visual consistency with existing UI
- [ ] No console errors or warnings
- [ ] Keyboard navigation works
- [ ] Focus states visible

---

## Common UI Bugs to Avoid

### ❌ Flash of unstyled content

Load styles before rendering

### ❌ Layout shift while loading

Use skeleton screens or fixed heights

### ❌ Buttons that don't provide feedback

Always show loading state on click

### ❌ Error messages that disappear

Keep errors visible until resolved

### ❌ Text overflow breaking layout

Use `truncate` or `overflow-hidden`

```jsx
<p className="truncate">Very long text that might overflow...</p>
```

---

**Last Updated**: January 1, 2026
