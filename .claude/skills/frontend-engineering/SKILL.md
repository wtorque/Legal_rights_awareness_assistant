---
name: frontend-engineering
description: Implement or change Aequa's Next.js 16 / React 19 frontend — routes, layouts, pages, client/server boundaries, state and data fetching. Use for any frontend feature that is not purely visual design, animation or a single reusable component.
---

# Frontend Engineering

## When to use
Adding or changing a page, layout, route, hook, store, or service-layer call in `frontend/`.

## Required project context
`docs/frontend/FRONTEND_ARCHITECTURE.md`, `brain/DESIGN_SYSTEM.md`, `frontend/AGENTS.md`. **This Next.js (16.4.3) differs from older versions — read the relevant guide in `frontend/node_modules/next/dist/docs/` before coding** (e.g. `01-app/01-getting-started/`). `cacheComponents` and `partialPrefetching` are enabled in `next.config.ts`.

## Engineering principles
- Server components by default; `"use client"` only for state, effects, browser APIs, Framer/GSAP.
- Reuse existing components; add features in `components/<feature>/`.
- Typed everything; no `any`. Imports via `@/`.
- Routes and nav stay in sync (`config/navigation.ts`).
- The browser calls only the Aequa backend through the typed service layer; never NVIDIA.

## Workflow
1. Run `project-brain` for the module; read the Next docs relevant to your change.
2. Search for existing components/hooks (`grep` in `frontend/src`).
3. Define types from `docs/integration/DATA_CONTRACTS.md` (do not invent shapes).
4. Build server-first; isolate interactivity.
5. Handle loading, empty, error (envelope), success; handle abort for streams.
6. Check both themes, keyboard use, narrow widths, reduced motion.
7. Run `npx tsc --noEmit && npm run lint`; `npm run build` for routing/config/layout changes.
8. Run `documentation-maintenance`.

## Relevant files
`frontend/src/app/**`, `components/**`, `config/navigation.ts`, `config/site.ts`, `stores/theme-store.ts`, `lib/*`, `next.config.ts`, `tsconfig.json`.

## Implementation requirements
- Page files export `metadata`; keep them server components.
- No secrets in `NEXT_PUBLIC_*`. No `dangerouslySetInnerHTML` except the existing theme script.
- Sample content uses `MockDataBadge`.
- Legal answers always show sources and the disclaimer (`siteConfig.disclaimer`).

## Testing requirements
Type check, lint, build. No test runner exists yet: describe the manual verification (themes, widths, keyboard, reduced motion). When a runner is introduced, add component/E2E tests for the change.

## Common mistakes
- Coding from memory of older Next.js APIs.
- Making whole pages client components.
- Calling `fetch` in components instead of services.
- Adding a route without a nav entry (or the reverse).
- Forgetting loading/error states for streaming.

## Definition of done
Types/lint/build pass, feature works in light and dark and at 320–1280 px, keyboard accessible, no duplicated components, contract types match docs, docs updated.
