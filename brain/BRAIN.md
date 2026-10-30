# BRAIN — Project Memory and Navigation

Entry point to project knowledge. Keep this file short. Detail lives in the linked documents.

- Product: **Aequa**, an AI-assisted Legal Rights Awareness Platform (name from `frontend/src/config/site.ts`).
- Last audited against the repository: **2026-10-31**.
- Phase: **Frontend complete on mock data**. The application frontend (shell and nine modules) works against mock services with fictional content. Backend is a scaffold. No AI, RAG, database or real legal data exists yet.

## Status vocabulary (used everywhere)

| Term | Meaning |
|---|---|
| Implemented | Code exists and was verified to work |
| Partial | Some of it exists; gaps are listed |
| Planned | Intended, no code yet |
| Missing | Required by the product, not started, not yet designed |
| Broken | Exists but fails verification |
| Unknown | Not verified. Do not assume |

Never move a feature to Implemented without running something that proves it.

## Repository map

```
Legal Rights Awareness Assistant/
├── CLAUDE.md              Root instructions (loaded every session)
├── .claude/               skills/ (25), agents/ (11), rules/ (6)
├── brain/                 This directory: central project knowledge
├── docs/                  frontend/, backend/, integration/ engineering guides
├── frontend/              Next.js app (own AGENTS.md — read it)
├── backend/               FastAPI scaffold (app/, migrations/, tests/, scripts/, docs/, storage/)
├── landing/               Empty. Purpose undefined
├── landingg/              Earlier marketing-style shell (own node_modules); seed for a separate landing project
└── claude/                Empty. Not used
```

## Where to look

| Need | Read |
|---|---|
| What and why | [PROJECT_OVERVIEW](PROJECT_OVERVIEW.md), [PRODUCT_VISION](PRODUCT_VISION.md) |
| How it is built | [ARCHITECTURE](ARCHITECTURE.md), [TECH_STACK](TECH_STACK.md) |
| What exists today | [DEVELOPMENT_STATUS](DEVELOPMENT_STATUS.md), [FEATURE_MAP](FEATURE_MAP.md) |
| What is broken or risky | [KNOWN_ISSUES](KNOWN_ISSUES.md) |
| What is next | [ROADMAP](ROADMAP.md) |
| Why we chose X | [DECISIONS](DECISIONS.md) |
| UI look and feel | [DESIGN_SYSTEM](DESIGN_SYSTEM.md), `docs/frontend/` |
| API and data shapes | [API_CONTRACTS](API_CONTRACTS.md), `docs/integration/DATA_CONTRACTS.md` |
| Database | [DATABASE_SCHEMA](DATABASE_SCHEMA.md), `docs/backend/DATABASE_DESIGN.md` |
| AI, RAG, NVIDIA | [AI_SYSTEM](AI_SYSTEM.md), `docs/backend/RAG_PIPELINE.md`, `docs/backend/NVIDIA_INTEGRATION.md` |
| Legal data and citations | [LEGAL_KNOWLEDGE](LEGAL_KNOWLEDGE.md) |
| Security and privacy | [SECURITY_MODEL](SECURITY_MODEL.md), `docs/backend/SECURITY.md` |

## Context to load by task

| Task | Load |
|---|---|
| Any UI work | DESIGN_SYSTEM, `docs/frontend/FRONTEND_ARCHITECTURE.md`, `frontend/AGENTS.md` |
| Any endpoint | API_CONTRACTS, `docs/integration/DATA_CONTRACTS.md`, `docs/backend/API_REFERENCE.md` |
| Any model or migration | DATABASE_SCHEMA, `docs/backend/DATABASE_DESIGN.md` |
| Any AI answer path | AI_SYSTEM, LEGAL_KNOWLEDGE, `docs/backend/RAG_PIPELINE.md` |
| Uploads or documents | `docs/backend/DOCUMENT_PROCESSING.md`, SECURITY_MODEL |

## Non-negotiables

1. Legal output is sourced or it is refused. No fabricated law, section numbers or citations.
2. Sample content is labelled (`MockDataBadge`). It is never presented as verified law.
3. Secrets stay server-side. The NVIDIA key never reaches the browser.
4. Frontend and backend share one contract (`docs/integration/DATA_CONTRACTS.md`). Change it in one place first.
5. Documents are not changed with unverified claims.

## Maintaining this brain

See the `documentation-maintenance` skill and `.claude/rules/documentation.md`. Short version: after a meaningful change, update DEVELOPMENT_STATUS, and only the other documents the change actually touches.
