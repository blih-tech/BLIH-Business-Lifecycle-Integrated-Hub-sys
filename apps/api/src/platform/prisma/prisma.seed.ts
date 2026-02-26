/**
 * Prisma seed: RBAC resource/action/permission catalog, role metadata/hierarchy,
 * ModuleConfig, and other core bootstrap data.
 *
 * RBAC notes:
 * - No PermissionModule layer.
 * - No role default permission links.
 * - No persisted User.permissions snapshot rebuild.
 */
import 'dotenv/config';
import { createPrismaPgAdapter } from './prisma.adapter';
import { PrismaClient } from './prisma-client';
import {
  SystemPermissionPermissions,
  SystemResourcePermissions,
} from '../../core/rbac/constants/permissions.constants';
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

const canonicalResourceNames = [
  ...new Set(RBAC_RESOURCE_CATALOG.map((entry) => entry.name)),
];
const canonicalPermissionSlugs = [...new Set(RBAC_PERMISSIONS)];
const canonicalActionNames = [
  ...new Set(RBAC_PERMISSIONS.map((slug) => parsePermissionSlug(slug).action)),
];

const ensureCatalogConsistency = () => {
  const resourceNameSet = new Set(canonicalResourceNames);

  const unknownResourceNames = [
    ...new Set(
      RBAC_PERMISSIONS.map((slug) => parsePermissionSlug(slug).resource),
    ),
  ].filter((resourceName) => !resourceNameSet.has(resourceName));

  if (unknownResourceNames.length > 0) {
    throw new Error(
      `Permissions reference unknown resources: ${unknownResourceNames.join(', ')}`,
    );
  }
};

const ensureResources = async () => {
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

  return new Map(resources.map((entry) => [entry.name, entry.id]));
};

const ensureActions = async () => {
  for (const actionName of canonicalActionNames) {
    await prisma.permissionAction.upsert({
      where: { name: actionName },
      update: {},
      create: {
        name: actionName,
      },
    });
  }

  const actions = await prisma.permissionAction.findMany({
    select: { id: true, name: true },
  });

  return new Map(actions.map((entry) => [entry.name, entry.id]));
};

const upsertPermission = async (
  slug: string,
  resourceIdByName: Map<string, string>,
  actionIdByName: Map<string, string>,
) => {
  const parsed = parsePermissionSlug(slug);
  const resourceId = resourceIdByName.get(parsed.resource);
  const actionId = actionIdByName.get(parsed.action);

  if (!resourceId) {
    throw new Error(`Unknown resource in permission slug: ${slug}`);
  }
  if (!actionId) {
    throw new Error(`Unknown action in permission slug: ${slug}`);
  }

  return prisma.permission.upsert({
    where: { slug: parsed.slug },
    update: {
      description: null,
    },
    create: {
      resourceId,
      actionId,
      slug: parsed.slug,
    },
  });
};

const pruneUnknownCatalogRows = async () => {
  await prisma.permission.deleteMany({
    where: {
      slug: {
        notIn: canonicalPermissionSlugs,
      },
    },
  });

  await prisma.permissionAction.deleteMany({
    where: {
      name: {
        notIn: canonicalActionNames,
      },
    },
  });

  await prisma.permissionResource.deleteMany({
    where: {
      name: {
        notIn: canonicalResourceNames,
      },
    },
  });
};

const assertCatalogPruned = async () => {
  const [unknownResourceCount, unknownActionCount, unknownPermissionCount] =
    await Promise.all([
      prisma.permissionResource.count({
        where: {
          name: {
            notIn: canonicalResourceNames,
          },
        },
      }),
      prisma.permissionAction.count({
        where: {
          name: {
            notIn: canonicalActionNames,
          },
        },
      }),
      prisma.permission.count({
        where: {
          slug: {
            notIn: canonicalPermissionSlugs,
          },
        },
      }),
    ]);

  if (
    unknownResourceCount > 0 ||
    unknownActionCount > 0 ||
    unknownPermissionCount > 0
  ) {
    throw new Error(
      `RBAC catalog drift detected after seed: resources=${unknownResourceCount}, actions=${unknownActionCount}, permissions=${unknownPermissionCount}`,
    );
  }
};

async function main(): Promise<void> {
  ensureCatalogConsistency();

  const resourceIdByName = await ensureResources();
  const actionIdByName = await ensureActions();

  const permissionsBySlug = new Map<string, { id: string }>();
  for (const slug of RBAC_PERMISSIONS) {
    const permission = await upsertPermission(
      slug,
      resourceIdByName,
      actionIdByName,
    );
    permissionsBySlug.set(permission.slug, { id: permission.id });
  }

  const requiredBootstrapPermissions = [
    SystemResourcePermissions.VIEW,
    SystemResourcePermissions.CREATE,
    SystemResourcePermissions.UPDATE,
    SystemResourcePermissions.DELETE,
    SystemPermissionPermissions.VIEW,
    SystemPermissionPermissions.UPDATE,
    SystemPermissionPermissions.DELETE,
  ];

  for (const permissionSlug of requiredBootstrapPermissions) {
    if (!permissionsBySlug.has(permissionSlug)) {
      throw new Error(
        `Missing required bootstrap permission after seed: ${permissionSlug}`,
      );
    }
  }

  await pruneUnknownCatalogRows();
  await assertCatalogPruned();

  const rolesByName = new Map<
    string,
    { id: string; parentRoleName?: string }
  >();

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

    rolesByName.set(role.name, {
      id: record.id,
      parentRoleName: role.parentRoleName,
    });
  }

  for (const role of RBAC_ROLES) {
    if (!role.parentRoleName) {
      await prisma.role.update({
        where: { name: role.name },
        data: { parentRoleId: null },
      });
      continue;
    }

    const parentRole = rolesByName.get(role.parentRoleName);
    if (!parentRole) {
      throw new Error(
        `Missing parent role for ${role.name}: ${role.parentRoleName}`,
      );
    }

    await prisma.role.update({
      where: { name: role.name },
      data: {
        parentRoleId: parentRole.id,
      },
    });
  }

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
