# Frontend Meta Improvements

**Priority**: 🟢 Quick Win  
**Effort**: 30 minutes  
**Standard**: HTML Best Practices, SEO

---

## Objective

Fix HTML meta tags for proper branding and SEO.

---

## Current State

```html
<!-- apps/frontend/index.html -->
<title>frontend</title>
<!-- No meta description -->
<!-- Generic favicon -->
```

---

## Implementation

### Target File

- `apps/frontend/index.html`

### Required Changes

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Updated title -->
    <title>Load Tester - API Performance Testing</title>
    
    <!-- Add meta description -->
    <meta name="description" content="Load test your APIs with configurable scenarios. Monitor performance, analyze results, and ensure your endpoints handle traffic." />
    
    <!-- Optional: Open Graph for social sharing -->
    <meta property="og:title" content="Load Tester" />
    <meta property="og:description" content="API performance testing made simple" />
    <meta property="og:type" content="website" />
    
    <!-- Optional: Theme color for mobile browsers -->
    <meta name="theme-color" content="#000000" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## Success Criteria

- [ ] Title updated to "Load Tester - API Performance Testing"
- [ ] Meta description added (150-160 chars)
- [ ] Open Graph tags for social sharing
- [ ] Theme color for mobile browsers

---

## Verification

```bash
# Check in browser
# Tab should show "Load Tester - API Performance Testing"

# Check meta tags
curl http://localhost:5173 | grep -E "<title>|<meta"
```

### Social Preview Test

Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or [Twitter Card Validator](https://cards-dev.twitter.com/validator) when deployed.

---

## Optional: Custom Favicon

Replace `/vite.svg` with a custom Load Tester icon:

1. Create SVG with bolt/speedometer icon
2. Save as `public/favicon.svg`
3. Update link in index.html

---

## References

- [Meta Tags](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta)
- [Open Graph Protocol](https://ogp.me/)
