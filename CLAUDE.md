# CLAUDE.md

**Aequa** — an AI-assisted Legal Rights Awareness Platform. Helps ordinary people understand their rights with plain-language, multilingual, source-backed, jurisdiction-aware answers. General information only, not legal advice.

Stack: Next.js 16 / React 19 / TypeScript / Tailwind 4 frontend (`frontend/`); FastAPI / PostgreSQL + pgvector / SQLAlchemy backend (`backend/`); NVIDIA-hosted GLM via RAG.

**Reality check:** the project is in its foundation phase. The frontend shell and design system exist; the backend is a scaffold (`app/core` only); AI, RAG, database, auth and legal data do not exist yet. Never describe planned work as done.

## Project brain

Start at `brain/BRAIN.md`. It indexes everything and lists what to load per task. Key files: `ARCHITECTURE.md`, `DEVELOPMENT_STATUS.md`, `FEATURE_MAP.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `ROADMAP.md`. Engineering guides: `docs/frontend/`, `docs/backend/`, `docs/integration/`.

Load only what the task needs. For UI: `brain/DESIGN_SYSTEM.md` + `docs/frontend/`. For endpoints: `brain/API_CONTRACTS.md` + `docs/integration/DATA_CONTRACTS.md`. For AI/legal: `brain/AI_SYSTEM.md` + `brain/LEGAL_KNOWLEDGE.md`.

**Next.js here is not the one you know.** Read the relevant guide in `frontend/node_modules/next/dist/docs/` before writing Next code (see `frontend/AGENTS.md`).

## Skills and agents

- Skills live in `.claude/skills/<name>/SKILL.md` (25). Use the one that matches the task: project (`project-brain`, `architecture-planning`, `documentation-maintenance`), frontend (`frontend-engineering`, `ui-ux-design`, `component-engineering`, `animation-engineering`, `responsive-design`, `frontend-accessibility`, `frontend-performance`), backend (`backend-engineering`, `api-engineering`, `database-engineering`, `security-engineering`), AI (`ai-engineering`, `nvidia-glm-integration`, `rag-engineering`, `prompt-engineering`, `legal-intelligence`, `citation-verification`), quality (`testing-qa`, `debugging`, `code-review`, `performance-audit`, `deployment-engineering`).
- Agents live in `.claude/agents/` (11): `frontend-architect`, `ui-ux-designer`, `animation-engineer`, `backend-architect`, `database-architect`, `ai-systems-engineer`, `rag-engineer`, `legal-research-engineer`, `security-engineer`, `qa-engineer`, `code-reviewer`. Delegate focused, scoped work to them; review agents are read-only.
- Rules in `.claude/rules/` (architecture, coding-standards, security, testing, documentation, git-workflow) always apply.

## Commands

```
cd frontend && npm run dev | npx tsc --noEmit | npm run lint | npm run build
cd backend && source .venv/bin/activate && pytest     # no tests exist yet
```

## Rules

- Inspect before modifying. Read the code and the relevant brain docs first.
- Never invent completed functionality. Verify before claiming.
- Never introduce unnecessary dependencies. Check `brain/TECH_STACK.md`.
- Never duplicate existing components or helpers. Search first.
- Never expose API secrets. NVIDIA key is server-side only.
- Never fabricate legal data or citations. Fixtures use clearly fictional law; sample content carries `MockDataBadge`.
- Never bypass type checking, lint or tests.
- Never silently change API contracts. Change `docs/integration/DATA_CONTRACTS.md`, the Pydantic schema and the TS type together.
- Never overwrite working code unnecessarily; keep diffs scoped.
- Test every meaningful change and report the real result.

## Reviewing changes

Use the `code-review` skill / `code-reviewer` agent. Check correctness, contract consistency, security, accessibility (both themes, keyboard, reduced motion), and that docs were updated.

## Maintaining documentation and decisions

After a meaningful change follow `.claude/rules/documentation.md` and the `documentation-maintenance` skill: update `brain/DEVELOPMENT_STATUS.md`, touch only affected docs, record significant decisions as ADRs in `brain/DECISIONS.md`, and log new risks in `brain/KNOWN_ISSUES.md`. Only write verified facts.
