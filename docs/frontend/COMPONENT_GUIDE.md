# Component Guide

## Before creating anything

1. Search `frontend/src/components` for an existing component. Never duplicate.
2. Check `components/ui` and `brain/DESIGN_SYSTEM.md`.
3. Decide the layer: `ui/` (primitive), `layout/`, or `<feature>/`.

## Conventions

- File names kebab-case (`mock-data-badge.tsx`); exports PascalCase; one main component per file.
- Variants via `cva`, merged with `cn()` from `@/lib/utils`. Accept `className` and spread remaining props.
- Forward refs on interactive primitives (see `Button`, `Card`).
- Props typed with an exported interface; document non-obvious props with a one-line JSDoc.
- Colours only from semantic tokens (`bg-primary`, `text-muted-foreground`). No raw hex, no `dark:` colour pairs for token-covered colours.
- Icons: `lucide-react`. Decorative icons get `aria-hidden`; icon-only buttons get `aria-label`.
- Comments explain *why*, matching the existing sparse style.

## Primitive libraries (current state, ADR-014)

| Library | Use today | Rule |
|---|---|---|
| shadcn CLI (`components.json`: `base-nova`) | Configured only. `ui/` components are hand-written | If you add via CLI, review the output, retheme to tokens, keep the existing variant API (`primary`, `outline`, ...). Do not let it overwrite `button.tsx`, `card.tsx` or `badge.tsx` unreviewed |
| Radix UI | Dialog, dropdown menu, context menu, popover, tooltip, tabs, switch, slot | Wrap once in `components/ui`; never import Radix directly in feature code |
| Headless UI | Mobile drawer, FAQ accordion | Use for transitions via `data-closed:` |
| `cmdk` | Global search list | Only in `components/search` |
| 21st.dev, React Bits | None used | Copy-in. Review code, strip unneeded deps, retheme, record provenance in a one-line comment, verify reduced motion and mobile performance |

Adding any npm dependency requires justification (a task or ADR). Prefer copy-in over a new package when the component is small.

## Accessibility requirements (WCAG 2.2 AA)

- Semantic elements first: `button`, `a`, `nav`, `main`, headings in order (one `h1` per page, from `PageHeader`).
- All interactive elements keyboard reachable with a visible focus ring (global `:focus-visible` style; don't suppress).
- Targets at least 24×24 CSS px; primary actions 44px (`Button size="md"` is `h-11`).
- Contrast: text ≥ 4.5:1, large text/UI ≥ 3:1 in both themes. Verify when adding colours.
- Dialogs: focus trap, Esc to close, labelled (`DialogTitle`). 
- State is not conveyed by colour alone (add icon/text).
- Live regions for streaming/async results (`aria-live="polite"`), and a non-animated final state.
- Forms: visible labels, associated errors (`aria-describedby`), no placeholder-only labels.

## Composition patterns

- Page = `Section` + `PageHeader` + content blocks. Use `Section width="prose"` for reading-width text.
- Group staggered content with `RevealGroup` / `RevealItem`.
- Wrap sample content with `MockDataBadge`.
- Link-styled buttons: `<Button asChild><Link …/></Button>`.

## Legal UI components (to build)

- **SourceCard / CitationChip**: shows document title, section label, jurisdiction, verified date. Links to the source section. Never renders a citation not marked verified.
- **AnswerView**: answer + adjacent sources + disclaimer + refusal state.
- **JurisdictionSelect**: shows coverage status.
- Define their prop types from `DATA_CONTRACTS.md`, not ad hoc.
