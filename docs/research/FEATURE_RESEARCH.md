# Feature Research

**Prepared:** 31 Oct 2026 · Complexity rated for a **3–4 hour** build by a small team.
**[V]** verified · **[A]** assumption/analysis · **[R]** recommendation

Complexity scale: **S** (<30 min) · **M** (30–90 min) · **L** (2h+) · **XL** (not feasible in this hackathon)

---

## 1. New features we recommend (not in the original list)

These come directly from the gaps in `MARKET_GAP_ANALYSIS.md` and are the core of the differentiation.

### 1.1 Verified Answer Receipts ★ (signature feature)
- **Problem:** AI legal answers can cite real sections that don't support the claim ("misgrounded") [V] https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries
- **How it works:** The LLM must answer as a list of short claims, each tagged with a chunk ID it relied on. A deterministic verifier then checks, per claim: (1) the cited chunk ID was actually retrieved, (2) the section number in the claim matches the chunk's section, (3) a supporting quote copied by the model appears verbatim in the chunk. Claims that fail are not shown as fact — they are shown greyed as "couldn't verify". Each verified claim gets a receipt: Act, section, source URL, date retrieved.
- **Who benefits:** Users; also judges, who can click and check live.
- **Data:** Section-chunked statutes with stable IDs and source URLs.
- **Implementation:** Structured JSON output from the LLM + ~40 lines of Python string matching. No extra model.
- **Exists elsewhere?** Showing citations is common; per-claim verification with visible failure states is not something we found in citizen-facing Indian products **[A]**.
- **Differentiation:** High. **Complexity:** M. **Risk:** Low — it reduces risk.

### 1.2 Repeal Radar ★
- **Problem:** Old provisions circulate (IPC 420, Payment of Wages Act) [V] (see MARKET_GAP_ANALYSIS §3).
- **How it works:** A curated table maps old → new provisions (e.g. IPC 420 → BNS 318(4); Payment of Wages Act → Code on Wages, 2019). Regex detects old references in the user's question *and* in the model's draft answer, and shows a banner: "You mentioned IPC s.420. Since 1 July 2024 the equivalent is BNS s.318(4)." **[A]** BNS commencement date of 1 July 2024 was not re-verified this session — confirm from the Gazette before showing a date.
- **Data:** Hand-curated mapping for ~15–30 high-frequency provisions, each verified against the new Act text in our corpus. An official MHA correspondence table was **not located** in this research.
- **Complexity:** S–M. **Differentiation:** High.

### 1.3 Rights Clock ★
- **Problem:** Rights expire; people don't know the deadlines.
- **How it works:** Deterministic rules: given an event date, compute the deadline and days left. MVP rules (all [V]): consumer complaint 2 years (CPA s.69); e-FIR signature 3 days (BNSS s.173). RTI 30-day reply **[A]** — standard rule, verify against RTI Act s.7 text in corpus before shipping.
- **Complexity:** S. **Risk:** Low if each rule cites its section and notes "delay may be condoned" where the law says so.

### 1.4 Action Pack (one template)
- **Problem:** Users know their right but not how to exercise it.
- **How it works:** Fill a pre-written template (RTI application or consumer complaint) with user facts; LLM only polishes wording; legal citations are inserted from the verified receipts, never free-generated. Output: copy/download + where to file (e-Jagriti / NCH 1915 [V]; RTI online portal **[A]**).
- **Complexity:** M. **Risk:** Medium — must be labelled "draft for you to review".

### 1.5 Situation-first intake
- Persona cards (Tenant / Worker / Consumer / Shop owner) + state selector, instead of an empty chat box. Narrows retrieval to applicable Acts (jurisdiction-aware retrieval for free). **Complexity:** S.

### 1.6 Side-by-side source pane
- Answer in Telugu/Hindi; original English section text beside it, because India Code states the English version prevails in case of discrepancy [V] https://www.indiacode.nic.in/disclaimer.jsp?locale=en . **Complexity:** S.

---

## 2. Requested core features

