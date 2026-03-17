# Prisma Runtime & Seed

This folder contains only the API-side Nest runtime wiring for Prisma.
The database source of truth lives in `packages/database/`.

## Structure

| Path                                              | Purpose                                                       |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `prisma.service.ts`                               | Nest lifecycle wrapper around `PrismaClient`.                 |
| `prisma.module.ts`                                | Global Nest module exporting `PrismaService`.                 |
| `prisma.adapter.ts`                               | API env-to-adapter shim for the database package.             |
| `prisma-client.ts`                                | Compatibility re-export for `@repo/database/prisma-client`.   |
| `../../../../../packages/database/schema/`        | Canonical Prisma schema source.                               |
| `../../../../../packages/database/migrations/`    | Canonical Prisma migration history.                           |
| `../../../../../packages/database/seed/`          | Canonical Prisma seed files and RBAC manifest.                |
| `../../../../../packages/database/src/generated/` | Generated Prisma client source owned by the database package. |

## Alignment with application

- **Permission slugs**: 2-part format `resource:action` (e.g. `user:view`, `system_role:create`). Used by `User.permissions`, guards, and RBAC use cases. The canonical source is `packages/types/src/rbac/permissions.constants.ts`.
- **PermissionResource**: Unique by `name` globally. The seed and app (e.g. `CreateScopeUseCase`, `CreateRoleUseCase`) use `findUnique({ where: { name } })` and upsert by resource name.
- **Role**: Global (no `realmId`). Roles are upserted by `name`; hierarchy is set via `parentRoleId`. The manifest defines `RBAC_ROLES` with `parentRoleName`; the seed applies that to `parentRoleId`.
- **User.permissions**: String array of permission slugs (and optionally `'*'` for superadmin). Populated by the seed’s `rebuildAllUserPermissions()` and by `UserPermissionSnapshotService` in the app.
- **Realm bootstrap**: Seed creates module and RBAC catalog data for the default `blih` realm context.

## Running

```bash
# Generate client and package runtime artifacts (after schema change)
npm run prisma:generate

# Apply migrations (dev, creates migration if needed)
npm run prisma:migrate:dev

# Apply migrations (production / CI)
npm run prisma:migrate:deploy

# Reset DB, re-apply all migrations, then run seed
npx prisma migrate reset

# Run seed only (e.g. after deploy)
npm run prisma:seed
```
