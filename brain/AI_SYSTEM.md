# AI System

**State: no AI code exists.** `backend/app/ai/{providers,prompts,services}` and `backend/app/rag/*` contain only `__init__.py`. Only configuration is defined (`core/config.py`, `.env.example`). This file states the intended design and non-negotiable rules.

Detail: `docs/backend/NVIDIA_INTEGRATION.md`, `docs/backend/RAG_PIPELINE.md`.

## Configuration (real, in code)

| Setting | Default | Note |
|---|---|---|
| `NVIDIA_API_KEY` | empty | Server-side only. `SecretStr` |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` | |
| `NVIDIA_CHAT_MODEL` | empty | **Unknown.** Set to the NVIDIA-hosted GLM model id you have access to. Never hard-code a guess |
| `NVIDIA_EMBEDDING_MODEL` | empty | **Unknown.** Multilingual embedding model id |
| `EMBEDDING_DIM` | 1024 | Must equal the model output |
| `NVIDIA_TIMEOUT_SECONDS` | 60 | |
| `NVIDIA_MAX_RETRIES` | 3 (0–6) | |

## Design (Planned)

1. **Provider abstraction.** `ai/providers` defines a small interface (`chat`, `chat_stream`, `embed`). One implementation talks to NVIDIA over httpx. Services depend on the interface so models can be swapped or faked in tests.
2. **RAG-only legal answers.** The model is never asked to recall law from memory. It receives retrieved section text and must answer from it.
3. **Hybrid retrieval.** Vector similarity + keyword (tsvector) merged and re-ranked, always filtered by jurisdiction and effective date.
4. **Structured output.** The model returns answer text plus citations referencing provided section ids. The backend parses and validates; free-text citations are not trusted.
5. **Citation verification.** Every citation must resolve to a stored section and its quoted span must occur in that section's text. Failures are dropped. If no verified citation supports the answer, return a refusal.
6. **Multilingual.** Embedding model must be multilingual. The answer language follows the user preference; section text is quoted in its original language with an optional translation labelled as such.
7. **Streaming.** Answers stream to the UI; verification results arrive as a final event and may retract or annotate streamed text (contract in DATA_CONTRACTS).
8. **Prompt management.** Prompts are versioned files under `ai/prompts`, not inline strings. Each has a version id recorded with the message.

## Safety rules

- Retrieved text and uploaded documents are untrusted data. Delimit them; instructions inside them are never followed.
- No tool calls with side effects are exposed to the model.
- Do not log questions, document text or model output (`core/logging.py` redacts these keys; keep it that way).
- Temperature low for legal answering; determinism over creativity.
- The system prompt forbids legal advice, outcome prediction and invented citations, and requires a refusal when context is insufficient.

## Evaluation (Missing, required before launch)

A fixed evaluation set per supported jurisdiction measuring: citation validity (must be 100%), groundedness, refusal correctness, and language quality. Prompt or model changes must not regress it.

## Status

| Area | Status |
|---|---|
| Settings | Implemented |
| NVIDIA client | Missing |
| Embeddings + ingestion | Missing |
| Retrieval + ranking | Missing |
| Prompts | Missing |
| Citation verification | Missing |
| Evaluation harness | Missing |
