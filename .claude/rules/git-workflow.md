# Git workflow rules

- Repo: branch `main`, remote `origin` (`wtorque/Legal_rights_awareness_assistant`). Do not commit or push unless the user asks.
- Work on a branch, never directly on `main`: `feat/<area>-<short>`, `fix/<area>-<short>`, `docs/<short>`, `chore/<short>`, `refactor/<short>`.
- Commit messages: imperative subject ≤ 72 chars with a conventional prefix (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`), body explaining why when not obvious. One logical change per commit.
- Keep diffs clean: no unrelated formatting, no reordered imports in untouched files, no generated artifacts. `.next/`, `node_modules/`, `.venv/`, `*.tsbuildinfo`, `.env*` must never be committed.
- Never `git add -A` blindly; stage specific files and review `git diff --staged`. Check no secrets or personal documents are staged.
- No force-push, no history rewriting of shared branches, no `--no-verify`, unless the user explicitly asks.
- Migrations are committed with the model change that needs them. Contract changes are committed together with both frontend and backend sides.
- Docs that describe a change ship in the same commit/PR as the change.
- PR description: what changed, why, how it was verified (commands + results), and doc/ADR updates.
- Current state: `backend/` and `frontend/` are untracked. Do not commit them as part of an unrelated change; the initial commit is a deliberate task (ROADMAP M0).
