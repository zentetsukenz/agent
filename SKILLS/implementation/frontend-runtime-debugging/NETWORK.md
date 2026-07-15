# Network Failures

Data won't load, a request errors, or the UI shows nothing because a fetch never resolved. The
browser separates *transport* failures (the request never got a response) from *application*
failures (a response arrived with a bad status) — capture tells you which.

## Capture recipe

Pull these from the network + console channels (see the capability checklist in
[SKILL.md](SKILL.md)):

- Every **failed request**: URL, method, and failure reason (`ERR_CONNECTION_REFUSED`,
  `ERR_NAME_NOT_RESOLVED`, CORS, timeout).
- Every **completed response** for the relevant calls: status, and timing if slowness is
  suspected.
- The **request headers** actually sent (Origin, Authorization, Content-Type) and, for CORS, the
  **response headers** (`Access-Control-Allow-*`).
- The **console** — CORS blocks and mixed-content blocks print a distinctive message there even
  when the network panel shows only "failed".

A connection-level failure yields **no response** — so an empty response with a failed-request
entry means "never reached the server", not "server returned nothing".

## Likely origins

| Evidence | Likely origin |
|---|---|
| `ERR_CONNECTION_REFUSED` / no response | Wrong host/port, API server down, wrong base URL for the environment |
| `blocked by CORS policy` in console | Missing/incorrect `Access-Control-Allow-Origin` on the server, or credentialed request without `Allow-Credentials` |
| 401 / 403 | Missing/expired token, cookie not sent (SameSite, missing `credentials: 'include'`), wrong auth header |
| 404 | Wrong path, missing `/api` prefix, client/route drift, trailing-slash mismatch |
| 500 | Server-side bug — request itself is fine; move to backend |
| Mixed content blocked | `http://` request from an `https://` page |
| Slow response, UI hangs | No timeout/loading state; unbounded await; N+1 requests |
| Preflight `OPTIONS` fails | Custom headers/method triggering preflight the server doesn't handle |
| Works locally, 404/CORS in prod | Base URL / proxy config differs between dev (proxy) and prod (absolute origin) |

## Fix patterns

- **Base URL by environment.** Read the API origin from config/env, not a hardcoded string. Dev
  often proxies `/api`; prod hits an absolute origin — the *same* client code must resolve both.
- **CORS is a server fix.** The browser is correctly enforcing policy. Set the right
  `Access-Control-Allow-Origin` (and `Allow-Credentials` for cookies) on the API; don't try to
  defeat it client-side.
- **Credentials.** For cookie auth, the request needs `credentials: 'include'` *and* the server
  needs `Allow-Credentials: true` with a specific (non-`*`) origin.
- **Timeouts + loading/error states.** Every request path needs a visible loading state, an error
  state, and (ideally) an abort/timeout. A "stuck spinner" is almost always a request with no
  error branch.
- **Trace to origin.** A 500 is a backend origin — stop debugging the frontend. A 404 is usually a
  client-side URL-construction bug — find where the URL is built, not where the fetch is called.

## Verify

Re-run the repro and confirm the previously-failing request now returns the expected status with
data, and that loading/error states behave. Re-capture — the failed-request entry should be gone.
