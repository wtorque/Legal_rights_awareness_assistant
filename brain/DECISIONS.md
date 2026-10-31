# Architectural Decisions

Format: ID, status, context, decision, consequences. Status values: **Accepted** (observed in code and intended), **Proposed** (needs ratification before dependence), **Superseded**. Add new records at the bottom. Never edit history; supersede it.

## ADR-001 — Monorepo with `frontend/` and `backend/` — Accepted
Context: one team, tightly coupled contracts. Decision: keep both in one repository, separately built and deployed. Consequence: contract changes can land atomically; root tooling must not assume one language.

## ADR-002 — Single error envelope — Accepted
Decision: all errors return `{"error": {code, message, details, request_id}}` (defined in `core/exceptions.py`). Consequence: the frontend has one error parser; handlers must convert every exception, including framework validation errors, into this shape.

## ADR-003 — Layered backend packages by domain — Accepted
Decision: `api → services → repositories → models`, with domain packages `ai`, `rag`, `legal`, `document_intelligence`, `action_engine`. Consequence: routers hold no business logic; SQL lives only in repositories.

## ADR-004 — Theme applied by inline pre-hydration script — Accepted
Context: avoid flash of wrong theme. Decision: `themeInitScript` in `<head>` sets `dark` class, `data-theme`, `color-scheme` before paint; a Zustand store takes over after hydration. Consequence: script and store `apply()` must stay in sync (comment in `theme-provider.tsx`). Light/dark tokens are CSS variables, never per-component conditionals.

## ADR-005 — Progressive smooth scrolling — Superseded for the application by ADR-013
Decision: Lenis is driven by the GSAP ticker so ScrollTrigger stays in sync, and is skipped for `prefers-reduced-motion`. This applies only to marketing-style pages. The application frontend does not use Lenis (native scrolling); the implementation remains in `landingg/`.

## ADR-006 — Sample data is always labelled — Accepted
Decision: placeholder content carries `MockDataBadge`; `siteConfig.prototypeNotice` states the prototype status. Consequence: unlabelled sample legal text is a defect.

## ADR-007 — Embedding dimension is a deployment constant — Accepted
Decision: `EMBEDDING_DIM` (default 1024) must match the embedding model and the `vector(N)` column. Consequence: changing model or dimension = new migration + full re-embed.

## ADR-008 — Model ids are configuration, not code — Accepted
Decision: `NVIDIA_CHAT_MODEL` and `NVIDIA_EMBEDDING_MODEL` are blank in `.env.example` and read from environment. Consequence: no model id literal in application code; the actual GLM id is Unknown until chosen.

## ADR-009 — RAG-only legal answers with citation verification — Proposed
Decision: the model answers only from retrieved, jurisdiction-filtered text; citations are verified against stored sections; otherwise refuse. Needs: confirmation and an evaluation plan.

## ADR-010 — `/api/v1` prefix and SSE for streaming — Proposed
Decision: URL-versioned REST; answers stream over Server-Sent Events. Needs: confirmation against deployment constraints and the frontend streaming approach.

## ADR-011 — Primitive component layer — Accepted (see ADR-014)
Context: `components.json` is `base-nova` (Base UI), while components used Radix Slot and Headless UI. Resolved by ADR-014; `@base-ui/react` was removed.

## ADR-012 — First supported jurisdiction — Open
Needs a decision: which jurisdiction and which official sources come first. Blocks ingestion, evaluation set and copy.

## ADR-013 — Application shell replaces the marketing shell; landing is separate — Accepted
Context: the product needs a dashboard-style application (sidebar, topbar, nine modules). The first foundation was a marketing-style floating header. Decision: `frontend/` is the application only, with a sidebar shell, native scrolling and no Lenis. The earlier marketing shell was moved by the project owner to `landingg/` and is the seed for a separate landing project. Consequence: no landing page is built in `frontend/`; `/` redirects to `/dashboard`.

