# Data Contracts

**Status: Proposed, except the error envelope (Implemented in `backend/app/core/exceptions.py`).** The frontend and backend must never independently invent incompatible formats. Ratify (ADR) before implementing; then update this file to match the code. Wire format: JSON, `snake_case`, timestamps ISO 8601 UTC.

Pydantic and TypeScript sketches are shown side by side. Fictional placeholders only; never put real citations in examples.

## Conventions

- IDs are opaque strings (UUID). Enums are lowercase strings. Optional = may be absent or `null` as stated.
- Unknown response fields must be ignored by the client. Unknown request fields are rejected by the server on write models.

## Error envelope (Implemented)

```python
# backend: rendered by the exception handler (handler Missing)
{"error": {"code": str, "message": str, "details": list | None, "request_id": str | None}}
```
```ts
interface ApiErrorBody { error: { code: string; message: string; details: unknown[] | null; request_id: string | null } }
```
Validation `details` items: `{ field: string; message: string }`.
Codes: `bad_request`, `unauthorized`, `forbidden`, `not_found`, `conflict`, `payload_too_large`, `validation_error`, `unsupported_jurisdiction`, `rate_limited`, `internal_error`, `upstream_unavailable`.

## Shared models (Proposed)

```python
class Source(BaseModel):          # a verified citeable section
    section_id: str
    document_title: str
    section_label: str             # e.g. "12(3)"
    jurisdiction_code: str
    quote: str                     # exact text from the section
    source_url: str | None
    verified_at: datetime          # date the source was verified
    language: str                  # BCP 47
```
```ts
interface Source { section_id: string; document_title: string; section_label: string; jurisdiction_code: string;
  quote: string; source_url: string | null; verified_at: string; language: string }
```

```python
class AnswerRequest(BaseModel):
    question: str                  # length-limited
    jurisdiction_code: str
    language: str                  # BCP 47, answer language
    conversation_id: str | None = None

class Answer(BaseModel):
    message_id: str
    conversation_id: str
    status: Literal["answered", "refused", "needs_clarification"]
    text: str
    sources: list[Source]          # verified only
    refusal_reason: Literal["unsupported_jurisdiction", "insufficient_evidence", "out_of_scope"] | None
    disclaimer_key: str            # client maps to siteConfig.disclaimer text
```

Other models to define here before building their endpoints: `Jurisdiction` (code, name, parent, coverage_status, last_verified_at), `RightsTopic`, `DocumentUpload`/`DocumentStatus`, `DocumentAnalysis`/`Clause`, `ActionPlan`/`ActionStep`, `UserPreferences`.

## Frontend adaptation and proposed extensions (Proposed)

The frontend keeps its own camelCase UI types in `frontend/src/types/` and maps wire models to them inside each service, so UI code does not depend on the wire format. Today every service is a mock and no mapping code exists.

- `Source` (verified-only, snake_case) maps to the UI `SourceReference`, which adds `origin: "sample" | "verified"` so fixtures are never shown as verified.
- **Structured answer (needs ratification, ADR-018).** The assistant UI renders `simpleExplanation`, `provisions[]`, `rights[]`, `nextSteps[]`, `limitations[]`, `sources[]` and `followUps[]` in addition to the fields of `Answer`. The backend must either return these or the UI must parse them from `text`. Next-step items are suggestions and must never be presented as legal requirements.
- `status: "refused" | "needs_clarification"` exists in the type; the UI has no refusal screen yet.
- Streaming events used by the UI: `delta`, `final`, `error` (a subset of the proposed SSE table). `meta`, `sources` and `retract` are not consumed yet.
- Models with no contract yet: conversation, document analysis (clauses with neutral flags `attention | ambiguous | obligation | missing`), document comparison, rights topic, action plan, knowledge source, evidence graph, legal aid organisation, search result. Define them here before building their endpoints.

## Implemented locally: assistant answer endpoint (Proposed contract)

`POST /api/v1/assistant/answers` (SSE). Request (`backend/app/schemas/assistant.py`, unknown fields rejected): `question` (1 to 2000 chars), `jurisdiction_code`, `region_code?`, `language`, `conversation_id?`, `history[]` of up to 8 `{role, content}` turns (each at most 4000 chars). `region_code` and `history` are additions to the table above and need ratification.

