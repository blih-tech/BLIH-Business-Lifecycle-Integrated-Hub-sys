# BLIH Web (`apps/web`)

Next.js application for the BLIH dashboard. This document focuses on **shared types and contracts**: the frontend and the NestJS API must use the **same** TypeScript definitions so payloads, enums, and RBAC slugs never drift.

## Source of truth: `@repo/types`

All cross-cutting **API contracts**, **DTO shapes**, **enums**, **permission slugs**, and **shared response types** live in the workspace package:

| Location                                                                                                     | Role                                                                                                    |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| [`packages/types`](../../packages/types)                                                                     | **Canonical** TypeScript library (`@repo/types` on npm workspaces).                                     |
| [`packages/types/src/rbac/permissions.constants.ts`](../../packages/types/src/rbac/permissions.constants.ts) | **Canonical** RBAC permission string constants (must match `@Roles(...)` on the API and any UI checks). |
| Domain modules under `packages/types/src/*`                                                                  | e.g. `recruitment/`, `auth/`, `hr/` — DTOs and enums consumed by API and web.                           |

The API depends on `@repo/types` (see [`apps/api/package.json`](../api/package.json)). The web app must treat that package the same way: **import types from `@repo/types` (or its subpath exports), not re-declare them** in `apps/web/src` unless you are intentionally adding a **web-only** UI type (view models, component props) that is not an API contract.

### Why this matters

- **RBAC**: The API `RbacGuard` resolves permission slugs against the user’s permission list. If the UI uses a different string literal than `permissions.constants.ts`, users will see confusing allow/deny behavior or unnecessary 403s.
- **DTOs**: Request/response bodies are validated and typed on the server from `@repo/types`. If the client uses a hand-rolled duplicate interface, TypeScript will not catch contract breaks.

## How the web app imports `@repo/types`

### 1. TypeScript path mapping (this repo)

[`tsconfig.json`](./tsconfig.json) maps `@repo/types` to the **package source** so the IDE and `tsc` resolve types without relying on `packages/types/dist` during development:

```json
"@repo/types": ["../../packages/types/src/index.ts"],
"@repo/types/*": ["../../packages/types/src/*"]
```

Use imports that mirror the package’s **export map** (see [`packages/types/package.json`](../../packages/types/package.json)), for example:

```ts
import type { CreateJobDto } from '@repo/types/recruitment';
import type { AuthMeResponseDto } from '@repo/types/auth';
```

### Next.js / Turbopack and RBAC **value** imports

The file [`packages/types/src/rbac/index.ts`](../../packages/types/src/rbac/index.ts) re-exports using `.js` extensions (for the compiled ESM output). When the web app resolves `@repo/types` **source** via `tsconfig` paths, **Turbopack can fail** on those barrel imports (`Can't resolve './access-evaluation.js'`).

For **runtime permission constants** used in Client Components, import the **constants module directly** (no `.js` specifiers inside that file):

```ts
import {
  JobApprovalPermissions,
  JobPermissions,
} from '@repo/types/rbac/permissions.constants';
```

The Nest API may keep using `@repo/types/rbac` or deep imports; both resolve to the same canonical strings in `permissions.constants.ts`.

Prefer **subpath imports** (`@repo/types/recruitment`, `@repo/types/auth`, …) for other domains when they work with your bundler; if a barrel under `packages/types/src/<area>/index.ts` only re-exports with `.js` extensions and the build breaks, import the **specific** `*.ts` module instead.

### 2. Runtime / bundling

Next bundles whatever you import. Keeping imports on `@repo/types` (resolved via `tsconfig` paths to `src`) is consistent with local development. For production builds, ensure the types package is buildable when you change it (Turbo `dependsOn: ["^build"]` on the repo’s build pipeline). If you add **value** imports (constants, runtime enums) from `@repo/types`, treat them like any other dependency: they must compile to valid JS in the types package output or be safe as TypeScript-only `import type` where appropriate.

## RBAC and permissions (frontend rules)

1. **Never** invent ad-hoc permission strings in the UI (e.g. `'job:view'` as a raw string in multiple files). Import the constant objects from `@repo/types/rbac/permissions.constants` (e.g. `JobPermissions.VIEW`).
2. **Wildcard rules** for “does the user have this slug?” are implemented in the web helper that mirrors the API (`apps/web/src/shared/auth/permission-check.ts` — keep in sync with `apps/api/src/platform/keycloak/utils/role.util.ts`).
3. UI checks are **advisory**: they improve UX and avoid pointless calls. **Authorization is always enforced on the API.**

## DTOs, enums, and API envelopes

- Prefer `import type { ... } from '@repo/types/<domain>'` for shapes that only exist to type API JSON.
- If you need a **narrow** client-side view (e.g. form state), you may define local types in `src/features/...`, but the **wire format** sent to `/api/v1/...` should still align with `@repo/types` DTOs.

## Legacy `apps/web/src/types`

Some modules still import from `@/types/...`. Those files are **web-local** definitions. For anything that **duplicates** `@repo/types` (same field names as an API DTO), treat that as **technical debt**: new code should import from `@repo/types` instead, and refactors should converge on the shared package.

## Related documentation

- Monorepo agent guide: [`../../AGENTS.md`](../../AGENTS.md)
- Types package entry: [`../../packages/types/src/index.ts`](../../packages/types/src/index.ts)
- API workspace: [`../api`](../api) (NestJS uses the same `@repo/types` dependency)

## Scripts (web)

| Command               | Purpose                         |
| --------------------- | ------------------------------- |
| `npm run dev`         | Next.js dev server (port 3000). |
| `npm run build`       | Production build.               |
| `npm run check-types` | `tsc --noEmit` for this app.    |
| `npm run lint`        | ESLint.                         |

Run these from `apps/web`, or via the root Turbo tasks as documented in the root `package.json`.
