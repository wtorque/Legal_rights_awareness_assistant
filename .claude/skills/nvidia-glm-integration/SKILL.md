---
name: nvidia-glm-integration
description: Implement Aequa's NVIDIA-hosted GLM and embedding client — provider interface, configuration, streaming, retries, rate limits, error mapping and response validation. Use when touching backend/app/ai/providers or any NVIDIA call.
---

# NVIDIA GLM Integration

## When to use
Writing or changing the NVIDIA client, model configuration, streaming, retry logic, or embedding calls.

## Required project context
`docs/backend/NVIDIA_INTEGRATION.md`. Config exists in `core/config.py`: `NVIDIA_API_KEY` (SecretStr), `NVIDIA_BASE_URL` (`https://integrate.api.nvidia.com/v1`), `NVIDIA_CHAT_MODEL` and `NVIDIA_EMBEDDING_MODEL` (blank, Unknown), `EMBEDDING_DIM`, `NVIDIA_TIMEOUT_SECONDS`, `NVIDIA_MAX_RETRIES`.

## Engineering principles
- Verify the current NVIDIA API contract in its official documentation before coding. Do not rely on memory; record what you verified and when.
- Model ids are configuration, never literals.
- One module talks to NVIDIA; everything else uses the interface.
- Treat all responses as untrusted and validate them.

## Workflow
1. Read the NVIDIA docs for the chosen models: endpoints, request fields, streaming format, embedding input types, limits. Update `NVIDIA_INTEGRATION.md` with verified facts and the doc date.
2. Define `ChatProvider` / `EmbeddingProvider` interfaces and a fake for tests.
3. Implement `NvidiaProvider` with a shared `httpx.AsyncClient` (timeouts, limits).
4. Add retry: exponential backoff + jitter on timeouts, connection errors, 429, 5xx; honour `Retry-After`; no retry on other 4xx.
5. Streaming: parse events, support cancellation on client disconnect, idle timeout.
6. Map failures to `UpstreamUnavailable`; never include upstream bodies or keys in errors/logs.
7. Validate output into Pydantic models; one bounded retry on malformed output.
8. Confirm `EMBEDDING_DIM` equals the embedding output; fail startup/ingestion on mismatch.

## Relevant files
`backend/app/ai/providers/`, `backend/app/core/config.py`, `backend/.env.example`, `backend/app/core/exceptions.py`.

## Implementation requirements
- The key is read with `.get_secret_value()` only when building headers.
- Batch embeddings; hash-cache identical texts.
- Log metadata only (model id, latency, status, token counts if provided).

## Testing requirements
Offline tests with mocked transport (`httpx.MockTransport`): success, 429 with Retry-After, 5xx retries, timeout, malformed JSON, truncated stream, cancel. A live smoke test is opt-in via env var, never in default CI.

## Common mistakes
- Guessing a GLM model id or API parameters.
- Logging prompts or the Authorization header.
- Retrying non-idempotent failures endlessly.
- Per-request client creation (no pooling).

## Definition of done
Interface + NVIDIA implementation + fake, verified API facts documented, tests green offline, no secrets or text in logs, dimension check in place.
