# Architecture rules

- Respect the module boundaries in `brain/ARCHITECTURE.md`. Backend flow is `api/v1/endpoints → services → repositories → models`; routers contain no business logic or SQL.
- `app/core` imports nothing from other `app` packages. Domain packages (`ai`, `rag`, `legal`, `document_intelligence`, `action_engine`) never import from `app/api`.
- Only `app/ai/providers` talks to NVIDIA. Services depend on provider interfaces, not on HTTP clients.
- Frontend reaches the backend only through the typed service layer. Components do not call `fetch` directly and never talk to NVIDIA.
- Frontend: server components by default; `"use client"` only where needed. Primitives in `components/ui`, structure in `components/layout`, feature code in `components/<feature>/`.
- One source of truth per concern: design tokens in `globals.css`, nav in `config/navigation.ts`, motion constants in `lib/motion.ts`, settings in `core/config.py`, contracts in `docs/integration/DATA_CONTRACTS.md`.
- Search for an existing implementation before adding one. Extend, do not duplicate.
- Do not add dependencies without a stated reason. Check `brain/TECH_STACK.md` first.
- A decision that changes boundaries, stack, data model or contracts needs an entry in `brain/DECISIONS.md`.
- Keep changes scoped. Do not refactor unrelated modules while implementing a feature.
