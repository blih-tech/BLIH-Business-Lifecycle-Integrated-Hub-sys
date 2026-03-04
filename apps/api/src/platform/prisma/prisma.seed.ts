/**
 * Prisma seed: RBAC catalog (resources/actions/permissions), roles (metadata + hierarchy), ModuleConfig.
 */
import 'dotenv/config';
import { createPrismaPgAdapter } from './prisma.adapter';
import { PrismaClient } from './prisma-client';
import {
  RBAC_PERMISSIONS,
  RBAC_RESOURCE_CATALOG,
  RBAC_ROLES,
} from './seed/rbac.manifest';

const { adapter, pool } = createPrismaPgAdapter();
const prisma = new PrismaClient({ adapter });

const PERMISSION_PATTERN = /^[a-z0-9_]+:[a-z0-9_*-]+$/;

const parsePermissionSlug = (slug: string) => {
  const normalized = slug.trim().toLowerCase();
  const [resource, action, extra] = normalized.split(':');
  if (!resource || !action || extra || !PERMISSION_PATTERN.test(normalized)) {
    throw new Error(`Invalid permission slug: ${slug}`);
  }
  return { resource, action, slug: normalized };
};

const ensureCatalogConsistency = () => {
  const resourceSet = new Set(RBAC_RESOURCE_CATALOG.map((entry) => entry.name));
  const unknownResourceNames = [
    ...new Set(
      RBAC_PERMISSIONS.map((slug) => parsePermissionSlug(slug).resource),
    ),
  ].filter((resourceName) => !resourceSet.has(resourceName));

  if (unknownResourceNames.length > 0) {
    throw new Error(
      `Permissions reference unknown resources: ${unknownResourceNames.join(', ')}`,
    );
  }
};

const ensureCatalog = async () => {
  for (const resource of RBAC_RESOURCE_CATALOG) {
    await prisma.permissionResource.upsert({
      where: { name: resource.name },
      update: {
        description: resource.description,
      },
      create: {
        name: resource.name,
        description: resource.description,
      },
    });
  }

  const resources = await prisma.permissionResource.findMany({
    select: { id: true, name: true },
  });

  return new Map(resources.map((entry) => [entry.name, entry.id] as const));
};

const ensurePermissions = async (resourceIdByName: Map<string, string>) => {
  const actions = [
    ...new Set(
      RBAC_PERMISSIONS.map((slug) => parsePermissionSlug(slug).action),
    ),
  ];

  for (const action of actions) {
    await prisma.permissionAction.upsert({
      where: { name: action },
      update: {},
      create: { name: action },
    });
  }

  const actionIdByName = new Map(
    (
      await prisma.permissionAction.findMany({
        select: { id: true, name: true },
      })
    ).map((entry) => [entry.name, entry.id] as const),
  );

  for (const slug of RBAC_PERMISSIONS) {
    const parsed = parsePermissionSlug(slug);
    const resourceId = resourceIdByName.get(parsed.resource);
    const actionId = actionIdByName.get(parsed.action);

    if (!resourceId || !actionId) {
      throw new Error(`Missing resource/action mapping for ${slug}`);
    }

    await prisma.permission.upsert({
      where: { slug: parsed.slug },
      update: {
        resourceId,
        actionId,
      },
      create: {
        resourceId,
        actionId,
        slug: parsed.slug,
      },
    });
  }
};

const ensureRoles = async () => {
  const roleIdByName = new Map<string, string>();

  for (const role of RBAC_ROLES) {
    const record = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        displayName: role.displayName,
        description: role.description,
        isSystem: role.isSystem,
      },
      create: {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isSystem: role.isSystem,
      },
      select: {
        id: true,
      },
    });

    roleIdByName.set(role.name, record.id);
  }

  for (const role of RBAC_ROLES) {
    const parentRoleId = role.parentRoleName
      ? (roleIdByName.get(role.parentRoleName) ?? null)
      : null;

    await prisma.role.update({
      where: { name: role.name },
      data: { parentRoleId },
    });
  }
};

async function main(): Promise<void> {
  ensureCatalogConsistency();

  const resourceIdByName = await ensureCatalog();
  await ensurePermissions(resourceIdByName);
  await ensureRoles();

  await prisma.moduleConfig.upsert({
    where: { module: 'core' },
    update: {},
    create: {
      module: 'core',
      enabled: true,
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
