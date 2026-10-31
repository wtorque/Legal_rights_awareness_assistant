# Market Gap Analysis

**Prepared:** 31 Oct 2026 · Builds on `COMPETITOR_ANALYSIS.md`
**[V]** verified · **[A]** assumption/analysis · **[R]** recommendation

## 1. Method

Each candidate gap is scored 1–5 on five criteria from the research brief. "Existing solutions" is scored **inversely** (5 = nobody solves it well). Feasibility is judged against a **3–4 hour build**.

| Score | Meaning |
|---|---|
| 5 | Strong / severe / wide open / very feasible |
| 1 | Weak / mild / well served / infeasible in time |

## 2. Gap ranking

| Rank | Gap | User importance | Severity today | Existing solutions (inverse) | Innovation room | 3–4h feasibility | **Total /25** |
|---|---|---|---|---|---|---|---|
| 1 | **Verifiable answers** — users (and judges) can't check whether an AI's legal claim is actually in the cited section | 5 | 5 | 4 | 5 | 4 | **23** |
| 2 | **Stale law** — answers cite repealed provisions (IPC/CrPC, pre-Code labour Acts) | 5 | 5 | 4 | 4 | 4 | **22** |
| 3 | **"What do I do next, and by when?"** — deadlines and the right authority | 5 | 4 | 4 | 4 | 5 | **22** |
| 4 | **Free legal aid discovery** — people don't know they qualify | 5 | 4 | 3 | 3 | 5 | **20** |
| 5 | **Walk away with a document** — a filled RTI/consumer complaint draft | 4 | 4 | 3 | 4 | 4 | **19** |
| 6 | Telugu-language access with source text alongside | 5 | 4 | 2 | 2 | 4 | **17** |
| 7 | Document understanding (rent agreement / legal notice photo) | 4 | 4 | 3 | 3 | 2 | **16** |
| 8 | Voice for low-literacy users | 5 | 4 | 1 | 1 | 1 | **12** |
| 9 | Privacy of sensitive legal questions | 4 | 3 | 3 | 2 | 3 | **15** |

## 3. Evidence behind the top gaps

### Gap 1 — Verifiable answers
- **[V]** Even professional legal AI tools produced "misgrounded" answers — correct-sounding claims attached to sources that don't support them; rates >17% to >34% across tools; general chatbots 58–82%. https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries
- **[V]** The organisers explicitly require "answers they can trace back to a reliable source" (problem-statement slide in repo).
- **[A]** Most hackathon RAG bots show a source list but do not check that each sentence is supported.
- **Why underserved:** showing a link is easy; *proving* the link supports the sentence is not — so few do it.

### Gap 2 — Stale law
- **[V]** All four Labour Codes in force from 21 Nov 2025 (Code on Wages and Social Security Code only partly) — replacing Payment of Wages, Minimum Wages, Industrial Disputes Acts etc. https://ksandk.com/labour-employment/all-four-labour-codes-enforced-from-21-november-2025/
- **[V]** Criminal law moved from IPC/CrPC to BNS/BNSS; e.g. IPC s.420 cheating now corresponds to BNS s.318(4). https://news24online.com/india/no-more-420-fraud-cases-know-difference-between-ipc-420-and-bns-3184-new-law-punishment/931933/
- **[V]** State-level changes too: Telangana's 8 July 2025 Gazette notification allows 10-hour days (48 hr/week cap) in commercial establishments other than shops. https://www.indialaw.in/blog/labour/telangana-eases-working-hours-for-commercial-establishments//pdf/
- **[V]** Jugalbandi was criticised for outdated information. https://www.medianama.com/2023/06/223-jugalbandi-chatbot-rural-india-what-to-know/
- **[V]** Even official dashboards go stale: NALSA's Telangana dashboard shows legal-clinic figures "as of March 2019" and internally inconsistent DLSA counts. https://nalsa.gov.in/dashboard/TL
- **[A]** People still say "420" and "ID Act"; LLMs trained on older text will repeat these.

### Gap 3 — Next steps and deadlines
- **[V]** Consumer complaint: 2 years from cause of action, delay condonable for sufficient cause (CPA 2019 s.69). https://www.advocatekhoj.com/library/bareacts/consumerprotection2019/69.php
- **[V]** District Consumer Commission handles claims up to ₹50 lakh (2021 Jurisdiction Rules). https://www.moneylife.in/article/union-govt-revises-pecuniary-jurisdiction-district-consumer-commissions-limit-revised-to-rs50-lakh-from-rs1-crore/66005.html
- **[V]** e-FIR must be signed within 3 days; zero FIR can be registered at any police station (BNSS s.173). https://azbpartners.com/wp-content/uploads/2024/07/Article-on-BNSS-26-07-2024.pdf
- **[V]** Consumers can file on e-Jagriti (launched 1 Jan 2025) or call National Consumer Helpline 1915. https://ianslive.in/national-consumer-day-nch-e-jagriti-platforms-ensure-timely-grievance-redressal--20251223135215
- **Why underserved:** deadlines are deterministic, so an LLM is the wrong tool; most chatbots don't build the deterministic layer **[A]**.

### Gap 4 — Free legal aid
- **[V]** s.12 LSA Act categories (women, children, SC/ST, persons with disabilities, industrial workmen, persons in custody, disaster victims, trafficking victims, income-based). https://kslsa.kar.nic.in/faq.html
- **[V]** Telangana income ceiling ₹1,00,000. https://nalsa.gov.in/dashboard/TL ; https://nyaaya.org/legal-explainer/eligibility-for-legal-aid/
- **[V]** Women qualify regardless of income. https://kslsa.kar.nic.in/faq.html
- **Insight [A]:** Many users — every woman, every industrial worker — qualify for free legal services without knowing it. A 3-question checker delivers a "wow, I qualify" moment with zero hallucination risk.

## 4. Gaps that sound good but we de-prioritise

| Idea | Why not now |
|---|---|
| "Supports 22 languages" | Nyaya Setu already claims this [V]; we can't beat it in 4 hours. Do 3 languages well. |
| Voice assistant | Government already voice-first [V]; ASR integration + demo risk is high. |
| Case-law search | Lay users need statutes and procedures; judgments add noise and licensing complexity. |
| Legal Evidence Graph / Scenario Simulator | Impressive in slides, low real value for a tenant with a deposit dispute **[A]**; high build cost. |
| Contract comparison | Rarely needed by the four personas **[A]**. |

## 5. The underserved intersection

> **No verified product combines (a) section-level citations that are machine-checked, (b) repealed-law detection, (c) deterministic deadlines and legal-aid eligibility, and (d) a generated next-step document — for Telangana users in Telugu.**

That intersection is our product. See `FEATURE_PRIORITIZATION.md` for what fits in 3–4 hours.
