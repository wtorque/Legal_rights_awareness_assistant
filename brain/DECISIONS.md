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

