import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

interface PermissionCacheEntry {
  permissions: string[];
  expiresAt: number;
}

@Injectable()
export class UserPermissionSnapshotService {
  private readonly cacheTtlMs = 60_000;
  private readonly cache = new Map<string, PermissionCacheEntry>();

  constructor(private readonly prisma: PrismaService) {}

  async getEffectivePermissionsByUserId(userId: string): Promise<string[]> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      return [];
    }

    const cached = this.readCached(normalizedUserId);
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: normalizedUserId,
      },
      select: {
        id: true,
      },
    });
    if (!user) {
      return [];
    }

    const permissions = await this.computePermissionsForUser(user.id);
    this.writeCache(user.id, permissions);
    return permissions;
  }

  async getEffectivePermissionsByKeycloakId(
    keycloakUserId: string,
  ): Promise<string[]> {
    const normalizedKeycloakId = keycloakUserId.trim();
    if (!normalizedKeycloakId) {
      return [];
    }

    const user = await this.prisma.user.findFirst({
      where: {
        keycloakId: normalizedKeycloakId,
      },
      select: {
        id: true,
      },
    });
    if (!user) {
      return [];
    }

    const cached = this.readCached(user.id);
    if (cached) {
      return cached;
    }

    const permissions = await this.computePermissionsForUser(user.id);
    this.writeCache(user.id, permissions);
    return permissions;
  }

  async invalidateUser(userIdOrKeycloakId: string): Promise<void> {
    const normalized = userIdOrKeycloakId.trim();
    if (!normalized) {
      return;
    }

    if (this.cache.has(normalized)) {
      this.cache.delete(normalized);
      return;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: normalized }, { keycloakId: normalized }],
      },
      select: {
        id: true,
      },
    });
    if (user) {
      this.cache.delete(user.id);
    }
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  private async computePermissionsForUser(userId: string): Promise<string[]> {
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

    const assignedRoleIds = roleAssignments.map(
      (assignment) => assignment.roleId,
    );
    const expandedRoleIds = await this.expandRoleDescendants(assignedRoleIds);

    let hasSuperadmin = false;
    if (expandedRoleIds.size > 0) {
      const expandedRoles = await this.prisma.role.findMany({
        where: {
          id: {
            in: [...expandedRoleIds],
          },
        },
        select: {
          name: true,
        },
      });
      hasSuperadmin = expandedRoles.some(
        (role) => role.name.toLowerCase() === 'superadmin',
      );
    }

    if (hasSuperadmin) {
      return ['*'];
    }

    const permissions = new Set<string>();

    if (expandedRoleIds.size > 0) {
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
        userId,
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

    return [...permissions].sort((left, right) => left.localeCompare(right));
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

  private readCached(userId: string): string[] | null {
    const cached = this.cache.get(userId);
    if (!cached) {
      return null;
    }

    if (Date.now() >= cached.expiresAt) {
      this.cache.delete(userId);
      return null;
    }

    return [...cached.permissions];
  }

  private writeCache(userId: string, permissions: string[]): void {
    this.cache.set(userId, {
      permissions: [...permissions],
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }
}
