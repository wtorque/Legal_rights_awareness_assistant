---
name: testing-qa
description: Plan, write and run tests for Aequa on both sides — pytest unit/integration/security tests, contract fixtures, and frontend verification. Use after any meaningful change, when adding the first test infrastructure, or when a bug needs a regression test.
---

# Testing and QA

## When to use
Finishing a change; reproducing a bug; setting up pytest or a frontend runner; judging whether coverage is adequate.

## Required project context
`.claude/rules/testing.md`. Reality: no tests exist (`backend/tests/{unit,integration,security}` empty, no pytest config); no frontend runner (only `tsc`, `eslint`, `next build`). pytest 9.2.0 and pytest-asyncio 1.4.1 are installed.

## Engineering principles
- Test behaviour, not implementation. Fail first, then pass.
- Real PostgreSQL + pgvector for DB behaviour; fakes for NVIDIA.
- Synthetic, fictional data only; no real personal data or real legal citations.
- Never skip, delete or loosen a test to get green.

## Workflow
1. Identify risk in the change: logic, contract, authorization, data, UI states.
2. Choose layers: unit (pure logic), integration (repos/endpoints), security (cross-user, auth, uploads, injection, redaction), contract (shared fixtures), manual UI.
3. First time on backend: add pytest config (asyncio mode, markers), `conftest.py` with settings override and test DB fixtures; first tests for `core/` (production guards, `redact`, exception codes/status).
4. Write the failing test, implement, make it pass.
5. Run: `cd backend && source .venv/bin/activate && pytest`; frontend: `npx tsc --noEmit && npm run lint && npm run build`.
6. Frontend manual matrix: light/dark, 320/768/1280, keyboard, reduced motion, loading/error states.
7. Report exact commands and results, and what could not be run.

## Relevant files
`backend/tests/**`, `backend/requirements-dev.txt`, `backend/app/core/*.py`, `docs/integration/DATA_CONTRACTS.md`.

## Implementation requirements
- Deterministic tests: fake clock, fake provider, seeded data.
- Contract fixtures loaded by both the Pydantic and TypeScript sides.
- Each bug fix includes a regression test.
- No network in default runs.

## Testing requirements
This skill defines them: coverage of happy path, validation errors, auth failures, not-found, rate-limit, upstream failure, and the specific risks listed in step 1.

## Common mistakes
- SQLite standing in for Postgres/pgvector.
- Tests that assert mocks were called rather than outcomes.
- Using real-looking statute text in fixtures.
- Claiming "tested" when only type checks ran.

## Definition of done
New tests fail without the change and pass with it; the full relevant suite passes; gaps and unrun checks are stated honestly.
