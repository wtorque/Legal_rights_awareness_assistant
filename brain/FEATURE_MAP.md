# Feature Map

Status per [BRAIN](BRAIN.md) vocabulary. Verified 2026-10-31: `tsc`, `lint`, `build`, 27 Vitest tests and 44 Playwright tests pass in `frontend/`. **"Implemented (mock)" means the UI works end to end against mock services with fictional fixture data; no backend, AI or real legal content exists.** Nothing here is Implemented against real data.

## 1. AI Legal Assistant — `/assistant`, `/conversations`

| Feature | Status |
|---|---|
| Chat UI with streaming render, typing indicator, stop | Implemented (mock) |
| Structured answer (explanation, provisions, rights, next steps, limitations, sources) | Implemented (mock); backend contract Proposed |
| Copy, regenerate, feedback, follow-up questions | Implemented (mock) |
| Conversation list: group by date, search, rename, delete, context menu | Implemented (mock, stored in browser) |
| Language selection (7 languages) | Implemented in UI; sample answers exist only for English, Hindi and Telugu |
| Jurisdiction selection | Implemented in UI |
| Backend answer endpoint (SSE) and NVIDIA GLM client | Partial: works locally with `z-ai/glm-5.3-flash`; no retrieval, no verified sources, no citation verification, no rate limiting, no persistence |
| Refusal / needs-clarification UX | Partial (type exists, no refusal flow rendered) |

## 2. Rights Catalogue — `/rights`

| Feature | Status |
|---|---|
| Catalogue data model (rights, provisions, documents, jurisdictions, authorities, remedies, sources, provenance, verification) | Implemented |
| Corpus: Constitution of India Part III (24 rights) | Implemented (machine-extracted, not human-verified) |
| API: search, facets, pagination, detail, coverage | Implemented (JSONL-backed, no database) |
| Explorer UI rendered from the API: search, facets from data, load more, coverage panel | Implemented; no fixed card count |
| Right detail page: official wording, kind, document, amendment notes, remedy, provenance, caveats | Implemented |
| Plain-language explanations | Missing (shown as not yet written) |
| Central Acts, State Acts, rules, notifications, judgments, welfare entitlements | Missing |
| State and UT coverage (36 jurisdictions) | Missing (0 indexed) |
| Coverage audit | Missing (audit status `not_started`) |
| Offline mode (no backend) | Fictional sample catalogue, labelled |

## 3. Document Intelligence — `/documents`

| Feature | Status |
|---|---|
| Upload (PDF only, 10 MB, progress), library, search, filters, delete | Implemented (mock); files stay in the browser |
| Viewer: pages, zoom, search, clause highlighting | Implemented for fictional sample documents; uploaded files use the browser's PDF viewer |
| Analysis panel: summary, clauses, obligations, gaps, dates, references, lawyer questions, chart | Implemented (mock). For uploaded files it shows a fixed demonstration and says so |
| Document comparison (added, removed, modified, word diff) | Implemented: samples in mock mode; real uploads in live mode via backend clause matching |
| Real PDF upload, validation, text extraction, storage, delete, retention purge (live mode) | Implemented (file-backed, no auth, no OCR) |
| Rule-based clause labels, dates, quoted citations, gaps (live mode) | Implemented (keyword rules; no AI explanation; citations unverified) |
| Assistant input guard, reply-language resolution (en, hi, te, hinglish), output citation validation | Implemented (pattern based; no live model test) |
| Emergency contacts page with call links | Implemented (static, verified 2026-10-31; no location awareness) |
| OCR for scanned PDFs, AI plain-language clause explanation, verified legal-section linking | Missing |
| Real text extraction, OCR, clause extraction | Missing |
| Retention / deletion job | Missing (preference UI only) |

## 4. Legal Action Blueprint — `/action-plans`

| Feature | Status |
|---|---|
| Overview tabs, progress ring, create plan (validated form), delete | Implemented (mock, stored in browser) |
| Plan detail: timeline with notes, checklist (add, remove, persist), authorities, dates | Implemented (mock); every date is marked unverified |
| Plan generation (`action_engine`) | Missing (new plans copy a generic template) |

## 5. Legal Sources and Evidence — `/knowledge`, `/evidence`

| Feature | Status |
|---|---|
| Source library with search and filters; detail page with metadata | Implemented (mock); all sources fictional, never verified |
| Source card with sample / verified labelling | Implemented |
| Evidence graph: selection, details, search, related highlight, fit, zoom | Implemented (mock graph) |
| Source registry, citation verification, ingestion | Missing |

## 6. Jurisdiction Intelligence

| Feature | Status |
|---|---|
| `UnsupportedJurisdiction` error class | Implemented (code only) |
| Jurisdiction model, hierarchy, coverage registry | Missing |
| Jurisdiction-aware retrieval | Missing |

## 7. Settings, search, notifications — `/settings`, `/help`, `/saved`, `/legal-aid`

| Feature | Status |
|---|---|
| Light/dark/system theme, persisted, no flash | Implemented (browser-tested) |
| Response and interface language, default jurisdiction | Implemented as saved preferences; interface text is English only |
| Reduced motion, text size, compact layout | Implemented (applied to the document) |
| Retention preferences | Partial: saved, not enforced (no backend) |
| Export and delete local data | Implemented |
| Global search overlay (Ctrl/⌘ K, grouped, keyboard nav, recents) | Implemented (mock services) |
| Notifications popover | Implemented with sample notifications |
| Saved resources | Implemented (local) |
| Legal Aid Finder | Implemented; 7 real organisations, contact details limited to what was found on their sites |
| Help page | Implemented |
| Account / auth | Missing |

## Platform foundation

| Feature | Status |
|---|---|
| Application shell, sidebar, mobile drawer, topbar, skip link | Implemented |
| Design tokens (light + dark), typography, surfaces | Implemented |
| Reveal / page-transition / GSAP (scan animation) / Framer plumbing | Implemented |
| Dashboard knowledge discovery: filter sample topics by category and expand learning resources | Implemented (mock) |
| Frontend service layer (typed interfaces + mock implementations) | Implemented (mock only) |
| Landing page | Out of scope here; separate project |
| Backend settings, logging, error classes | Implemented (untested) |
| FastAPI app, routing, middleware | Missing |
| DB models, migrations | Missing |
| Auth | Missing |
| Rate limiting | Missing (settings only) |
| Test suites | Frontend: Vitest + Playwright Implemented. Backend: Missing |
| CI | Missing |
