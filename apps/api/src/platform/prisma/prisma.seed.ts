/**
 * Prisma seed: realm, org, RBAC catalog (modules/resources/permissions/roles),
 * role–permission links, User.permissions snapshot, ModuleConfig, SystemConfig.
 * Source of truth for RBAC catalog and roles: ./seed/rbac.manifest.ts.
 * Permission slugs must be 2-part (resource:action) to match schema and app.
 */
import { PrismaClient } from '@prisma/client';
import {
  SystemPermissionPermissions,
  SystemResourcePermissions,
} from '../../core/rbac/constants/permissions.constants';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
  RBAC_RESOURCE_CATALOG,
  RBAC_ROLES,
} from './seed/rbac.manifest';

const prisma = new PrismaClient();

const PERMISSION_PATTERN = /^[a-z0-9_]+:[a-z0-9_*-]+$/;

const parsePermissionSlug = (slug: string) => {
  const normalized = slug.trim().toLowerCase();
  const [resource, action, extra] = normalized.split(':');
  if (!resource || !action || extra || !PERMISSION_PATTERN.test(normalized)) {
    throw new Error(`Invalid permission slug: ${slug}`);
  }
  return { resource, action, slug: normalized };
};

const ensureCatalog = async () => {
  for (const moduleName of RBAC_MODULES) {
    await prisma.permissionModule.upsert({
      where: { name: moduleName },
      update: {},
      create: {
        name: moduleName,
      },
    });
  }

  const modules = await prisma.permissionModule.findMany({
    select: { id: true, name: true },
  });
  const moduleIdByName = new Map(
    modules.map((entry) => [entry.name, entry.id]),
  );

  for (const resource of RBAC_RESOURCE_CATALOG) {
    const moduleId = moduleIdByName.get(resource.module);
    if (!moduleId) {
      throw new Error(`Missing module for resource ${resource.name}`);
    }

    await prisma.permissionResource.upsert({
      where: { name: resource.name },
      update: {},
      create: {
        moduleId,
        name: resource.name,
        description: resource.description,
      },
    });
  }

  const resources = await prisma.permissionResource.findMany({
    select: { id: true, name: true, moduleId: true },
  });

  return new Map(
    resources.map((entry) => [
      entry.name,
      {
        id: entry.id,
        moduleId: entry.moduleId,
      },
    ]),
  );
};

const upsertPermission = async (
  slug: string,
  resourceMap: Map<string, { id: string; moduleId: string }>,
) => {
  const parsed = parsePermissionSlug(slug);
  const resource = resourceMap.get(parsed.resource);
  if (!resource) {
    throw new Error(`Unknown resource in permission slug: ${slug}`);
  }

  const actionRecord = await prisma.permissionAction.upsert({
    where: { name: parsed.action },
    update: {},
    create: {
      name: parsed.action,
    },
  });

  return prisma.permission.upsert({
    where: { slug: parsed.slug },
    update: {},
    create: {
      moduleId: resource.moduleId,
      resourceId: resource.id,
      actionId: actionRecord.id,
      slug: parsed.slug,
    },
  });
};

const DEFAULT_ACTION_NAMES = [
  ...new Set(RBAC_PERMISSIONS.map((slug) => parsePermissionSlug(slug).action)),
];

const canonicalModuleNames = [...new Set(RBAC_MODULES)];
const canonicalResourceNames = [
  ...new Set(RBAC_RESOURCE_CATALOG.map((entry) => entry.name)),
];
const canonicalPermissionSlugs = [...new Set(RBAC_PERMISSIONS)];

const ensureCatalogConsistency = () => {
  const moduleSet = new Set<string>(canonicalModuleNames);
  const resourceModuleByName = new Map<string, string>();

  for (const resource of RBAC_RESOURCE_CATALOG) {
    if (!moduleSet.has(resource.module)) {
      throw new Error(
        `Resource ${resource.name} references unknown module ${resource.module}`,
      );
    }
    if (resourceModuleByName.has(resource.name)) {
      throw new Error(
        `Duplicate permission resource in catalog: ${resource.name}`,
      );
    }
    resourceModuleByName.set(resource.name, resource.module);
  }

  const unknownResourceNames = [
    ...new Set(
      RBAC_PERMISSIONS.map((slug) => parsePermissionSlug(slug).resource),
    ),
  ].filter((resourceName) => !resourceModuleByName.has(resourceName));
  if (unknownResourceNames.length > 0) {
    throw new Error(
      `Permissions reference unknown resources: ${unknownResourceNames.join(', ')}`,
    );
  }
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
        notIn: DEFAULT_ACTION_NAMES,
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

  await prisma.permissionModule.deleteMany({
    where: {
      name: {
        notIn: canonicalModuleNames,
      },
    },
  });
};

