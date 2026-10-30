# Document Processing

State: **Missing.** Libraries installed: PyMuPDF 2.0 (+ pymupdf4llm, pymupdf_layout), python-docx 1.2.0, python-multipart. **No OCR engine** is installed or chosen. Packages: `app/document_intelligence/{extraction,analysis,comparison}` (empty). Limits in settings: `MAX_UPLOAD_BYTES` (10 MiB), `UPLOAD_RETENTION_DAYS` (30), `STORAGE_DIR` (`storage`).

Uploaded documents are the most sensitive data in the product. Treat every file as hostile and every byte as private.

## Secure uploads

1. Enforce size before reading the whole body (request-size middleware plus streaming cap).
2. Accept only allow-listed types: PDF and DOCX (extend deliberately). Detect type by content signature, not by filename or `Content-Type` alone.
3. Generate a random storage key; never use the client filename for paths. Store under `STORAGE_DIR`, outside any served directory. Keep the original name only as metadata (sanitised).
4. Compute SHA-256 for dedupe/integrity. Record owner, size, mime, status, `expires_at` (now + `UPLOAD_RETENTION_DAYS`).
5. Reject encrypted/password-protected files with a clear message, or ask for removal of protection; never try to crack.
6. Parse in isolation: bounded pages, bounded decompressed size (zip-bomb guard for DOCX), wall-clock timeout, run in a worker, not on the event loop.
7. Malware scanning if the deployment supports it; otherwise document the residual risk.

## PDF processing

PyMuPDF for text with layout; detect pages with no text layer → OCR path. Preserve page numbers and reading order. Strip active content (JS, embedded files) from consideration; never render untrusted PDFs server-side to executable output.

## DOCX processing

python-docx for paragraphs/tables/headers. Do not execute macros; refuse `.docm`. Validate zip structure and size before parsing.

## OCR (decision needed)

Choose an engine and language packs (record an ADR): requirements are multilingual support, acceptable accuracy on photos of notices, resource cost. OCR output is flagged lower-confidence and shown to the user for correction before analysis.

## Clause extraction and analysis

- Split into clauses by numbering/headings; keep offsets so the UI can highlight the original text.
- Per clause: category, plain-language explanation, risk level, referenced obligations/deadlines. Generated with the AI pipeline using the document text as untrusted data. Explanations about *law* must cite verified sections; otherwise they only describe what the clause says, labelled as such.
- Dates, amounts and parties are extracted deterministically where possible, then confirmed by the model, not invented by it.

## Document comparison

Align clauses between two versions (heading/number match, then text similarity); report added, removed, changed with word-level diffs. Pure algorithmic diff first; AI summary second and clearly marked.

## File retention and deletion

- Files and derived text expire at `expires_at`; a scheduled job hard-deletes DB rows and stored files and logs only counts.
- User-initiated delete is immediate and covers file, extracted text, embeddings (if any) and analyses.
- Extracted text is not added to the shared legal corpus or embedded into shared indexes. User documents never leak into other users' retrieval.
- Never log filenames, text or analysis content.

## Testing

Fixtures are synthetic, fictional documents. Include malformed, oversized, encrypted, wrong-extension, empty, and scanned-image cases; cross-user access tests; retention job test with a fake clock.
