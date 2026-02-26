# Prisma Runtime & Seed

This folder contains Prisma runtime wiring and seed logic used by the application.
Schema and migrations are stored at the API root in `prisma/`.

## Structure

| Path                            | Purpose                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `../../../prisma/schema.prisma` | Canonical schema (models, relations). Generate client with `npm run prisma:generate`.          |
| `../../../prisma/migrations/`   | Ordered SQL migrations. Apply with `npm run prisma:migrate:dev` or `prisma:migrate:deploy`.    |
| `prisma.seed.ts`                | Seed script run after `prisma migrate reset` or via `npm run prisma:seed`.                     |
| `seed/rbac.manifest.ts`         | RBAC resource and role metadata definitions. Permission slugs come from permissions constants. |

## Alignment with application

- **Permission slugs**: 2-part `resource:action` format (for example `user:view`, `system_role:create`).
- **Permission model**: `Permission = PermissionResource + PermissionAction`, unique by `(resourceId, actionId)` and by `slug`.
- **Role hierarchy**: Role parent/child is modeled with `parentRoleId`; manifest uses `parentRoleName` only for seed-time linking.
- **No persisted user snapshot**: effective permissions are resolved dynamically (`UserRole -> RolePermission -> Permission` plus `UserPermissionOverride`) and cached in memory.
- **No module layer in RBAC**: permission catalogs do not use `PermissionModule`.

## Running

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npx prisma migrate reset
npm run prisma:seed
```

## Seed behavior

1. Validates RBAC catalog consistency (`resource:action` slugs and known resources).
2. Upserts `PermissionResource`, `PermissionAction`, and `Permission` catalogs.
3. Prunes unknown permission/action/resource rows.
4. Upserts role metadata and applies hierarchy (`parentRoleId` from manifest `parentRoleName`).
5. Seeds no default role-permission links.
6. Keeps `ModuleConfig` seed behavior unchanged (`core`).
