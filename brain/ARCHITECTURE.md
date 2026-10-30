# Architecture

Status key: see [BRAIN](BRAIN.md). Everything labelled **Planned** has no code yet.

## System shape

Two deployable units in one repository:

```
Browser ──HTTPS──> Next.js frontend (frontend/)           Implemented (all modules, mock data)
                        │  typed service layer             Implemented (mock implementations only)
                        ▼
                  FastAPI backend (backend/)               Partial (core/ only)
                        │
        ┌───────────────┼──────────────────┬───────────────┐
        ▼               ▼                  ▼               ▼
   PostgreSQL+pgvector  Redis (optional)   File storage    NVIDIA API
   Planned              Planned            backend/storage Planned
```

The browser never talks to NVIDIA. The browser never holds secrets.

## Frontend (Implemented on mock services)

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4.
- Route group `(application)` wraps every page in `AppShell`: collapsible sidebar, topbar (breadcrumbs, search, jurisdiction, language, notifications, theme, account), skip link, overlays.
- Modules: dashboard, assistant, conversations, documents (+ viewer, comparison), rights (+ topics), action plans (+ detail), knowledge (+ sources), evidence graph, legal aid, saved, settings, help. `/` redirects to `/dashboard`. No landing page.
- Pages reach data only through `src/services/*.service.ts`; the implementations in `src/services/mock/` use fictional fixtures from `src/mocks/` and browser `localStorage`.
- Root layout loads fonts, injects the theme init script, mounts `AppProviders` (theme, store hydration, Framer `MotionConfig`, toasts).

Detail: `docs/frontend/FRONTEND_ARCHITECTURE.md`.

## Backend (Partial)

Intended layering (directories exist, mostly empty):

```
api/v1/endpoints  →  services  →  repositories  →  models (SQLAlchemy)
        │               │
     schemas        ai/ rag/ legal/ document_intelligence/ action_engine/
(Pydantic I/O)
core/ (config, logging, exceptions)   middleware/   utils/
```

| Package | Purpose | State |
|---|---|---|
| `core` | Settings, structured logging with redaction, error classes + envelope | Implemented, untested |
| `api/v1/endpoints` | HTTP routers | Missing (no `main.py`, no app) |
| `schemas` | Pydantic request/response models | Missing |
| `models`, `repositories` | SQLAlchemy models, data access | Missing |
| `services` | Business logic | Missing |
| `middleware` | Request id, size limit, rate limit, security headers | Missing |
| `ai/{providers,prompts,services}` | NVIDIA client, prompt templates, orchestration | Missing |
| `rag/{ingestion,embeddings,retrieval,ranking,citations}` | RAG pipeline | Missing |
| `legal/{sources,documents,sections,jurisdictions}` | Legal data model and registry | Missing |
| `document_intelligence/{extraction,analysis,comparison}` | Uploads → clauses, risks, diffs | Missing |
| `action_engine/{planning,resources}` | Action blueprints | Missing |

Detail: `docs/backend/BACKEND_ARCHITECTURE.md`.

## Primary data flow: sourced answer (Planned)

1. Frontend sends question + jurisdiction + language to `POST /api/v1/...` (contract in [API_CONTRACTS](API_CONTRACTS.md)).
2. Backend validates, rate-limits, resolves jurisdiction (declines if unsupported).
3. Query is embedded; hybrid retrieval (vector + keyword) over legal section chunks, filtered by jurisdiction and validity date.
4. Ranked chunks are assembled into a bounded, delimited context.
5. GLM (via NVIDIA) generates an answer constrained to the context, returning structured citations.
6. Citation verification checks each citation against stored text. Unverifiable citations are removed; if nothing grounded remains, the answer becomes a refusal.
7. Response streams to the browser with sources attached.

Detail: [AI_SYSTEM](AI_SYSTEM.md), `docs/backend/RAG_PIPELINE.md`.

## Dependency rules

- Frontend → backend only through the frontend service layer.
- Routers call services; services call repositories and `ai/rag/legal`; repositories own all SQL.
- `core` imports nothing from other app packages.
- `ai/providers` is the only code that imports an HTTP client for NVIDIA.
- Shared shapes are defined once in [DATA_CONTRACTS](../docs/integration/DATA_CONTRACTS.md).

## Cross-cutting

- Errors: one envelope (see API_CONTRACTS). Implemented in `core/exceptions.py`.
- Logging: structlog with redaction of emails, bearer tokens, long digit runs, and blocked keys (`question`, `text`, `content`, ...). Implemented.
- Config: pydantic-settings from environment; production guards on JWT secret and CORS. Implemented.
- Observability, tracing, metrics: Missing.
