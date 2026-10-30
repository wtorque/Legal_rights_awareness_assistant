---
name: backend-engineering
description: Implement or change Aequa's FastAPI backend code — app factory, middleware, services, repositories, error handling and config. Use for any server-side Python work that is not purely API contract, schema, security hardening or AI logic.
---

# Backend Engineering

## When to use
Creating the app object, middleware, services/repositories, background jobs, exception handlers, or changing `app/core`.

## Required project context
`docs/backend/BACKEND_ARCHITECTURE.md`, `brain/ARCHITECTURE.md`. Reality: only `app/core/{config,logging,exceptions}.py` exist; no app, no tests, Python 3.14.7 venv at `backend/.venv`.

## Engineering principles
- Layering: router → service → repository → model. Routers are thin; SQL only in repositories.
- Dependency injection through `Depends`; overridable in tests.
- Expected failures are `AppError` subclasses; one envelope for all errors.
- Async end to end; blocking work off the event loop.
- Never log user text or secrets.

## Workflow
1. Run `project-brain`; read the touched modules and `core/` files.
2. Confirm the contract in `docs/integration/DATA_CONTRACTS.md`; use `api-engineering` for endpoint shapes.
3. Write the failing test first where practical.
4. Implement in the right layer; add schemas separate from models.
5. Wire DI and error handling; ensure unexpected exceptions become `internal_error` without leaks.
6. Run `source backend/.venv/bin/activate && pytest`; run the app and exercise the path.
7. Run `documentation-maintenance`.

## Relevant files
`backend/app/core/*.py`, `backend/app/{api,services,repositories,schemas,middleware}/`, `backend/.env.example`, `backend/requirements*.txt`.

## Implementation requirements
- Settings only via `get_settings()`; never read `os.environ` ad hoc.
- Use `get_logger`; add request id via contextvars.
- Time-box outbound calls; no module-level mutable singletons.
- New dependency → justify, add to requirements, record in `TECH_STACK.md`.

## Testing requirements
Unit tests for logic; integration tests for endpoints/repositories on real Postgres; a test per error code path; security tests for authorization. Report real pytest output.

## Common mistakes
- Business logic in routers; returning ORM objects.
- Catching `Exception` and swallowing it.
- Blocking calls (PDF parsing) in async handlers.
- Reading settings at import time so tests cannot override.
- Treating the in-memory rate limiter as production-ready.

## Definition of done
Tests pass, error envelope verified, layering respected, no secrets/user text in logs, docs and contracts updated.
