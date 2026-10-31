# Project Problem Analysis

**Project:** Legal Rights Awareness Assistant — SMRU Hack Day (Hacktoberfest), Hyderabad, Problem Statement #6
**Prepared:** 31 Oct 2026 · **Verified jurisdiction for this phase:** India (central law) + Telangana (state law)
**Build constraint:** 3–4 hours of development time, small team

Legend used across all research docs:
- **[V]** Verified fact, with source URL and access date
- **[A]** Assumption — not verified, stated so it can be challenged
- **[R]** Recommendation — our judgement based on the evidence

---

## 1. The problem as set by the organisers

From `ps photo.png` in this repository (the official problem-statement slide):

- **Problem:** Most people don't know their basic legal rights, legal text is long and hard to read, and asking a lawyer even a simple question costs money.
- **Who it helps:** Citizens, tenants, workers, small shop owners.
- **What to build:** Help ordinary people understand their basic legal rights **in simple language**, **in the language they speak**, **with answers they can trace back to a reliable source**.

The third requirement — *traceable to a reliable source* — is the one most teams will under-deliver on, and it is the one the judges wrote into the brief. **[R]** Treat it as the product's spine, not a footnote.

## 2. Decomposing the problem

| # | Sub-problem | Evidence it is real | What "solved" looks like |
|---|---|---|---|
| 1 | Legal language is hard | Organiser brief; Nyaaya exists specifically to translate law into plain explainers [V] https://nyaaya.org/ (accessed 2026-10-31) | Plain-language answer *plus* the exact statutory text it came from |
| 2 | People don't know which law applies | Laws are split across central and state statutes; e.g. tenancy in Telangana is governed by a state Act (Telangana Buildings (Lease, Rent and Eviction) Control Act, 1960) [V] https://www.indiacode.nic.in/handle/123456789/8607 | System asks for state + situation, then retrieves only applicable law |
| 3 | Law changes and old info circulates | All four Labour Codes were brought into force effective 21 Nov 2025, replacing Acts like the Payment of Wages Act and Industrial Disputes Act [V] https://ksandk.com/labour-employment/all-four-labour-codes-enforced-from-21-november-2025/ ; IPC/CrPC replaced by BNS/BNSS (e.g. IPC s.420 → BNS s.318(4)) [V] https://news24online.com/india/no-more-420-fraud-cases-know-difference-between-ipc-420-and-bns-3184-new-law-punishment/931933/ ; Telangana raised daily working-hour limits for commercial establishments to 10 hrs via Gazette of 8 Jul 2025 [V] https://www.indialaw.in/blog/labour/telangana-eases-working-hours-for-commercial-establishments//pdf/ | Answers flag repealed law and point to the current provision |
| 4 | People don't know what to do next | Rights are time-bound: consumer complaints must be filed within 2 years of the cause of action (CPA 2019 s.69) [V] https://www.advocatekhoj.com/library/bareacts/consumerprotection2019/69.php ; an e-FIR must be signed within 3 days (BNSS s.173) [V] https://azbpartners.com/wp-content/uploads/2024/07/Article-on-BNSS-26-07-2024.pdf | A concrete action plan with deadlines and the right authority |
| 5 | Language barriers | Telangana's population primarily speaks Telugu and Urdu alongside Hindi/English **[A]** (not re-verified this session) | Answer in Telugu/Hindi with the English statutory text alongside (English text prevails per India Code's own disclaimer [V] https://www.indiacode.nic.in/disclaimer.jsp?locale=en) |
| 6 | Legal help costs money | Free legal aid exists under s.12 of the Legal Services Authorities Act, 1987 for women, children, SC/ST, industrial workmen and others; Telangana's income ceiling is ₹1,00,000 [V] https://kslsa.kar.nic.in/faq.html ; https://nalsa.gov.in/dashboard/TL ; https://nyaaya.org/legal-explainer/eligibility-for-legal-aid/ | Instant eligibility check + exact contact for the State/District Legal Services Authority |
| 7 | AI answers can be confidently wrong | Stanford RegLab/HAI found even purpose-built legal AI tools hallucinated on >17% (Lexis+ AI) to >34% (Westlaw AI-AR) of benchmark queries; general chatbots 58–82% [V] https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries | Every claim checked against retrieved source text; unsupported claims shown as such |

## 3. Personas (from the brief)

Each persona maps to a small, bounded set of laws — this is what makes a 3–4 hour build feasible.

| Persona | Typical question | Laws to cover in MVP |
|---|---|---|
| **Tenant** (Hyderabad) | "Landlord won't return my deposit / wants me out in a week" | Telangana Buildings (Lease, Rent and Eviction) Control Act, 1960 — **data gap:** India Code page lists no files [V] https://www.indiacode.nic.in/handle/123456789/8607 |
| **Worker** | "Employer hasn't paid wages for 2 months" | Code on Wages, 2019 (partly in force from 21 Nov 2025) [V]; Telangana Shops & Establishments Act, 1988 [V] https://www.indiacode.nic.in/bitstream/123456789/8549/1/act_20_of_1988.pdf |
| **Citizen / consumer** | "Seller won't refund a defective phone" / "Police refused my complaint" | Consumer Protection Act, 2019 [V]; BNSS s.173 (FIR / zero FIR / e-FIR) [V]; RTI Act, 2005 |
| **Small shop owner** | "What registration/hours rules apply to my shop and staff?" | Telangana Shops & Establishments Act, 1988 + 2025 hours notification [V] |
| **Everyone** | "Can I get a free lawyer?" | Legal Services Authorities Act, 1987 s.12 [V] |

## 4. What the product is NOT (scope guardrails)

- **Not a lawyer and not legal advice.** In India only enrolled advocates may practise law (Advocates Act s.29/33), and the Supreme Court has read "practice" to include advice; in Sept 2026 the Bar Council of Maharashtra & Goa issued notice to a non-advocate "legal and advisory" platform under s.45 [V] https://www.livelaw.in/news-updates/bar-council-of-maharashtra-goa-warns-platform-against-giving-legal-advice-without-advocate-enrolment-548350 (2026-09-02). **[R]** Position as *legal information + routing to authorised help*, never "your lawyer".
- **Not global coverage.** Architecture can be jurisdiction-agnostic, but only India/Telangana content is claimed.
- **Not a case-law research tool.** Judgments add complexity and noise for lay users; statutes + official procedures answer most persona questions **[R]**.

## 5. Problem statement, restated for the team

> A tenant, worker, consumer or shop owner in Telangana describes their situation in Telugu, Hindi or English. Within seconds they get: what the law says (in their language), **the exact section it comes from — verified, current, and linkable**, how long they have to act, and exactly where to go for free help.

## 6. Research gaps

- No authoritative user research (interviews/surveys) with the four personas was possible in this phase.
- Telugu/Urdu speaker statistics for Telangana were not re-verified.
- Telangana's tenancy Act text is not downloadable from India Code (empty file list) — an official alternative source must be located before the tenant scenario is demoed.
