import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

interface UserPermissionSnapshotRecord {
  userId: string;
  keycloakUserId: string;
  permissions: string[];
}

@Injectable()
export class UserPermissionSnapshotService {
  constructor(private readonly prisma: PrismaService) {}

  async getPersistedPermissions(keycloakUserId: string): Promise<string[]> {
    const user = await this.prisma.user.findFirst({
      where: {
        keycloakId: keycloakUserId,
      },
      select: {
        permissions: true,
      },
    });

    return (user?.permissions ?? [])
      .map((permission) => permission.trim().toLowerCase())
      .filter(Boolean);
  }

  async recomputeForUser(userId: string): Promise<string[]> {
    const snapshot = await this.computeAndPersist(userId);
    return snapshot.permissions;
  }

  async recomputeForKeycloakId(keycloakUserId: string): Promise<string[]> {
    const user = await this.prisma.user.findFirst({
      where: {
        keycloakId: keycloakUserId,
      },
      select: {
        id: true,
      },
    });
    if (!user) {
      return [];
    }

    const snapshot = await this.computeAndPersist(user.id);
    return snapshot.permissions;
  }

  async recomputeAllUsers(): Promise<void> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
      },
    });

    for (const user of users) {
      await this.computeAndPersist(user.id);
    }
  }

  private async computeAndPersist(
    userId: string,
  ): Promise<UserPermissionSnapshotRecord> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        keycloakId: true,
      },
    });

    if (!user) {
      return {
        userId,
        keycloakUserId: '',
        permissions: [],
      };
    }

    const now = new Date();
    const roleAssignments = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: {
        roleId: true,
      },
    });

    const assignedRoleIds = roleAssignments.map(
      (assignment) => assignment.roleId,
    );
    const expandedRoleIds = await this.expandRoleDescendants(assignedRoleIds);

    const expandedRoles = await this.prisma.role.findMany({
      where: {
        id: {
          in: [...expandedRoleIds],
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const hasSuperadmin = expandedRoles.some(
      (role) => role.name.toLowerCase() === 'superadmin',
    );

    const permissions = new Set<string>();

    if (!hasSuperadmin && expandedRoleIds.size > 0) {
      const rolePermissions = await this.prisma.rolePermission.findMany({
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

    const overrides = await this.prisma.userPermissionOverride.findMany({
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
        permissions.add(slug);
      } else {
        permissions.delete(slug);
      }
    }

    const snapshot = hasSuperadmin ? ['*'] : [...permissions].sort();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        permissions: snapshot,
      },
    });

    return {
      userId: user.id,
      keycloakUserId: user.keycloakId,
      permissions: snapshot,
    };
  }

  private async expandRoleDescendants(roleIds: string[]): Promise<Set<string>> {
    const allRoles = await this.prisma.role.findMany({
      select: {
        id: true,
        parentRoleId: true,
      },
    });

    const childrenByParentId = new Map<string, string[]>();

    for (const role of allRoles) {
      if (!role.parentRoleId) {
        continue;
      }

      const existingChildren = childrenByParentId.get(role.parentRoleId) ?? [];
      existingChildren.push(role.id);
      childrenByParentId.set(role.parentRoleId, existingChildren);
    }

    const visited = new Set<string>();
    const queue = [...new Set(roleIds)];

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
  }
}
