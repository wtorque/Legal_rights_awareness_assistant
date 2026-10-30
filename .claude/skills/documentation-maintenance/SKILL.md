---
name: documentation-maintenance
description: Keep Aequa's brain and docs accurate after a meaningful code change. Use after finishing a feature, fix, contract, schema, dependency or architecture change, or when docs look stale.
---

# Documentation Maintenance

## When to use
After any meaningful change (new/changed module, endpoint, table, dependency, feature status, decision, bug found or fixed). Not after trivial edits.

## Required project context
`.claude/rules/documentation.md`, `brain/BRAIN.md`, the status vocabulary.

## Engineering principles
- Verified facts only. If you did not run or read it, do not write it.
- Touch only the documents the change affects. Do not rewrite the brain.
- Keep `BRAIN.md` concise; link instead of copying.
- Replace *Proposed* text with what was actually built when code lands.

## Workflow
1. List what changed (files, behaviour, contracts, dependencies).
2. Walk the checklist and update only what applies:
   - Architecture or boundaries → `brain/ARCHITECTURE.md`, relevant `docs/*` guide.
   - API shape → `brain/API_CONTRACTS.md` + `docs/integration/DATA_CONTRACTS.md` (+ confirm Pydantic and TS types match).
   - Tables/migrations → `brain/DATABASE_SCHEMA.md` + `docs/backend/DATABASE_DESIGN.md`.
   - Feature status → `brain/FEATURE_MAP.md`.
   - Dependencies/versions → `brain/TECH_STACK.md`.
   - AI/legal/security behaviour → `AI_SYSTEM.md`, `LEGAL_KNOWLEDGE.md`, `SECURITY_MODEL.md`.
3. Always update `brain/DEVELOPMENT_STATUS.md`: what is completed, what was verified (command + result), date.
4. Record significant decisions as a new ADR at the bottom of `brain/DECISIONS.md` (never edit old ADRs; supersede).
5. Add new bugs/debt to `brain/KNOWN_ISSUES.md`; remove fixed ones.
6. If the roadmap order or scope changed, adjust `brain/ROADMAP.md`.
7. Re-read the diff of docs for claims you cannot back up; remove them.

## Relevant files
`brain/*.md`, `docs/**`, `CLAUDE.md` (only if commands or rules changed).

## Implementation requirements
- Use the status vocabulary exactly. Update "Last verified" only if you re-verified.
- Link to code paths, not code dumps.
- Do not delete existing documentation without a stated reason.

## Testing requirements
Docs are checked by evidence: re-run the command or open the file for each status you set. Check internal links resolve to existing files.

## Common mistakes
- Marking a feature Implemented because the route exists.
- Updating many docs "for consistency" with unverified content.
- Forgetting the TS/Pydantic pair when updating a contract.
- Editing an old ADR instead of adding a superseding one.

## Definition of done
Every affected document matches the code, DEVELOPMENT_STATUS has the dated entry with verification evidence, decisions and issues are recorded, and nothing unverified was added.
