# Legal Reliability & Safety

**Prepared:** 31 Oct 2026 · All URLs accessed 2026-10-31.
**[V]** verified · **[A]** assumption · **[R]** recommendation
This document is research, not legal advice.

---

## 1. Regulatory context (India)

### 1.1 Practice of law
- **[V]** Under the Advocates Act, s.29 only advocates may practise law; s.33 restricts practice before courts/authorities; s.45 makes illegal practice punishable with up to six months' imprisonment. The Supreme Court has read "practice" to include advice and consultancy. In Sept 2026 the Bar Council of Maharashtra & Goa issued a notice to "Society First", a non-advocate legal/advisory platform, threatening s.45 action. https://www.livelaw.in/news-updates/bar-council-of-maharashtra-goa-warns-platform-against-giving-legal-advice-without-advocate-enrolment-548350 (2 Sep 2026)
- **[A]** The line between general legal *information* and tailored *advice* is not settled for AI tools; the article does not address AI.
- **[R] Product rules:**
  - Describe the product as "legal information and guidance to official help" — never "legal advice", "AI lawyer", "consult".
  - Explain what the law says and who can help; don't tell users what they *should* do in their specific dispute or predict outcomes.
  - Always surface free, authorised help: Tele-Law (14454), NALSA (15100), Telangana SLSA.

### 1.2 Misleading-claims precedent
- **[V]** FTC action against DoNotPay for unsubstantiated "robot lawyer" claims; $193,000 settlement. https://abovethelaw.com/2024/09/chatbot-law-site-donotpay-settles-with-ftc/
- **[R]** No accuracy claims in the pitch beyond what you measured. Say "every claim is checked against the section text", not "100% accurate".

### 1.3 Data protection — DPDP Act 2023 & Rules 2025
- **[V]** MeitY notified the DPDP Rules on 14 Nov 2025 with phased commencement; obligations include notices stating purposes, data categories and retention; breach notification to the Board and affected persons; verifiable guardian consent for certain processing of children's data. https://en.wikipedia.org/wiki/Digital_Personal_Data_Protection_Rules,_2025 (secondary; exact phase dates not confirmed from primary text)
- **[R]** Simplest compliant design for the hackathon: **no accounts, no stored conversations, no analytics on question text**. Process in memory, discard. Show a one-line notice: "We don't store your questions."
- Users will type sensitive facts (domestic violence, caste atrocity, arrests). Don't log request bodies; strip phone numbers/Aadhaar-like 12-digit numbers before sending to the LLM **[R]**.

## 2. Failure modes and handling

| Risk | Example | Handling **[R]** |
|---|---|---|
| **Incorrect answer** | Wrong limitation period | Deadlines only from deterministic Rights Clock with cited section; LLM forbidden to state numbers not in a quote |
| **Outdated law** | "Under the Payment of Wages Act…" | `in_force` metadata; Repeal Radar banner; corpus only contains current Codes for workers. Labour Codes in force from 21 Nov 2025 (two only partly) [V] https://ksandk.com/labour-employment/all-four-labour-codes-enforced-from-21-november-2025/ |
| **Partly-in-force law** | Citing a Code on Wages section not yet commenced | Tag each section `in_force: yes/partly/no`; verifier warns on non-commenced sections |
| **Repealed provision** | "IPC 420" | Repeal Radar maps to BNS 318(4) [V] https://news24online.com/india/no-more-420-fraud-cases-know-difference-between-ipc-420-and-bns-3184-new-law-punishment/931933/ |
| **Conflicting sources** | Central vs state rule; NALSA dashboard vs SLSA notice | Prefer statute text > Gazette > authority website; show both with dates if they conflict. NALSA's Telangana dashboard has stale (2019) figures and inconsistent DLSA counts [V] https://nalsa.gov.in/dashboard/TL |
| **Jurisdiction uncertainty** | User outside Telangana | State dropdown; if not Telangana, answer central-law parts only and say state rules weren't checked |
| **Missing evidence** | Question on divorce (not in corpus) | `insufficient_evidence` → "We haven't verified laws on this topic yet" + help card. Never answer from model memory. |
| **High-risk situation** | Violence, arrest, eviction today, child at risk | Keyword/LLM risk classifier → top-of-screen urgent card: police 112 **[A]** (verify), women's helpline 181 **[A]** (verify), NALSA 15100 [V], before any explanation |
| **Translation error** | Telugu mistranslates "may" as "must" | English source quote shown beside every claim; s.52(1)(r) disclaimer [V] https://copyright.gov.in/Copyright_Act_1957/chapter_xi.html |
| **Sensitive documents** (P1 Document X-Ray) | Rent agreement with Aadhaar number | Process in memory; mask 12-digit numbers; don't persist uploads |
| **Prompt injection via pasted text** | Notice containing "ignore instructions" | Treat pasted text as data; system prompt states this; verifier still enforces quotes from *corpus*, not user text |

## 3. Trust framework

| Principle (from brief) | Mechanism | Where |
|---|---|---|
| Every legal claim linked to evidence | Claim → `chunk_id` → section → India Code URL + download date | `AI_AND_RAG_RESEARCH.md` §4 |
| Citations validated against retrieved sources | Deterministic verifier (retrieved? quote present? section matches? in force?) | §5 there |
| Unsupported claims not presented as fact | Unverified claims greyed + labelled | UI |
| Insufficient evidence communicated | Explicit "not enough information" state | UI |
| System doesn't pretend to be a lawyer | Wording rules, footer, no outcome predictions | §1.1 |
| Users can find qualified help | Help card on every answer; eligibility checker | P0 feature |

## 4. Required UI copy **[R]**

- Header badge: "Legal information from official texts — not legal advice."
- Under each answer: "Checked against: *Consumer Protection Act, 2019, s.69* · India Code · downloaded 31 Oct 2026."
- Translation note (s.52(1)(r)): "This translation has not been authorised or accepted as authentic by the Government. The English text prevails."
- Help card: "Free help: Tele-Law 14454 · NALSA 15100 · Telangana SLSA 040-23446725" (re-confirm numbers before demo).

## 5. Evaluation plan (30 minutes, before demo) **[R]**

Write 15 test questions (3 per persona + 3 out-of-scope). For each record: retrieved correct section? all claims verified? any repealed law? correct refusal for out-of-scope? Report the actual numbers in the pitch ("13/15 fully verified in our test set") — honest and specific.

## 6. Research gaps
- Emergency numbers 112 / 181 not re-verified this session.
- DPDP phase dates not confirmed from MeitY primary text.
- No Indian court/BCI ruling found specifically on AI legal-information tools.
