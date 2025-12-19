# Load Tester - Quality Standards

> **Purpose**: Define what "done" means. Agents MUST meet these standards before claiming completion.

---

## Definition of Done

Work is **NOT done** until ALL of the following are true:

### ✅ Functional Completeness
- [ ] Feature works as specified
- [ ] Edge cases handled (empty states, errors, loading)
- [ ] Data validation on both client and server
- [ ] API returns appropriate status codes

### ✅ Code Quality
- [ ] No linting errors (`npm run lint` passes)
- [ ] No TypeScript/type errors
- [ ] No console warnings in browser
- [ ] No deprecation warnings in terminal
- [ ] Tests pass with required coverage (80%+ for backend)

### ✅ UI/UX Polish
- [ ] Loading states shown during async operations
- [ ] Error messages are user-friendly (not technical jargon)
- [ ] Success feedback provided (toast notifications)
- [ ] Responsive layout (works on mobile)
- [ ] Consistent styling with existing UI
- [ ] Empty states have helpful messages
- [ ] Forms have proper validation feedback

### ✅ Self-Verification
- [ ] Actually tested in browser (not just assumed working)
- [ ] Verified on happy path AND error paths
- [ ] Checked console for errors/warnings
- [ ] Checked terminal for errors/warnings

---

## Code Quality Standards

### Backend (Node.js/Express)

```javascript
// ✅ GOOD: Proper error handling with custom errors
async function getEndpoint(id) {
  const endpoint = await prisma.endpoint.findUnique({ where: { id } });
  if (!endpoint) {
    throw new NotFoundError('Endpoint');  // Custom error class
  }
  return endpoint;
}

// ❌ BAD: Generic errors, no proper HTTP codes
async function getEndpoint(id) {
  const endpoint = await prisma.endpoint.findUnique({ where: { id } });
  if (!endpoint) {
    throw new Error('not found');  // Will return 500, not 404
  }
  return endpoint;
}
```

```javascript
// ✅ GOOD: Async handler wrapper prevents unhandled rejections
const asyncHandler = require('../utils/asyncHandler');

app.get('/api/endpoints/:id', asyncHandler(async (req, res) => {
  const endpoint = await endpointService.getById(req.params.id);
  res.json(endpoint);
}));

// ❌ BAD: Missing async error handling
app.get('/api/endpoints/:id', async (req, res) => {
  const endpoint = await endpointService.getById(req.params.id);  // Unhandled rejection!
  res.json(endpoint);
});
```

### Frontend (React)

```jsx
// ✅ GOOD: Complete state handling
export const EndpointList = () => {
  const { data, loading, error } = useEndpoints();
  
  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data?.length) return <EmptyState message="No endpoints yet" />;
  
  return <ul>{data.map(e => <EndpointItem key={e.id} {...e} />)}</ul>;
};

// ❌ BAD: Missing states cause poor UX
export const EndpointList = () => {
  const { data } = useEndpoints();
  return <ul>{data.map(e => <EndpointItem key={e.id} {...e} />)}</ul>;  // Crashes on load!
};
```

```jsx
// ✅ GOOD: User-friendly error messages
toast.error('Could not save endpoint. Please check your connection.');

// ❌ BAD: Technical errors shown to users
toast.error(error.message);  // Shows "Network Error" or "500 Internal Server Error"
```

### Testing

```javascript
// ✅ GOOD: Tests verify behavior, not implementation
describe('endpointService.create', () => {
  it('throws ConflictError when endpoint URL+method already exists', async () => {
    await endpointService.create({ name: 'Test', url: 'http://example.com', method: 'GET' });
    
    await expect(
      endpointService.create({ name: 'Duplicate', url: 'http://example.com', method: 'GET' })
    ).rejects.toThrow(ConflictError);
  });
});

// ❌ BAD: Tests coupled to implementation details
it('calls prisma.create with correct params', async () => {
  await endpointService.create(data);
  expect(mockPrisma.endpoint.create).toHaveBeenCalledWith({ data });
});
```

---

## UI/UX Standards

### Loading States
Every async operation MUST show loading feedback:
- API calls → Loading spinner or skeleton
- Form submissions → Button disabled with "Saving..." text
- Page loads → Full-page loader or skeleton

### Error Handling
Every error MUST be user-friendly:
- Network errors → "Unable to connect. Check your internet connection."
- Not found → "This endpoint doesn't exist or was deleted."
- Validation → Specific field-level errors, not generic "Invalid data"
- Server errors → "Something went wrong. Please try again."

### Empty States
Every list/collection MUST have an empty state:
- Helpful message explaining what would appear
- Call-to-action to create first item
- Not just blank space

### Form UX
- Real-time validation (on blur, not just submit)
- Clear error messages near the field
- Submit button disabled while invalid
- Prevent double-submission

### Visual Consistency
- Use existing Tailwind classes from the project
- Follow the blue primary color scheme (`primary-500`, etc.)
- Match button styles to existing buttons
- Match card/container styles to existing components

---

## Communication Standards

### When to Ask vs. Proceed

**ASK when:**
- Requirements are ambiguous
- Multiple valid approaches exist with significant trade-offs
- Work would take more than ~30 minutes and direction is unclear
- Deleting or significantly restructuring existing code
- Adding new dependencies

**PROCEED when:**
- Requirements are clear
- Following established patterns in the codebase
- Implementing standard CRUD operations
- Fixing bugs with obvious solutions
- Adding tests for existing code

### Progress Updates

For work taking more than a few minutes:
1. Share what you're about to do
2. Share progress at natural checkpoints
3. Share what you completed and any issues found

### Reporting Completion

When claiming work is done, explicitly confirm:
```
✅ Completed: [what was done]
✅ Tested: [how you verified]
✅ Warnings: [none / list any remaining]
✅ Known issues: [none / list any]
```

---

## Verification Requirements

### Before Claiming Done

1. **Run the tests**
   ```fish
   npm run backend:test
   npm run frontend:test
   ```

2. **Check for warnings**
   - Terminal output (deprecation, security)
   - Browser console (React warnings, runtime errors)
   - Build output (if applicable)

3. **Manual verification**
   - Open the app in browser
   - Test the happy path
   - Test at least one error case
   - Check mobile responsiveness (if UI change)

4. **Code review checklist**
   - No `console.log` left in production code
   - No commented-out code blocks
   - No hardcoded test data
   - Error messages are user-friendly
   - Loading states exist

---

## Anti-Patterns to Avoid

### ❌ "It works on my machine"
Always verify in the actual running application, not just in tests.

### ❌ "The test passes"
Tests can pass while UX is broken. Manual verification required.

### ❌ "I'll fix the warning later"
Warnings become tech debt. Fix them now or document why they can't be fixed.

### ❌ "Functionally complete"
Functional != Done. Polish and UX matter.

### ❌ Claiming done without checking
Run the verification checklist. Every time.

---

## Quality Bar Summary

This project aims for **production-ready quality**, not prototype quality.

| Aspect | Prototype | Production (Our Standard) |
|--------|-----------|---------------------------|
| Error handling | Crashes or shows error | Graceful recovery, helpful message |
| Loading states | None / janky | Smooth, consistent feedback |
| Empty states | Blank page | Helpful guidance |
| Validation | Server-side only | Client + server, real-time feedback |
| Mobile | Broken | Responsive |
| Warnings | "Fix later" | Fixed or documented |
| Testing | Manual only | Automated + manual verification |
