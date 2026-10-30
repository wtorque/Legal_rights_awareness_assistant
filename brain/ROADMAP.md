# Roadmap

Ordered by dependency. Each milestone has an exit check; do not start a milestone that depends on an unfinished one unless the work is clearly independent. Status of everything: Planned unless stated.

## M0 — Repo hygiene and decisions
- Commit `frontend/` and `backend/` after review; add root `.gitignore` and a real README (setup commands).
- Decide: ADR-012 (first jurisdiction), GLM + embedding model ids, anonymous vs account use.
- Run `npm run build`; record the result.
- Exit: clean tracked tree, decisions recorded in DECISIONS.

## M1 — Backend runnable
- App factory, `/health`, `/ready`, request-id + size-limit + security-header middleware, exception handlers rendering the envelope.
- pytest config; unit tests for `core/` (config guards, redaction, exceptions).
- ruff + mypy config.
- Exit: `uvicorn` starts, tests pass, envelope verified by test.

## M2 — Data foundation
- Alembic init, async engine/session, `vector` extension migration.
- Models + migrations for jurisdictions, sources, documents, sections, chunks (DATABASE_SCHEMA).
- Repositories with tests against a real Postgres (not SQLite).
- Exit: migrate up/down clean; vector + keyword indexes exist.

## M3 — Contracts and frontend service layer
- Status: the frontend service interfaces and mock implementations exist (ADR-015); contracts are not ratified and no HTTP client exists.
- Ratify API_CONTRACTS and DATA_CONTRACTS (ADR-010).
- Typed API client, error parser, SSE reader in `frontend/src/lib` or `services`.
- Shared fixtures proving Pydantic and TS shapes match.

## M4 — Legal corpus and ingestion (needs M2 + ADR-012)
- Source registry, ingestion CLI in `backend/scripts`, section segmentation, chunking, embeddings, verification workflow.
- Exit: one jurisdiction ingested from official sources with recorded hashes and verifier.

## M5 — Sourced assistant (needs M3 + M4)
- NVIDIA provider with retries/streaming, prompts, hybrid retrieval, ranking, context assembly, citation verification, refusal path.
- Evaluation harness with the first jurisdiction's set.
- Assistant UI with streaming, source cards, disclaimer, language and jurisdiction selection.
- Exit: citation validity 100% on the evaluation set.

## M6 — Rights Explorer, Sources, Jurisdiction coverage pages

## M7 — Document Intelligence
- Secure upload, PDF/DOCX extraction, OCR decision, clause extraction, risk flags, comparison, retention job.

## M8 — Action Blueprint

## M9 — Auth, accounts, settings, rate limiting (Redis), data erasure

## M10 — Landing page, accessibility audit, performance audit, CI, deployment

Auth (M9) may move earlier if conversation history or uploads are needed before then. Record that as an ADR.
