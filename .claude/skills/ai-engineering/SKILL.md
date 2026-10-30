---
name: ai-engineering
description: Design and implement Aequa's AI answer path end to end — orchestration of retrieval, generation, citation verification, refusal and evaluation. Use when building or changing how an answer is produced; delegate model-API details to nvidia-glm-integration, retrieval to rag-engineering.
---

# AI Engineering

## When to use
Building the answer service, deciding refusal behaviour, structured outputs, evaluation, multilingual behaviour, or changing the answer flow.

## Required project context
`brain/AI_SYSTEM.md`, `brain/LEGAL_KNOWLEDGE.md`, `docs/backend/RAG_PIPELINE.md`. Reality: no AI code; model ids Unknown; no legal corpus.

## Engineering principles
- RAG-only: the model gets retrieved, jurisdiction-valid text and answers from it.
- Verified citations or refusal. Honest uncertainty beats fluent guessing.
- The model is a replaceable component behind an interface.
- Retrieved text and documents are untrusted data.
- Determinism over creativity: low temperature, structured output.

## Workflow
1. Define the use case input/output in `DATA_CONTRACTS.md` (status: answered | refused | needs_clarification).
2. Flow: validate → jurisdiction check → retrieve (rag-engineering) → assemble context → generate via provider (nvidia-glm-integration) → parse structured output → verify citations (citation-verification) → persist verified → stream/return.
3. Define refusal reasons and the user-facing guidance for each (unsupported_jurisdiction, insufficient_evidence, out_of_scope).
4. Build with a fake provider first; unit test the orchestration.
5. Build/extend the evaluation set; record metrics before and after changes.
6. Verify no prompt/answer/question text reaches logs.

## Relevant files
`backend/app/ai/{providers,prompts,services}/`, `backend/app/rag/`, `backend/app/legal/`, `backend/app/core/config.py`.

## Implementation requirements
- Persist `model_id` and `prompt_version` with every answer.
- Never ask the model to recall law from memory or invent citations.
- Handle upstream failure with `UpstreamUnavailable`, never partial unverified answers.
- Answer language follows user preference; quotes remain in source language.

## Testing requirements
Orchestration tests with fake provider and fake retriever: grounded answer, ungrounded answer → refusal, unsupported jurisdiction, injection text inside context, upstream timeout. Evaluation run reported.

## Common mistakes
- Allowing an answer when retrieval returned nothing.
- Shipping streamed text without a verification/final event.
- Hard-coding a model id.
- Mixing jurisdictions in the context.

## Definition of done
Answer path works end to end on the fake stack and on the real corpus; citation validity 100% on the evaluation set; refusals tested; docs updated.