## ADR-014 — Radix primitives plus Headless UI; no Base UI — Accepted
Decision: dialogs, menus, popovers, tooltips, tabs, switch and context menu use Radix; the mobile drawer and FAQ accordion use Headless UI; selects are styled native `<select>` elements; the command palette uses `cmdk`. `@base-ui/react` and the Lenis dependency were removed. `components.json` still says `base-nova`; CLI-added components must be reviewed and rethemed. Consequence: one wrapper per primitive in `components/ui`, themed through tokens.

## ADR-015 — Typed service layer with mock implementations — Accepted
Decision: every module calls an interface in `src/services/*.service.ts`; implementations in `src/services/mock/` simulate latency and errors and persist user-created state to `localStorage`. Components never call `fetch`. Consequence: moving to FastAPI means writing HTTP/SSE implementations of the same interfaces and adapting wire types (snake_case) to UI types (camelCase) inside the service.

## ADR-016 — Fixture content is fictional; real organisations only when checked — Accepted
Decision: all legal text, statutes, documents, sources, topics and plans are fictional and labelled with `MockDataBadge`. The Legal Aid Finder lists real organisations, but only those whose websites loaded on 2026-10-31, and only contact details found on those sites (NALSA's helpline number 15100 was found on its homepage). Entries without a verified detail show none. Consequence: adding or changing a real entry requires re-checking and updating `verification` in `mocks/legal-aid.ts`.

## ADR-017 — Frontend test stack: Vitest and Playwright — Accepted
Decision: Vitest + Testing Library (jsdom) for logic, stores, services and small components; Playwright (Chromium) for routes, interactions, theme, responsive overflow. `@types/node` was raised to ^24 because Vitest 5 requires it. Consequence: `npm run test:e2e` needs a production build and uses port 4310.

## ADR-018 — Structured answer sections are a proposed contract extension — Proposed
Context: the assistant UI renders six sections (explanation, provisions, rights, next steps, limitations, sources) plus follow-ups. The ratified-to-be `Answer` contract has only `text` and `sources`. Decision needed: extend `Answer` (see DATA_CONTRACTS "Frontend adaptation") or keep sections in one markdown text field. Until decided, the frontend `StructuredAnswer` type is the working shape.

## ADR-019 — Live assistant over SSE with browser-side conversation storage — Accepted (interim)
Decision: the frontend `chat.service` switches to `httpChatService` when `NEXT_PUBLIC_API_BASE_URL` is set. Answers stream from `POST /api/v1/assistant/answers` as `meta`, `delta`, `final`, `error` events. The backend prompts the model to emit marked sections (explanation, next steps, follow-ups) and parses them; limitations are fixed text; provisions and sources are empty until a verified corpus exists. Conversation CRUD stays in `localStorage` because there is no database. Reasoning tokens from the model are discarded. Chat model id is `z-ai/glm-5.3-flash`, read from `NVIDIA_CHAT_MODEL` (ADR-008). Consequence: answers carry `origin: "ai-unverified"` and are labelled as such; adding RAG later fills `sources` without UI changes.

## ADR-020 — Catalogue served from versioned JSONL corpora behind a repository interface — Accepted (interim)
Context: PostgreSQL is not running locally and the first corpus is small. Decision: the catalogue API reads `data/corpus/<family>/*.jsonl` (validated by Pydantic models with `extra="forbid"`) through `CatalogueRepository`. The service layer only uses that interface, so a SQLAlchemy repository over the existing `legal_*` tables can replace it. Consequence: corpora are reproducible build artefacts produced by scripts; do not edit them by hand. Re-ingestion changes `content_sha256` when the source changes.

## ADR-021 — Rights are derived only from source text; classification is editorial and flagged — Accepted
Decision: a right record exists only if a provision in a registered source supports it; title, quote, locator, dates and amendment notes are extracted, never authored. Choices that are judgements (what counts as an individual right, `kind`, domain names) live in explicit tables in the ingestion code, are stored with a `*_basis` string, and set `needs_review`. `plain_language` stays null until a person writes and reviews it. Consequence: the UI shows the official wording first, says when no explanation exists, and shows `machine_extracted` records as not human-verified. Coverage is computed from the data and the API type forbids `complete: true`.

## ADR-022 — Enforceable rights, constitutional protections, procedural rights and scheme benefits are distinct kinds — Accepted
Decision: `RightKind` has four values, shown as separate badges and filters, with a plain explanation of each. A government scheme benefit must never be rendered as an enforceable right. Consequence: new corpora must set `kind` with a stated basis; the explorer's filter lists only kinds present in the data.


## ADR-023 — Documents are processed by the backend with deterministic rules and stored in files — Accepted (interim)
Context: the documents module ran only in the browser and analysed nothing. PostgreSQL is not running locally, there is no authentication, and OCR (Tesseract) is not installed. Decision: `POST /api/v1/documents/upload` validates the file by content (`%PDF-` header, no scripts or attachments, not encrypted, at most 200 pages), extracts text with PyMuPDF, and stores the original and a JSON record under `storage/documents/<random id>`. Analysis (`POST /documents/{id}/analysis`) is rule-based: clause segmentation, keyword categories, neutral reading-aid labels, dates, citations quoted as written (`verified: false`), and keyword-found gaps. No model reads document text, so a document cannot instruct an AI; instruction-like text is only reported as a warning. `simplified` is null until a reviewed plain-language explanation exists. Documents older than `UPLOAD_RETENTION_DAYS` are deleted at startup. The frontend `documents.service` switches to the HTTP service when `NEXT_PUBLIC_API_BASE_URL` is set. Consequence: ids are unguessable but there is no per-user ownership until authentication exists (KNOWN_ISSUES #46); scanned PDFs are accepted for preview and flagged `needs_ocr` (KNOWN_ISSUES #47). A PostgreSQL repository can replace `DocumentRepository` without touching the service.

## ADR-024 — Email and password accounts with signed bearer tokens, file-backed — Accepted (interim)
Context: no authentication existed and documents were readable by anyone holding an id. Decision: `/api/v1/auth` offers register, login, refresh, `GET/PATCH /me` and password change. Passwords use Argon2; access (15 min) and refresh (14 days) tokens are JWTs with a pinned algorithm, a `typ` claim that is checked, and a secret of at least 32 characters (otherwise auth reports "not configured"). Users live in `storage/users/<id>.json` behind `UserRepository`. Document and assistant endpoints require a valid access token; document queries are scoped by `owner_id` in the repository and report another user's document as not found. Failed logins are limited to 5 per email per 15 minutes (process-local). Google sign-in, phone OTP and email password recovery are not built because they need external providers (OAuth client, SMS gateway, SMTP). Consequence: tokens are kept in browser localStorage by the frontend (KNOWN_ISSUES #53); refresh tokens cannot be revoked until a store with a deny list exists. Mock mode (no `NEXT_PUBLIC_API_BASE_URL`) has no accounts.

## ADR-025 — Assistant safety is enforced by server-side layers, and unchecked model text is never streamed — Accepted
Context: prompt instructions alone cannot stop jailbreaks or hallucination, and streaming raw tokens let unchecked text reach the user before validation. Decision: (1) `ai/guard.py` classifies the question and every history turn, whatever role the client claims, in several canonical forms (case, homoglyph, leetspeak, letter-spacing, ROT13, decoded base64 and hex) and refuses before any model call; a narrow first-person-intent filter refuses help with forgery, evidence destruction, blackmail and evasion. (2) User text is escaped and wrapped in `<user_question>` with the rules restated after it; the system prompt carries a per-request canary. (3) `ai/pipeline.py` checks the reply: a leaked canary or prompt fragment, or a changed persona, blocks the reply; then sentence by sentence it drops URLs, legal references not confirmed in the catalogue, numbers, amounts and deadlines the user did not write, guarantees, claims to be a lawyer, and mentions of other countries. Dropped sentences are never rewritten; if nothing is left the answer abstains and points to NALSA 15100. (4) Raw deltas are off by default (`ASSISTANT_STREAM_UNVERIFIED`); only the checked `final` event is sent. (5) Per-user limits: 20 requests per minute, and 3 refused or blocked requests per 10 minutes pause the user. Consequence: answers are slower to appear (no live typing), some correct sentences with numbers are dropped, and the guard is a pattern list that determined paraphrase can evade (KNOWN_ISSUES #56).
