# Animation Guide

Motion supports comprehension and polish; it never gates content or access. Existing plumbing: `lib/motion.ts`, `lib/gsap.ts`, `hooks/use-gsap.ts`, `components/motion/*`. The application uses native scrolling; Lenis is not part of it (ADR-013).

## Choosing the tool

| Need | Use |
|---|---|
| Mount/enter, hover, layout, shared-element (e.g. nav pill `layoutId`), gesture | Framer Motion |
| Scroll-triggered reveals of ordinary content | `Reveal` / `RevealGroup` / `RevealItem` (Framer `whileInView`) |
| Complex timelines, pinned/scrubbed scroll sequences | GSAP + ScrollTrigger via `useGsap` |
| Simple hover/press/colour transitions | CSS transitions (Tailwind). Cheapest, preferred |

## Framer Motion

- Import variants/easing from `@/lib/motion` (`fadeUp`, `fadeIn`, `stagger`, `transitions`, `ease`, `duration`). Add new shared motion there; do not scatter magic numbers.
- Durations: 0.18 fast / 0.4 base / 0.8 slow. Easing `[0.22, 1, 0.36, 1]` ("ease out expo") for entrances.
- `MotionConfig` is set in `AppProviders`: `reducedMotion="always"` when Settings forces reduced motion, otherwise `"user"`. Transforms are disabled, opacity still animates.
- Animate `transform` and `opacity` only. Never animate `width/height/top/left`.
- Components using `motion.*` are client components (`"use client"`).
- Page transition: `(application)/template.tsx` → `PageTransition` (opacity + 12px). Keep it short; do not delay content paint.

## GSAP

- Always `import { gsap, ScrollTrigger } from "@/lib/gsap"` (registers plugins once, client only).
- Use `useGsap(scopeRef, setup, deps)`: it scopes selectors, reverts on unmount, and skips under reduced motion.
- Never create a ScrollTrigger outside a `gsap.context`. Kill on unmount (the hook does).
- Provide a static, complete layout when GSAP does not run (reduced motion): content must be visible and ordered without it.

## Smooth scrolling

Not used in the application. The window and internal workspaces scroll natively. A marketing page may add Lenis (see `landingg/`), and must then follow ADR-005.

## Scroll-triggered animation

- Default `once: true`, margin `0px 0px -12% 0px` (as in `Reveal`).
- Never hide content that is needed above the fold until JS runs.
- Anchor links and keyboard focus must land on visible content (`scroll-padding-top` accounts for the header).

## Hover interactions

- Buttons: `active:scale-[0.97]`, subtle `-translate-y-px` lift on primary. Cards: `interactive` variant lifts 4px.
- Hover is enhancement only. Anything revealed by hover must be reachable by focus and tap.

## Reduced motion (required)

- Framer: handled globally. GSAP: skipped by `useGsap` (it checks the system query and `html[data-reduced-motion="true"]`). CSS: the system media query and `html[data-reduced-motion="true"]` both collapse durations. The document scan overlay shows its steps statically when GSAP is skipped.
- When adding a new animation, test with reduced motion enabled and confirm no content is lost.

## Performance

- Prefer CSS over JS for simple effects. Avoid animating `backdrop-filter`/blur values and large box-shadows per frame.
- Limit simultaneous animated elements; stagger groups, don't animate lists of hundreds.
- Use `will-change` sparingly and remove after animation.
- No layout thrash: read then write. Remove listeners/timelines on unmount.
- Check the Performance panel for long tasks when adding scroll-linked effects.
- Streaming answers: append text without animating each token's layout.
