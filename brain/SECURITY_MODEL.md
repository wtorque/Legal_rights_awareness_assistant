# Security Model

Engineering detail: `docs/backend/SECURITY.md`, `.claude/rules/security.md`.

## What is implemented today (verified by code read)

- Secrets typed as `SecretStr` (`jwt_secret`, `nvidia_api_key`).
- Production guards in `Settings`: JWT secret ≥ 32 chars, wildcard CORS rejected.
- Log scrubbing: blocked keys (`password`, `token`, `access_token`, `refresh_token`, `authorization`, `api_key`, `content`, `text`, `document_text`, `question`) are redacted; emails, bearer tokens, and 9+ digit runs are masked.
- Request/upload limits defined as settings (`MAX_REQUEST_BYTES` 1 MiB, `MAX_UPLOAD_BYTES` 10 MiB).
- `.env` ignored by git in both `backend/` and `frontend/`; `.env.example` has no real secrets.

None of this is wired to a running app yet (no middleware, no auth, no endpoints).

## Assets worth protecting

1. User questions and uploaded documents (often highly personal).
2. Account credentials and tokens.
3. NVIDIA API key.
4. Integrity of the legal corpus and citations (poisoning would mislead users).

## Planned controls

| Area | Control |
|---|---|
| Authn | Argon2 password hashes, short-lived access JWT (15 min), refresh tokens (14 d) stored hashed and rotatable. Anonymous mode decision pending |
| Authz | Every resource query scoped by owner id in the repository layer. Test cross-user access explicitly |
| Transport | HTTPS only; HSTS; strict CORS allow-list from `CORS_ORIGINS` |
| Input | Pydantic validation everywhere; body size limit middleware; upload type sniffing, not extension trust |
| Uploads | Random storage keys, outside web root, size/page limits, no execution, malware scan if feasible, timed deletion |
| Rate limiting | Per-user/IP limits; Redis when multi-process, in-memory only for single process |
| Prompt injection | Untrusted-data delimiting, no side-effect tools, citation verification, output schema validation |
| Secrets | Env only; never in frontend bundles (`NEXT_PUBLIC_*` must never hold secrets) |
| Logging | Metadata only. Never question text, document text, or model output |
| Retention | Uploads expire (`UPLOAD_RETENTION_DAYS`, default 30); user erasure deletes rows and files |
| Headers | CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors |

## Threat model (summary)

| Threat | Mitigation |
|---|---|
| Prompt injection via uploaded document or source text | Treat as data; schema-validated output; no tools |
| Hallucinated law | RAG-only, citation verification, refusal path |
| IDOR on documents/conversations | Owner-scoped repository queries + tests |
| Malicious upload (zip bomb, crafted PDF) | Size/page/time limits, isolated parsing, library updates |
| Key leakage | Server-only key, redacted logs, no key in client code or errors |
| PII in logs/telemetry | Redaction + blocked keys; review any new log field |
| Corpus poisoning | Registry with hashes, verification step, ingestion audit trail |
| Abuse / cost exhaustion of NVIDIA quota | Rate limits, per-user quotas, request size caps |

## Open items

See [KNOWN_ISSUES](KNOWN_ISSUES.md): no auth, no middleware, no tests, unpinned dependencies, no dependency/secret scanning configured.
