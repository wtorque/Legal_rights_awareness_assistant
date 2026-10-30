# Responsive Design

Tailwind 4 default breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536. The approved direction is **desktop-first composition** with a fully usable tablet and mobile experience. Write Tailwind mobile-first classes (base = smallest) but design and review the desktop layout first, then verify down.

## Containers and spacing

- `container-page`: max 80rem, fluid side padding `clamp(1rem, 4vw, 2.5rem)`.
- `container-prose`: 46rem for reading text. Long legal text always uses prose width (60–75 characters per line).
- `Section` vertical rhythm: `py-16 sm:py-24` (or `flush` + explicit padding).
- Topbar: sticky, 4 rem tall. Pages use `PageContainer` (default 72rem, wide 88rem, full for workspaces) with `PageHeader`.

## Navigation adaptation

- `lg` and up: persistent sidebar (272 px, collapses to an 80 px rail with tooltips; state persisted). Topbar shows breadcrumbs, a search field, jurisdiction and language buttons (labels from `xl`), notifications, theme and account.
- Below `lg`: the sidebar is hidden; a hamburger opens `MobileDrawer` (Headless UI dialog). Below `md` the search field becomes an icon. Below `sm` earlier breadcrumb levels are hidden.
- Both sidebar and drawer render `SidebarNav` from `config/navigation.ts`. A nav item missing in one is a bug.

## Typography

- Display sizes use fluid `clamp()` utilities (`text-display-2xl` … `md`, `text-lead`). Do not add breakpoint-specific font sizes for headings.
- Body minimum 16px on mobile (prevents iOS input zoom). Inputs 16px+.
- `text-wrap: balance` on headings, `pretty` on lead text (already in utilities).

## Layout patterns

| Pattern | Desktop | Tablet | Mobile |
|---|---|---|---|
| Card grids | 3–4 columns | 2 | 1 |
| Assistant | Conversation list + chat | Conversation list in a dialog | Same as tablet; composer floats at the bottom |
| Document view | Document and analysis side by side | Stacked | Stacked |
| Evidence graph | Canvas + details panel | Canvas above details | Canvas above details |
| Tables (clauses, comparisons) | Full table | Horizontal scroll with sticky first column | Card list per row |

## Requirements

- No horizontal page scroll at 320 px width.
- Touch targets ≥ 44 px for primary actions on touch devices; ≥ 24 px minimum anywhere.
- Use `min-h-dvh` (not `vh`) for full-height shells; respect safe-area insets for fixed bars.
- Content reflows at 200% zoom and with 400% text spacing without loss (WCAG 1.4.4/1.4.10/1.4.12).
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Hover-only affordances need touch/focus equivalents.
- Test widths: 320, 375, 768, 1024, 1280, 1536. Test one RTL language before claiming multilingual support (`components.json` currently sets `rtl: false`; revisit when RTL languages are supported).
- Images use `next/image` with explicit sizes. Heavy decorative effects (blur, large shadows) are reduced on small screens if they cost frame rate.

## Verification

`frontend/e2e/phase5-6.spec.ts` asserts no horizontal overflow on ten primary routes at 390, 820 and 1280 px. Visual checks at 390, 820 and 1440 px were done on 2026-10-31. Widths 320 and 1536, real devices and 200% zoom were not tested.
