# Monorepo Conventions

This repository uses a root-first governance model. Shared automation and quality controls live at the monorepo root, while domain/runtime logic stays inside each app/package.

## Root-Owned Configuration

- CI workflows: `.github/workflows/`
- Git hooks: `.husky/`
- Commit message rules: `commitlint.config.cjs`
- Staged file quality checks: `.lintstagedrc.cjs`
- Formatting/editor defaults: `.prettierrc`, `.editorconfig`
- Workspace orchestration: `package.json`, `turbo.json`

## App-Owned Configuration

- API application code, module-specific lint rules, and Docker files: `apps/api/`
- Web application code: `apps/web/`
- Shared package configs and source: `packages/*`

## Standard Root Commands

- `npm run lint` runs lint across workspaces with Turborepo.
- `npm run check-types` runs type checks across workspaces.
- `npm run api:verify` runs API lint/typecheck/tests (CI-grade).
- `npm run docker:api:infra:up` starts shared API dependencies.
- `npm run docker:api:up` starts full API stack with app container.

## Hook Flow

- `pre-commit`: branch-name validation and lint-staged.
- `commit-msg`: conventional commit validation with commitlint.
- `pre-push`: branch protection checks, monorepo lint, monorepo type-check, and API tests.

## CI Flow

Workflow: `.github/workflows/governance.yml`

- PR governance: branch naming + conventional commit range checks.
- Quality gates: install, lint monorepo, type-check monorepo, run API verification.
