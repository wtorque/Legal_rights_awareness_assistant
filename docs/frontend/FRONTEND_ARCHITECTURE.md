# Frontend Architecture

Location: `frontend/`. Next.js 16.4.3 App Router, React 19.3, strict TypeScript, Tailwind 4. Describes the code as verified on 2026-10-31.

**Before writing Next.js code**, read the relevant guide in `frontend/node_modules/next/dist/docs/` (`01-app/` for the App Router). `frontend/AGENTS.md` states that this version has breaking changes from earlier releases. Do not remove its marked block.

## Scope

`frontend/` is the application frontend: a dashboard shell and nine modules, all powered by clearly labelled mock services. It contains no marketing landing page. The earlier marketing-style shell (floating header, footer, Lenis) lives untouched in `landingg/` and is the starting point for a separate landing project.

## Directory layout (`frontend/src`)

```
app/
  layout.tsx, globals.css        Fonts, theme init script, providers; design tokens
  page.tsx                       Redirects to /dashboard
  (application)/                 Route group wrapped in the application shell
    layout.tsx, template.tsx     AppShell; page-enter animation
    dashboard, assistant, conversations, documents (+ [id], compare),
    rights (+ [slug]), action-plans (+ [id]), knowledge (+ [id]),
    evidence, legal-aid, saved, settings, help
components/
  ui/            Primitives: button, card, badge, input, select, switch, tabs, dialog,
                 dropdown-menu, context-menu, popover, tooltip, skeleton, empty-state,
                 error-state, toaster, segmented-control, mock-data-badge, kbd, confirm-dialog
  layout/        app-shell, topbar, breadcrumbs, jurisdiction-menu, language-menu,
                 notifications-popover, user-menu, theme-toggle, shortcuts dialog and handler,
                 page-container, page-header, set-breadcrumb
  navigation/    sidebar, sidebar-nav, mobile-drawer
  motion/        reveal, page-transition
  providers/     app-providers, theme-provider (+ init script), store-hydrator
  shared/        source-card, save-button, saved-view, relative-time
  dashboard/ assistant/ documents/ rights/ action-plans/ knowledge/ evidence/
  legal-aid/ settings/ search/ help/     Feature components
config/          navigation.ts, site.ts, jurisdictions.ts, languages.ts
hooks/           use-async, use-now, use-gsap
lib/             utils (cn), motion, gsap, format, group-by-date, text-diff, mock-storage, local-data
mocks/           Fixtures (fictional legal text; see below)
services/        *.service.ts interfaces + exported instance; mock/ holds the implementations
stores/          Zustand: theme, preferences, ui, chat, documents, plans, saved, notification
types/           Domain types per module
test/            Vitest setup
```

Path alias: `@/*` → `src/*`. Always import with `@/`. End-to-end tests are in `frontend/e2e/`.

## Layout hierarchy

`RootLayout` → `AppProviders` (ThemeProvider → StoreHydrator → Framer `MotionConfig` → Toaster) → `(application)/layout` → `AppShell` (skip link, `Sidebar`, `Topbar`, `<main id="main">`, drawers/dialogs, `GlobalSearch`, global shortcuts) → `template` (`PageTransition`) → page.

The window scrolls natively. There is no smooth-scroll library in the application. The assistant and evidence graph pages use a fixed-height, internally scrolling workspace.

## Service layer (the backend seam)

Every module talks to a typed interface in `services/<area>.service.ts`, for example `ChatService`, `DocumentsService`, `RightsService`, `KnowledgeService`, `ActionPlansService`, `EvidenceService`, `LegalAidService`, `DashboardService`, `SearchService`. Each file exports one instance bound to its implementation in `services/mock/`. Replacing a mock with an HTTP client is a one-line change per service. Components and stores never import from `mocks/` directly, except `config` data and a few fixture lookups used for static route params.

- Mock services simulate latency, validation and errors, and persist user-created state to `localStorage` (`aequa-mock-*` keys).
- `ChatService.sendMessage` is an `AsyncGenerator` of `delta` / `final` / `error` events, mirroring the proposed SSE contract.
- Types that map to the backend contract are adapted at the service boundary. See `docs/integration/DATA_CONTRACTS.md` ("Frontend adaptation").
- `ServiceError` mirrors the backend error codes.

## State

- URL for shareable state where practical (detail pages use route params).
- Zustand holds client state that several components share: `theme-store`, `preferences-store` (persisted), `ui-store` (sidebar, overlays; persists only sidebar state), `chat-store`, `documents-store`, `plans-store`, `saved-store`, `notification-store`.
- Persisted stores use `skipHydration`; `StoreHydrator` rehydrates them after mount so server and first client render agree. Stores that mirror service data (`chat`, `documents`, `plans`) act as caches with optimistic updates and call the service for persistence.
- Everything persisted is non-sensitive demonstration data in this browser only.

## Rules specific to this Next.js version (`cacheComponents` is on)

- Prerendering cannot read the clock. Do not call `new Date()` during render in client components that are prerendered. Use `useNow()` or `<RelativeTime>`, which fill in after mount.
- Dynamic routes export `generateStaticParams` for fixture ids and render the param-reading part inside `<Suspense>` (see any `[id]/page.tsx`). User-created ids render on demand.
- Pages export `metadata` from server components; interactive parts are client components.

## Component architecture

- `components/ui`: primitives with `cva` variants and `cn()`; no app knowledge. Overlays and menus use Radix primitives; the mobile drawer and FAQ accordion use Headless UI.
- Feature components live in `components/<feature>/`. Shared pieces used by several modules live in `components/shared/`.
- Server components by default. Add `"use client"` for state, effects, browser APIs, Framer or GSAP.

## Data fetching conventions

- Pages load through the service layer with `useAsync` (loading → ready / error with retry) or a store `load()`.
- Every async view has a skeleton, an empty state and an error state with retry. Streaming handles abort and mid-stream failure.
- Never put secrets in `NEXT_PUBLIC_*`. The browser never calls NVIDIA.

## Verification commands

```
cd frontend
npx tsc --noEmit
npm run lint
npm run build
npm test            # Vitest: logic, stores, a few components
npm run test:e2e    # Playwright against `next start` on port 4310 (run `npm run build` first)
```
