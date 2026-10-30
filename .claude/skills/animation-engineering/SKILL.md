---
name: animation-engineering
description: Add or tune motion in Aequa using Framer Motion, GSAP/ScrollTrigger and Lenis, with reduced-motion support and performance discipline. Use for transitions, scroll effects, hover interactions and smooth-scroll behaviour.
---

# Animation Engineering

## When to use
Page/route transitions, reveal-on-scroll, scroll-linked sequences, hover and press feedback, smooth-scroll issues.

## Required project context
`docs/frontend/ANIMATION_GUIDE.md`. Plumbing: `lib/motion.ts`, `lib/gsap.ts`, `hooks/use-gsap.ts`, `components/motion/*`, `components/providers/smooth-scroll-provider.tsx`.

## Engineering principles
- Motion supports comprehension; content is never gated on animation.
- Simple CSS first, Framer for UI/layout, GSAP for timelines/scroll sequences.
- One Lenis instance, driven by `gsap.ticker`.
- Reduced motion is a required code path, not a nicety.
- Animate `transform`/`opacity` only.

## Workflow
1. Decide tool (CSS vs Framer vs GSAP) using the guide's table.
2. Reuse variants and durations from `lib/motion.ts`; add new shared ones there.
3. Implement in a client component; GSAP via `useGsap(scopeRef, setup, deps)`.
4. Provide the reduced-motion/static fallback and confirm content is visible without JS animation.
5. Test scroll behaviour with Lenis on and off; nested scrollers get `data-lenis-prevent`.
6. Profile (Performance panel, CPU throttling) for long tasks and layout shifts.
7. Type check and lint.

## Relevant files
`frontend/src/lib/motion.ts`, `lib/gsap.ts`, `hooks/use-gsap.ts`, `components/motion/*`, `components/providers/*`, `globals.css` (Lenis rules, reduced-motion media query).

## Implementation requirements
- Import GSAP only through `@/lib/gsap`. Kill/revert on unmount.
- Default `once: true` for scroll reveals; keep above-the-fold content visible immediately.
- Streaming text must not animate per-token layout.
- Do not remove the global reduced-motion CSS or `MotionConfig`.

## Testing requirements
Manual with reduced motion enabled; throttled CPU run; keyboard focus lands on visible content after scroll/anchors; verify no console errors on route changes (ScrollTrigger cleanup).

## Common mistakes
- Creating a second RAF loop or Lenis instance.
- Animating layout properties or large blur/shadow values.
- ScrollTriggers created outside a context (leaks on navigation).
- Hiding content with `opacity: 0` in CSS that depends on JS to reveal.
- Hover-only information.

## Definition of done
Animation uses shared constants, has a working reduced-motion fallback, no leaks on navigation, smooth on throttled CPU, type check and lint pass.
