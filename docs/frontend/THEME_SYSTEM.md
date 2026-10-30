# Theme System

Files: `src/stores/theme-store.ts`, `src/components/providers/theme-provider.tsx`, `src/components/layout/theme-toggle.tsx`, `src/app/globals.css`, `src/app/layout.tsx`. Settings → Appearance uses `SegmentedControl` bound to `setPreference`. Display preferences (text size, reduced motion, density) are separate: `preferences-store` plus `StoreHydrator`.

## Model

- Preference: `"light" | "dark" | "system"` (default `system`). Resolved theme: `"light" | "dark"`.
- Persistence: `localStorage` key `aequa-theme` (`THEME_STORAGE_KEY`). Every read and write is wrapped in try/catch (private mode, blocked storage fall back gracefully).
- Applied on `<html>`: class `dark`, `data-theme`, inline `color-scheme`. Tailwind dark variant: `@custom-variant dark (&:where(.dark, .dark *))`.

## No flash on first paint

1. `layout.tsx` renders `<script dangerouslySetInnerHTML={{__html: themeInitScript}} />` in `<head>`; it runs before paint, reads storage, matches `prefers-color-scheme` for `system`, and sets class/data-theme/color-scheme.
2. `<html suppressHydrationWarning>` because the script mutates attributes before hydration.
3. `ThemeProvider` calls `store.init()` in an effect: re-reads the preference, re-applies (no animation), subscribes to OS changes and cross-tab `storage` events.
4. `ThemeToggle` renders both icons and swaps them with CSS (`dark:`), so server and client markup match.

**Invariant:** `themeInitScript` and the store's `apply()` must stay equivalent. Change both together and re-test the first paint in light and dark with storage cleared and set.

## Switching

- `setPreference` persists, applies, and adds `theme-animating` to `<html>` for 450 ms, which cross-fades colour properties (see `globals.css`). `toggle()` reads the DOM class so the first click is right even before `init`.
- The status-bar colour is set through `viewport.themeColor` with both schemes.

## Semantic tokens

- All colours are CSS variables on `:root` (light) and `.dark`, mapped to Tailwind with `@theme inline` (`--color-*`). Use utility names (`bg-card`, `text-foreground`, `border-border`).
- Adding a colour: define in both `:root` and `.dark`, add to `@theme inline`, document in `DESIGN_SYSTEM.md`, add it to the token table in `brain/DESIGN_SYSTEM.md`.
- Non-token colours (e.g. `Badge` warning uses `amber-500` with `dark:` text) are exceptions; prefer a token when adding new states.

## Component compatibility checklist

- Looks correct in both themes at default, hover, focus, disabled.
- Focus ring visible in both (`--ring`).
- Contrast verified in both.
- Shadows use `--elev-*` tokens (tuned per theme).
- Images/SVG use `currentColor` or token classes, not fixed colours.
- Third-party components (Headless UI, 21st.dev, React Bits) are rethemed to tokens before merge.

## Testing

Automated: `frontend/e2e/theme.spec.ts` (toggle, persistence, first paint, system preference) and `src/stores/theme-store.test.ts`. Still manual: clear storage → load (follows OS) → toggle → reload (persists) → change OS scheme while on `system` → open two tabs and change in one. Check no flash with CPU throttling.
