# Load-Tester Frontend Patterns

**Purpose**: React 19, Vite 7, and Tailwind 4 implementation patterns with examples

---

## Component Patterns

### Basic Functional Component

**Pattern**: Small, focused, composable components

```jsx
// components/ui/Button.jsx
export function Button({ 
  children, 
  variant = 'primary', 
  disabled = false, 
  onClick,
  type = 'button',
  ...props 
}) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };
  
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Key points**:

- ✅ Named exports for components
- ✅ Destructure props with defaults
- ✅ Spread `...props` for flexibility
- ✅ Tailwind classes for styling
- ❌ Don't use default exports
- ❌ Don't define styles outside component

---

### State Management with Hooks

**Pattern**: Use built-in hooks for local state, Context API for global state

```jsx
import { useState, useEffect } from 'react';

export function EndpointList() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchEndpoints() {
      try {
        setLoading(true);
        const data = await endpointService.getAll();
        setEndpoints(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEndpoints();
  }, []); // Empty deps = run once on mount
  
  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!endpoints.length) return <EmptyState message="No endpoints yet" />;
  
  return (
    <ul className="space-y-2">
      {endpoints.map(endpoint => (
        <EndpointItem key={endpoint.id} endpoint={endpoint} />
      ))}
    </ul>
  );
}
```

**Key points**:

- ✅ Handle all states (loading, error, empty, data)
- ✅ Use `useEffect` with proper dependencies
- ✅ Always provide `key` prop in lists
- ❌ Don't forget error handling
- ❌ Don't skip loading states

---

## Custom Hooks Patterns

### Data Fetching Hook

**Pattern**: Encapsulate API calls and state in custom hooks

```jsx
// hooks/useEndpoints.js
import { useState, useEffect } from 'react';
import endpointService from '@/services/endpoints';

export function useEndpoints() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    async function fetch() {
      try {
        setLoading(true);
        const endpoints = await endpointService.getAll();
        if (!cancelled) {
          setData(endpoints);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    
    fetch();
    
    return () => {
      cancelled = true; // Cleanup: prevent state updates after unmount
    };
  }, []);
  
  const refetch = async () => {
    // Trigger re-fetch
    setLoading(true);
    const endpoints = await endpointService.getAll();
    setData(endpoints);
    setLoading(false);
  };
  
  return { data, loading, error, refetch };
}

// Usage in component
function EndpointList() {
  const { data, loading, error, refetch } = useEndpoints();
  
  // ... render logic
}
```

**Key points**:

- ✅ Return object with named properties
- ✅ Cleanup effects to prevent memory leaks
- ✅ Provide `refetch` for manual updates
- ❌ Don't forget cleanup function
- ❌ Don't update state after unmount

---

## Form Handling with react-hook-form

**Pattern**: Use react-hook-form for validation and state management

```jsx
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export function EndpointForm({ endpoint, onSave }) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: endpoint || {
      name: '',
      url: '',
      method: 'GET',
      headers: '',
      body: ''
    }
  });
  
  const onSubmit = async (data) => {
    try {
      await onSave(data);
      toast.success('Endpoint saved successfully');
    } catch (error) {
      toast.error('Could not save endpoint. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          {...register('name', { 
            required: 'Name is required',
            maxLength: { value: 255, message: 'Name too long' }
          })}
          className="mt-1 block w-full rounded border-gray-300"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="url" className="block text-sm font-medium">
          URL
        </label>
        <input
          id="url"
          type="url"
          {...register('url', { 
            required: 'URL is required',
            pattern: { 
              value: /^https?:\/\/.+/, 
              message: 'Must be valid URL' 
            }
          })}
          className="mt-1 block w-full rounded border-gray-300"
        />
        {errors.url && (
          <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="method" className="block text-sm font-medium">
          Method
        </label>
        <select
          id="method"
          {...register('method')}
          className="mt-1 block w-full rounded border-gray-300"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Endpoint'}
      </button>
    </form>
  );
}
```

**Key points**:

- ✅ Use `register` to connect inputs
- ✅ Show validation errors inline
- ✅ Disable submit button while submitting
- ✅ Show user-friendly error messages (not technical)
- ❌ Don't forget labels and error messages
- ❌ Don't show raw error.message to users

---

## Service Layer Pattern

**Pattern**: Centralized API client with error handling

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
```

```javascript
// services/endpoints.js
import api from './api';

const endpointService = {
  async getAll() {
    const response = await api.get('/endpoints');
    return response.data;
  },
  
  async getById(id) {
    const response = await api.get(`/endpoints/${id}`);
    return response.data;
  },
  
  async create(data) {
    const response = await api.post('/endpoints', data);
    return response.data;
  },
  
  async update(id, data) {
    const response = await api.put(`/endpoints/${id}`, data);
    return response.data;
  },
  
  async delete(id) {
    await api.delete(`/endpoints/${id}`);
  }
};

export default endpointService;
```

