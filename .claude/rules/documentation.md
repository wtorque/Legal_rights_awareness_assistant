# Documentation rules

The brain (`brain/`) and guides (`docs/`) must stay true. After any meaningful change, run this check (full procedure: `documentation-maintenance` skill):

1. Architecture or module boundaries changed → `brain/ARCHITECTURE.md` and the relevant `docs/*` guide.
2. API shape changed → `brain/API_CONTRACTS.md`, `docs/integration/DATA_CONTRACTS.md`, and both Pydantic and TypeScript types, together.
3. Tables/migrations changed → `brain/DATABASE_SCHEMA.md` and `docs/backend/DATABASE_DESIGN.md`.
4. A feature's status changed → `brain/FEATURE_MAP.md`.
5. Always → `brain/DEVELOPMENT_STATUS.md` (what was verified, date).
6. Significant decision (new dependency, boundary, data model, contract, security posture) → append an ADR to `brain/DECISIONS.md`.
7. New bug, debt or discovered risk → `brain/KNOWN_ISSUES.md`; remove entries you fixed.
8. New dependency or version change → `brain/TECH_STACK.md`.

## Rules
- Record only verified facts. Use the status vocabulary (Implemented, Partial, Planned, Missing, Broken, Unknown). Never describe planned work as done.
- Update only the documents the change touches. Do not rewrite the brain wholesale after small changes.
- `brain/BRAIN.md` stays short and links out; do not paste whole documents into it.
- Proposed designs are labelled *Proposed* until ratified; when code lands, replace the proposal with what was actually built.
- Do not delete existing documentation without a stated reason. Preserve `frontend/AGENTS.md` and its managed block.
- Update the "Last verified" date only when you actually re-verified.
- Docs are written in plain, prose-style technical English (not abbreviated chat style).
