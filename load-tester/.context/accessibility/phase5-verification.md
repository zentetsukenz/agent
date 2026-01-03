# Phase 5: Verification

**Effort**: 60 min | **Priority**: Required

---

## Objective

Verify all accessibility improvements and catch remaining issues.

---

## 5.1 Lighthouse Audit

### Run Audit

1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Check "Accessibility" only
4. Click "Analyze page load"

### Target

- Score: **90+**
- Zero contrast violations
- Zero missing labels

### Fix Common Issues

| Issue | Fix |
|-------|-----|
| Low contrast | Increase color difference |
| Missing label | Add `<label>` or `aria-label` |
| Missing alt | Add `alt=""` for decorative, description for meaningful |

---

## 5.2 Keyboard Navigation

### Test Flow

1. Start at browser URL bar
2. Press Tab repeatedly through entire page
3. Complete: Dashboard → Create Endpoint → Configure Test

### Checklist

- [ ] **Reachable**: All buttons, links, inputs focusable
- [ ] **Visible**: Focus ring always visible
- [ ] **No traps**: Can Tab out of any component
- [ ] **Activation**: Enter/Space triggers buttons
- [ ] **Escape**: Closes modals/dialogs
- [ ] **Arrows**: Work in dropdowns/selects

---

## 5.3 Screen Reader Test (VoiceOver)

### Setup

```
Cmd + F5  → Enable VoiceOver
Ctrl + Option + Arrows → Navigate
```

### Test Cases

**1. Landmarks**

- Ctrl + Option + U → Open rotor
- Select "Landmarks"
- Should see: banner, navigation, main, contentinfo

**2. Headings**

- Rotor → "Headings"
- Each page should have h1
- Structure should be logical

**3. Forms**

- Navigate to Create Endpoint form
- Each field should announce its label
- Errors should be announced

**4. Toasts**

- Trigger success/error action
- Toast message should be announced

---

## Success Criteria

### Must Pass

- [ ] Lighthouse accessibility ≥ 90
- [ ] Skip link works
- [ ] Nav landmark present
- [ ] One h1 per page
- [ ] All inputs labeled
- [ ] Toasts announced

### Should Pass

- [ ] No contrast violations
- [ ] Decorative icons hidden
- [ ] Focus management in modals

---

## Document Results

After verification, update [SPEC.md](SPEC.md) with:

- Final Lighthouse score
- Any remaining issues
- Mark as complete
