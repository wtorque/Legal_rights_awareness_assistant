---
name: ui-ux-design
description: Design or refine Aequa screens and flows while preserving the approved premium architectural LegalTech identity. Use for layout, hierarchy, typography, trust UX (sources, disclaimers, refusals), empty and error states, and design critique.
---

# UI/UX Design

## When to use
Designing a new page or flow, reviewing a screen, deciding how legal evidence, uncertainty or refusals are presented, or adding design tokens.

## Required project context
`brain/DESIGN_SYSTEM.md`, `docs/frontend/COMPONENT_GUIDE.md`, `/design-system` page, `frontend/src/app/globals.css`.

## Engineering principles
- Keep the identity: ivory/soft-blue light, midnight-navy dark, brass accent, Instrument Serif display + Geist, pill buttons, rounded-3xl cards, glass surfaces. No generic template look.
- Trust first: the source is part of the answer. Uncertainty and refusals are designed states, not errors.
- Plain language, reading-width text, generous space; motion supports clarity.
- Accessibility is a design input, not a final check.

## Workflow
1. Identify the user's goal and emotional state (often stressed, non-expert, possibly non-native reader).
2. Sketch hierarchy: one primary action, secondary actions, evidence placement.
3. Compose from existing primitives (`Section`, `PageHeader`, `Card`, `Badge`, `Button`); extend tokens only if truly new, in both themes.
4. Design all states: default, hover, focus, disabled, loading, empty, error, refusal, no-coverage.
5. Write the microcopy in plain language; avoid jargon or define it inline.
6. Check contrast, focus, target size, text scaling, small widths.
7. Implement with `frontend-engineering` / `component-engineering`; verify visually.

## Relevant files
`frontend/src/app/globals.css`, `frontend/src/components/ui/*`, `frontend/src/components/layout/*`, `frontend/src/config/site.ts`.

## Implementation requirements
- Semantic tokens only. New colours added to `:root`, `.dark`, `@theme inline`, and the design-system page.
- Disclaimers visible near AI output. `MockDataBadge` on sample content.
- Never style an unverified citation like a verified one.

## Testing requirements
Visual pass in light/dark at 320/768/1280; keyboard walkthrough; contrast measurement for new colour pairs; reduced motion check. State which were actually done.

## Common mistakes
- Importing a flashy component that breaks the calm identity.
- Hiding sources behind hover or a tiny footnote.
- Colour-only status indication.
- Designing only the happy path.
- Long unbroken legal text with no structure.

## Definition of done
Screen uses tokens and existing primitives, all states designed, accessible, consistent in both themes and across breakpoints, and the design-system docs updated if tokens or primitives changed.
