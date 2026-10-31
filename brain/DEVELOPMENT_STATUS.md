# Development Status

Last verified: **2026-10-31**. Update this file after every meaningful change. Only record what was verified.

## Verification performed at last audit

| Check | Result |
|---|---|
| `cd frontend && npx tsc --noEmit` | Pass |
| `cd frontend && npm run lint` | Pass (no output) |
| `cd frontend && npm run build` | Pass (all routes prerendered, dynamic routes with `generateStaticParams`) |
| `cd frontend && npm test` (Vitest) | Pass: 27 tests in 9 files, including dashboard discovery filtering, keyboard selection and learning-resource disclosure |
| `cd frontend && npm run test:e2e` (Playwright, Chromium, against `next start`) | Pass: 44 tests, including dashboard discovery filtering and learning-resource disclosure; every route loads without console errors, navigation, theme, shell, assistant, documents, comparison, rights, plans, knowledge, evidence graph, legal aid, settings, search, notifications, saved, no horizontal overflow at 390/820/1280 px |
| Visual check | Screenshots of dashboard (light, dark, mobile), document workspace, assistant, plan, evidence graph, settings, legal aid, tablet documents were inspected |
| Not done | Real-device testing, screen-reader testing, automated accessibility audit (axe), Firefox/Safari, performance profiling |
| Backend start (`uvicorn app.main:app`) | Starts; `/api/v1/health` returns `degraded` because no PostgreSQL is running |
| Backend tests (`python -m pytest`) | Pass: 15 passed, 1 skipped (needs `TEST_DATABASE_URL`). Includes the assistant parser, SSE endpoint with a fake provider, validation and the unconfigured-provider path |
| Live assistant (2026-10-31) | A real question from the browser to `POST /api/v1/assistant/answers` streamed a `z-ai/glm-5.3-flash` answer back; the UI showed the "AI-generated · not verified" badge; no console errors. First words take 45 to 60 s, total about 55 to 70 s |
| Frontend tests after the backend change | Vitest 24/24, `tsc`, `lint` pass. Playwright was not re-run after the HTTP service was added (it uses mocks) |

## Demo and bug-fix pass (2026-10-31)

- Browser demo with Playwright (Chromium, dev server in live mode): all 15 routes in light and dark, theme toggle, sidebar collapse, search, notifications, jurisdiction and language menus, rights search and detail, document upload and viewer, comparison, action plan checklist, evidence graph, legal aid, knowledge, settings, help, 404, mobile drawer, and a live assistant answer.
- Fixed: `frontend/package.json` had `--webpack` on `dev` and `build`, which rendered every page unstyled because Tailwind is wired through the Turbopack rule only (KNOWN_ISSUES #45). Scripts are back to the default; the `typecheck` script stays.
- Fixed: a question sent while the conversation list was still loading disappeared, because the late `load()` overwrote the store. `load` now shares one in-flight promise and `send`/`startNew` wait for it. Regression test added in `chat-store.test.ts` (fails without the fix).
- Fixed: the rights coverage notice showed raw backticks (`` `documents` ``); the wording is now plain text.
- Verified after the fixes: `tsc` and `lint` pass; Vitest 28/28; `npm run build` (Turbopack) passes; Playwright 44/44; backend `pytest` 26 passed, 1 skipped.
- Observed, not fixed: a live answer took about 120 s to finish (upstream latency, KNOWN_ISSUES #34). The first attempt hit the 120 s upstream read timeout and the backend retried.

## Completed (frontend, all on mock services)

- Application shell: collapsible sidebar with tooltips and keyboard toggle, mobile drawer, topbar with breadcrumbs, search trigger, jurisdiction and language menus, notifications popover, theme toggle, account menu, shortcuts dialog.
- Theme system (light, dark, system), persisted, no flash; design tokens and typography; reduced-motion, text-size and density preferences applied to the document.
- Dashboard with category-filtered featured topics and expandable sample learning resources; AI assistant (streaming sample answers, structured answer sections, copy, regenerate, feedback, follow-ups, conversation list with rename, delete and context menu); conversations page.
- Documents: upload with validation and progress, library with search and filters, viewer with page navigation, zoom, in-document search and clause highlighting, analysis panel, scan animation, document comparison with word-level diff.
- Rights Explorer with search, category and country filters and topic detail pages; Action plans with timeline, notes, checklist, creation form and persistence.
- Legal Knowledge library and source detail pages; Evidence graph (React Flow) with selection, search, related highlighting and details panel.
- Legal Aid Finder with real organisations whose websites were checked on 2026-10-31.
- Settings (appearance, language, jurisdiction, privacy, accessibility, export and delete of local data), global search, saved resources, help page.
- Typed service layer with mock implementations (see FRONTEND_ARCHITECTURE).
- Backend package skeleton and `core`: `Settings`, structured logging with redaction, exception hierarchy (unchanged, untested).
- This project intelligence system (`CLAUDE.md`, `.claude/`, `brain/`, `docs/`).

## Rights catalogue (verified 2026-10-31)

- `python -m scripts.ingest_constitution` produced 24 rights, 29 provisions, 37 jurisdictions, 6 categories; all automated checks passed (all Part III articles found, commencement date read from Article 394, every State and UT name found in the First Schedule). Corpus is committed under `backend/data/corpus/india`; the raw PDF is cached in git-ignored `backend/storage/raw/`.
- Backend: `python -m pytest` 26 passed, 1 skipped, including parser tests on fictional text, API tests on a fictional corpus, and integrity checks on the real corpus (provenance, hash, no authored plain-language text, coverage never `complete`).
- Frontend: tsc, lint and build pass; Vitest 24/24; Playwright 43/43 (mock mode). In live mode the explorer, search, a facet and a detail page were exercised in a real browser with no console errors.
- Scope is Part III only. Coverage of everything else is Missing. No record is human-verified.

## Local run (verified 2026-10-31)

- Backend: `cd backend && source .venv/bin/activate && uvicorn app.main:app --port 8000`. Needs `backend/.env` (copy `.env.example`; set `NVIDIA_API_KEY`, `NVIDIA_CHAT_MODEL=z-ai/glm-5.3-flash`, `NVIDIA_TIMEOUT_SECONDS=120`, a `JWT_SECRET`, and `CORS_ORIGINS` containing the frontend origin).
- Frontend: `frontend/.env.development.local` contains `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`; then `npm run dev`. Without that variable the frontend uses its mock services (builds and tests do this).
- Only the assistant answer is live. Every other module, and conversation storage, is still mock or browser-local. No database is needed or used.

## In progress

Nothing recorded.

## Remaining (high level, see ROADMAP)

1. Create the FastAPI app, exception handlers, middleware, `/health`.
2. DB models, Alembic setup, pgvector extension migration.
3. Ratify contracts (including the structured answer extension) and replace mock services with HTTP/SSE clients.
4. Legal data model, source registry, first jurisdiction. Replace every fictional fixture with verified content.
5. NVIDIA provider, embeddings, ingestion, hybrid retrieval, citation verification.
6. Real document extraction and analysis (uploaded files are currently not read).
7. Auth, rate limiting, retention jobs (privacy settings are saved preferences only).
8. Backend test suites and CI; landing page as a separate project.

## Git state

Branch `main`, remote `origin` = `wtorque/Legal_rights_awareness_assistant`. `backend/`, `frontend/`, `landingg/`, `brain/`, `docs/` are untracked (never committed). Root has no `.gitignore`.
