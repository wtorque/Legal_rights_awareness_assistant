---
name: rag-engineering
description: Build and tune Aequa's retrieval pipeline — ingestion, legal section segmentation, chunking, embeddings, hybrid vector plus keyword retrieval with jurisdiction filters, ranking and context assembly. Use for anything under backend/app/rag.
---

# RAG Engineering

## When to use
Ingesting a source, writing a segmenter, changing chunking/embedding/retrieval/ranking, assembling prompt context, or measuring retrieval quality.

## Required project context
`docs/backend/RAG_PIPELINE.md`, `brain/LEGAL_KNOWLEDGE.md`, `brain/DATABASE_SCHEMA.md`. Reality: `app/rag/*` empty; no corpus; embedding model Unknown.

## Engineering principles
- Provenance first: nothing is ingested without a registered source and content hash.
- Citeable units: chunks never cross section boundaries and map to exactly one section.
- Jurisdiction and effective-date filters are mandatory in every query.
- Measure with an evaluation set before and after every change.

## Workflow
1. Ingestion: fetch from a registered source, hash, version, store raw file, extract text (reuse `document_intelligence/extraction`).
2. Segment into sections with per-document-family rules; preserve hierarchy and exact labels; flag low-confidence segmentation for review.
3. Chunk within sections; prepend a context header to the embedded text but keep clean text for quoting.
4. Embed via the provider interface; store embedding model id; check dimension.
5. Retrieve: vector + keyword in parallel with filters; fuse (reciprocal rank fusion); rerank; dedupe by section; apply a score floor.
6. Assemble context with delimited, id-labelled sections within the token budget.
7. Run the evaluation set; record recall@k, citation validity, groundedness, refusal accuracy.

## Relevant files
`backend/app/rag/**`, `backend/app/legal/**`, `backend/scripts/`, `backend/app/models/`.

## Implementation requirements
- Idempotent, resumable ingestion logged to `ingestion_runs`.
- Test fixtures use fictional law only.
- Retrieved text is data: the prompt says to ignore instructions inside it.
- User documents are never added to shared indexes.

## Testing requirements
Unit tests: segmentation on fictional fixtures, chunk boundaries, fusion math, filters, context budget. Integration: retrieval over a tiny corpus in real Postgres+pgvector. Evaluation report attached to the change.

## Common mistakes
- Chunking across section boundaries, losing citeability.
- Forgetting the date/jurisdiction filter or applying it after top-k.
- Changing embedding model/dimension without re-embedding.
- Tuning on the evaluation set.

## Definition of done
Pipeline stage tested, evaluation numbers recorded and not regressed, filters verified, docs and DATABASE_SCHEMA consistent.