Events: `meta {message_id, conversation_id}`, `delta {text}` (explanation only), `final` (`Answer` plus `structured {simple_explanation, next_steps[{title, detail}], limitations[], follow_ups[], provisions[]}` and `generated_by: "ai"`), `error {error: {code, message, details, request_id}}`. `sources` is always empty today. The frontend adapter is `frontend/src/services/http/chat.http.ts`.

## Implemented locally: rights catalogue API (Proposed contract)

All GET, snake_case, under `/api/v1/catalogue`. Models: `backend/app/legal/catalogue/schemas.py` and `backend/app/schemas/catalogue.py`. Frontend adapter: `frontend/src/services/http/catalogue.http.ts` (keys converted to camelCase; note that dictionary keys such as `machine_extracted` are converted too). UI types: `frontend/src/types/catalogue.ts`.

- `GET /rights?q&domain&category&kind&jurisdiction&verification&status&limit(1-100)&offset` returns `{items: RightSummary[], total, next_offset | null, facets}`. Facet counts apply every filter except the facet's own. There is no maximum catalogue size.
- `GET /rights/{id}` returns `RightDetail`: the right, domain, category, jurisdiction, document, source, provisions (verbatim text and amendment footnotes), authorities, remedies, related rights, `kind_explanation` and `caveats`. Unknown id: 404 with the error envelope.
- `GET /coverage` returns counts, verification and kind breakdown, indexed documents, every jurisdiction with indexed document and right counts, and the audit reports. `complete` is always `false` and `audit_status` is `not_started` until an audit exists.
- Every record has `provenance {source_id, source_url, retrieved_at, content_sha256, locator}` and `verification {status, checked_by, checked_at, notes, needs_review}`.

## Authentication headers

`Authorization: Bearer <access_token>`. Optional `X-Request-ID` from the client (generated otherwise). Language via explicit body field, plus `Accept-Language` as a hint only.

## Streaming contract (SSE, Proposed)

`POST /api/v1/assistant/answers` with `Accept: text/event-stream`. Events:

| `event` | `data` | Meaning |
|---|---|---|
| `meta` | `{message_id, conversation_id}` | First event |
| `delta` | `{text}` | Append-only text chunk |
| `sources` | `{sources: Source[]}` | Verified sources (final) |
| `retract` | `{reason}` | Streamed text failed verification; client replaces with the final text |
| `final` | `Answer` | Authoritative final result; client renders this |
| `error` | `ApiErrorBody` | Terminal failure |

`final` (or `error`) always ends the stream. Clients render `delta` progressively but treat `final` as truth.

## File upload contract (Proposed)

**Implemented (ADR-023), differs from the proposal below.** `POST /api/v1/documents/upload` — `multipart/form-data`: `file` (PDF), `category` (`housing|employment|consumer|financial|other`). Response 201 `DocumentRecord` (`id, name, category, pages, size_bytes, uploaded_at, status, origin, analyzed, detected_type, needs_ocr, warnings, failure_reason, history[]`). Processing is synchronous, so `status` is `ready` on return. `POST /documents/{id}/analysis` returns `DocumentAnalysis` (`summary, document_type, clauses[], obligations, missing_information, key_dates, lawyer_questions, legal_references[{text,page,verified:false}], origin:"extracted", generated_by:"rules"`). `Clause.simplified` is nullable. Python: `app/schemas/documents.py`; TypeScript: `types/documents.ts`. Earlier proposal, not built:
```ts
interface DocumentUpload { id: string; status: "queued" | "processing" | "ready" | "failed"; filename: string; size_bytes: number; expires_at: string }
```
Poll `GET /api/v1/documents/{id}`. Errors: `payload_too_large` (413), `bad_request` for unsupported type.

## Pagination (Proposed)

```ts
interface Page<T> { items: T[]; next_cursor: string | null }   // request: ?limit=&cursor=
```

## API versioning

URL prefix `/api/v1`. See `docs/backend/API_REFERENCE.md`.

## Change process

1. Edit this file and `brain/API_CONTRACTS.md`.
2. Update the Pydantic schema and the TypeScript type in the same change; add/refresh a shared example fixture.
3. Add an ADR for any breaking change.
