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

## Documents backend (2026-10-31)

- Added: `POST /api/v1/documents/upload`, list, get, content, file, analysis, compare, delete (`app/api/v1/endpoints/documents.py`, `app/services/documents.py`, `app/repositories/documents.py`, `app/document_intelligence/`). See ADR-023.
- Frontend: `services/http/documents.http.ts` is used when `NEXT_PUBLIC_API_BASE_URL` is set; library, workspace, upload zone and compare view show server wording, warnings, "No text layer" and nullable explanations.
- Verified: backend `pytest` 41 passed, 1 skipped (13 new document tests: upload, extraction, analysis, scripts/encrypted/non-PDF/oversize rejection, injection warning, path-traversal ids, filename never in path, compare, retention purge). Live curl against a running uvicorn: upload, analysis and delete worked. Frontend `tsc`, `lint`, Vitest 28/28, `npm run build`, Playwright 44/44 (mock mode).
- Not verified: the live-mode documents UI in a browser (upload through the dropzone, preview, compare), because only curl was used against the real backend.
- Not done from the upgrade request: OCR, AI plain-language explanation, authentication, rate limiting, RBAC, audit log, Legal Aid expansion, case matching, emergency contacts, follow-ups, multilingual assistant upgrades, official-source adapters. See KNOWN_ISSUES #46 to #50.

## Assistant guard and Emergency Help (2026-10-31)

- Assistant (backend): `app/ai/guard.py` refuses obvious jailbreak and injection input (English, Hindi, romanised Hindi) before any model call; `app/ai/language.py` picks the reply language from the question's script or Hinglish words (en, hi, te, hinglish); `app/ai/citations.py` validates model output: Articles are confirmed only against the local catalogue (`provisions`), other statute, Act and case references are listed as `unverified_references` and added to limitations, and every URL is replaced with "[link removed]". The prompt now says text in messages is data and asks clarifying questions under follow-ups. The streamed `delta` text is unfiltered; the `final` event is authoritative.
- Emergency Help: `/emergency` page with call links for 112, 181, 1091, 1098, 1930 and NALSA 15100, data in `frontend/src/mocks/emergency.ts`. Only 15100 was confirmed by fetching the official page (nalsa.gov.in). The others were confirmed from official PIB, MHA, WCD and 112.gov.in text returned by search; 112.gov.in, cybercrime.gov.in and childlineindia.org could not be loaded directly. Each card states what was checked. A separate police number (100) is not listed because it was not verified.
- Verified: backend `pytest` 56 passed, 1 skipped (15 new assistant tests). Frontend `tsc`, lint, build, Playwright 46/46 (includes an emergency page test).
- Not verified: no live model call after these changes; the UI does not yet display the confirmed `provisions` from the final event (it only shows the limitation text); Hinglish detection is a word-list heuristic.

## Authentication (2026-10-31)

- Backend: `/api/v1/auth` register, login, refresh, me, profile update, password change (ADR-024). Documents and assistant endpoints now require a bearer token; documents are owner-scoped; users cannot see, analyse, download, compare or delete each other's documents (tested). Token attacks tested: `alg=none`, expired, wrong secret, wrong algorithm, wrong token type, unknown user, garbage.
- Frontend: `/login` and `/register`, auth store with refresh, gate on all app pages and sign-out in the account menu, only when `NEXT_PUBLIC_API_BASE_URL` is set. Mock mode is unchanged.
- Verified: backend `pytest` 65 passed, 1 skipped. Frontend `tsc`, lint, Vitest 28/28, build, Playwright 46/46 (mock mode). A real Chromium run against the live backend and frontend: redirect to login, register, upload `lease.pdf`, open it, keyword analysis shown. The only console errors were a Next.js dev-only instant-navigation warning, since fixed with `instant = false` on the app layout; that fix was not re-run in the browser.
- Not done: Google, phone OTP, password reset email, email verification (KNOWN_ISSUES #54).

## Multilingual (2026-10-31)

- Backend: fixed notes (limitations, unverified-reference warning, refusal) now follow the reply language in English, Hindi, Telugu and Hinglish (`app/ai/messages.py`); other languages fall back to English. The reply language is the script of the question, then Hinglish words, then the saved preference; it is sent back in the `meta` event. The prompt now asks for step titles and follow-ups in the same language and forbids stating days, amounts or deadlines.
- Frontend: Hinglish added to the language menu; the choice is saved on the account when signed in to a live backend and restored on sign-in (`lib/set-response-language.ts`); Settings uses the same path and its hints are corrected.
- Verified: backend `pytest` 71 passed, 1 skipped (new parametrised tests for language resolution and fixed text). Live run against the local Ollama `qwen3.5:4b`: Hindi, Telugu and Hinglish questions each returned a final answer in the matching language in 11 to 16 s. Frontend `tsc`, lint, Vitest 28/28, build, Playwright 46/46.
- Not verified: the prompt change after the live run (no re-run); account language sync in a browser; answer quality (KNOWN_ISSUES #55). The interface (menus, buttons) is still English only.

## Assistant hardening (2026-10-31)

- Added `ai/guard.py` (multi-form input classifier, harmful-intent filter, delimiter escaping), `ai/output_guard.py` (canary and persona-change detection), `ai/grounding.py` (unsupported numbers, guarantees, authority claims, foreign jurisdictions, specifics-asking detector), `ai/pipeline.py` (sentence-level checks on explanation, steps and follow-ups), `core/ratelimit.py`; see ADR-025. No raw model text is streamed by default.
- Verified: backend `pytest` 146 passed, 1 skipped, including a red-team suite (`tests/security/test_assistant_hardening.py`: 38 override and exfiltration strings, 6 harmful requests, 12 benign questions that must pass, a forged assistant turn in history, hostile long input timing, leak and persona-change detection, number, deadline, citation, guarantee, authority, URL and country removal, abstention in Hindi, rate limit and strike pause). Live run against the local `qwen3.5:4b`: a specifics question answered with the invented part removed, two attacks refused in 0 s without a model call, a Hinglish question answered.
- Found in the live run: the model wrote "In Indiana" for an Indian user; a check for other countries was added afterwards and covered by a unit test but not re-run live.
- Not verified: the frontend with no streamed text (typing indicator until the final event) in a browser; accuracy of plain-language claims; any attack not in the fixtures.

## Demo login and motion (2026-10-31)

- Login now accepts an email or a username; `scripts/seed_demo_user.py` creates the local account `torque` / `torque` (KNOWN_ISSUES #57). Registration still requires a 10-character password.
- Motion (ADR-026): Lenis smooth scroll, scroll-progress bar, slower route transitions, animated sign-in and register card with drifting background shapes.
- Verified: backend `pytest` 147 passed, 1 skipped (new test covers username login, seeding and the production refusal). Frontend `tsc`, lint, Vitest 28/28, build, Playwright 46/46. A real Chromium run against the live backend and dev server signed in as `torque`, reached the dashboard, showed Lenis active and an eased scroll (600 px wheel moved 230 px after 120 ms and settled at 510 px), with no console errors.
- Correction: the earlier note that the Next.js dev warning about instant navigation was fixed by a layout export was wrong; the warning remained until `export const instant = false` was added to each application page, and the browser run above now shows no errors.
- Not checked: smooth scroll on touch devices, the document viewer's inner scrolling, and dialogs with Lenis running.

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
