---
name: security-engineering
description: Implement and verify security controls in Aequa — authentication, authorization, secrets, upload safety, rate limiting, privacy, log redaction and prompt-injection defence. Use for auth work, handling user data or files, and before release.
---

# Security Engineering

## When to use
Building auth, any endpoint that touches user-owned data, uploads, middleware, logging changes, AI input handling, or doing a security pass.

## Required project context
`brain/SECURITY_MODEL.md`, `docs/backend/SECURITY.md`, `.claude/rules/security.md`. Implemented today: `SecretStr` secrets, production config guards, log scrubbing in `core/logging.py`. Everything else is Missing.

## Engineering principles
- Least data, least privilege, shortest retention.
- Defence in depth: validation, authz in the repository, redaction, limits.
- Untrusted: user input, uploaded files, retrieved legal text, model output.
- Fail closed; no detail leakage in errors.

## Workflow
1. Map the data and trust boundaries of the change.
2. Identify threats (see the model's table) and pick controls.
3. Implement controls: Argon2 passwords, pinned-algorithm JWT, hashed rotating refresh tokens, owner scoping, size/type limits, random storage keys, rate limits, security headers.
4. Add security tests (`backend/tests/security`): cross-user access, auth bypass, malformed tokens, upload abuse, injection strings, log redaction.
5. Review logs and errors for sensitive fields; add keys to the blocked list if new sensitive fields exist.
6. For deep review, delegate to the read-only `security-engineer` agent.

## Relevant files
`backend/app/core/{config,logging,exceptions}.py`, `backend/app/middleware/`, `backend/.env.example`, `frontend/.gitignore`, `backend/.gitignore`.

## Implementation requirements
- No secrets in code, tests, logs, errors or `NEXT_PUBLIC_*`.
- Keep the production guards in `Settings`.
- Ingestion fetchers allow only registered hosts (SSRF).
- Redis-backed rate limiting before multi-process deployment.

## Testing requirements
Every new resource has a cross-user denial test; auth error paths tested; redaction test; upload tests (oversize, wrong type, zip bomb, encrypted); prompt-injection fixture test. Report actual results.

## Common mistakes
- Trusting the JWT `alg` header.
- Checking ownership in the router but not the repository.
- Logging request bodies "temporarily".
- Verifying uploads by extension.
- Different error messages that enable user enumeration.

## Definition of done
Controls implemented and tested, nothing sensitive in logs or errors, security docs updated, residual risks recorded in KNOWN_ISSUES.
