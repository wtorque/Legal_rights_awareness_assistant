# Frontend ↔ Backend Integration

State: **no integration exists.** The frontend has a typed service layer (`frontend/src/services`) whose implementations are mocks; the backend has no app. This file defines how they will connect so neither side invents its own format. To integrate, implement each `*.service.ts` interface over HTTP/SSE, map wire types to the UI types inside the service, and switch the exported instance from the mock.

## Topology

```
Browser (Next.js pages/components)
   └─ service layer (frontend/src/services; interfaces Implemented, HTTP clients Planned)  ──HTTPS JSON / SSE──>  FastAPI /api/v1
```

- Components call typed service functions. Services own `fetch`, headers, error parsing, streaming and retries. Components never see raw HTTP.
- The browser talks only to the Aequa backend. NVIDIA, the database and Redis are never reachable from the client.

## Configuration

| Side | Setting | Notes |
|---|---|---|
| Frontend | `NEXT_PUBLIC_API_BASE_URL` | Non-secret origin of the backend (e.g. `http://localhost:8000`). Only public values in `NEXT_PUBLIC_*` |
| Backend | `CORS_ORIGINS` | JSON list that must include the frontend origin (default `["http://localhost:3000"]`) |

Names are proposals until the first integration lands; then record them here.

## Request lifecycle

1. Component calls `services/<area>.<fn>(input)`.
2. Service builds the request from a typed input, adds auth header when available, sets `Accept-Language` / explicit `language` field per contract, and a timeout/AbortSignal.
3. Backend validates, authorises, processes, returns a schema or the error envelope; always sets `X-Request-ID`.
4. Service parses success into the shared TypeScript type, or throws a typed `ApiError { status, code, message, details, requestId }` from the envelope.
5. UI renders loading / empty / error / success. User-facing error copy is derived from `code`, with `message` as fallback. Show `requestId` in a "details" affordance for support.

## Error handling rules

- Parse the envelope in one place. Unknown/malformed error bodies map to a generic `internal_error`.
- `rate_limited`: respect `Retry-After`. `unsupported_jurisdiction`: show the coverage page link. `upstream_unavailable`: offer retry. `unauthorized`: attempt one token refresh, then route to sign-in.
- Network failure and aborts are distinct from API errors.

## Streaming

The assistant answer streams over SSE (Proposed). The service exposes an async iterator or callback API yielding typed events (see DATA_CONTRACTS). Must support abort (user stops, navigates away), mid-stream `error` events, and a final `done` event carrying verified sources. Because `EventSource` cannot send an `Authorization` header or POST bodies, read the stream with `fetch` + `ReadableStream`.

## File upload

`multipart/form-data` via `fetch` with `FormData`; progress via XHR or streamed request only if needed. Validate size/type client-side for UX, but the server is authoritative. Show processing status by polling the document status resource.

## Keeping both sides in sync

1. Change the contract first: `DATA_CONTRACTS.md` and `brain/API_CONTRACTS.md`.
2. Update the Pydantic schema and the TypeScript type in the same change.
3. Prefer generating TS types from the FastAPI OpenAPI schema once endpoints exist (decide tool in an ADR). Until then maintain both by hand and keep a shared example payload fixture per endpoint that both test suites load.
4. Never reshape a response silently; breaking changes follow the versioning rules in `docs/backend/API_REFERENCE.md`.
