# RAG Pipeline

State: **Missing.** Packages exist (`app/rag/{ingestion,embeddings,retrieval,ranking,citations}`) but are empty. This is the target design. Principles in `brain/AI_SYSTEM.md`; legal data rules in `brain/LEGAL_KNOWLEDGE.md`.

## Pipeline overview

```
Ingest:  source → extract text → segment into sections → chunk → embed → store (+tsvector)
Answer:  question → jurisdiction check → embed query → hybrid retrieve → rank → assemble context
         → generate (structured) → verify citations → stream / refuse
```

## 1. Document ingestion (`rag/ingestion`, scripts in `backend/scripts`)

- Input only from a registered `legal_source`. Record retrieval time and content hash. Re-ingest creates a new version if the hash changed.
- Idempotent and resumable; every run logged to `ingestion_runs`.
- Raw files stored under `storage/` (or object storage), not in git.

## 2. Text extraction

- Reuse `document_intelligence/extraction` for PDF (PyMuPDF/pymupdf4llm) and DOCX (python-docx); HTML from official portals via a sanitising parser.
- Preserve structure (headings, numbering). Keep page numbers for provenance. Scanned PDFs need OCR (engine undecided).

## 3. Legal section segmentation (`legal/sections`)

- Split into the smallest citeable unit using heading/numbering patterns *per document family*. Keep hierarchy (part → chapter → section → sub-section) and the exact label ("12(3)").
- Segmenters are rule-based first, with unit tests built from **fictional** fixtures. Low-confidence segmentation is flagged for human review, not guessed.

## 4. Chunking

- Chunk within a section; never across section boundaries. Target size by tokens of the embedding model (configure; tune on evaluation). Overlap only inside a long section.
- Prepend a short context header (document title + section label + heading) to the embedded text, but store the clean section text for citation.
- Every chunk references exactly one `section_id`.

## 5. Embedding generation (`rag/embeddings`)

- Provider interface `embed(texts, input_type)`; NVIDIA implementation batches and retries. Some embedding models require distinguishing query vs passage input; verify against the chosen model's documentation.
- Model must be multilingual. Record `embedding_model` on each chunk. Dimension = `EMBEDDING_DIM`.

## 6. Hybrid retrieval (`rag/retrieval`)

- Vector search (cosine) and keyword search (`tsvector`) run in parallel with mandatory filters: `jurisdiction_id` (including parent jurisdictions where law applies), effective-date validity, language.
- Merge with reciprocal rank fusion (or a tuned weighted sum). Top-k configurable.

## 7. Ranking (`rag/ranking`)

- Optional reranker (model or heuristics: exact-term match, hierarchy proximity, recency). Deduplicate chunks from the same section. Keep a score threshold: below it, the answer is "insufficient evidence".

## 8. Context assembly

- Fit within the model context budget; prefer fewer, more relevant sections over many.
- Each section is delimited and labelled with an opaque id (`[S1]`, `[S2]`) and its label/title. Retrieved text is data; the prompt states instructions inside it must be ignored.

## 9. Response generation

- Low temperature. Structured output: `answer`, `claims[]`, `citations[] {source_ref, quote}`, `confidence`, `needs_clarification`. Refuse when context does not support an answer.
- Answer language follows the user preference; quotes stay in the original language.

## 10. Evidence validation (`rag/citations`)

For each citation: `source_ref` maps to a retrieved section → quote is a substring of that section's text (normalised for whitespace/case) → section is in force for the date/jurisdiction. Drop failures. If no claim remains grounded, convert to a refusal with a pointer to official help. Persist only verified citations.

## Evaluation (required)

Per-jurisdiction set of questions with expected sections and expected refusals. Metrics: retrieval recall@k, citation validity (must be 100%), groundedness, refusal accuracy. Run before changing chunking, embeddings, retrieval, prompts, or models.
