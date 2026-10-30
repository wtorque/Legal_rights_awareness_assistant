---
name: debugging
description: Systematically find and fix bugs in Aequa — reproduce, isolate, root-cause, fix with a regression test. Use when something fails, behaves unexpectedly, or a build, type check, test or runtime error appears.
---

# Debugging

## When to use
Errors from `tsc`, `eslint`, `next build`, `pytest`, uvicorn, the browser console, or wrong behaviour in the UI/API.

## Required project context
`brain/KNOWN_ISSUES.md` (maybe already known), `brain/ARCHITECTURE.md`. Next.js is 16.4.3 with `cacheComponents` — read the Next docs in `frontend/node_modules/next/dist/docs/` for unfamiliar errors rather than guessing from older versions.

## Engineering principles
- Reproduce before theorising. Change one thing at a time.
- Find the root cause; do not mask symptoms (no `any`, `@ts-ignore`, swallowed exceptions, skipped tests).
- Read the actual error and the code path; do not assume.
- Preserve evidence; avoid logging sensitive data while debugging.

## Workflow
1. Capture the exact error/steps/environment. Check `KNOWN_ISSUES.md`.
2. Reproduce minimally (command, request, or UI steps). If you cannot, say so.
3. Localise: bisect the code path, read logs (request id), inspect inputs at boundaries (contract mismatch is common), check recent changes (`git diff`, `git log`).
4. Form a hypothesis, test it with a targeted probe.
5. Write a failing regression test (or a documented manual repro if no runner exists).
6. Fix the cause with the smallest change; run the test and the surrounding suite.
7. Record: remove or add `KNOWN_ISSUES` entry; update status docs if behaviour changed.

## Relevant files
Depends on the symptom; start at the stack trace or the failing route/component. For API issues compare `DATA_CONTRACTS.md` with both implementations.

## Implementation requirements
- Remove temporary debug code and logs. Never commit `print`/`console.log` probes.
- Do not paste secrets or user text into issue notes.

## Testing requirements
Regression test or documented manual repro that fails before, passes after; `tsc`/`lint`/`build`/`pytest` as applicable.

## Common mistakes
- Fixing the symptom at the call site while the contract is wrong.
- Hydration errors "fixed" by `suppressHydrationWarning` (only the theme attribute use is intended).
- Blaming the library before checking the Next 16 docs.
- Skipping the repro.

## Definition of done
Root cause identified and stated, fix is minimal, regression test exists, no debug leftovers, results reported.
