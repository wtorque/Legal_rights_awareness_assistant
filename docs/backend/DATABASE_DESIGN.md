# Database Design — Engineering Guide

Logical tables are in `brain/DATABASE_SCHEMA.md` (proposed). This file says **how** to implement them. State today: nothing implemented; `backend/migrations/versions/` is empty and Alembic is not initialised.

## Stack and setup

- PostgreSQL 15+ with the `vector` extension. `DATABASE_URL=postgresql+asyncpg://…` (async app). SQLAlchemy 2 async (`create_async_engine`, `async_sessionmaker`, `AsyncSession`).
- Alembic needs either an async `env.py` (`run_sync` pattern) or a sync URL via psycopg (this is probably why `psycopg[binary]` is listed; confirm in an ADR).
- Create the extension in the first migration: `CREATE EXTENSION IF NOT EXISTS vector;` (and `citext` if used). Requires privileges; document for local, CI and production.

## Model conventions

- Declarative base with naming convention for constraints/indexes (so Alembic diffs are stable).
- Primary keys UUID (server default `gen_random_uuid()`), `created_at`/`updated_at` as `timestamptz` with DB defaults.
- Mapped types with `Mapped[...]` / `mapped_column`. `nullable` explicit. Enums as text with CHECK or native enums chosen once and documented.
- Table names plural snake_case; FK columns `<entity>_id`; index names via the naming convention.
- Deletion: user erasure must remove or irreversibly anonymise personal data. Use soft-delete only where there is a reason; scheduled hard-delete for expired uploads.

## pgvector

- Column: `Vector(EMBEDDING_DIM)` from `pgvector.sqlalchemy`; dimension equals `Settings.embedding_dim` and the embedding model. Changing it = new migration, re-embed all rows.
- Index: HNSW with the operator class matching the distance used in queries (cosine → `vector_cosine_ops`, query with `<=>`). Create after bulk load or with `CREATE INDEX CONCURRENTLY` in production.
- Normalise or not consistently with the model's recommendation. Store the embedding model id with each chunk so mixed-model data is detectable.
- Always filter by `jurisdiction_id`/validity *with* the vector query; test the plan (`EXPLAIN`) to ensure the filter does not defeat the index at your data size.
- Hybrid: keep a generated or maintained `tsvector` column with a GIN index; choose the text-search configuration per language.

## Migrations

- One logical change per revision, reversible `downgrade` where feasible, reviewed by hand (autogenerate is a draft).
- Never edit an applied migration. Add a new one.
- Data migrations separate from schema migrations; batch large updates.
- CI/test: `upgrade head` on a clean DB, then `downgrade base`, then `upgrade head` again.
- Never run migrations against a real database without explicit approval.

## Indexing and constraints

- Index every foreign key and every column used in frequent filters (`user_id`, `jurisdiction_id`, `expires_at`, `document_id`).
- Unique constraints encode business rules (e.g. one preferences row per user, unique `(document_id, label, version)`).
- Foreign keys with explicit `ON DELETE` behaviour; cascade only for true child data.

## Transactions

- One `AsyncSession` per request (dependency), committed at the service boundary, rolled back on exception. Repositories never commit.
- Keep transactions short; do not hold one open across NVIDIA calls or file parsing.
- Idempotent ingestion: upsert by `(source_id, content_hash)`.

## Testing

Integration tests run against real PostgreSQL with pgvector (container or CI service), not SQLite. Cover: migration up/down, ownership scoping, vector search ordering on a tiny fixed corpus, constraint violations.
