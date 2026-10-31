# Official Legal Data Sources (India-first)

**Prepared:** 31 Oct 2026 · All URLs accessed 2026-10-31.
**[V]** verified · **[A]** assumption/not verified · **[R]** recommendation

> Licensing and reuse are analysed in detail in `LEGAL_DATA_LICENSING.md`. "Automated access" below means: did we find an explicit statement permitting or forbidding bots/scraping? In most cases we found **none** — that is a gap, not a permission.

---

## 1. Legislation

### 1.1 India Code (Legislative Department, Ministry of Law & Justice)
| Field | Finding |
|---|---|
| URL | https://www.indiacode.nic.in/ |
| Jurisdiction | Central Acts; State Acts; subordinate legislation uploaded by ministries/departments [V] |
| Content | Bare Acts as PDFs; disclaimer says PDFs are "exact reproduction of officially adopted text" and **the English version prevails** in a discrepancy [V] https://www.indiacode.nic.in/disclaimer.jsp?locale=en |
| API | None found **[A]** |
| Download | Per-Act PDF (e.g. Telangana Shops & Establishments Act, 1988 [V] https://www.indiacode.nic.in/bitstream/123456789/8549/1/act_20_of_1988.pdf) |
| Update frequency | Not stated **[A]** |
| Warranty | "as is" and "as available" [V] |
| Automated access | Not addressed in the disclaimer [V] |
| **Data gap found** | The Telangana Buildings (Lease, Rent and Eviction) Control Act, 1960 page lists **no files** and no amendments [V] https://www.indiacode.nic.in/handle/123456789/8607 |
| Integration **[R]** | Manually download the 6–8 PDFs for the MVP; parse once; store section-level text with the PDF URL and download date. Do not crawl. |

### 1.2 e-Gazette of India
| Field | Finding |
|---|---|
| URL | https://egazette.gov.in/ **[A]** (URL from general knowledge; site not fetched this session) |
| Content | Official notifications — commencement of Codes, rules, amendments |
| Why it matters | The Labour Codes' commencement (21 Nov 2025) and partial commencement details live in Gazette notifications [V] https://ksandk.com/labour-employment/all-four-labour-codes-enforced-from-21-november-2025/ |
| Reuse | Copyright Act s.52(1)(q)(i): reproducing matter published in an Official Gazette (other than an Act) is not infringement [V] https://copyright.gov.in/Copyright_Act_1957/chapter_xi.html |
| Integration **[R]** | P3 — basis for a future amendment tracker. Store commencement notification references as metadata now. |

### 1.3 Telangana Gazette / state departments
- **[V]** The 8 Jul 2025 working-hours exemption was published in an extraordinary Telangana Gazette under s.73(4) of the Telangana Shops & Establishments Act. https://www.indialaw.in/blog/labour/telangana-eases-working-hours-for-commercial-establishments//pdf/ (secondary summary)
- Official Telangana Gazette URL not verified **[A]**.

## 2. Judgments (not needed for MVP)

### 2.1 Indian Supreme Court Judgments — AWS Open Data
| Field | Finding [V] https://registry.opendata.aws/indian-supreme-court-judgments/ |
|---|---|
| Content | SC judgments 1950–2025, downloaded from eCourts; English and regional languages |
| Format | JSON metadata, Parquet, zipped judgments; S3 `indian-supreme-court-judgments`, `ap-south-1`, no AWS account needed |
| Update | Bi-monthly |
| Licence | CC-BY-4.0 (dataset); maintainer Dattam Labs |
| Integration **[R]** | P3. Bulk, clean, licence-clear — best route to case law later. |

### 2.2 eCourts services / judgment search
- High Court case status: https://hcservices.ecourts.gov.in/ [V] (site exists). API not public **[A]**. Captcha-protected search **[A]**. Do not scrape.

### 2.3 Indian Kanoon API
- Prepaid, attribution required for display and RAG use [V] https://api.indiankanoon.org/terms/ . Commercial aggregator, not official. P3 if judgments ever needed.

## 3. Legal aid and help routing

| Source | Finding | Use |
|---|---|---|
| **NALSA / State SLSA sites** | s.12 eligibility categories [V] https://kslsa.kar.nic.in/faq.html ; Telangana SLSA address: Nyaya Seva Sadan, City Civil Court Compound, Purani Haveli, Hyderabad 500002; phone 040-23446725; income ceiling ₹1,00,000 [V] https://nalsa.gov.in/dashboard/TL | Eligibility checker + contact card. **Caution:** same page has 2019-era statistics and inconsistent DLSA counts [V] — re-confirm phone before demo. |
| **NALSA helpline 15100** | Short code allocated by DoT [V] https://dot.gov.in/node/27489 | Help card |
| **Tele-Law** | Free pre-litigation advice from panel lawyers; toll-free 14454; via CSCs [V] https://opengovasia.com/india-launches-disha-2-0-to-expand-digital-access-to-justice/ | Help card |
| **National Consumer Helpline / e-Jagriti** | NCH 1915; e-Jagriti launched 1 Jan 2025 for consumer case filing [V] https://ianslive.in/national-consumer-day-nch-e-jagriti-platforms-ensure-timely-grievance-redressal--20251223135215 | Consumer action plan |
| **Nyaaya** | High-quality plain-language explainers; state-wise legal-aid income table [V] https://nyaaya.org/legal-explainer/eligibility-for-legal-aid/ | Reference/cross-check only — not ingested (licence unknown) |

## 4. International / global repositories (for architecture, not MVP)

| Source | Finding | Relevance |
|---|---|---|
| **Akoma Ntoso (OASIS LegalDocML)** | OASIS standard XML vocabulary for legislative documents, with a naming convention [V] https://docs.oasis-open.org/legaldocml/akn-core/v1.0/csd01/part1-vocabulary/akn-core-v1.0-csd01-part1-vocabulary.html ; https://oasis-open.org/?p=4747 | Model for our internal document schema (work → expression → section) |
| **European Legislation Identifier (ELI)** | EU framework for identifying and reusing legislation [V] https://data.europa.eu/en/news-events/news/european-legislation-identifier-making-eu-laws-easier-find-and-reuse | Pattern for stable, versioned law URIs |
| **legislation.gov.uk** | Point-in-time versions exist (third-party tools use them) [V] https://apify.com/yummy_persimmon_er1/uk-legislation-history ; licence (OGL) **[A]** not verified this session | Gold-standard example of versioned law; P3 jurisdiction |

## 5. Recommended MVP corpus (Telangana personas) **[R]**

| # | Instrument | Source | Persona | Status |
|---|---|---|---|---|
| 1 | Consumer Protection Act, 2019 | India Code PDF | Consumer, shop owner | Download |
| 2 | Bharatiya Nagarik Suraksha Sanhita, 2023 — s.173 only (FIR) | India Code PDF | Citizen | Download; ingest relevant chapter |
| 3 | Right to Information Act, 2005 | India Code PDF | Citizen | Download |
| 4 | Code on Wages, 2019 | India Code PDF | Worker | Download; mark which sections are in force (partial commencement) [V] |
| 5 | Telangana Shops & Establishments Act, 1988 (+ 8 Jul 2025 notification note) | India Code PDF [V] | Worker, shop owner | Download |
| 6 | Legal Services Authorities Act, 1987 — s.12 | India Code PDF | All | Download |
| 7 | Telangana Buildings (Lease, Rent & Eviction) Control Act, 1960 | **No file on India Code [V]** | Tenant | Find official alternative (Telangana govt/High Court site) or drop tenant scenario from live demo |
| 8 | BNS, 2023 — only sections needed for Repeal Radar mapping | India Code PDF | Citizen | Download |

Size estimate **[A]**: under 2,000 section-level chunks — small enough for in-memory search.

## 6. Research gaps
- No official API found for India Code; robots.txt not checked (shell network blocked to non-allowlisted hosts).
- e-Gazette and Telangana Gazette not fetched.
- Official IPC→BNS correspondence table not located; mapping must be verified section by section against BNS text.
