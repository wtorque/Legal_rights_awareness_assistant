---
name: frontend-accessibility
description: Build and audit Aequa's UI for WCAG 2.2 AA — semantics, keyboard, focus, contrast, forms, dialogs, live regions, reduced motion and multilingual content. Use when adding interactive UI or reviewing accessibility.
---

# Frontend Accessibility

## When to use
Any interactive component, form, dialog, streaming UI, or an accessibility review. Legal-rights users include people with disabilities, low literacy and assistive technology, so this is core.

## Required project context
`docs/frontend/COMPONENT_GUIDE.md` (accessibility section), `docs/frontend/THEME_SYSTEM.md`, existing patterns: skip link in `AppShell`, `aria-current` in nav, `aria-label` on icon buttons, Headless UI dialog, global `:focus-visible`.

## Engineering principles
- Semantic HTML before ARIA.
- Everything operable by keyboard with a visible focus indicator.
- Information is never conveyed by colour or motion alone.
- Status changes are announced; content is readable at 200% zoom.

## Workflow
1. Check structure: landmarks, one `h1`, ordered headings, link vs button semantics.
2. Tab through: order, focus visibility, no traps (except dialogs, which trap and restore focus).
3. Check names/roles/states for every control; labels for inputs; errors tied via `aria-describedby`.
4. Check contrast (text 4.5:1, large text/UI 3:1) in both themes.
5. Announce async/streaming updates with `aria-live="polite"`; provide the final non-animated state.
6. Test reduced motion; test 200% zoom and 320px width.
7. Set `lang` appropriately; mark foreign-language quotes with `lang` and `dir` when added.

## Relevant files
`frontend/src/components/**`, `frontend/src/app/layout.tsx` (`lang="en"`), `globals.css`.

## Implementation requirements
- Dialogs: label, focus trap, Esc, restore focus; scrollable ones carry `data-lenis-prevent`.
- Target size ≥ 24px (44px for primary).
- Citations/sources are real links with descriptive text, not "click here".
- Verification state (verified / sample) has text or icon, not colour only.

## Testing requirements
Keyboard-only pass, a screen reader smoke test (VoiceOver on macOS) for new interactive components, automated checks (axe via devtools or a test runner once available). Record what was run.

## Common mistakes
- `div` buttons; removing outlines; placeholder-only labels.
- Live region that announces every streamed token.
- Contrast checked only in light mode.
- Focus lost after closing a dialog or route change.

## Definition of done
Keyboard and screen-reader operable, contrast verified in both themes, states announced, reduced motion respected, no new axe violations in what was checked.