const assertCatalogPruned = async () => {
  const [
    unknownModuleCount,
    unknownResourceCount,
    unknownActionCount,
    unknownPermissionCount,
  ] = await Promise.all([
    prisma.permissionModule.count({
      where: {
        name: {
          notIn: canonicalModuleNames,
        },
      },
    }),
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
          notIn: DEFAULT_ACTION_NAMES,
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
    unknownModuleCount > 0 ||
    unknownResourceCount > 0 ||
    unknownActionCount > 0 ||
    unknownPermissionCount > 0
  ) {
    throw new Error(
      `RBAC catalog drift detected after seed: modules=${unknownModuleCount}, resources=${unknownResourceCount}, actions=${unknownActionCount}, permissions=${unknownPermissionCount}`,
    );
  }
};

const expandRoleIds = (
  rootRoleIds: string[],
  childrenByParentId: Map<string, string[]>,
) => {
  const visited = new Set<string>();
  const queue = [...rootRoleIds];

  while (queue.length > 0) {
    const roleId = queue.shift();
    if (!roleId || visited.has(roleId)) {
      continue;
    }

    visited.add(roleId);
    const children = childrenByParentId.get(roleId) ?? [];
    for (const child of children) {
      queue.push(child);
    }
  }

  return visited;
};

const rebuildAllUserPermissions = async () => {
  const now = new Date();
  const roles = await prisma.role.findMany({
    select: {
      id: true,
      name: true,
      parentRoleId: true,
    },
  });

  const roleNameById = new Map(roles.map((role) => [role.id, role.name]));
  const childrenByParentId = new Map<string, string[]>();

  for (const role of roles) {
    if (!role.parentRoleId) {
      continue;
    }

    const existing = childrenByParentId.get(role.parentRoleId) ?? [];
    existing.push(role.id);
    childrenByParentId.set(role.parentRoleId, existing);
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      keycloakId: true,
    },
  });

  for (const user of users) {
    const roleAssignments = await prisma.userRole.findMany({
      where: {
        userId: user.id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: {
        roleId: true,
      },
    });

    const expandedRoleIds = expandRoleIds(
      roleAssignments.map((assignment) => assignment.roleId),
      childrenByParentId,
    );

    const hasSuperadmin = [...expandedRoleIds].some(
      (roleId) => roleNameById.get(roleId)?.toLowerCase() === 'superadmin',
    );

    const permissions = new Set<string>();
    if (!hasSuperadmin && expandedRoleIds.size > 0) {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: {
          roleId: {
            in: [...expandedRoleIds],
          },
        },
        include: {
          permission: {
            select: {
              slug: true,
            },
          },
        },
      });

      for (const rolePermission of rolePermissions) {
        permissions.add(rolePermission.permission.slug.toLowerCase());
      }
    }

    const overrides = await prisma.userPermissionOverride.findMany({
      where: {
        keycloakUserId: user.keycloakId,
      },
      include: {
        permission: {
          select: {
            slug: true,
          },
        },
      },
    });

    for (const override of overrides) {
      const overridePermission = override.permission.slug.toLowerCase();
      if (override.granted) {
        permissions.add(overridePermission);
      } else {
        permissions.delete(overridePermission);
      }
    }

    const snapshot = hasSuperadmin ? ['*'] : [...permissions].sort();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        permissions: snapshot,
      },
    });
  }
};

async function main(): Promise<void> {
  ensureCatalogConsistency();

  const resourceMap = await ensureCatalog();

  const permissionsBySlug = new Map<string, { id: string }>();
  for (const slug of RBAC_PERMISSIONS) {
    const permission = await upsertPermission(slug, resourceMap);
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
        dataScope: role.dataScope,
        isSystem: role.isSystem,
      },
      create: {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        dataScope: role.dataScope,
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

  const seededRoleIds = [...rolesByName.values()].map((entry) => entry.id);
  await prisma.rolePermission.deleteMany({
    where: {
      roleId: { in: seededRoleIds },
    },
  });

  const rolePermissionRows: { roleId: string; permissionId: string }[] = [];
  for (const role of RBAC_ROLES) {
    const roleRecord = rolesByName.get(role.name);
    if (!roleRecord) {
      continue;
    }

    for (const slug of role.permissions) {
      const permission = permissionsBySlug.get(slug);
      if (!permission) {
        throw new Error(
          `Missing permission mapping for role ${role.name}: ${slug}`,
        );
      }
      rolePermissionRows.push({
        roleId: roleRecord.id,
        permissionId: permission.id,
      });
    }
  }

  if (rolePermissionRows.length > 0) {
    await prisma.rolePermission.createMany({
      data: rolePermissionRows,
      skipDuplicates: true,
    });
  }

  await rebuildAllUserPermissions();

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
  .finally(() => prisma.$disconnect());
