import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

interface PermissionCacheEntry {
  expiresAt: number;
  permissions: string[];
}

@Injectable()
export class UserPermissionSnapshotService {
  private readonly logger = new Logger(UserPermissionSnapshotService.name);
  private readonly ttlMs = 5 * 60 * 1000;
  private readonly cache = new Map<string, PermissionCacheEntry>();

  constructor(private readonly prisma: PrismaService) {}

  async getPersistedPermissions(
    keycloakUserId: string,
    keycloakTokenRoles: string[] = [],
  ): Promise<string[]> {
    this.logger.debug(
      `getPersistedPermissions called for ${keycloakUserId} with tokenRoles=${JSON.stringify(keycloakTokenRoles)}`,
    );

    const dbPermissions =
      await this.getEffectivePermissionsByKeycloakId(keycloakUserId);

    this.logger.debug(
      `getPersistedPermissions: dbPermissions count = ${dbPermissions.length}`,
    );

    if (dbPermissions.length === 0) {
      this.logger.warn(
        `Permission DB lookup empty for ${keycloakUserId}; returning empty permission set. tokenRoles=${JSON.stringify(keycloakTokenRoles)}`,
      );
      return [];
    }

    this.logger.debug(
      `getPersistedPermissions: returning dbPermissions count = ${dbPermissions.length}`,
    );
    return dbPermissions;
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

    const expandedRoleIds = await this.expandRoleAncestors(
      roleAssignments.map((assignment) => assignment.roleId),
    );

    const expandedRoles =
      expandedRoleIds.size > 0
        ? await this.prisma.role.findMany({
            where: { id: { in: [...expandedRoleIds] } },
            select: { id: true, name: true },
          })
        : [];

    const hasSuperadmin = expandedRoles.some(
      (role) => role.name.toLowerCase() === 'superadmin',
    );

    if (hasSuperadmin) {
      return ['*'];
    }

    const rolePermissions =
      expandedRoleIds.size > 0
        ? await this.prisma.rolePermission.findMany({
            where: { roleId: { in: [...expandedRoleIds] } },
            select: { permission: { select: { slug: true } } },
          })
        : [];

    const allowedByRoles = new Set(
      rolePermissions.map((rolePermission) =>
        rolePermission.permission.slug.toLowerCase(),
      ),
    );

    // Additive logic: User gets permissions from their roles OR explicitly assigned ones
    const effectivePermissions = new Set([
      ...allowedByRoles,
      ...(user.permissions ?? []).map((p) => p.trim().toLowerCase()),
    ]);

    return [...effectivePermissions].sort((left, right) =>
      left.localeCompare(right),
    );
  }

  private async expandRoleAncestors(roleIds: string[]): Promise<Set<string>> {
    const allRoles = await this.prisma.role.findMany({
      select: {
        id: true,
        parentRoleId: true,
      },
    });

    const parentByRoleId = new Map<string, string | null>();
    for (const role of allRoles) {
      parentByRoleId.set(role.id, role.parentRoleId);
    }

    const visited = new Set<string>();
    const queue = [...new Set(roleIds)];

    while (queue.length > 0) {
      const roleId = queue.shift();
      if (!roleId || visited.has(roleId)) {
        continue;
      }

      visited.add(roleId);
      const parentRoleId = parentByRoleId.get(roleId);
      if (parentRoleId) {
        queue.push(parentRoleId);
      }
    }

    return visited;
  }
}
