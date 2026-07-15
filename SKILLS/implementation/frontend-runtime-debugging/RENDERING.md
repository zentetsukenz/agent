# Rendering Failures

The component tree won't paint what you expect: blank screen, stuck spinner, a missing component,
a render loop, or an SSR hydration mismatch. These are framework-shaped bugs — the patterns below
use React terms but the shapes recur in Vue, Svelte, and Solid.

## Capture recipe

- **Console + uncaught errors first.** A blank page is usually a thrown error during render that
  unmounted the tree — the [SKILL.md](SKILL.md) console/pageerror channels will show it. Classify
  as Console if there's an error; only treat it as pure Rendering once the console is clean.
- **Framework warnings.** Keys, "Maximum update depth exceeded", "Cannot update a component while
  rendering a different component", hydration mismatch warnings — capture them; they name the bug.
- **DOM snapshot** at the failure moment: is the node absent, present-but-empty, or present-with-
  stale-content? Each points at a different origin.
- **Render count**, if a loop is suspected — a quick counter/log in the suspect component (removed
  after) confirms "renders forever" vs "renders once with wrong data".

## Likely origins

| Evidence | Likely origin |
|---|---|
| Blank page + thrown error in console | Uncaught error during render; no error boundary to contain it |
| Stuck spinner, no error | Loading state never cleared — a request that never resolves (see [NETWORK.md](NETWORK.md)) or a promise that never settles |
| "Maximum update depth exceeded" | `setState` during render, or an effect whose dependency it also updates — a render→effect→render loop |
| "Cannot update a component while rendering a different component" | State update triggered synchronously during another component's render |
| Missing key warning + reordering/duplication bugs | Unstable or index-based `key` in a list |
| Component renders once then never updates | Stale closure, or mutating state in place instead of replacing it |
| "Hydration failed / content did not match" | Server and client rendered different output (see below) |
| Laggy input / re-renders everything on keystroke | New object/array/function identity passed as a prop or effect dep every render |

## Fix patterns

- **Error boundaries.** Wrap risky subtrees so one thrown error degrades locally instead of
  blanking the whole app — and so the error is *visible* instead of a white screen.
- **Break the loop.** For "maximum update depth": don't `setState` during render; give effects a
  correct, minimal dependency array; move derived values into `useMemo`/computed rather than into
  state that an effect keeps syncing.
- **Stable identities.** Memoize objects/arrays/callbacks passed as props or effect deps
  (`useMemo`/`useCallback`, or hoist constants out) so children don't re-render on every parent
  render.
- **Stable keys.** Use a stable domain id for list `key`, never the array index when the list can
  reorder, insert, or delete.
- **Immutable updates.** Replace state, don't mutate it — mutation skips the change detection that
  triggers re-render, producing "updates once then goes stale".

## Hydration mismatches (SSR)

The server-rendered HTML must match the client's first render exactly. Common origins:

- Rendering `Date.now()`, `Math.random()`, or locale/timezone-dependent output that differs
  between server and client.
- Reading `window`/`localStorage`/`navigator` during the initial render (undefined on the
  server).
- Invalid HTML nesting the browser "fixes" (e.g. a `<div>` inside a `<p>`), so the client tree
  no longer matches.

Fix: make the first client render identical to the server's — defer client-only values to an
effect (post-hydration), guard browser-only APIs, and fix invalid nesting.

## Verify

Re-run the repro: the component paints the expected content, no warning in the console, no render
loop. For hydration, confirm the mismatch warning is gone on a fresh SSR load.
