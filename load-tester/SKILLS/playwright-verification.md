# UI Verification with Playwright

## Context Awareness

Screenshots are expensive (~100KB each). A typical session can handle 3-4 screenshots before context fills. Manage context budget carefully.

## Before Taking ANY Screenshot

1. Ask: "Do I really need a screenshot, or can I verify another way?"
   - Check DOM structure via browser console
   - Read the component file to verify changes
   - Only screenshot when visual appearance must be confirmed

2. If screenshot is needed, ask: "Is this the RIGHT moment?"
   - ❌ After every small CSS tweak
   - ✅ After completing a logical chunk of UI work
   - ✅ For final verification before claiming done

## Screenshot Workflow

When you do take a screenshot:

1. **Capture** - Take the screenshot
2. **Describe immediately** - Write a TEXT description of what you see:
   ```
   Screenshot shows: Header aligned correctly, navigation visible, 
   button styling applied. Issues found: spacing between cards 
   is inconsistent, loading spinner still visible after load.
   ```
3. **Act on description** - Work from your text description, not the image
4. **Limit retention** - Avoid keeping multiple screenshots in context

## Strategic Verification Pattern

```
Iteration 1-3: Make changes → verify via code reading
Iteration 4:   Take screenshot → describe → identify remaining issues  
Iteration 5-7: Fix issues → verify via code reading
Final:         Take screenshot → confirm all issues resolved → claim done
```

## Anti-patterns

- ❌ Screenshot after every small change (context death by 1000 cuts)
- ❌ Keeping multiple screenshots in context simultaneously
- ❌ Taking screenshot without describing what you see
- ❌ Taking screenshot when code inspection would suffice
- ❌ Forgetting that context has limits

## When Context Is Getting Full

If you notice responses slowing or context warnings:
1. Stop taking screenshots immediately
2. Work from your last text description
3. Verify remaining changes via code reading
4. Save final screenshot for absolute last verification
