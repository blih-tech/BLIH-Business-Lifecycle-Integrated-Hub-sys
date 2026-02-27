-- RBAC/User refactor:
-- - Replace UserPermissionOverride model with persisted User.permissions[]
-- - Add Department entity and optional User.departmentId relation

CREATE TABLE IF NOT EXISTS "Department" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Department_name_key" ON "Department"("name");

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "departmentId" UUID;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill User.permissions from current effective role + override state.
WITH RECURSIVE "role_tree" AS (
  SELECT ur."userId", ur."roleId"
  FROM "UserRole" ur
  WHERE ur."expiresAt" IS NULL OR ur."expiresAt" > NOW()
  UNION
  SELECT rt."userId", r."id"
  FROM "role_tree" rt
  JOIN "Role" r ON r."parentRoleId" = rt."roleId"
),
"base_permissions" AS (
  SELECT rt."userId", lower(p."slug") AS slug
  FROM "role_tree" rt
  JOIN "RolePermission" rp ON rp."roleId" = rt."roleId"
  JOIN "Permission" p ON p."id" = rp."permissionId"
),
"superadmins" AS (
  SELECT DISTINCT rt."userId"
  FROM "role_tree" rt
  JOIN "Role" r ON r."id" = rt."roleId"
  WHERE lower(r."name") = 'superadmin'
),
"override_grants" AS (
  SELECT upo."userId", lower(p."slug") AS slug
  FROM "UserPermissionOverride" upo
  JOIN "Permission" p ON p."id" = upo."permissionId"
  WHERE upo."granted" = true
),
"override_denies" AS (
  SELECT upo."userId", lower(p."slug") AS slug
  FROM "UserPermissionOverride" upo
  JOIN "Permission" p ON p."id" = upo."permissionId"
  WHERE upo."granted" = false
),
"effective_base" AS (
  SELECT bp."userId", bp.slug
  FROM "base_permissions" bp
  WHERE NOT EXISTS (
    SELECT 1
    FROM "override_denies" od
    WHERE od."userId" = bp."userId"
      AND od.slug = bp.slug
  )
  UNION
  SELECT og."userId", og.slug
  FROM "override_grants" og
)
UPDATE "User" u
SET "permissions" = CASE
  WHEN EXISTS (
    SELECT 1
    FROM "superadmins" sa
    WHERE sa."userId" = u."id"
  ) THEN ARRAY['*']::TEXT[]
  ELSE COALESCE(
    (
      SELECT ARRAY_AGG(DISTINCT eb.slug ORDER BY eb.slug)
      FROM "effective_base" eb
      WHERE eb."userId" = u."id"
    ),
    ARRAY[]::TEXT[]
  )
END;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'User_departmentId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_departmentId_fkey"
      FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "User_departmentId_idx" ON "User"("departmentId");

DROP TABLE IF EXISTS "UserPermissionOverride";
