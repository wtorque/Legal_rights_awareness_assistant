# Feature Prioritization

**Prepared:** 31 Oct 2026 · **Constraint:** 3–4 hours build, small team
**[R]** This whole document is recommendation, grounded in the other research docs.

## 1. Scoring

Each criterion 1–5. **Effort** and **Risk** are scored so that 5 = *low* effort / *low* risk (higher is always better). Max 35.

| Feature | User impact | Innovation | Feasibility | Data available | Demo value | Effort (5=low) | Risk (5=low) | **Total** | Tier |
|---|---|---|---|---|---|---|---|---|---|
| Verified Answer Receipts (citation verifier) | 5 | 5 | 4 | 5 | 5 | 3 | 5 | **32** | **P0** |
| Free Legal Aid Eligibility Check | 5 | 3 | 5 | 5 | 5 | 5 | 5 | **33** | **P0** |
| Rights Clock (deadlines) | 5 | 4 | 5 | 4 | 5 | 5 | 4 | **32** | **P0** |
| Repeal Radar (IPC→BNS, old labour Acts→Codes) | 4 | 5 | 5 | 4 | 5 | 4 | 4 | **31** | **P0** |
| AI Assistant (hybrid RAG, persona+state scoped) | 5 | 2 | 4 | 4 | 4 | 3 | 3 | **25** | **P0** (host for Receipts) |
| Multilingual (te/hi/en) + side-by-side source | 5 | 2 | 4 | 4 | 5 | 4 | 3 | **27** | **P0** |
| Situation-first intake (persona + state) | 4 | 3 | 5 | 5 | 4 | 5 | 5 | **31** | **P0** |
| Trust/coverage page | 3 | 4 | 5 | 5 | 4 | 5 | 5 | **31** | **P0** |
| Action Pack (one template: RTI or consumer complaint) | 5 | 4 | 4 | 4 | 5 | 3 | 3 | **28** | **P1** (do in hour 3 if P0 is solid) |
| Legal Notice Explainer (paste text) | 4 | 3 | 4 | 4 | 4 | 4 | 3 | **26** | P1 |
| Legal Procedure Guide (3 procedures) | 4 | 2 | 4 | 3 | 3 | 3 | 4 | **23** | P1 |
| Document X-Ray (photo upload) | 4 | 3 | 2 | 3 | 5 | 2 | 2 | **21** | P1 |
| Answer entailment check (2nd LLM pass) | 3 | 3 | 4 | 5 | 2 | 3 | 4 | **24** | P1 |
| Rights Explorer (browse) | 3 | 1 | 4 | 4 | 2 | 3 | 5 | **22** | P2 |
| Legal Rights Timeline | 3 | 2 | 3 | 3 | 3 | 3 | 4 | **21** | P2 |
| Voice assistant | 5 | 1 | 2 | 2 | 4 | 1 | 2 | **17** | P3 |
| Law Amendment Tracker (Gazette watcher) | 4 | 4 | 1 | 2 | 3 | 1 | 3 | **18** | P3 |
| Accounts + history | 2 | 1 | 3 | 5 | 1 | 2 | 2 | **16** | P3 |
| Auto jurisdiction detection | 2 | 2 | 3 | 3 | 2 | 3 | 3 | **18** | P3 |
| Case-law search | 2 | 1 | 2 | 4 | 2 | 2 | 3 | **16** | P3 |
| Contract Comparison | 2 | 2 | 2 | 3 | 2 | 2 | 3 | **16** | Cut |
| Legal Scenario Simulator | 1 | 3 | 1 | 1 | 3 | 1 | 1 | **11** | Cut |
| Legal Evidence Graph | 1 | 3 | 1 | 1 | 3 | 1 | 2 | **12** | Cut |

## 2. Tiers

**P0 — Essential MVP (hours 0–3)**
1. Persona + state intake (Telangana)
2. Ask → hybrid RAG → **Verified Answer Receipts**
3. Telugu / Hindi / English answers with English source pane + translation disclaimer
4. **Repeal Radar** banner (question + answer)
5. **Rights Clock** (consumer 2-yr, e-FIR 3-day, RTI 30-day after verification)
6. **Free Legal Aid check** + help card (TSLSA, NALSA 15100, Tele-Law 14454)
7. Trust/coverage section

**P1 — High-value upgrades (hour 3–4 only if P0 works end-to-end)**
- Action Pack (one template) · Legal Notice Explainer (paste) · entailment check

**P2 — Advanced innovations (post-hackathon)**
- Document X-Ray (image) · Procedure guides · Rights Explorer · Timeline

**P3 — Future roadmap**
- Voice (BHASHINI) · Gazette-driven amendment tracker · more states · accounts with DPDP consent · case law (AWS SC dataset, CC-BY-4.0)

## 3. Hour-by-hour cut line

| Time | Must be true | If behind, cut |
|---|---|---|
| T+1h | Model + embeddings callable; corpus ingested (≥4 Acts) | Drop Telangana tenancy Act (data gap); drop BNS beyond s.318 |
| T+2h | `/ask` returns verified claims locally; UI shows them | Drop Telugu → Hindi + English |
| T+3h | Rights Clock + Legal Aid live; deployed | Drop Action Pack |
| T+3.5h | Demo questions cached; backup recording made | Drop animations / landing polish |

## 4. Demo script (90 seconds)

1. **Worker (Telugu):** "My employer hasn't paid salary for 2 months, under Payment of Wages Act what can I do?" → Repeal Radar: "Payment of Wages Act has been replaced by the Code on Wages, 2019 (in force from 21 Nov 2025)" → verified claims with Code on Wages sections → legal-aid check: "Industrial workmen are a listed category for free legal services (s.12); otherwise income under ₹1,00,000 in Telangana qualifies" → help card. (A shop employee may not be an "industrial workman" — the checker should say "may qualify", not "qualifies".)
2. **Consumer:** "Bought a phone 23 months ago, it's defective" → verified CPA answer → Rights Clock: "~1 month left to file (s.69); delay may be condoned for sufficient cause" → e-Jagriti / NCH 1915.
3. **Trick question:** ask something outside the corpus → "Not enough verified information" + help card. *Say:* "We'd rather say 'we don't know' than invent a section."
4. Click any receipt → English section text on India Code.

## 5. What to say when a judge asks "how is this different from Nyaya Setu?"

"Nyaya Setu is great for reach and languages. We focused on what you can *check*: every sentence is machine-verified against the exact section, we flag laws that were repealed — like the old labour Acts replaced last November — we compute your deadline, and we tell you in 3 taps if you qualify for a free lawyer." (Only say Nyaya Setu lacks a feature if a teammate has tested it.)
