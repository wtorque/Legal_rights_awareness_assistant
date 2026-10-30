---
name: frontend-performance
description: Measure and improve Aequa frontend performance — Core Web Vitals, bundle size, client/server component split, fonts, images, animation cost and streaming render. Use when pages feel slow or before shipping heavy UI.
---

# Frontend Performance

## When to use
Slow load or interaction, janky scroll/animation, large bundles, adding heavy libraries (GSAP plugins, 21st.dev/React Bits effects), or before release.

## Required project context
`docs/frontend/ANIMATION_GUIDE.md` (performance), `docs/frontend/FRONTEND_ARCHITECTURE.md`. Heavy client libs already in: framer-motion, gsap, lenis, headlessui. Fonts via `next/font/google` (Geist, Geist Mono, Instrument Serif).

## Engineering principles
- Measure first; no speculative optimisation.
- Keep work on the server and out of the client bundle where possible.
- Animate compositor properties only; defer non-critical JS.
- Performance budgets protect users on low-end devices and slow networks.

## Workflow
1. Establish a baseline: `npm run build` output (route sizes), Lighthouse/Web Vitals (LCP, INP, CLS), Performance panel for animation.
2. Find the cause (bundle analysis, long tasks, layout shifts, hydration cost).
3. Apply the smallest fix: server component instead of client, dynamic import for heavy below-fold code, `next/image` sizing, fewer fonts/weights, reduce blur/shadow animation, memoise only where measured.
4. Re-measure and compare; keep the numbers.
5. Document anything that changes conventions.

## Relevant files
`frontend/next.config.ts`, `frontend/src/app/layout.tsx` (fonts), `components/providers/*`, `components/motion/*`, `package.json`.

## Implementation requirements
- Read Next 16 caching docs (`node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`) before changing caching behaviour; `cacheComponents` is on.
- New dependencies need size justification.
- Streaming UIs append text without re-rendering the entire message tree per token.
- Respect reduced motion even when optimising.

## Testing requirements
Before/after numbers (build sizes, Lighthouse, trace). Check CLS from fonts/images. Test on throttled CPU/network.

## Common mistakes
- Making a page a client component for one button.
- Importing all of GSAP plugins/Lucide icon sets unnecessarily (import named icons only).
- Large unoptimised images; layout shift from late fonts/images.
- Optimising without a measurement.

## Definition of done
A measured improvement (or confirmed non-issue) with before/after evidence, no regression in accessibility or reduced-motion behaviour, build passes.
