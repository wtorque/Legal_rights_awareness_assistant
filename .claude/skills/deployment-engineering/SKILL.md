---
name: deployment-engineering
description: Prepare Aequa for build, CI and deployment — environment configuration, Docker and process setup, migrations, secrets handling, health checks and release checklists. Use when adding CI, containers or deploy configuration, or assessing release readiness. Never deploys or touches production without explicit instruction.
---

# Deployment Engineering

## When to use
Adding CI workflows, Dockerfiles, deployment config, environment variable documentation, release checklists, or reviewing readiness.

## Required project context
`backend/.env.example`, `backend/app/core/config.py`, `brain/SECURITY_MODEL.md`, `brain/ROADMAP.md` (M10). Reality: no CI, no Docker, no deploy config; git has no tracked `frontend/`/`backend/`; no root `.gitignore`; requirements unpinned; target hosting undecided.

## Engineering principles
- Reproducible builds: pinned and locked dependencies.
- Config via environment; secrets from the platform secret store, never baked into images or commits.
- Health/readiness endpoints before orchestration.
- Never run migrations or deploy against production without explicit approval.

## Workflow
1. Decide hosting targets (record an ADR): frontend (Node host/Vercel-like), backend (container), Postgres with pgvector, optional Redis, file storage.
2. Pin Python deps and produce a lock; commit `package-lock.json` (present).
3. CI: frontend `npm ci`, `tsc --noEmit`, `lint`, `build`; backend install, `pytest` with a Postgres+pgvector service, migration up/down check, dependency audit, secret scan.
4. Containers: multi-stage, non-root, no `.env` in image, healthcheck on `/health`.
5. Production config: `APP_ENV=production` activates the JWT-length and CORS guards; set `CORS_ORIGINS`, `REDIS_URL` (needed for multi-process rate limiting), `LOG_JSON=true`.
6. Release checklist: migrations reviewed, backups, rollback plan, storage retention job scheduled, monitoring/alerts, security review done.
7. Document env variables for both apps (frontend `NEXT_PUBLIC_API_BASE_URL`, backend `.env.example`).

## Relevant files
`backend/.env.example`, `backend/requirements*.txt`, `frontend/package.json`, `frontend/next.config.ts`, `.gitignore` files.

## Implementation requirements
- `.env*`, `.venv`, `node_modules`, `.next`, `*.tsbuildinfo`, `storage/*` stay out of git and images.
- Postgres image/extension includes pgvector; migration creates the extension.
- Do not enable production features that depend on Missing pieces (auth, rate limiting, retention job).

## Testing requirements
CI runs on a clean checkout; a container builds and passes its healthcheck locally; migration up/down on a fresh DB; smoke test of the built frontend against a local backend.

## Common mistakes
- Shipping with `APP_ENV` not set to production (guards inactive).
- In-memory rate limiting across multiple workers.
- Baking secrets into images or committing `.env`.
- Deploying without a retention job while promising deletion.

## Definition of done
Reproducible CI and build in place, env documented, secrets handled safely, readiness checklist complete, and nothing deployed without explicit approval.
