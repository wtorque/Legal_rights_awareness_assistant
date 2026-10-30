# Testing rules

Every meaningful change is verified. Report what you ran and its actual result. If you could not run something, say so.

## Commands

```
# Frontend (cd frontend)
npx tsc --noEmit        # types
npm run lint            # ESLint
npm run build           # production build (run for routing/config/layout changes)

# Backend (cd backend; source .venv/bin/activate)
pytest                  # all tests; dirs: tests/unit, tests/integration, tests/security
```
There is no frontend test runner and no backend test yet (KNOWN_ISSUES #2, #9). Adding the first of each is a roadmap task (M1); until then, verify manually and record how.

## Expectations
- **Unit**: pure logic (segmenters, chunkers, ranking, citation verification, redaction, config guards). Fast, no network, no DB.
- **Integration**: repositories and endpoints against real PostgreSQL with pgvector, not SQLite. Cover migrations up and down.
- **Security** (`tests/security`): cross-user access, auth failures, upload abuse, prompt-injection fixtures, log redaction.
- **Regression**: every bug fix lands with a test that fails without the fix.
- **AI**: use a fake provider; no live NVIDIA calls in default runs. Citation verification must have exhaustive tests: valid, wrong section, altered quote, out-of-force section, missing section.
- **Frontend UI**: verify in a browser in both themes, with keyboard only, at 320/768/1280 widths, and with reduced motion. Streaming and error states included.
- Test data is synthetic and fictional. No real personal data or real legal citations.
- Never delete, skip or loosen a test to get green; fix the code or justify the test change.
- Contract changes: update the shared example payloads and test both the Pydantic and TypeScript sides.
