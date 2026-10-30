---
name: responsive-design
description: Make Aequa layouts work from 320px phones to wide desktops — navigation adaptation, fluid type, grids, tables and touch targets. Use when building or fixing layout across breakpoints.
---

# Responsive Design

## When to use
New page layouts, nav changes, tables/clause lists/comparison views, or any report of broken layout on a device.

## Required project context
`docs/frontend/RESPONSIVE_DESIGN.md`, `brain/DESIGN_SYSTEM.md`. Containers `container-page` / `container-prose`; fluid type utilities; header `--header-h`.

## Engineering principles
- Desktop-first composition, fully usable on tablet and mobile.
- Tailwind classes mobile-first (base = smallest), verified at the extremes.
- Fluid type via `clamp()` utilities, not per-breakpoint font sizes.
- Reading text stays at prose width.

## Workflow
1. Design the desktop layout, then define how each region collapses (columns → stack, side panel → drawer/sheet, table → cards).
2. Implement with Tailwind responsive utilities; use `min-h-dvh`, safe-area aware fixed bars.
3. Keep `config/navigation.ts` as the nav source for both desktop pill nav (`lg+`) and `MobileMenu`.
4. Test widths 320, 375, 768, 1024, 1280, 1536; zoom to 200%.
5. Check touch targets and hover/focus equivalents.
6. Type check and lint.

## Relevant files
`frontend/src/components/layout/*`, `components/ui/*`, `globals.css`, `config/navigation.ts`.

## Implementation requirements
- No horizontal page scroll at 320px.
- Inputs ≥ 16px font size on mobile.
- Primary touch targets ≥ 44px, none under 24px.
- Wide tables scroll inside their own container or restructure; never stretch the page.
- Heavy blur/shadow effects reduced if they cost frame rate on small devices.

## Testing requirements
Devtools device emulation at the listed widths in both themes, plus a real device when available. Check text spacing overrides and 200% zoom. Record what was verified.

## Common mistakes
- Fixed pixel widths; `100vh` on mobile (use `dvh`).
- Hover-only menus.
- Different nav items on desktop and mobile.
- Testing only at 1440px.
- Ignoring RTL when adding multilingual UI (`components.json` is `rtl: false`).

## Definition of done
Layout verified at all listed widths and zoom levels, nav parity, touch/keyboard operable, no horizontal overflow, type check and lint pass.
