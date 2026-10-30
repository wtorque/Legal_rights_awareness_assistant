# Coding standards

Match the surrounding code: naming, comment density, idiom.

## TypeScript / React (`frontend/`)
- `strict` stays on. No `any`, no `@ts-ignore`/`@ts-expect-error` without a one-line reason, no `as` casts to silence errors. Do not weaken `tsconfig.json` or the ESLint config.
- Files kebab-case, components PascalCase, hooks `use-*.ts`, stores `*-store.ts`. Imports via `@/`.
- Styling with Tailwind and semantic tokens; `cn()` for class merging; variants with `cva`.
- Explicit prop interfaces; no unused exports; no dead code left behind.
- Comments state intent or constraints (why), not what the line does.
- Handle loading, empty and error states for any async UI.
- Before Next.js work, read the matching guide in `frontend/node_modules/next/dist/docs/`.

## Python (`backend/`)
- Type-annotate all function signatures; Python 3.14, `from __future__` not needed for current features.
- Pydantic models for I/O, SQLAlchemy 2 `Mapped[...]` for persistence; never mix them.
- `async` for I/O; no blocking calls on the event loop.
- Raise `AppError` subclasses for expected failures; never return error dicts. Never catch bare `Exception` without re-raising or logging with context.
- Logging via `get_logger`; no `print`. Never log user text, secrets or tokens.
- Modules snake_case, classes PascalCase, constants UPPER_SNAKE. Docstrings only where behaviour is non-obvious (match `core/` style).
- Keep functions small and single-purpose; early returns over deep nesting.

## General
- Never bypass type checking, lint rules, or tests to make a change pass; fix the cause.
- No commented-out code, no TODO without an owner/reason and a KNOWN_ISSUES entry.
- Legal content in code, tests and docs is never invented (see `.claude/rules/security.md` and `brain/LEGAL_KNOWLEDGE.md`).
