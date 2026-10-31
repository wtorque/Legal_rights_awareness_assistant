# Tech Stack Validation

**Prepared:** 31 Oct 2026 · All URLs accessed 2026-10-31.
**[V]** verified · **[A]** assumption · **[R]** recommendation
**Constraint that drives every decision:** 3–4 hours of build time.

---

## 1. Summary

The proposed stack is reasonable for a product, but **too heavy for a 3–4 hour hackathon**. Every extra service is setup time not spent on the differentiator. **[R]** Cut to two deployable pieces: one Next.js app and one FastAPI service, with the corpus shipped as files.

## 2. Component-by-component

| Layer | Proposed | Verdict | Notes |
|---|---|---|---|
| Frontend | Next.js + React + TypeScript | ✅ Keep | Team strength (TypeScript/Node) |
| | Tailwind CSS + shadcn/ui | ✅ Keep | Fast, consistent UI |
| | Framer Motion | ⚠️ Optional | Only if time remains; zero user value for the core flow |
| Backend | Python + FastAPI | ✅ Keep | One service: `/ask`, `/eligibility`, `/deadline`, `/draft` |
| | PostgreSQL + SQLAlchemy | ❌ Cut for MVP | No users, no history, corpus <2,000 chunks **[A]** → JSONL + NumPy in memory |
| | Redis | ❌ Cut | No sessions or queues; cache demo answers in a Python dict |
| AI | NVIDIA API (GLM) | ✅ Keep, env-configurable model ID | GLM churn: GLM-5 deprecated 20 Apr 2026 [V] https://forums.developer.nvidia.com/t/urgent-glm-5-deprecation-april-20-2026-replacement-z-ai-glm-5-1-not-available-in-nim-api/366610 ; `glm-5-3-flash` currently listed [V] https://build.nvidia.com/models |
| | Sentence Transformers (local) | ❌ Replace | Render free = 0.1 CPU / 512 MB RAM [V] https://render.com/docs/llms-full.txt — use NVIDIA-hosted `nemotron-3.5-embed-1b` (Hindi + Telugu evaluated) [V] https://build.nvidia.com/nvidia/nemotron-3_5-embed-1b/modelcard ; precompute corpus embeddings offline |
| | pgvector | ❌ Defer | NumPy cosine over 2k vectors is milliseconds |
| | BM25 | ➕ Add | `rank_bm25` pure-Python, tiny |
| Docs | PyMuPDF | ✅ Keep (offline ingestion only) | |
| | python-docx | ❌ Cut | No DOCX input in MVP; drafts exported as text/PDF from browser print |
| Deploy | Vercel (frontend) | ✅ Keep | Hobby plan is free but **non-commercial personal use only**; functions up to 300 s [V] https://vercel.com/docs/plans/hobby — fine for a hackathon |
| | Render / Railway (backend) | ✅ Render free, with caveat | Spins down after 15 min idle, ~1 min cold start; 750 free instance-hours/month [V] https://render.com/docs/llms-full.txt → **ping it 2 minutes before your demo slot** |
| | Supabase | ❌ Cut | Not needed without DB/auth. (If used later: 500 MB DB, 2 active free projects, pauses after 1 week idle [V] https://supabase.com/pricing.md) |
| | Cloudflare | ❌ Cut | No benefit at demo scale |
| | Docker | ❌ Cut | Render builds Python directly; Dockerfile only if Render's native build fails |
| | GitHub | ✅ Keep | Repo exists: `wtorque/Legal_rights_awareness_assistant` (MIT licence, README, problem-statement image) |

## 3. Final MVP stack **[R]**

```
frontend/  Next.js (App Router) + TS + Tailwind + shadcn/ui     → Vercel
backend/   FastAPI + rank_bm25 + numpy + openai (client) + pymupdf(offline)  → Render free
data/      corpus.jsonl, embeddings.npy, repeal_map.json, deadlines.json, legal_aid.json, help_contacts.json
scripts/   ingest.py (run locally once)
```

External services: **one** — NVIDIA API (LLM + embeddings), via the OpenAI-compatible client at `https://integrate.api.nvidia.com/v1` [V] https://jaesolshin.com/posts/nvidia-nim-api/

Environment variables: `NVIDIA_API_KEY`, `LLM_MODEL` (e.g. `z-ai/glm-5.3-flash` — **confirm exact ID on build.nvidia.com on the day** **[A]**), `LLM_FALLBACK_MODEL`, `EMBED_MODEL`, `ALLOWED_ORIGIN`.

## 4. Bottlenecks & risks

| Risk | Mitigation |
|---|---|
| NVIDIA free tier throttling (~40 RPM best-effort) [V] | Cache the rehearsed demo answers; fallback model |
| Model ID changes/deprecation [V] | Env var + fallback; test at T-0 |
| Render cold start (~1 min) [V] | Warm-up request before demo; or run backend locally and tunnel |
| Telugu output quality unknown | Test in hour 1; fall back to Hindi + English if poor; Sarvam Translate as backup (₹100 free credits) [V] https://docs.sarvam.ai/api-reference-docs/pricing.md |
| PDF section parsing messier than expected | Limit to 5–6 Acts; hand-fix the specific sections used in demo |
| Venue Wi-Fi | Record a backup screen capture of the full demo |

## 5. Security concerns

- Keep `NVIDIA_API_KEY` server-side only (never in Next.js client bundle).
- CORS restricted to the Vercel domain.
- Don't log request bodies (sensitive legal facts; DPDP) — see `LEGAL_RELIABILITY_AND_SAFETY.md`.
- Rate-limit `/ask` per IP (simple in-memory counter) to protect the shared API key.

## 6. Cost

| Item | Hackathon cost |
|---|---|
| Vercel Hobby | ₹0 [V] |
| Render free | ₹0 [V] |
| NVIDIA API trial | ₹0 (trial terms) [V] |
| Sarvam (optional) | ₹0 within ₹100 credits [V] |

## 7. When to bring the cut pieces back (post-hackathon)

| Add | Trigger |
|---|---|
| Postgres + pgvector | Corpus > ~50k chunks or multiple jurisdictions |
| Auth + history | Users ask to save cases (requires DPDP notice/consent flows) |
| Redis | Real traffic / rate limiting across instances |
| Reranker | Retrieval eval shows ranking errors |
| Paid/self-hosted inference | Leaving trial terms; production SLA |