**Benefits**:

- Centralized error handling
- Easy to mock for testing
- Type-safe (can add TypeScript later)
- Clean component code

---

## Routing Pattern

**Pattern**: React Router with lazy loading

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const EndpointsPage = lazy(() => import('./pages/EndpointsPage'));
const TestsPage = lazy(() => import('./pages/TestsPage'));

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          {/* Navigation */}
        </nav>
        
        <main className="container mx-auto py-6">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/endpoints" element={<EndpointsPage />} />
              <Route path="/tests" element={<TestsPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

**Key points**:

- ✅ Use lazy loading for code splitting
- ✅ Wrap with Suspense and fallback
- ✅ Structure routes hierarchically
- ❌ Don't load all pages eagerly

---

## Tailwind Styling Patterns

### Utility Classes

```jsx
// ✅ GOOD: Composition with Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-800">Title</h2>
  <button className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded">
    Action
  </button>
</div>

// ❌ BAD: Inline styles instead of Tailwind
<div style={{ display: 'flex', padding: '16px', backgroundColor: 'white' }}>
  <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Title</h2>
</div>
```

### Responsive Design

```jsx
// Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>
```

### Color Scheme Consistency

```jsx
// Use consistent color palette
<button className="bg-blue-500 hover:bg-blue-600 text-white">Primary</button>
<button className="bg-gray-200 hover:bg-gray-300 text-gray-800">Secondary</button>
<button className="bg-red-500 hover:bg-red-600 text-white">Danger</button>
```

---

## Loading States Pattern

**Pattern**: Always show loading feedback

```jsx
// Skeleton loading
export function EndpointSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

// Spinner loading
export function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Button loading state
<button disabled={isLoading} className="...">
  {isLoading ? (
    <>
      <Spinner className="mr-2" />
      Saving...
    </>
  ) : (
    'Save'
  )}
</button>
```

---

## Error Handling Pattern

**Pattern**: User-friendly error messages

```jsx
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" /* icon */ />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {message || 'Something went wrong'}
          </h3>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Empty States Pattern

**Pattern**: Helpful guidance when no data

```jsx
export function EmptyState({ 
  title = 'No items yet', 
  description,
  actionLabel,
  onAction 
}) {
  return (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" /* icon */ />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {actionLabel || 'Get started'}
        </button>
      )}
    </div>
  );
}
```

---

## Testing Patterns

### Component Testing

```jsx
// EndpointList.test.jsx
import { render, screen } from '@testing-library/react';
import { EndpointList } from './EndpointList';
import endpointService from '@/services/endpoints';

// Mock the service
vi.mock('@/services/endpoints');

describe('EndpointList', () => {
  it('shows loading state initially', () => {
    endpointService.getAll.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<EndpointList />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('shows endpoints when loaded', async () => {
    const mockEndpoints = [
      { id: 1, name: 'Test API', url: 'http://test.com', method: 'GET' }
    ];
    endpointService.getAll.mockResolvedValue(mockEndpoints);
    
    render(<EndpointList />);
    
    expect(await screen.findByText('Test API')).toBeInTheDocument();
  });
  
  it('shows error message on failure', async () => {
    endpointService.getAll.mockRejectedValue(new Error('Network error'));
    
    render(<EndpointList />);
    
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
  
  it('shows empty state when no endpoints', async () => {
    endpointService.getAll.mockResolvedValue([]);
    
    render(<EndpointList />);
    
    expect(await screen.findByText(/no endpoints/i)).toBeInTheDocument();
  });
});
```

### API Mocking with MSW

```javascript
// test/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:3001/api/endpoints', () => {
    return HttpResponse.json([
      { id: 1, name: 'Test', url: 'http://test.com', method: 'GET' }
    ]);
  }),
  
  http.post('http://localhost:3001/api/endpoints', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ id: 2, ...data }, { status: 201 });
  })
];
```

---

## Common Gotchas

### ❌ Missing Keys in Lists

```jsx
// BAD: No key
{endpoints.map(e => <EndpointItem endpoint={e} />)}

// GOOD: Unique key
{endpoints.map(e => <EndpointItem key={e.id} endpoint={e} />)}
```

### ❌ Not Handling All States

```jsx
// BAD: Only handles success
function List() {
  const { data } = useEndpoints();
  return <ul>{data.map(...)}</ul>;
}

// GOOD: Handles loading, error, empty, success
function List() {
  const { data, loading, error } = useEndpoints();
  if (loading) return <Loading />;
  if (error) return <ErrorMessage />;
  if (!data.length) return <EmptyState />;
  return <ul>{data.map(...)}</ul>;
}
```

### ❌ Showing Technical Errors

```jsx
// BAD: Shows raw error
toast.error(error.message); // "Network Error"

// GOOD: User-friendly message
toast.error('Could not load endpoints. Please check your connection.');
```

---

**Last Updated**: January 1, 2026
