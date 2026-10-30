---
name: legal-intelligence
description: Model and manage Aequa's legal knowledge — jurisdictions, source registry, documents, sections, versions, coverage and verification workflow. Use when choosing or onboarding a jurisdiction or source, or designing legal data structures. Never supplies law from memory.
---

# Legal Intelligence

## When to use
Selecting the first jurisdiction (ADR-012), onboarding an official source, defining the registry/section structure, coverage reporting, or designing verification.

## Required project context
`brain/LEGAL_KNOWLEDGE.md`, `brain/DATABASE_SCHEMA.md` (legal tables), `docs/backend/RAG_PIPELINE.md` (segmentation). Reality: no jurisdiction, no sources, no code in `app/legal/*`.

## Engineering principles
- Official provenance or nothing. Registry entries record publisher, URL, retrieval date, hash, licence, verifier and verification date.
- Versioned law: new hash = new version, effective dates respected.
- Coverage is transparent and honest per jurisdiction (none / partial / verified).
- Contributors never write real-sounding law from memory.

## Workflow
1. Define candidate sources for a jurisdiction; fetch and read them; note URL + retrieval date for every fact (use the `legal-research-engineer` agent for research).
2. Evaluate: authority, stability, licence/reuse terms, language(s), format, update cadence.
3. Model the hierarchy and labels for the document family; write segmentation rules (hand to `rag-engineering`).
4. Define the verification checklist and who signs off; implement registry/verification fields.
5. Publish coverage (sources, last verified, gaps) as product data.
6. Record the jurisdiction decision as an ADR.

## Relevant files
`backend/app/legal/{sources,documents,sections,jurisdictions}/`, `backend/app/core/exceptions.py` (`UnsupportedJurisdiction`), `brain/LEGAL_KNOWLEDGE.md`.

## Implementation requirements
- `is_sample` flag for development content; sample content never reaches production and is labelled in UI.
- Translations link to the original-language section and are labelled.
- Parent jurisdictions' law can apply to children; model inheritance explicitly.

## Testing requirements
Unit tests on hierarchy resolution, effective-date selection, version creation on hash change, coverage status transitions. Fixtures are fictional ("Example Tenancy Act, Section 1").

## Common mistakes
- Using a summary site or model output as a "source".
- Overwriting a document instead of versioning it.
- Claiming coverage that has no verified sources.
- Invented statute names in tests or docs.

## Definition of done
Registry and structures implemented with tests, first jurisdiction decision recorded, every ingested document traceable to an official source with verification metadata, coverage output accurate.
