---
name: project-brain
description: Load the right Aequa project context before working. Use at the start of any non-trivial task, when unsure what exists, or when asked about project status, architecture, decisions or roadmap.
---

# Project Brain

## When to use
Start of a task; before claiming something exists or is done; when answering "what is the state of X".

## Required project context
`brain/BRAIN.md` is the index. Status vocabulary: Implemented, Partial, Planned, Missing, Broken, Unknown.

## Engineering principles
- Repository code is the source of truth; brain docs describe it and can be stale. Verify before relying.
- Load only what the task needs.
- Never describe planned work as done.

## Workflow
1. Read `brain/BRAIN.md` (short).
2. Pick the row in "Context to load by task" and read those documents.
3. Read `brain/DEVELOPMENT_STATUS.md` and `brain/KNOWN_ISSUES.md` for anything touching your area.
4. Spot-check the facts you will depend on against the code (`ls`, `grep`, open the file). If code and brain disagree, trust the code and note the doc drift.
5. State what is Implemented vs Missing for the task before proposing changes.

## Relevant files
`brain/*.md`, `docs/frontend|backend|integration/*.md`, `CLAUDE.md`, `frontend/AGENTS.md`.

## Implementation requirements
- When you discover drift, fix the doc (use `documentation-maintenance`) or log it in `KNOWN_ISSUES.md`.
- Reference facts with file paths so they are checkable.

## Testing requirements
Not applicable to code. For claims: each claim of "exists" is backed by a file you opened or a command you ran.

## Common mistakes
- Treating Proposed contracts/schemas (`API_CONTRACTS`, `DATABASE_SCHEMA`, `DATA_CONTRACTS`) as implemented.
- Loading every document instead of the relevant ones.
- Forgetting `frontend/AGENTS.md` (Next.js docs in `node_modules`).
- Assuming a library listed in requirements is wired up.

## Definition of done
You can name the relevant modules, their real status, applicable decisions, and known issues for the task, with sources.
