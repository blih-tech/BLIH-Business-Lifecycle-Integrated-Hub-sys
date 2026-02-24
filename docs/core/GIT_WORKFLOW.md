# Git Workflow: Branches, Commits, Pull Requests

This document defines the required branch naming, commit message format, and pull request expectations for the BLIH monorepo. It aligns with enforced repository hooks and CI checks.

## Quick Start

1. Sync main: `git switch main && git pull`
2. Create a branch: `git switch -c feature/short-description`
3. Commit with Conventional Commits: `git commit -m "feat(api): add audit export"`
4. Push: `git push --set-upstream origin feature/short-description`
5. Open a PR to `main`

## Branch Naming Rules

Format: `<prefix>/<slug>`

Allowed prefixes:

- `feature`
- `fix`
- `chore`
- `docs`
- `refactor`
- `test`
- `build`
- `ci`
- `perf`
- `style`
- `revert`
- `release`
- `hotfix`

Slug rules:

- Lowercase only
- Allowed characters: `a-z`, `0-9`, `.`, `_`, `-`

Protected branches:

- `main`, `develop`, `dev`
- Direct pushes are blocked. Use a PR.

Examples:

- `feature/user-audit-export`
- `fix/api-timeout`
- `docs/commit-guidelines`
- `hotfix/payment-gateway`

## Commit Message Rules

Format: `type(scope?): subject`

Allowed types:

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

Rules:

- `type` and `scope` must be lowercase.
- `scope` is optional but recommended. Use areas like `api`, `web`, `ui`, `docs`, `repo`, `infra`, or a module name.
- `subject` is required, imperative, and must not end with a period.
- Header max length is 72 characters.
- Body and footer are optional, but if present they must start after a blank line.
- Body and footer lines must be 120 characters or fewer.
- Breaking changes must be declared with `BREAKING CHANGE:` in the footer.

Examples:

```
feat(api): add audit export endpoint
```

```
fix(web): handle null token refresh

Adds a guard around the refresh flow to prevent a null dereference.
```

```
refactor(repo): rename environment variables

BREAKING CHANGE: API_HOST renamed to API_BIND_HOST.
```

## Pull Request Guidelines

Target branch:

- Default is `main`.
- Use `release/*` or `hotfix/*` only when explicitly required.

Scope and size:

- Keep PRs focused on one concern.
- Split large changes into a series of smaller PRs.

PR title:

- Recommended to follow Conventional Commits, e.g. `feat(api): add audit export`.

PR description should include:

- Summary of changes
- Testing performed
- Risks and rollout notes
- Any follow-ups or TODOs

## Local Hooks and Quality Gates

Pre-commit:

- Branch name validation
- Lint and format staged files

Commit message:

- Conventional Commit validation

Pre-push:

- Prevents direct push to protected branches
- Runs `npm run lint`
- Runs `npm run check-types`
- Runs `npm run test --workspace blih-system-backend -- --ci --passWithNoTests`

Useful local checks:

- `npm run branch:check`
- `npm run commits:check`
- `npm run commits:check:branch`

## Common Issues

If your commit is rejected:

- Fix the message to follow `type(scope): subject`
- Ensure the subject is under 72 characters and does not end with a period

If your push is rejected:

- Ensure your branch name matches the required pattern
- Do not push directly to `main`, `develop`, or `dev`