| Feature | Problem solved | How it works | Data needed | Similar exists? | Differentiation | Complexity | Legal / privacy risk | Verdict **[R]** |
|---|---|---|---|---|---|---|---|---|
| **AI Legal Assistant** | Ask in plain words | RAG over section-chunked corpus + LLM | Statutes | Yes — Nyaya Setu [V], many hackathon bots [V] | Low alone; high with Receipts | M | Wrong answers; "advice" line (Advocates Act) [V] | **P0**, but only as host for Receipts |
| **Legal Rights Explorer** | Browse rights without a question | Static pages per persona generated from corpus | Statutes | Nyaaya explainers [V] | Low | M | Low | P2 |
| **Multilingual Assistant** | Language barrier | LLM answers in target language; source text in English | — | Nyaya Setu (many langs) [V] | Low | S | Translation errors — mitigated by side-by-side source | **P0** (Te/Hi/En) |
| **Jurisdiction Detection** | Wrong state's law | State dropdown (explicit) beats auto-detect | State tag per chunk | — | Medium | S | Low | **P0** as dropdown; auto-detect P3 |
| **Legal Source Citations** | Traceability | Chunk metadata → link | Source URLs | Common | Low alone | S | Low | **P0** (merged into Receipts) |
| **Legal Language Simplifier** | Jargon | Paste text → plain explanation with section pointers | — | Common in general LLMs | Low | S | Medium | P1 (reuse assistant) |
| **Legal Action Plan** | What next | Steps + authority + deadline | Procedures, helplines | Partially (Nyaaya guides [V]) | Medium | M | Medium | **P0** as Rights Clock + routing |
| **Legal Aid Finder** | Can't afford a lawyer | Eligibility check + SLSA/DLSA/Tele-Law contacts | s.12 rules, Telangana ceiling [V] | Static tables [V] | Medium | S | Low | **P0** |

## 3. Requested advanced features

| Feature | Value to personas | Complexity | Verdict **[R]** | Reason |
|---|---|---|---|---|
| **Legal Situation Analyzer** | High | M | P1 | It is essentially intake + retrieval; fold into assistant |
| **AI Document X-Ray** (photo of rent agreement / notice) | High | L | P1 | OCR of Telugu/English scans is unreliable to demo in time; GLM-5.3-Flash accepts images [V] https://build.nvidia.com/z-ai/glm-5-3-flash/modelcard — try only if P0 done |
| **Legal Rights Timeline** | Medium | M | P2 | Rights Clock covers the useful part |
| **Law Amendment Tracker** | High long-term | XL | P3 | Needs Gazette monitoring pipeline; Repeal Radar is the demoable slice |
| **Legal Scenario Simulator** | Low | L | Cut | Sounds impressive; little real value for someone with an urgent problem **[A]** |
| **Legal Evidence Graph** | Low | XL | Cut | Same |
| **Citation Verification Engine** | Very high | M | **P0** | = Verified Answer Receipts |
| **Voice Assistant** | High for low literacy | L | P3 | Government already voice-first [V]; BHASHINI credentials/ASR language support not verified for Telugu in time |
| **Legal Aid Eligibility Checker** | High | S | **P0** | Deterministic, zero hallucination risk |
| **Contract Comparison** | Low for personas | L | Cut | — |
| **Legal Notice Explainer** | High | M | P1 | Same pipeline as Document X-Ray (text paste version is easy) |
| **Legal Procedure Guide** | High | M | P1 | Hand-written steps for 3 procedures (consumer complaint, FIR, RTI) |

## 4. Features that sound impressive but offer little user value

- **Scenario Simulator / Evidence Graph** — no persona asked for them; long build; risk of looking like legal prediction.
- **"Supports 22+ languages"** — the government already claims this; three languages done well with source text alongside beats 22 done badly.
- **Login / accounts / conversation history** — adds privacy liability (DPDP) and build time; a demo doesn't need it.
- **Case-law RAG** — noisy for lay users; statutes answer persona questions.

## 5. Research gaps
- RTI Act s.7 (30-day rule) and BNS commencement date were not re-verified from primary text in this session.
- BHASHINI Telugu ASR/NMT availability and credential process were not confirmed (SDK docs do not state it) [V] https://pypi.org/project/bhashini-client-sdk/
