# Legal Knowledge Architecture

**State (2026-10-31): a catalogue data model, an ingestion pipeline for one source, and an API exist. The indexed corpus is Part III (Fundamental Rights) of the Constitution of India only: 24 rights, 29 provisions, 1 document. Coverage is NOT complete and has not been audited. No Central Act, State Act, rule, notification, judgment or scheme is indexed, and no State or Union Territory legislation is covered.**

## Catalogue (implemented)

Code: `backend/app/legal/catalogue` (schemas, repository, service), `backend/app/legal/ingestion` (Constitution parser and builder), `backend/scripts/ingest_constitution.py`, API `backend/app/api/v1/endpoints/catalogue.py`, corpus `backend/data/corpus/india/*.jsonl` plus `audit.json`.

Record types (separate files, linked by id): sources, jurisdictions (India, 28 States, 8 UTs), domains, categories, documents, provisions, authorities, remedies, rights. Every document, provision and right carries `provenance` (source id, URL, retrieval time, SHA-256 of the source file, locator) and `verification` (`unverified`, `machine_extracted` or `human_verified`, plus `needs_review`). Rights have a `kind`: `enforceable_right`, `constitutional_protection`, `procedural_right`, `scheme_benefit`; today only the first three of Part III's kinds appear, and nothing is a scheme benefit.

What is extracted versus editorial:
- Extracted from the official PDF: provision text (verbatim, with the printed footnote markers), marginal headings, group headings, amendment footnotes, repeal status of articles, the commencement date (read from Article 394), the edition note, and the check that every State and UT name appears in the First Schedule.
- Editorial and unreviewed: which Part III articles count as individual rights (`RIGHT_ARTICLES`), which are procedural (`PROCEDURAL_ARTICLES`), the domain name "Constitutional law", the titles of the sub-rights of Article 19(1) (derived from the sub-clause words), and the Article 32 remedy link. All are flagged `needs_review` and their basis is stored on the record.
- Not written: plain-language explanations (`plain_language` is null everywhere). Nothing is generated or invented into the corpus.

Source used: the Constitution of India pocket edition PDF (text as on May 2022, amended up to the 105th Amendment) at a `cdnbbsr.s3waas.gov.in` URL. Its publisher is inferred from the document's own preface; the link from legislative.gov.in was not confirmed. Later amendments are not reflected. Re-running the script fails loudly if an article is not found, if the commencement date cannot be parsed, or if a State or UT name is missing from the First Schedule.

## Principle

The platform's value is trust. Law enters the system only through a **source registry** of official publications, is stored in a citeable structure, and is shown with its provenance. The model never supplies law from memory.

## Data model (see DATABASE_SCHEMA for tables)

```
Jurisdiction ── LegalSource ── LegalDocument (versioned) ── LegalSection (citeable) ── SectionChunk (retrieval)
```

- **Jurisdiction**: hierarchical (country → region → locality). Coverage status per jurisdiction: `none`, `partial`, `verified`. Only `partial`/`verified` may answer, and the UI shows which.
- **LegalSource**: publisher, URL, retrieval date, content hash, licence, who verified it and when. Prefer official government publishers and official gazettes.
- **LegalDocument**: an act, rule, regulation or judgment with effective dates and version. Retrieval filters on the date the user cares about (default: today).
- **LegalSection**: the smallest unit that can be cited, with a stable label such as "12(3)". Hierarchy preserved.
- **SectionChunk**: derived text and embeddings. Always maps back to exactly one section.

## Source registry rules

1. Every document has a registered source. No source, no ingestion.
2. Store the retrieval timestamp and a content hash. Re-ingestion that changes the hash creates a new version, it does not overwrite.
3. Record licence and reuse terms. Do not ingest content we may not redistribute.
4. Never ingest from unofficial summaries, blogs or model-generated text as if they were law.
5. Translations are labelled as translations and linked to the original-language section.

## Verification rules

- A human or documented automated check marks a source `verified` with date and verifier.
- Citation verification at answer time (see AI_SYSTEM): section exists, quoted span occurs in section text, section is in force for the jurisdiction and date.
- Sample or seed content for development must be flagged `is_sample=true` (Planned) and rendered with `MockDataBadge`. Sample data never ships to production.

## Fabrication rules for contributors (and Claude)

- Do not write real-sounding statute names, section numbers, case names or quotations into code, tests, fixtures, docs or UI unless they come from a registered source in the repo.
- Test fixtures use clearly fictional law ("Example Tenancy Act, Section 1"), labelled as fixtures.
- If the true law is unknown, say it is unknown.

## Coverage transparency

Each jurisdiction exposes: sources ingested, last verified date, known gaps. This is a product feature (`/sources`, `/jurisdictions/{code}/coverage`), not an internal note.

## Status

| Area | Status |
|---|---|
| Jurisdiction records (India, 28 States, 8 UTs) | Implemented (names confirmed in the First Schedule; codes unverified) |
| Source registry | Partial (one source, JSONL files, no database) |
| Ingestion pipeline | Partial (Constitution Part III only) |
| Section segmentation | Partial (articles of Part III) |
| Verification workflow | Missing (no human has verified any record; coverage audit not started) |
| Central Acts, State Acts, rules, notifications, judgments, schemes | Missing |
| Repeal and amendment tracking across documents | Partial (article-level repeal flag and verbatim footnotes for Part III only) |
| First supported jurisdiction | India (Union level, Constitution only); see ADR-012 |
