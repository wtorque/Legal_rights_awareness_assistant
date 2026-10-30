# Legal Rights Awareness API

Evidence-grounded, jurisdiction-aware legal information backend. Not legal advice. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design, ER diagram, API contract and security model.

## Run (development)

```bash
python3 -m venv .venv && . .venv/bin/activate     # Python 3.12+ (developed on 3.14)
pip install -r requirements-dev.txt
cp .env.example .env                               # fill JWT_SECRET etc.
createdb legal_rights                              # PostgreSQL 15+ with pgvector installed
alembic upgrade head
uvicorn app.main:app --reload
```

Docs at `http://localhost:8000/docs` (disabled in production). Health: `GET /api/v1/health`.

## Test

```bash
pytest                                             # unit + API tests
TEST_DATABASE_URL=postgresql+asyncpg://user@host:5432/db pytest   # also runs DB-backed tests
```

## Status

Phase 1 only (see architecture doc). Implemented and tested: config with production guards, async DB session, 20-table schema + initial migration, request-id/size-limit/security-header middleware, CORS, uniform error envelope, log redaction, `/health`. Everything else in the spec is **not implemented yet**.

## Known gaps (Phase 1)

- The migration was verified (up and down) on PostgreSQL 16 with the pgvector-specific statements removed, because pgvector was not installed in the dev environment. `CREATE EXTENSION vector`, the `vector(1024)` column and the HNSW index are **untested** until run on a server with pgvector.
- `Dockerfile` / `docker-compose.yml` are provided but **untested** (Docker is not available in the dev environment).
- Redis is not used yet.
