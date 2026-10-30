---
name: performance-audit
description: Audit Aequa's end-to-end performance — frontend vitals, API latency, database and vector query plans, ingestion throughput and NVIDIA call cost — and produce a measured, prioritised report. Use before release or when something is slow.
---

# Performance Audit

## When to use
Pre-release, after adding heavy features (streaming assistant, ingestion, document analysis), or on a latency/cost complaint. For fixing frontend-only issues use `frontend-performance`.

## Required project context
`docs/backend/DATABASE_DESIGN.md` (indexes), `docs/backend/RAG_PIPELINE.md`, `docs/backend/NVIDIA_INTEGRATION.md` (rate limits), `docs/frontend/ANIMATION_GUIDE.md`. Reality: no running backend yet; frontend measurable today.

## Engineering principles
- Measure, then change. Compare before/after on the same workload.
- Optimise the critical path users feel: time to first token, time to sourced answer, LCP/INP.
- Cost is a metric: tokens and NVIDIA calls per answer.

## Workflow
1. Define scenarios and budgets (e.g. first token latency, p95 retrieval time, upload analysis time, LCP/INP).
2. Frontend: build output sizes, Lighthouse, Performance trace.
3. API: timings per stage (validate, embed, retrieve, generate, verify) via structured log durations; load test with realistic concurrency.
4. DB: `EXPLAIN (ANALYZE, BUFFERS)` for vector (HNSW use with filters) and keyword queries; index usage; connection pool sizing.
5. AI: tokens in/out, retries, cache hit rate for embeddings, concurrency caps against NVIDIA limits.
6. Rank bottlenecks by user impact; propose fixes with expected gains; implement only what is approved.
7. Report in a table with numbers.

## Relevant files
`backend/app/rag/`, `backend/app/ai/`, `backend/app/repositories/`, `frontend/next.config.ts`, route components.

## Implementation requirements
- Use test/synthetic data; never profile with real user documents.
- Log durations and counts only, never content.

## Testing requirements
Repeat measurements (warm and cold). Record environment (machine, DB size, model). Re-run after fixes.

## Common mistakes
- Benchmarking with an empty table where the planner picks a sequential scan.
- Ignoring retries and timeouts in latency numbers.
- Optimising embedding throughput while retrieval filters defeat the index.
- Reporting one run as truth.

## Definition of done
A report with baselines, bottlenecks ranked, measured improvements for any fixes made, and remaining risks listed.
