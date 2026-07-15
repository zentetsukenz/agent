# Verification Dimensions

What to actually look at. Don't check every dimension on every dispatch — scope to what the code
change plausibly affects (a spacing tweak doesn't need a contrast audit; a new color token does).

## Layout & alignment

- Elements align to a consistent grid/baseline — no stray 1-2px offsets between sibling elements.
- Content doesn't overflow its container, clip unexpectedly, or cause unwanted scrollbars.
- Flex/grid children wrap and distribute space as intended at the viewport under test.
- Z-index stacking is correct — no element hidden behind another that should be on top.

## Spacing rhythm

- Padding/margin follow the project's spacing scale (e.g. 4/8px increments) — not arbitrary values.
- Vertical rhythm between stacked elements (headings, paragraphs, list items) is consistent.
- Touch/click targets have adequate spacing from neighbors (especially on mobile).

## Typography

- Font family, weight, size, and line-height match the design system for the element's role.
- Text doesn't truncate unexpectedly, orphan a single word, or overflow its bounding box.
- Heading hierarchy is visually consistent with the semantic hierarchy (h1 > h2 > h3 in emphasis).

## Color & contrast (accessibility)

- Text-to-background contrast meets WCAG AA at minimum (4.5:1 normal text, 3:1 large text)
  for the affected elements — flag anything visibly low-contrast even without measuring exactly.
- Color is not the only signal for state (error/success/warning) — check for icon/text backup.
- Colors match the design system's tokens, not one-off hex values that will drift from re-themes.

## Responsive breakpoints

- Check at minimum: mobile (~375px), tablet (~768px), desktop (~1280px) — narrow further only if
  the change specifically targets a breakpoint.
- Navigation collapses/expands correctly across the breakpoint boundary.
- Content reflows (stacks, wraps, hides/shows) as intended — nothing overlaps or gets cut off.
- Touch targets are large enough on mobile (~44x44px minimum).

## Component states

Most visual bugs hide in states that don't show up on a fresh page load. Check whichever apply:

- **Hover / focus** — visible focus ring for keyboard nav; hover state doesn't shift layout.
- **Active / pressed** — button/control gives clear pressed feedback.
- **Disabled** — visually distinct from enabled, and unambiguous why.
- **Loading** — skeleton/spinner doesn't cause layout jump when real content arrives.
- **Empty** — empty state is intentional, not a blank gap or broken-looking table.
- **Error** — error state is visible, readable, and doesn't break layout.
- **Long content / edge-case data** — very long strings, many items, zero items, unicode/emoji.

## Theming

- Light and dark mode (if supported) both render correctly — no invisible text, no leftover
  hardcoded colors that ignore the theme.
- Brand/theming tokens applied consistently across the changed surface.

## Cross-browser / cross-viewport consistency

- If the project supports multiple browsers, note any rendering difference only when it's
  plausible the change is browser-specific (new CSS feature, flex/grid quirk).

## Visual regressions

- Compare against the prior known-good state (screenshot, baseline, or recollection of the
  pre-change UI) — did anything *unrelated* to this change shift? See baseline-regression mode in
  [MODES.md](MODES.md).
