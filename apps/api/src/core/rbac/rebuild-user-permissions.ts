import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function main() {
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

  const now = new Date();

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

    const permissionSet = new Set<string>();
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
        permissionSet.add(rolePermission.permission.slug.toLowerCase());
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
      const slug = override.permission.slug.toLowerCase();
      if (override.granted) {
        permissionSet.add(slug);
      } else {
        permissionSet.delete(slug);
      }
    }

    const permissions = hasSuperadmin ? ['*'] : [...permissionSet].sort();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        permissions,
      },
    });
  }

  console.log(`Rebuilt permission snapshots for ${users.length} users.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
