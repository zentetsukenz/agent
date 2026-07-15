# State & Race Failures

The UI shows the wrong value, an update seems lost, something is correct after a refresh but wrong
live, or behavior changes depending on timing. These bugs rarely throw — the console is clean and
the network is fine — which is what makes them hard. The evidence is a **diff between expected and
actual state over time**, not an error message.

## Capture recipe

- **State snapshots over time**, not a single dump. Capture the relevant state (store, component
  state, cache) at each step of the repro so you can see *when* it diverges from expected.
- **Action/event order.** Log the sequence of dispatches / effects / requests with timestamps. Race
  bugs are almost always "these two things happened in the wrong order".
- **The stale value's source.** When a value is stale, capture both the value the UI shows and the
  value the source of truth holds — the gap tells you it's a propagation/closure bug, not a data
  bug.
- **Repro rate for flakiness.** If it's intermittent, this is a feedback-loop problem first — go to
  [diagnose](../diagnose/SKILL.md) and raise the reproduction rate before hypothesizing.

## Likely origins

| Evidence | Likely origin |
|---|---|
| Value stale until refresh, source of truth is correct | Stale closure capturing an old value; missing dependency; not subscribed to the store |
| Update "lost" under rapid interaction | Setting state from a stale snapshot instead of the updater form; last-write-wins clobber |
| Correct result depends on which request finishes first | Out-of-order async responses; no request cancellation on re-fire |
| Flips between correct/incorrect run to run | Race between an effect and an event, or between two effects with no ordering guarantee |
| Two components disagree about the same data | Duplicated local state instead of one shared source; cache not invalidated |
| Works first time, breaks on repeat | State not reset between runs; leftover subscription/listener from a previous mount |
| Data from a previous route/item flashes in | No cleanup on unmount; response from an abandoned request applied to the new view |

## Fix patterns

- **Single source of truth.** Don't copy shared data into local state and let the copies drift.
  Derive from the one source; when data must be cached, invalidate it explicitly.
- **Functional updates.** Update from the *previous* state (`setX(prev => …)`), not from a value
  captured in a closure, so rapid successive updates don't clobber each other.
- **Cancel stale async.** On re-fire or unmount, abort the in-flight request (`AbortController`) or
  guard the result with a "is this still the latest?" check, so a late response can't overwrite
  fresh state.
- **Correct effect dependencies.** A stale value read inside an effect/callback usually means a
  missing dependency or a closure over an old render — include the dependency or read from a ref.
- **Clean up on unmount.** Remove listeners, cancel timers, unsubscribe from stores, and ignore
  responses that arrive after the component/route is gone — this kills "data from the last view
  flashes in" and "breaks on the second run".

## Trace to origin

State bugs punish symptom-fixing hardest — patching the display value hides the real desync. Trace
backward from "the wrong value is shown here" to "the wrong value was written there" to "the write
happened in the wrong order / from a stale snapshot". See
[systematic-debugging](../systematic-debugging/SKILL.md) for backward tracing and
[diagnose](../diagnose/SKILL.md) for making intermittent races reproducible.

## Verify

Re-run the repro, including the rapid/interleaved variant that triggered it. For a race, run it
many times (or drive the loop from [diagnose](../diagnose/SKILL.md)) and confirm the state now
converges correctly every time — a single passing run does not clear a race.
