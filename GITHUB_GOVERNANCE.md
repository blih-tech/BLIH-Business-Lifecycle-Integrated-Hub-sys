# GitHub Governance

This file describes the governance that is currently configured in this repository.

## Local Git Hooks

Husky is installed at the repository root and manages these hooks:

- `pre-commit`
  - Runs `lint-staged`
  - Staged-file rules come from `.lintstagedrc.cjs`
  - Current rules:
    - `*.{ts,tsx,js,jsx}` -> `eslint --fix` and `prettier --write`
    - `*.{md,json,yml}` -> `prettier --write`

- `commit-msg`
  - Runs `commitlint`
  - Configuration lives in `commitlint.config.cjs`
  - Allowed Conventional Commit types:
    - `build`
    - `chore`
    - `ci`
    - `docs`
    - `feat`
    - `fix`
    - `perf`
    - `refactor`
    - `revert`
    - `style`
    - `test`

- `pre-push`
  - Rejects direct pushes to `main`, `develop`, and `dev`
  - Runs `npm run check-types`
  - Runs `npm run lint`

## GitHub Actions

Governance workflow:

- `.github/workflows/governance.yml`

The workflow enforces:

- conventional commit validation on pull requests
- scoped lint and type-check verification for affected workspaces
- scoped backend tests when backend-related code changes

Current job names:

- `Monorepo Governance / commit-rules`
- `Monorepo Governance / quality-gates`

## Branch Protection Script

Manual GitHub branch protection can be applied with:

```powershell
pwsh ./scripts/apply-branch-protection.ps1 `
  -Owner <github-owner> `
  -Repo <github-repo> `
  -Branches main,develop
```

If this repository uses `dev` instead of `develop`, use:

```powershell
pwsh ./scripts/apply-branch-protection.ps1 `
  -Owner <github-owner> `
  -Repo <github-repo> `
  -Branches main,dev
```

The PowerShell script configures:

- required status checks
- pull-request review requirements
- linear history
- no force-pushes
- no branch deletions
- optional signed-commit enforcement
