import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

interface PermissionCacheEntry {
  expiresAt: number;
  permissions: string[];
}

@Injectable()
export class UserPermissionSnapshotService {
  private readonly ttlMs = 5 * 60 * 1000;
  private readonly cache = new Map<string, PermissionCacheEntry>();

  constructor(private readonly prisma: PrismaService) {}

  async getPersistedPermissions(keycloakUserId: string): Promise<string[]> {
    return this.getEffectivePermissionsByKeycloakId(keycloakUserId);
  }

  async getEffectivePermissionsByUserId(userId: string): Promise<string[]> {
    const now = Date.now();
    const cached = this.cache.get(userId);
    if (cached && cached.expiresAt > now) {
      return [...cached.permissions];
    }

    const permissions = await this.resolveEffectivePermissionsByUserId(userId);
    this.cache.set(userId, {
      expiresAt: now + this.ttlMs,
      permissions,
    });

    return [...permissions];
  }

  async getEffectivePermissionsByKeycloakId(
    keycloakUserId: string,
  ): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { keycloakId: keycloakUserId },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    return this.getEffectivePermissionsByUserId(user.id);
  }

  async invalidateUser(userId: string): Promise<void> {
    this.cache.delete(userId);
  }

  async invalidateAll(): Promise<void> {
    this.cache.clear();
  }

  private async resolveEffectivePermissionsByUserId(
    userId: string,
  ): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        permissions: true,
      },
    });

    if (!user) {
      return [];
    }

    const selectedPermissions = new Set(
      (user.permissions ?? [])
        .map((permission) => permission.trim().toLowerCase())
        .filter(Boolean),
    );

    const now = new Date();
    const roleAssignments = await this.prisma.userRole.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: {
        roleId: true,
      },
    });

    const expandedRoleIds = await this.expandRoleDescendants(
      roleAssignments.map((assignment) => assignment.roleId),
    );

    if (expandedRoleIds.size === 0) {
      return [];
    }

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

    if (hasSuperadmin) {
      return ['*'];
    }

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId: {
          in: [...expandedRoleIds],
        },
      },
      select: {
        permission: {
          select: {
            slug: true,
          },
        },
      },
    });

    const allowedByRoles = new Set(
      rolePermissions.map((rolePermission) =>
        rolePermission.permission.slug.toLowerCase(),
      ),
    );

    return [...selectedPermissions]
      .filter((permission) => allowedByRoles.has(permission))
      .sort((left, right) => left.localeCompare(right));
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
