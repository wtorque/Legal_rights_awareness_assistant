---
name: code-review
description: Review Aequa changes for correctness, contract consistency, architecture and security rule compliance, accessibility, test adequacy and documentation. Use before commit or PR, or when asked to review a diff, branch or file.
---

# Code Review

## When to use
After implementing a change; when asked to review; before merging. (Built-in `/code-review` also exists; this skill adds project-specific checks. For an independent read-only pass, use the `code-reviewer` agent.)

## Required project context
`.claude/rules/*.md`, `brain/DECISIONS.md`, `brain/API_CONTRACTS.md`, `docs/integration/DATA_CONTRACTS.md`.

## Engineering principles
- Review the diff against intent, not style preference.
- Prioritise: blockers (correctness, security, data loss, contract breaks) over minors.
- Evidence over opinion: reference `path:line`; run checks.
- Verify claims; do not trust "done".

## Workflow
1. Understand intent (task, PR text). Read `git status`/`git diff`.
2. Run checks for the touched area: `npx tsc --noEmit`, `npm run lint`, `npm run build` (config/layout/routing), `pytest`.
3. Checklist:
   - Correctness and edge cases; error handling uses `AppError` and the envelope.
   - Layering respected; no business logic in routers/components; no duplicated components.
   - Contract sync across Pydantic, TS types and both contract docs; versioning respected.
   - Security: no secrets, owner scoping, validation, no sensitive logging, no `dangerouslySetInnerHTML` of untrusted data.
   - Legal integrity: no fabricated law/citations; sample data labelled; sources verified-only.
   - Frontend: tokens (both themes), keyboard, focus, reduced motion, server/client boundary.
   - Dependencies justified and recorded in `TECH_STACK.md`.
   - Tests exist, meaningful, not weakened; docs/DEVELOPMENT_STATUS/ADR updated.
   - Diff scoped; no stray files (`.next`, `.env`, `*.tsbuildinfo`).
4. Report findings by severity with `path:line`, why it matters, and a suggested fix; list what you did not check; give a verdict.

## Relevant files
The diff and its neighbours, plus the rule and contract files above.

## Implementation requirements
Do not modify code during review unless asked; propose changes. Do not approve with unrun checks unless stated.

## Testing requirements
Report real outputs of the checks run; flag missing test coverage as a finding.

## Common mistakes
- Nitpicking formatting while missing a contract mismatch.
- Approving a doc update that claims unverified status.
- Missing the TS/Pydantic pair.
- Reviewing only changed lines, not their callers.

## Definition of done
Prioritised, evidence-backed findings delivered with a verdict, checks run and reported, unchecked areas stated.
