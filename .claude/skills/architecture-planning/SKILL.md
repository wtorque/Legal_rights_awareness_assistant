---
name: architecture-planning
description: Plan a feature or cross-module change for Aequa before coding. Use when a task touches several modules, changes data flow, contracts, schema or dependencies, or has more than one plausible design.
---

# Architecture Planning

## When to use
New feature spanning frontend and backend; new module; changing contracts, tables, dependencies or the AI pipeline; any choice worth an ADR.

## Required project context
`brain/ARCHITECTURE.md`, `brain/DECISIONS.md`, `brain/TECH_STACK.md`, `brain/ROADMAP.md`, plus the module-specific docs.

## Engineering principles
- Design from the real code, not from the diagrams.
- Smallest design that satisfies the requirement; reuse existing structure and dependencies.
- Contract first: define data shapes before implementation.
- Make the trade-off explicit and recommend one option.
- Respect layering and the non-negotiables (sourced answers, secrets server-side, labelled sample data).

## Workflow
1. Restate the goal and constraints in two or three lines.
2. Inspect the touched modules (use `project-brain`). List what exists and what is missing.
3. Identify dependencies on unfinished milestones (`ROADMAP.md`) and open decisions (ADR-011, ADR-012...).
4. Draft the change map: files/modules to add or modify, interfaces, data flow, contract changes, migrations.
5. List options only where real alternatives exist; recommend one with reasons and costs.
6. Break into ordered, independently verifiable tasks, each with its verification.
7. List risks, unknowns and what must be confirmed with the user.
8. If the decision is significant, draft an ADR for `brain/DECISIONS.md` (status Proposed).

## Relevant files
`brain/ARCHITECTURE.md`, `brain/DECISIONS.md`, `docs/integration/DATA_CONTRACTS.md`, `docs/backend/BACKEND_ARCHITECTURE.md`, `docs/frontend/FRONTEND_ARCHITECTURE.md`.

## Implementation requirements
The plan names exact paths, interfaces, new dependencies (with justification), contract changes (both sides), and doc updates. No code is written during planning unless asked.

## Testing requirements
Each task in the plan has a verification step (command or manual check) and the test layers needed (unit, integration, security).

## Common mistakes
- Designing an abstraction before there are two uses.
- Ignoring Unknowns (model ids, first jurisdiction, auth model) and planning as though they were settled.
- Plans that change the API without touching `DATA_CONTRACTS.md`.
- Adding a dependency that duplicates an installed one.

## Definition of done
A reviewable plan with change map, ordered verifiable tasks, risks, open questions, and (if needed) a Proposed ADR. User confirms before large implementations.
