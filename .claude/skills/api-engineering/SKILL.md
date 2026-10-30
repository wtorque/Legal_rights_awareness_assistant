---
name: api-engineering
description: Design, implement and change Aequa REST endpoints and their frontend-backend contracts — routes, Pydantic schemas, TypeScript types, errors, pagination, streaming and uploads. Use whenever an endpoint or data shape is added or modified.
---

# API Engineering

## When to use
New or changed endpoint, request/response shape, error code, SSE stream, upload route, or pagination. Also when the frontend needs data the backend does not yet expose.

## Required project context
`brain/API_CONTRACTS.md`, `docs/integration/DATA_CONTRACTS.md`, `docs/backend/API_REFERENCE.md`, `docs/integration/FRONTEND_BACKEND.md`. Only the error envelope is implemented; everything else is Proposed (ADR-010 for versioning and SSE).

## Engineering principles
- Contract first, in docs, then code on both sides in the same change.
- Never silently change a contract; breaking changes get a new version or field.
- One error envelope; safe messages; stable `code` values.
- Resources are plural nouns; `snake_case` JSON; ISO 8601 UTC.

## Workflow
1. Describe the endpoint: method, path, auth, request, response, errors, rate-limit class.
2. Update `DATA_CONTRACTS.md` and `API_CONTRACTS.md`; if the change is significant or breaking, add an ADR.
3. Write Pydantic schemas with explicit limits and `response_model`; declare error responses.
4. Implement router → service call only.
5. Write the matching TypeScript types and service function (frontend `services/`).
6. Add shared example payload fixtures used by both test suites.
7. Test happy path, validation failure, auth failure, not found, rate limit.

## Relevant files
`backend/app/api/v1/endpoints/`, `backend/app/schemas/`, `backend/app/core/exceptions.py`, `frontend/src` service layer (when it exists), the contract docs.

## Implementation requirements
- Reject unknown fields on write models; bound all lists and strings.
- Return 202 + status resource for slow work; stream via SSE with the documented event set.
- Authenticated endpoints scope data by owner.
- Never return model internals, stack traces or upstream response bodies.

## Testing requirements
Endpoint tests via the ASGI client; envelope shape asserted on every error path; contract fixture round-trip on Pydantic and TS sides; OpenAPI schema matches docs.

## Common mistakes
- Changing a field name on one side only.
- Different error shapes per endpoint.
- Offset pagination on growing lists.
- Using `EventSource` for POST/authenticated streams (cannot send headers/body).
- Undocumented 4xx codes.

## Definition of done
Docs, Pydantic schema, TS type and fixtures agree; tests pass; errors use the envelope; ADR recorded if needed; FEATURE_MAP/DEVELOPMENT_STATUS updated.
