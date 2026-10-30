# Known Issues and Technical Debt

Found during the 2026-10-31 audit and the frontend build that followed. Severity: **H** blocks progress or risks users, **M** should fix soon, **L** housekeeping. Remove an entry when fixed and note it in DEVELOPMENT_STATUS.

| # | Sev | Area | Issue |
|---|---|---|---|
| 1 | H | Backend | No FastAPI app: `backend/app` has no `main.py`/app factory, so nothing can run, and the error envelope has no handler wired |
| 2 | H | Backend | No tests exist (`tests/` dirs empty); no pytest config; security-sensitive `core/` code is unverified |
| 3 | H | AI | `NVIDIA_CHAT_MODEL` / `NVIDIA_EMBEDDING_MODEL` unset; GLM model id and embedding dimension are unconfirmed |
| 4 | H | Legal | No jurisdiction chosen and no legal sources; nothing can be answered truthfully yet |
| 5 | M | Repo | `backend/` and `frontend/` are untracked in git; the repo has only the initial commits. Commit them (with review) |
| 6 | M | Repo | No root `.gitignore`; root contains `ps photo.png` (≈190 KB binary, purpose unknown) |
| 7 | M | Repo | Root `README.md` is two lines ("Hacktober fest"); no setup instructions. `frontend/README.md` is the create-next-app default |
| 11 | M | Frontend | `themeInitScript` duplicates `apply()` logic by hand; drift would cause theme flash |
| 13 | M | Backend | `requirements.txt` uses `>=` only, no lock; installed set (Python 3.14.7, SQLAlchemy 2.1.6, etc.) is very recent. Pin and lock before CI |
| 14 | M | Backend | Both `asyncpg` and `psycopg[binary]` are required; role of psycopg (Alembic sync URL?) undecided |
| 15 | M | Backend | No OCR dependency despite OCR being a planned feature; no ruff/mypy |
| 16 | M | Backend | Rate limiting falls back to per-process memory when `REDIS_URL` is empty (documented in `.env.example`); unsafe with multiple workers |
| 17 | L | Repo | `landing/` and `claude/` are empty directories with no stated purpose |
| 18 | L | Naming | Product is "Aequa" in UI, "Legal Rights Awareness API" in backend settings, "Legal_rights_awareness_assistant" in git. Align naming |
| 20 | L | Docs | `frontend/AGENTS.md` is auto-managed by `next dev`; do not delete or edit its marked block |

- Whether the theme toggle, mobile menu, Lenis behaviour and animations work in a real browser.
- Behaviour on Python 3.14 of all pinned-by-need libraries (PyMuPDF 2.0, asyncpg 0.32) under load.
| 21 | H | Legal | Every legal provision, document, source, topic and plan in the frontend is fictional. Nothing may be shipped as real until replaced by verified content (ADR-016) |
| 22 | H | Frontend | Uploaded documents are not read: the analysis for a user file is a fixed demonstration. Preview uses the browser's native PDF viewer, not PDF.js |
| 23 | M | Contracts | The structured answer and several UI models (conversation, plan, knowledge, graph) have no ratified backend contract (ADR-018) |
| 24 | M | Frontend | `package.json` has no `typecheck` script; Playwright suite needs a prior `npm run build` and fixed port 4310 |
| 25 | M | Frontend | Accessibility has not been audited with automated tooling (axe) or a screen reader; keyboard paths were exercised in a few Playwright tests only |
| 26 | M | Frontend | Interface language is English only; the setting is stored but unused. Sample answers exist only in English, Hindi and Telugu. Telugu and Hindi sample text was not reviewed by a speaker |
| 27 | M | Frontend | Mock data is stored in `localStorage` with no migration for shape changes; clear the keys in Settings → Delete local data if a fixture changes |
| 28 | L | Frontend | Stopping a streaming answer keeps the partial text in the UI but the mock service does not persist it, so it disappears on reload |
| 29 | L | Frontend | At widths under 640 px the topbar has no room for the breadcrumb; the page heading still identifies the page |
| 30 | L | Repo | `landingg/` holds the earlier marketing shell with its own `node_modules`; its purpose should be stated or the folder renamed |
| 31 | L | Frontend | Legal Aid entries and official portal links were checked on 2026-10-31 and will go stale; no automated link check exists |
| 32 | H | Security | An NVIDIA API key was pasted into a chat session on 2026-10-31 and is stored in `backend/.env` (git-ignored). Treat it as exposed: rotate it, then update `.env` |
| 33 | H | AI | Live answers have no verified sources: the prompt forbids citing statutes and the endpoint returns empty `sources` and `provisions`. Without RAG the model can still state wrong general information. Output is labelled "AI-generated · not verified" |
| 34 | M | AI | Hosted GLM is slow: first words after 45 to 60 s even with thinking-disable parameters (none had an effect). Reasoning tokens are dropped server-side. Needs a faster model or endpoint before real use |
| 35 | M | Backend | `/assistant/answers` has no rate limiting, no auth and no usage cap; anyone who can reach the port can spend the key. Do not expose it beyond localhost |
| 36 | M | Backend | No PostgreSQL is running; `/health` reports `degraded`. Conversations are stored in the browser only |
| 37 | L | Backend | `pytest` fails with `No module named 'app'` unless run as `python -m pytest` (no `pythonpath` in `pytest.ini`) |
| 38 | H | Legal | The catalogue covers Part III of the Constitution only. "Comprehensive Indian rights database" is the goal; today it is under 1% of the source universe and must never be described as complete. Coverage audit not started |
| 39 | H | Legal | No catalogue record is human-verified. Which articles count as individual rights, their `kind`, and the Article 19(1) sub-right titles are editorial choices awaiting legal review |
| 40 | M | Legal | The source PDF is the May 2022 edition (to the 105th Amendment). Later amendments are not reflected; publisher identity is inferred from the PDF itself, not confirmed on legislative.gov.in |
| 41 | M | Backend | Catalogue is served from JSONL loaded in memory. Fine for thousands of records; needs PostgreSQL full-text and pgvector search before Central, State and UT corpora (ADR-020) |
| 42 | M | Legal | No parsers or source adapters exist for India Code, State government portals or Gazette publications. India Code was not reachable from this machine on 2026-10-31 (HTTP connection failed) |
| 43 | L | Frontend | Dashboard, search suggestions, evidence graph and saved items still link to fictional fixture topics when running in mock mode; in live mode those ids do not exist in the catalogue |
| 44 | L | Backend | ISO 3166-2 style jurisdiction codes (`IN-TG`, ...) were typed from knowledge, not verified against a source |

