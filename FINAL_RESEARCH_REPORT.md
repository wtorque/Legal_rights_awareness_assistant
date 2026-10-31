# Final Research Report — Legal Rights Awareness Assistant

**Event:** SMRU Hack Day (Hacktoberfest), Hyderabad — Problem Statement #6
**Prepared:** 31 Oct 2026 · **Status:** Research complete, awaiting team review. No code written.
**Verified jurisdiction:** India (central) + Telangana · **Build budget:** 3–4 hours

Legend: **[V]** verified (source in linked docs) · **[A]** assumption · **[R]** recommendation

---

## 1. Problem statement analysis

The brief (`ps photo.png`) asks for basic legal rights explained **in simple language**, **in the user's language**, **traceable to a reliable source**, for citizens, tenants, workers and small shop owners. Our research finds the real pain sits in four places: people can't tell which law applies, the law they've heard of may be repealed, rights expire on deadlines they don't know, and they don't know they may qualify for a free lawyer. AI adds a fifth: confident wrong citations. → `PROJECT_PROBLEM_ANALYSIS.md`

## 2. Research methodology

- Inspected the repo: README, MIT licence, problem-statement image only — nothing to overwrite.
- ~60 web searches and page fetches (31 Oct 2026), prioritising government sites, statutes, official model cards and primary docs; law-firm/news sources used only to locate or corroborate primary facts and marked as secondary.
- Every claim tagged [V]/[A]/[R]; research gaps listed at the end of each document.
- Limits: no user interviews; shell had no access to non-allowlisted sites (robots.txt not checked); Nyaya Setu not hands-on tested.

## 3. Existing solution comparison

| Product | What it is | Takeaway |
|---|---|---|
| **Nyaya Setu** (MoLJ / BHASHINI) | Free govt AI legal assistant on WhatsApp; voice-first; 22+ languages (sources differ); AI version unveiled Mar 2026 [V] | **"Multilingual legal chatbot" is not unique.** |
| Tele-Law / Nyaya Bandhu (DISHA 2.0, 2026–31) | Free lawyer advice via 14454 / CSCs; pro bono panels [V] | Route users here — partner, not competitor |
| Nyaaya (Vidhi) | Plain-language explainers, EN/HI/KN [V] | Quality bar for plain language; no Telugu site listed [V] |
| Jugalbandi | WhatsApp + BHASHINI + LLM for schemes; criticised for outdated info [V] | Freshness is a known failure |
| Indian Kanoon API | Paid case-law API, attribution required [V] | Not needed for MVP |
| DoNotPay | FTC settlement over "robot lawyer" claims [V] | Never overclaim |
| Lexis+/Westlaw AI | 17–34%+ hallucination incl. misgrounded citations [V] | RAG ≠ reliability; verify claims |

→ `COMPETITOR_ANALYSIS.md`

## 4. Major market gaps (ranked)

1. **Verifiable answers** (23/25) — per-claim checking against section text
2. **Stale law** (22/25) — Labour Codes in force 21 Nov 2025 [V]; IPC→BNS [V]; Telangana hours notification Jul 2025 [V]
3. **Next step + deadline** (22/25) — CPA s.69 two years [V]; e-FIR 3 days [V]
4. **Free legal aid discovery** (20/25) — s.12 categories; Telangana ₹1 lakh ceiling [V]
5. **Walk away with a draft** (19/25)

→ `MARKET_GAP_ANALYSIS.md`

## 5. Recommended unique features

| Feature | One-line pitch |
|---|---|
| **Verified Answer Receipts** ★ | Every sentence is machine-checked against the exact section; anything unverified is visibly greyed out |
| **Repeal Radar** ★ | "You said IPC 420 — that's BNS 318(4) now." "Payment of Wages Act? Replaced by the Code on Wages." |
| **Rights Clock** ★ | Enter a date → "You have 31 days left to file (CPA s.69)" |
| **Free Legal Aid in 3 taps** | Deterministic s.12 + Telangana ceiling → exact TSLSA / NALSA 15100 / Tele-Law 14454 card |
| Telugu/Hindi with English source alongside | Your language, the law's authoritative text |
| Action Pack (P1) | A ready-to-edit RTI / consumer complaint draft |

**Product name suggestion [R]:** something that says *proof*, e.g. "Hakku Proof" (*hakku* = right in Telugu **[A]**) or "Nyaya Receipt". Avoid "Nyaya Setu" — it's taken by the government product.

→ `FEATURE_RESEARCH.md`

## 6. Official legal data sources

- **India Code** (Legislative Dept): official Act PDFs; English prevails; "as is"; no API found → manual download of ~8 Acts [V]. **Gap:** Telangana tenancy Act page has no files [V].
- **e-Gazette**: commencement notifications (future amendment tracking).
- **AWS Indian SC Judgments**: CC-BY-4.0, 1950–2025, bi-monthly (future) [V].
- **Help routing**: Telangana SLSA (040-23446725), NALSA 15100, Tele-Law 14454, NCH 1915 / e-Jagriti [V].
- **Licensing**: Copyright Act s.52(1)(q) permits reproducing Acts *with commentary* and judgments; s.52(1)(r) permits Indian-language translations of Acts with a mandatory "not authorised by Government" statement [V].

→ `OFFICIAL_LEGAL_DATA_SOURCES.md`, `LEGAL_DATA_LICENSING.md`

## 7. AI and RAG architecture

