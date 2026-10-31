# Product Architecture Research

**Prepared:** 31 Oct 2026
**[V]** verified · **[A]** assumption · **[R]** recommendation

Three separate architectural areas, as requested. Each area lists **MVP (3–4h)** vs **Later**.

---

## A. Landing Page (marketing)

| Section | Content | MVP? |
|---|---|---|
| Hero | "Know your rights. See the exact law. Know your deadline." + Telugu/Hindi toggle + "Ask now" | ✅ (single section on the app's home route) |
| How it works | 3 steps: Describe → See verified sections → Act (deadline + free help) | ✅ |
| Trust & transparency | "Every claim checked against official text from India Code" · coverage manifest (what we cover / don't) · "Not legal advice" | ✅ — this is a differentiator, make it visible |
| Features | Verified Receipts · Repeal Radar · Rights Clock · Free Legal Aid check | ✅ (4 cards) |
| Resources | Links to Tele-Law, NALSA, e-Jagriti, India Code | ✅ (footer) |
| Blog / SEO pages | — | Later |

**[R]** For the hackathon the landing page *is* the home route of the frontend app — not a separate site.

## B. Frontend Platform

| Area | Purpose | MVP? |
|---|---|---|
| **Persona + state picker** | Tenant / Worker / Consumer / Shop owner; Telangana default | ✅ |
| **Ask screen** | Text box, language select (te/hi/en), example questions per persona | ✅ |
| **Answer view** | Verified claims (green ticks), unverified (greyed), evidence badge, Repeal Radar banner | ✅ |
| **Source pane** | English section text, Act + section, India Code link, downloaded date, translation disclaimer | ✅ |
| **Rights Clock card** | Event date input → deadline + days left + section cited | ✅ |
| **Free Legal Aid check** | 3 questions → eligible / maybe / not + TSLSA/NALSA/Tele-Law card | ✅ |
| **Action Pack** | One template (RTI or consumer complaint) → editable draft + "where to file" | ✅ if time (hour 3) |
| Document Intelligence (upload notice/agreement) | X-Ray | Later (P1) |
| Rights Explorer (browse) | Static persona pages | Later (P2) |
| Conversation history, settings, dashboard | Requires accounts | Later (P3) — deliberately cut for privacy and time |

Routes **[R]**: `/` (landing + picker) · `/ask` · `/legal-aid` · `/coverage`.

## C. Backend Platform

```
FastAPI (single service)
├── POST /ask          → repeal_radar → query_rewrite → hybrid_retrieve → generate → verify → assemble
├── POST /eligibility  → deterministic s.12 rules + state ceiling
├── POST /deadline     → deterministic rules table
├── POST /draft        → template fill (+ optional LLM polish) — citations from verified receipts only
├── GET  /coverage     → jurisdiction manifests
└── GET  /health       → warm-up ping
modules/
├── corpus.py        load corpus.jsonl, embeddings.npy, BM25 at startup
├── retrieve.py      filter + BM25 + cosine + RRF
├── llm.py           OpenAI-compatible client → NVIDIA API; model from env; fallback
├── verify.py        claim verifier (see AI_AND_RAG_RESEARCH.md §5)
├── repeal.py        regex + repeal_map.json
├── rules.py         deadlines.json, legal_aid.json
└── safety.py        PII masking, high-risk detection, rate limit
scripts/ingest.py    offline: PDFs → sections → metadata → embeddings
```

| Requested backend area | MVP implementation | Later |
|---|---|---|
| Authentication | None (no accounts) | Supabase/Auth.js + DPDP consent |
| API services | 5 endpoints above | Versioned API |
| AI inference | NVIDIA API (GLM + embeddings) | Paid/self-hosted |
| RAG pipeline | In-memory hybrid | pgvector + reranker |
| Legal knowledge ingestion | Offline script, manual PDFs | Gazette watcher, scheduled re-ingest |
| Citation verification | `verify.py` deterministic | + entailment check |
| Document processing | Offline PyMuPDF | Upload OCR (P1) |
| Jurisdiction management | Manifest JSON + chunk tags | Admin UI |
| Privacy & security | No storage, PII masking, CORS, rate limit | Audit logging (metadata only), DPDP notices |

## Data flow

```
[Browser] ──question+persona+state+lang──► [FastAPI /ask]
                                              │ repeal.py (question)
                                              │ llm.py (rewrite → English query)
                                              │ retrieve.py (IN + IN-TG chunks)
                                              │ llm.py (JSON answer with chunk_id + quote)
                                              │ verify.py (per-claim)
                                              │ repeal.py (answer) + rules.py (deadline, aid)
[Browser] ◄──claims[verified|unverified], sources[], banners[], help_card──┘
```

## Team split for 3–4 hours (assumes 3–4 people) **[R]**

| Person | Hour 0–1 | Hour 1–2 | Hour 2–3 | Hour 3–4 |
|---|---|---|---|---|
| A (data) | Download PDFs, `ingest.py`, section split | Metadata, `in_force`, repeal_map.json | 15-question eval set | Fix failures found by eval |
| B (backend) | FastAPI skeleton, `llm.py`, test model + Telugu | `retrieve.py`, `/ask` | `verify.py`, `/eligibility`, `/deadline` | Deploy Render, cache demo answers |
| C (frontend) | Next.js + shadcn, picker, ask screen | Answer view + source pane | Rights Clock + Legal Aid cards | Landing/trust section, deploy Vercel |
| D (pitch, if 4) | Test Nyaya Setu with demo questions; pitch outline | Action Pack template | Demo script + backup recording | Rehearse |

## Research gaps
- Team size not confirmed (plan assumes 3–4).
