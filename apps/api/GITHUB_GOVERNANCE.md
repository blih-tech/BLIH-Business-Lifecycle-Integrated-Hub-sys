# Repository Governance Setup

This repository enforces governance from the monorepo root (Git hooks + CI).

## Local Enforcement (Husky at repository root)

### Installed hooks

- `pre-commit`
  - Validates branch naming (`feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`, `test/*`, `build/*`, `ci/*`, `perf/*`, `style/*`, `revert/*`, `release/*`, `hotfix/*`, plus protected branches)
  - Runs `lint-staged` (ESLint/Prettier on staged files)
  - Runs ESLint and TypeScript checks only for the staged workspaces affected by the commit
- `commit-msg`
  - Enforces Conventional Commits (see [docs/COMMIT_MESSAGES.md](docs/COMMIT_MESSAGES.md) for full types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`)
- `pre-push`
  - Rejects direct pushes to `main`, `develop`, and `dev`
  - Rejects invalid branch names
  - Runs scoped workspace verification only for the packages affected by the push

### Bootstrap

```bash
npm ci
npm run prepare
```

## CI Enforcement (GitHub Actions)

Workflow: `.github/workflows/governance.yml`

Required checks to configure on protected branches:

- `Monorepo Governance / commit-and-branch-rules`
- `Monorepo Governance / quality-gates`

The workflow blocks PRs when:

- branch naming is invalid (must be `<prefix>/<name>` with a conventional prefix)
- commit messages are not conventional
- scoped ESLint verification fails for an affected workspace
- scoped TypeScript type-check fails for an affected workspace
- scoped backend tests fail when backend-related code changes

## Branch Protection Automation

Use GitHub CLI (`gh`) to apply protection to target branches.

```powershell
pwsh ./apps/api/scripts/github/apply-branch-protection.ps1 `
  -Owner <github-owner> `
  -Repo <github-repo> `
  -Branches main,develop `
  -RequireSignedCommits
```

For this repository, if you use `dev` instead of `develop`, run:

```powershell
pwsh ./apps/api/scripts/github/apply-branch-protection.ps1 `
  -Owner <github-owner> `
  -Repo <github-repo> `
  -Branches main,dev `
  -RequireSignedCommits
```

## What Branch Protection Enforces

- no direct pushes to protected branches (PR required)
- minimum 1 PR approval before merge
- required status checks before merge
- stale approvals dismissed on new commits
- force-push blocked on protected branches
- branch deletion blocked
- optional signed commits on protected branches

GitHub automatically blocks merge when PR has unresolved merge conflicts.
