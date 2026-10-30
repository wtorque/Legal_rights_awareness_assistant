# API Contracts

**State: no endpoints exist.** There is no FastAPI app object, router or schema in `backend/app`. The only implemented contract is the error envelope in `backend/app/core/exceptions.py`. Everything marked *Proposed* needs ratification (an entry in [DECISIONS](DECISIONS.md)) before code depends on it.

Conventions (versioning, pagination, auth): `docs/backend/API_REFERENCE.md`. Schemas, streaming and upload shapes: `docs/integration/DATA_CONTRACTS.md`. Do not duplicate them here.

## Implemented: error envelope

Every error response, from every endpoint:

```json
{ "error": { "code": "string", "message": "string", "details": [] , "request_id": "string|null" } }
```

`details` is a list or null. Server messages are safe to show to users; never include stack traces, SQL or secrets.

| HTTP | `code` | Class |
|---|---|---|
| 400 | `bad_request` | `BadRequest` |
| 401 | `unauthorized` | `Unauthorized` |
| 403 | `forbidden` | `Forbidden` |
| 404 | `not_found` | `NotFound` |
| 409 | `conflict` | `Conflict` |
| 413 | `payload_too_large` | `PayloadTooLarge` |
| 422 | `validation_error` | `ValidationFailed` |
| 422 | `unsupported_jurisdiction` | `UnsupportedJurisdiction` |
| 429 | `rate_limited` | `RateLimited` |
| 500 | `internal_error` | `AppError` |
| 503 | `upstream_unavailable` | `UpstreamUnavailable` |

The exception handler that renders this envelope is **Missing**; only the classes exist.

## Proposed endpoint catalogue (all under `/api/v1`)

| Module | Endpoint | Purpose | Status |
|---|---|---|---|
| Platform | `GET /health` | Liveness | Planned |
| Platform | `GET /ready` | DB/Redis/NVIDIA readiness | Planned |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` | Accounts and tokens | Planned |
| Assistant | `POST /assistant/answers` | Sourced answer (streaming via SSE) | Planned |
| Assistant | `GET/DELETE /conversations`, `/conversations/{id}` | History | Planned |
| Rights | `GET /rights/categories`, `/rights/topics/{id}` | Explorer content | Planned |
| Documents | `POST /documents`, `GET /documents/{id}`, `DELETE /documents/{id}` | Upload, status, delete | Planned |
| Documents | `POST /documents/{id}/analysis`, `POST /documents/compare` | Clauses/risks, diff | Planned |
| Blueprint | `POST /blueprints`, `GET /blueprints/{id}` | Action plans | Planned |
| Sources | `GET /sources`, `GET /sources/{id}`, `GET /sections/{id}` | Registry and section text | Planned |
| Jurisdictions | `GET /jurisdictions`, `/jurisdictions/{code}/coverage` | Coverage transparency | Planned |
| Settings | `GET/PATCH /me/preferences`, `DELETE /me` | Preferences, erasure | Planned |

## Rules

1. Add or change an endpoint in this file, `DATA_CONTRACTS.md`, the Pydantic schema and the TypeScript type in the same change.
2. Breaking change = new version path (`/api/v2`) or an explicitly versioned field. Never silently reshape a response.
3. Every endpoint documents: auth requirement, request schema, response schema, error codes it can raise.
