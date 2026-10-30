---
name: citation-verification
description: Implement and test Aequa's citation verification — checking that every cited section exists, the quoted text appears in it, and it is in force for the jurisdiction and date, with a refusal fallback. Use when touching backend/app/rag/citations or how citations are shown.
---

# Citation Verification

## When to use
Building or changing the verifier, structured citation output, UI treatment of sources, or investigating a suspected bad citation. This is the product's central trust gate.

## Required project context
`brain/AI_SYSTEM.md` (design rule 5), `docs/backend/RAG_PIPELINE.md` §10, `brain/LEGAL_KNOWLEDGE.md`, `docs/integration/DATA_CONTRACTS.md` (`Source`, SSE `retract`/`final`). Reality: nothing implemented.

## Engineering principles
- The model cites only by ids of sections it was given. Free-text citations are never trusted.
- A citation is shown only if verified. Unverified = removed.
- If no grounded claim remains, the answer becomes a refusal.
- 100% citation validity is a hard gate, not a target.

## Workflow
1. For each citation `{source_ref, quote}`: resolve `source_ref` to a section actually retrieved for this request.
2. Normalise whitespace/case/unicode and check the quote is a contiguous substring of that section's text.
3. Check the section's document version is in force for the requested date and belongs to the request's jurisdiction (or an applicable parent).
4. Mark `verified` with `verification_method`; persist only verified citations.
5. Evaluate remaining claims; if none supported, return `status="refused"`, reason `insufficient_evidence`.
6. In streaming, emit `retract` when streamed text includes unverified claims, then `final`.
7. Frontend renders only sources from the verified list.

## Relevant files
`backend/app/rag/citations/`, `backend/app/ai/services/`, `backend/app/models/` (`message_citations`), frontend source/citation components.

## Implementation requirements
- Pure, deterministic, side-effect-free verifier function(s), unit-testable without DB or network.
- Normalisation rules documented and identical in tests.
- Multilingual: compare in the section's original language; handle unicode normalisation.
- Never "repair" a quote by fuzzy-matching silently; fuzzy matching, if ever used, is explicit, thresholded and labelled.

## Testing requirements
Exhaustive unit tests: valid; unknown id; id from a different request; altered quote; quote spanning two sections; out-of-force version; wrong jurisdiction; empty quote; whitespace/case differences; unicode forms; all citations fail → refusal.

## Common mistakes
- Checking that the section exists but not that the quote is in it.
- Verifying against the model's own paraphrase.
- Showing sources before verification completes.
- Accepting sections that were never retrieved.

## Definition of done
Verifier implemented and exhaustively tested, integrated into the answer flow with refusal fallback, UI renders verified sources only, evaluation shows 100% citation validity.