Section-level chunks with jurisdiction/in-force metadata → persona+state filter → BM25 + NVIDIA multilingual embeddings fused with RRF → GLM generates **strict JSON claims each carrying a chunk ID and verbatim quote** → deterministic verifier (retrieved? quote present? section matches? in force?) → render verified/unverified. Deadlines, eligibility and repeal mapping never come from the LLM. Evidence-coverage badge instead of fake confidence scores.

Model facts: `glm-5-3-flash` listed on NVIDIA's catalog, MIT weights, 1M context, under NVIDIA API Trial ToS [V]; GLM-5 was deprecated Apr 2026 [V] → model ID in env + fallback. Embeddings: `nemotron-3.5-embed-1b` evaluated on Hindi and Telugu [V].

→ `AI_AND_RAG_RESEARCH.md`

## 8. Legal reliability strategy

- Information, not advice: Advocates Act s.29/33/45; Bar Council notice to a non-advocate advisory platform (Sep 2026) [V].
- Trust framework: claim → section → India Code URL + date; unverified claims degraded; "not enough information" state; help card on every answer; high-risk situations surface emergency/legal-aid contacts first.
- Privacy: no accounts, no stored questions, PII masking — simplest path under DPDP Rules (notified 14 Nov 2025) [V].
- Measure, then claim: run a 15-question eval and quote the real number in the pitch.

→ `LEGAL_RELIABILITY_AND_SAFETY.md`

## 9. Global scalability strategy

ISO-3166-2 jurisdiction hierarchy (`IN` → `IN-TG`), one jurisdiction per chunk, a **coverage manifest** per jurisdiction that the UI reads to state exactly what is verified, Akoma Ntoso-style document identity and `valid_from/valid_to` versioning. Coverage is claimed only for verified instruments. → `GLOBAL_JURISDICTION_RESEARCH.md`

## 10. Recommended technology stack

| Keep | Cut for the hackathon |
|---|---|
| Next.js + TS + Tailwind + shadcn/ui → Vercel Hobby (non-commercial, free) [V] | PostgreSQL, SQLAlchemy, pgvector, Redis, Supabase |
| FastAPI → Render free (512 MB, sleeps after 15 min — warm it up) [V] | Local Sentence Transformers (won't fit 512 MB) |
| NVIDIA API: GLM + nemotron embeddings | Docker, Cloudflare, python-docx, Framer Motion (optional) |
| rank_bm25 + NumPy, corpus as files; PyMuPDF offline | |

→ `TECH_STACK_VALIDATION.md`, `PRODUCT_ARCHITECTURE_RESEARCH.md`

## 11. MVP feature selection (P0)

Persona+state intake · hybrid RAG with **Verified Answer Receipts** · te/hi/en with source pane · **Repeal Radar** · **Rights Clock** · **Free Legal Aid check** + help card · trust/coverage section. Action Pack only if P0 works by hour 3. → `FEATURE_PRIORITIZATION.md` (includes hour-by-hour cut line and 90-second demo script)

## 12. Future roadmap

P1: Action Pack, legal-notice explainer, entailment check, document X-Ray · P2: procedure guides, rights explorer · P3: voice via BHASHINI, Gazette-driven amendment tracker, more states (AP/Karnataka first), accounts with DPDP consent, case law from the CC-BY SC dataset.

## 13. Potential risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| GLM model ID changes / throttling (~40 RPM) | Medium | Env var, fallback model, cached demo answers |
| Telugu output quality | Medium | Test in hour 1; fall back to Hindi/English; Sarvam Translate backup |
| PDF section parsing | Medium | ≤6 Acts; hand-fix demo sections |
| Tenancy Act text unavailable | High | Drop tenant scenario from live demo unless an official source is found |
| Overclaiming / "advice" | Low if rules followed | Wording rules, no predictions, help routing |
| Judge compares to Nyaya Setu | High | Lead with verification + freshness + deadlines; test Nyaya Setu beforehand |
| Render cold start / Wi-Fi | Medium | Warm-up ping; backup recording |

## 14. Final product recommendation

**Build a "proof-first" legal rights assistant for Telangana, not another chatbot.** The government already offers a free multilingual legal chatbot, so breadth can't be the pitch. What nobody demonstrably does — and what the problem statement explicitly demands — is make every answer *checkable*: each sentence verified against the exact current section, repealed law flagged, the deadline computed, and the free-legal-aid route shown. All of that is achievable in 3–4 hours because the hardest-sounding parts (verification, deadlines, eligibility, repeal mapping) are deterministic code, not more AI.

**Decisions needed from the team before building:**
1. Team size (plan assumes 3–4).
2. Tenant scenario: find an official Telangana tenancy Act source, or drop it from the demo?
3. Action Pack template: RTI application or consumer complaint?
4. Someone tests Nyaya Setu on WhatsApp with the demo questions before the pitch.

---

### Document index
`PROJECT_PROBLEM_ANALYSIS.md` · `COMPETITOR_ANALYSIS.md` · `MARKET_GAP_ANALYSIS.md` · `FEATURE_RESEARCH.md` · `OFFICIAL_LEGAL_DATA_SOURCES.md` · `LEGAL_DATA_LICENSING.md` · `AI_AND_RAG_RESEARCH.md` · `LEGAL_RELIABILITY_AND_SAFETY.md` · `TECH_STACK_VALIDATION.md` · `GLOBAL_JURISDICTION_RESEARCH.md` · `PRODUCT_ARCHITECTURE_RESEARCH.md` · `FEATURE_PRIORITIZATION.md`
