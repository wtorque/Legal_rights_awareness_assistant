---
name: component-engineering
description: Build or adapt reusable React components for Aequa, including adopting shadcn/ui, Headless UI, 21st.dev or React Bits pieces. Use when creating a new component, importing third-party UI, or changing a primitive in components/ui.
---

# Component Engineering

## When to use
New reusable component; adding a shadcn/21st.dev/React Bits component; changing `Button`, `Card`, `Badge` or similar; building legal UI (SourceCard, CitationChip, AnswerView).

## Required project context
`docs/frontend/COMPONENT_GUIDE.md`, `brain/DESIGN_SYSTEM.md`, ADR-011 (primitive layer, open). Current state: hand-written `ui/` primitives with `cva`; Radix Slot in `Button`; Headless UI in `MobileMenu`; `@base-ui/react` unused; `components.json` style `base-nova`.

## Engineering principles
- Search first, never duplicate (`grep -r` in `frontend/src/components`).
- Copy-in beats a new package for small components; justify any new dependency.
- Keep the existing variant API (`primary|secondary|outline|ghost|glass|link`).
- Props typed, `className` accepted, refs forwarded on interactive primitives.
- Third-party code is rethemed to tokens and made accessible before merge.

## Workflow
1. Define the component's single responsibility and layer (`ui/`, `layout/`, `<feature>/`).
2. Check whether an existing component can be extended.
3. For third-party: review the source, remove unused deps and inline colours, map to tokens, add `"use client"` only if needed, add a provenance comment.
4. Implement with `cva` + `cn()`; support both themes.
5. Add accessibility (roles, labels, keyboard, focus-visible).
6. Show it on `/design-system` if it is a shared primitive.
7. Type check and lint; verify in browser.

## Relevant files
`frontend/src/components/ui/*`, `components/layout/*`, `frontend/components.json`, `frontend/src/lib/utils.ts`, `frontend/src/app/(site)/design-system/page.tsx`.

## Implementation requirements
- Do not let the shadcn CLI overwrite `button.tsx`, `card.tsx`, `badge.tsx` without review.
- Decorative icons `aria-hidden`; icon-only buttons have `aria-label`.
- Legal source components render only verified citations (type-enforced where possible).
- No data fetching inside `ui/` components.

## Testing requirements
Type check, lint; manual states (hover/focus/disabled/loading) in both themes; keyboard operation; screen-reader name/role sanity check. Add component tests once a runner exists.

## Common mistakes
- Pasting a 21st.dev component with hard-coded colours or its own motion lib.
- Introducing a second dialog/menu library.
- Variant explosion instead of composition.
- Forgetting `"use client"` for stateful pieces, or adding it unnecessarily.

## Definition of done
Reusable, typed, tokenised, accessible in both themes, no duplicate, no unjustified dependency, listed on `/design-system` when shared, docs updated.
