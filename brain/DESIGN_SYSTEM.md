# Design System

Source of truth in code: `frontend/src/app/globals.css` (tokens) and `frontend/src/components/ui/*`. The `/design-system` reference page exists only in `landingg/`. This document describes what exists. The approved identity is **premium architectural LegalTech**: calm, editorial, trustworthy. Do not replace it with generic templates.

## Identity

- Name/wordmark: **Aequa** with an original arch-and-beam mark (`components/brand/logo.tsx`).
- Light theme: ivory background, soft-blue accents, brass highlights.
- Dark theme: midnight navy, lifted blues, warm brass.
- Voice: plain, respectful, never alarmist.

## Colour tokens (semantic; never hard-code hex in components)

Defined as CSS variables on `:root` and `.dark`, exposed to Tailwind through `@theme inline`.

| Token | Light | Dark |
|---|---|---|
| `background` | `#f6f3ea` | `#0a1226` |
| `foreground` | `#111c33` | `#e8ecf6` |
| `card` | `#fffefa` | `#101a33` |
| `primary` | `#27427a` | `#8eaae0` |
| `secondary` | `#e3eaf6` | `#17234a` |
| `muted` / `muted-foreground` | `#edeade` / `#596277` | `#121c38` / `#93a0bc` |
| `accent` | `#d6e2f5` | `#1c2a52` |
| `destructive` | `#b3402f` | `#e0715e` |
| `border` / `input` / `ring` | `#ddd8ca` / `#d3cebf` / `#5b7fb8` | `#22305a` / `#2a3969` / `#8eaae0` |
| `brass` (accent for eyebrows, highlights) | `#96703a` | `#c9a56b` |
| `sky`, `surface-2` | tonal fills | tonal fills |

Use `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, etc. Add a new token to both themes at once.

## Typography

- Display: Instrument Serif (`font-display`), utilities `text-display-2xl|xl|lg|md` (fluid `clamp`).
- Body: Geist (`font-sans`). Lead paragraph: `text-lead`.
- Mono / eyebrow: Geist Mono, `text-eyebrow` (uppercase, tracked, brass). Also for legal references like "Section 12(3)".

## Shape, surface, elevation

- Radius base `--radius: 1rem`; cards `rounded-3xl`; buttons and badges `rounded-full`.
- Surfaces: `surface` (solid card), `glass` (blurred translucent), tinted and outline card variants.
- Elevation: `shadow-soft`, `shadow-lift`.
- Layout containers: `container-page` (max 80rem), `container-prose` (46rem).
- Header height token `--header-h: 4.5rem`.

## Components that exist

`components/ui`: `Button` (primary, secondary, outline, ghost, glass, link; sizes sm/md/lg/icon/icon-sm; `asChild`), `Card` (+parts; solid/glass/tinted/outline; `interactive`), `Badge`, `MockDataBadge`, `Input`/`Textarea`/`Label`, `Select` (styled native), `Switch`, `SegmentedControl`, `Tabs`, `Dialog`, `ConfirmDialog`, `DropdownMenu`, `ContextMenu`, `Popover`, `Tooltip`/`Hint`, `Skeleton`, `EmptyState`, `ErrorState`, `Kbd`, `Toaster`.
Layout: `AppShell`, `Sidebar`, `MobileDrawer`, `Topbar`, `Breadcrumbs`, `PageContainer`, `PageHeader`, `ThemeToggle`, `Logo`. Motion: `Reveal`, `RevealGroup`, `RevealItem`, `PageTransition`. Shared: `SourceCard`, `SaveButton`, `RelativeTime`.

## Interaction principles

- Motion clarifies; it never gates content. Durations 0.18 / 0.4 / 0.8 s from `lib/motion.ts`, eased `[0.22, 1, 0.36, 1]`.
- Press feedback: buttons `active:scale-[0.97]`; cards lift on hover.
- Focus: 2px ring outline with 3px offset (`:focus-visible`). Never remove it.
- Theme switch cross-fades colours for 450 ms (`html.theme-animating`).
- Reduced motion (system or Settings): GSAP skipped, Framer reduced, CSS durations collapsed.

## Content rules with design impact

- Any sample/placeholder legal content carries `MockDataBadge`.
- Answers show their sources adjacent to the claim. `SourceCard` is the first-class source component; it labels fixtures as sample and shows a verified badge and official link only for verified sources.
- The disclaimer (`siteConfig.disclaimer`) is visible near AI output.

## Third-party UI

Radix primitives and Headless UI are in use (ADR-014). 21st.dev and React Bits components are allowed when they match this identity; none is used today. Retheme to the tokens above before use. See `docs/frontend/COMPONENT_GUIDE.md`.
