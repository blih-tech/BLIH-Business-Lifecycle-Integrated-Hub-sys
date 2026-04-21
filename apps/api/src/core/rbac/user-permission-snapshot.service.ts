import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { buildBaselinePermissions } from './role-permission-baseline';

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

    const tokenBaseline = this.buildTokenRoleFallback(keycloakTokenRoles);

    this.logger.debug(
      `getPersistedPermissions: tokenBaseline count = ${tokenBaseline.length}`,
    );

    if (dbPermissions.length === 0 && tokenBaseline.length === 0) {
      return [];
    }

    if (dbPermissions.length === 0) {
      this.logger.warn(
        `Permission DB lookup empty for ${keycloakUserId} — using token roles [${keycloakTokenRoles.join(', ')}] → ${tokenBaseline.length} permissions`,
      );
      return tokenBaseline;
    }

    // Merge DB permissions with the token-role baseline so that Keycloak
    // roles always grant their minimum permissions even when the DB only has
    // partial role-permission rows (e.g. partially-seeded or recently-updated DB).
    if (tokenBaseline.length > 0) {
      const merged = new Set([...dbPermissions, ...tokenBaseline]);
      this.logger.debug(
        `getPersistedPermissions: merged permissions count = ${merged.size}`,
      );
      return [...merged];
    }

    this.logger.debug(
      `getPersistedPermissions: returning dbPermissions count = ${dbPermissions.length}`,
    );
    return dbPermissions;
  }

  private buildTokenRoleFallback(tokenRoles: string[]): string[] {
    return buildBaselinePermissions(tokenRoles.map((r) => r.toLowerCase()));
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

    // Note: do NOT return early here — we must still run the hardcoded
    // fallback even when the DB has no role-permission rows (unseeded DB).
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

    // Hardcoded safety fallback: if the DB Role rows exist but RolePermission
    // rows are missing (e.g. partially-seeded DB), apply the canonical baseline
    // so that known roles always grant their minimum set of permissions.
    const lowerRoles = expandedRoles.map((r) => r.name.toLowerCase());
    const baselineForDbRoles = buildBaselinePermissions(lowerRoles);
    for (const perm of baselineForDbRoles) {
      allowedByRoles.add(perm);
    }

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
