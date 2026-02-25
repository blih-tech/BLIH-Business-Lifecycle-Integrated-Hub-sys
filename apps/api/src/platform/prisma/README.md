# Prisma Runtime & Seed

This folder contains Prisma runtime wiring and seed logic used by the application.
Schema and migrations are stored at the API root in `prisma/`.

## Structure

| Path                            | Purpose                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `../../../prisma/schema.prisma` | Canonical schema (models, enums, relations). Generate client with `npm run prisma:generate`.                      |
| `../../../prisma/migrations/`   | Ordered SQL migrations. Apply with `npm run prisma:migrate:dev` or `prisma:migrate:deploy`.                       |
| `prisma.seed.ts`                | Seed script run after `prisma migrate reset` or via `npm run prisma:seed`.                                        |
| `seed/rbac.manifest.ts`         | RBAC resource/module/role definitions. Permission slugs come from `core/rbac/constants/permissions.constants.ts`. |

## Alignment with application

- **Permission slugs**: 2-part format `resource:action` (e.g. `user:view`, `system_role:create`). Used by `User.permissions`, guards, and RBAC use cases. The canonical source is `core/rbac/constants/permissions.constants.ts`.
- **PermissionResource**: Unique by `name` globally. The seed and app (e.g. `CreateScopeUseCase`, `CreateRoleUseCase`) use `findUnique({ where: { name } })` and upsert by resource name.
- **Role**: Global (no `realmId`). Roles are upserted by `name`; hierarchy is set via `parentRoleId`. The manifest defines `RBAC_ROLES` with `parentRoleName`; the seed applies that to `parentRoleId`.
- **User.permissions**: String array of permission slugs (and optionally `'*'` for superadmin). Populated by the seed’s `rebuildAllUserPermissions()` and by `UserPermissionSnapshotService` in the app.
- **Realm / Organization**: Seed creates realm `blih` and default org; `SystemConfig` and `ModuleConfig` use the same realm and org.

## Running

```bash
# Generate client (after schema change)
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

## Seed behaviour

1. Upserts realm `blih` and default organization.
2. Ensures all modules/resources from `seed/rbac.manifest.ts` and all permission slugs from `core/rbac/constants/permissions.constants.ts` exist.
3. Prunes catalog drift by deleting permissions/actions/resources/modules not in canonical constants/manifest.
4. Upserts roles from `RBAC_ROLES`, sets `parentRoleId` from `parentRoleName`, then assigns permissions to roles via `RolePermission`.
5. Rebuilds `User.permissions` for all users (role-derived + overrides).
6. Upserts `ModuleConfig` (core) and `SystemConfig` (org.default).

Catalog truth is split intentionally: modules/resources/roles in `seed/rbac.manifest.ts`, permission slugs in `core/rbac/constants/permissions.constants.ts`. Seed reconciliation keeps DB aligned with both.
