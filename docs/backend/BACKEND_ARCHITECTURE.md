# Backend Architecture

Location: `backend/`. Python 3.14.7 venv at `backend/.venv`. FastAPI, Pydantic 2, SQLAlchemy 2 (async), Alembic. **Current state: scaffold.** Only `app/core/{config,logging,exceptions}.py` contain code. No app object, router, model, service or test exists.

## Layout

```
backend/
  app/
    core/                 config.py, logging.py, exceptions.py            Implemented
    api/v1/endpoints/     Routers (one module per area)                  Missing
    schemas/              Pydantic request/response models               Missing
    models/               SQLAlchemy ORM models                          Missing
    repositories/         All SQL access                                 Missing
    services/             Business logic orchestration                   Missing
    middleware/           request id, size limit, rate limit, headers    Missing
    utils/                Small pure helpers                             Missing
    ai/{providers,prompts,services}/
    rag/{ingestion,embeddings,retrieval,ranking,citations}/
    legal/{sources,documents,sections,jurisdictions}/
    document_intelligence/{extraction,analysis,comparison}/
    action_engine/{planning,resources}/
  migrations/versions/    Alembic (not initialised)
  tests/{unit,integration,security}/   (empty)
  scripts/                Ingestion / maintenance CLIs (empty)
  storage/                Uploaded files (git-ignored except .gitkeep)
  docs/                   (empty; backend-local docs, prefer /docs/backend)
  requirements.txt, requirements-dev.txt, .env.example
```

## Layering rules

1. **Routers** (`api/v1/endpoints`): parse/validate with Pydantic schemas, call exactly one service method, return a schema. No SQL, no business rules, no NVIDIA calls.
2. **Services**: orchestrate use cases, own transactions' boundaries, call repositories and domain packages (`rag`, `ai`, `legal`, ...). Raise `AppError` subclasses.
3. **Repositories**: only place that builds queries. Take an `AsyncSession`. Always scope user-owned data by owner id.
4. **Models**: SQLAlchemy mapped classes. No behaviour beyond simple invariants.
5. **Schemas**: separate from models. Never return an ORM object from an endpoint.
6. **Domain packages** (`ai`, `rag`, `legal`, `document_intelligence`, `action_engine`) must not import from `api`. `core` imports from nothing in `app`.

## Dependency injection

Use FastAPI `Depends` for: settings (`get_settings`, cached with `lru_cache`), DB session (one per request), current user, service instances, and the AI provider. Tests override these via `app.dependency_overrides`; no module-level singletons that cannot be replaced.

## Configuration

`core/config.py` `Settings` (pydantic-settings, `.env`): app env, logging, DB, Redis, JWT, CORS, size and rate limits, NVIDIA, retention. Production validators reject a short JWT secret and wildcard CORS. Secrets are `SecretStr`: call `.get_secret_value()` only at the point of use and never log it.

## Error handling

- Raise subclasses of `AppError` (`NotFound`, `Forbidden`, `UnsupportedJurisdiction`, ...). Each carries `status_code` and `code`.
- One exception handler renders the envelope `{"error": {code, message, details, request_id}}` (handler Missing). It must also convert FastAPI `RequestValidationError`, `HTTPException`, and unexpected exceptions into the same envelope (unexpected → `internal_error`, generic message, details never leaked).
- Upstream failures (NVIDIA timeout/5xx) → `UpstreamUnavailable` (503) after retry policy.
- Log the exception with request id; never log request bodies.

## Logging

`configure_logging(level, json_logs)` at startup; `get_logger(name)` everywhere. Add `request_id` via structlog contextvars in middleware. Do not add log fields containing user text; the scrubber is a backstop, not permission.

## Async rules

- Async endpoints and DB; no blocking calls on the event loop. CPU-heavy or blocking work (PDF parsing, OCR) goes to a thread/process pool or background worker.
- Time-box all outbound calls (`NVIDIA_TIMEOUT_SECONDS`).

## Running (once an app exists)

```
cd backend && source .venv/bin/activate
pytest
uvicorn app.main:app --reload     # module path is a proposal; app does not exist yet
```
