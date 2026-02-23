# Commit message format (Conventional Commits)

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/). They are enforced by the `commit-msg` hook (Husky) and by CI in the Governance workflow.

## Structure

```
type(scope?): subject

optional body

optional footer
```

- **type** (required): One of the allowed types below (lowercase).
- **scope** (optional): Area of the codebase, e.g. `auth`, `api`, `prisma` (lowercase).
- **subject** (required): Short description in lowercase, no period at the end. Max 72 characters for the full header line.
- **body** (optional): Longer description; blank line after header; max 100 characters per line.
- **footer** (optional): e.g. `BREAKING CHANGE:`, `Fixes #123`; blank line before footer; max 100 characters per line.

## Allowed types

| Type       | Use for                                                                           |
| ---------- | --------------------------------------------------------------------------------- |
| `feat`     | New feature                                                                       |
| `fix`      | Bug fix                                                                           |
| `docs`     | Documentation only                                                                |
| `style`    | Formatting, whitespace, no code logic change                                      |
| `refactor` | Code change that is not a fix or a feature                                        |
| `perf`     | Performance improvement                                                           |
| `test`     | Adding or updating tests                                                          |
| `build`    | Build system, dependencies, tooling                                               |
| `ci`       | CI config, workflows, scripts                                                     |
| `chore`    | Maintenance, no production code change                                            |
| `revert`   | Revert a previous commit (subject often: `revert: type(scope): original subject`) |

## Examples

```text
feat(auth): add refresh token rotation
fix(api): prevent null in pagination cursor
docs: update API README
chore(deps): bump eslint to 9.x
refactor(prisma): extract repository helpers
test(auth): add login e2e tests
ci: add commitlint to governance workflow
revert: feat(auth): add refresh token rotation
```

## Breaking changes

Option 1 — in header:

```text
feat(api)!: remove deprecated /v1 prefix
```

Option 2 — in footer:

```text
feat(api): introduce v2 response shape

BREAKING CHANGE: response payload is now under `data`.
```

## Validation

- **Local:** `git commit` runs `commitlint` via `.husky/commit-msg`. Invalid messages are rejected.
- **CI:** The Governance workflow runs `commitlint --from <base> --to <head>` on every PR.

To validate the last commit:

```bash
npx commitlint --from HEAD~1 --to HEAD --verbose
```

To validate all commits in the current branch against `main`:

```bash
npx commitlint --from main --to HEAD --verbose
```
