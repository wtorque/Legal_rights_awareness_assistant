# Tech Stack

Versions below come from `frontend/package.json`, `backend/requirements*.txt` and the installed `backend/.venv` (audited 2026-10-31). Backend requirements are lower-bounded (`>=`), not pinned, and there is no lock file.

## Frontend

| Tech | Version | Status | Role / notes |
|---|---|---|---|
| Next.js | 16.4.3 | In use | App Router. `cacheComponents` and `partialPrefetching` enabled in `next.config.ts`. **Not the Next you know**: read `frontend/node_modules/next/dist/docs/` before coding (see `frontend/AGENTS.md`) |
| React / React DOM | 19.3.0 | In use | |
| TypeScript | ^5 | In use | `strict: true`, alias `@/*` → `src/*` |
| Tailwind CSS | 4.3.3 | In use | CSS-first config in `globals.css` (`@theme inline`, `@utility`). Loaded through `@tailwindcss/turbopack` rule in `next.config.ts` |
| shadcn (CLI) | ^4.23.0 | Configured | `components.json` only. `ui/` components are hand-written; review CLI output before adding (ADR-014) |
| `@radix-ui/react-slot`, `-dialog`, `-dropdown-menu`, `-context-menu`, `-popover`, `-tooltip`, `-tabs`, `-switch` | see package.json | In use | Primitives wrapped in `components/ui` |
| `@headlessui/react` | ^2.2.10 | In use | Mobile drawer, FAQ accordion |
| `cmdk` | see package.json | In use | Global search command list |
| `sonner` | see package.json | In use | Toasts |
| `class-variance-authority`, `clsx`, `tailwind-merge` | see package.json | In use | Variants and `cn()` |
| `tw-animate-css` | ^1.4.0 | In use | Open/close animations on overlays |
| `framer-motion` | ^14.9.0 | In use | Reveal, page transition, sidebar width, nav indicator, stat counters, chat messages |
| `gsap` (+ScrollTrigger) | ^3.15.0 | In use | Document scan sequence (`hooks/use-gsap.ts`) |
| `lucide-react` | ^1.65.0 | In use | Icons |
| `zustand` | ^5.0.16 | In use | Theme, preferences, UI, chat, documents, plans, saved, notifications |
| `react-hook-form`, `zod`, `@hookform/resolvers` | see package.json | In use | New action plan form |
| `react-dropzone` | see package.json | In use | Document upload |
| `recharts` | see package.json | In use | Clause label chart |
| `@xyflow/react` | see package.json | In use | Evidence graph (React Flow) |
| `shadcn/tailwind.css` import | n/a | In use | Imported by globals.css |
| PDF.js / React PDF viewer | n/a | Not used | Uploaded PDFs preview in the native viewer (KNOWN_ISSUES #22) |
| Lenis | n/a | Removed | Not used in the application (ADR-013); still in `landingg/` |
| 21st.dev components | n/a | Not present | Copy-in registry; none imported |
| React Bits | n/a | Not present | Copy-in components; none imported |
| ESLint | ^9 + `eslint-config-next` 16.4.3 | In use | `npm run lint` passes |
| Vitest, jsdom, Testing Library | vitest ^5 | In use (dev) | `npm test`; `@types/node` ^24 required (ADR-017) |
| Playwright | see package.json | In use (dev) | `npm run test:e2e`, Chromium |

Fonts (next/font/google): Geist (sans), Geist Mono, Instrument Serif (display).

## Backend

| Tech | Installed | Status | Role / notes |
|---|---|---|---|
| Python | 3.14.7 (venv) | In use | |
| FastAPI | 0.162.0 | Installed | No app object yet |
| Uvicorn | 0.54.0 | Installed | |
| Pydantic / pydantic-settings | 2.14.2 / 2.16.2 | In use | `core/config.py` |
| SQLAlchemy (asyncio) | 2.1.6 | Installed | No models yet |
| Alembic | 1.20.1 | Installed | `migrations/versions/` empty, no `alembic.ini` / `env.py` |
| asyncpg and psycopg[binary] | 0.32.0 / 3.3.6 | Installed | Two drivers listed; `DATABASE_URL` uses asyncpg. Decide the role of psycopg (see KNOWN_ISSUES) |
| pgvector | 0.5.1 | Installed | Requires the Postgres extension |
| Redis client | 8.1.0 | Installed | Optional; empty `REDIS_URL` = in-memory rate limiting |
| httpx | 0.28.1 | Installed | NVIDIA client transport |
| argon2-cffi, PyJWT | 25.1.0 / 2.15.1 | Installed | Password hashing, tokens. No auth code yet |
| PyMuPDF (+layout, pymupdf4llm) | 2.0 | Installed | PDF extraction |
| python-docx | 1.2.0 | Installed | DOCX extraction |
| structlog | 26.1.0 | In use | `core/logging.py` |
| pytest, pytest-asyncio | 9.2.0 / 1.4.1 | Installed | No tests exist |
| OCR engine | n/a | **Missing** | Not in requirements |
| Linter/formatter/type checker (ruff, mypy) | n/a | **Missing** | |

## AI

| Piece | Status |
|---|---|
| NVIDIA API (`https://integrate.api.nvidia.com/v1`) | Configured in `.env.example` only. No client code |
| GLM chat model | **Unknown**: `NVIDIA_CHAT_MODEL` is intentionally blank. Do not guess an id |
| Multilingual embedding model | **Unknown**: `NVIDIA_EMBEDDING_MODEL` blank. `EMBEDDING_DIM=1024` must match the chosen model; changing it needs a migration |

## Selection rationale

Recorded as ADRs in [DECISIONS](DECISIONS.md). Add a dependency only if an ADR or a task justifies it. Check this table first: the capability may already be installed.
