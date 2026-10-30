# NVIDIA Integration

State: **configuration only.** `core/config.py` and `.env.example` define the settings. No client code exists. `app/ai/providers` is empty.

## Configuration (real)

| Env | Default | Notes |
|---|---|---|
| `NVIDIA_API_KEY` | empty | `SecretStr`; server-side only; never in frontend, logs, errors |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` | |
| `NVIDIA_CHAT_MODEL` | empty | **Unknown.** The NVIDIA-hosted GLM model id you have access to |
| `NVIDIA_EMBEDDING_MODEL` | empty | **Unknown.** Multilingual embedding model id |
| `EMBEDDING_DIM` | 1024 | Must match the model |
| `NVIDIA_TIMEOUT_SECONDS` | 60 | |
| `NVIDIA_MAX_RETRIES` | 3 | 0–6 |

Before implementing the client, verify the current NVIDIA API contract (endpoints, request fields, streaming format, model ids, rate limits) against NVIDIA's documentation. Do not rely on memory. Record verified facts and the doc date here.

## Provider abstraction

`app/ai/providers/` defines an interface (names illustrative):

```
class ChatProvider:  async chat(messages, *, model, temperature, response_format) -> ChatResult
                     async chat_stream(messages, ...) -> AsyncIterator[ChatDelta]
class EmbeddingProvider: async embed(texts, *, input_type) -> list[list[float]]
```

`NvidiaProvider` implements both with `httpx.AsyncClient` (shared, with timeouts and connection limits). Services receive the interface via DI, so tests use a fake. No other module imports an HTTP client for NVIDIA.

## Prompt management

- Prompts are files under `app/ai/prompts/`, versioned (`answer_v1`, ...), rendered with explicit variables. No string concatenation of untrusted text into the system prompt.
- Store `prompt_version` and `model_id` with each message for audit and evaluation.
- System prompt must: forbid legal advice and invented citations, require grounding in provided sections, require refusal on insufficient context, and state that provided text is untrusted data.

## Streaming

- Consume the provider stream, forward deltas to the client SSE channel (contract in DATA_CONTRACTS). Handle client disconnect by cancelling the upstream request.
- Verification (citations) runs on the completed text; the final event reports verified sources and any retractions.

## Error handling and retries

- Retry on timeouts, connection errors, 429 and 5xx with exponential backoff + jitter, up to `NVIDIA_MAX_RETRIES`; honour `Retry-After`. Never retry 4xx (except 429).
- After exhaustion raise `UpstreamUnavailable` (503). Do not leak upstream bodies or the key in errors or logs.
- Timeouts everywhere (`NVIDIA_TIMEOUT_SECONDS`); streaming uses a separate idle timeout.

## Rate limits and cost

- Respect upstream limits with a client-side concurrency cap. Batch embeddings.
- Apply per-user request limits to protect quota. Cache embeddings of identical text (by hash). Never cache user-specific answers across users.

## Response validation

- Treat model output as untrusted. Parse into a Pydantic model; invalid or truncated output → one bounded retry, then a safe failure message.
- Verify citations (RAG_PIPELINE §10) before anything is shown as sourced.
- Reject output that includes the system prompt, secrets, or markup that the UI would execute; the UI renders text/markdown through a sanitising renderer.

## Testing

Unit tests with a fake provider (no network). Contract tests for request/response mapping using recorded, scrubbed fixtures. One opt-in live smoke test gated by an env var, never run in default CI.
