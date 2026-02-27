import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

interface PermissionCacheEntry {
  effectivePermissions: string[];
  availablePermissions: string[];
  isSuperadmin: boolean;
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
      return [...cached.effectivePermissions];
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

    const snapshot = await this.computePermissionSnapshot(user.id);
    this.writeCache(user.id, snapshot);
    return [...snapshot.effectivePermissions];
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
      return [...cached.effectivePermissions];
    }

    const snapshot = await this.computePermissionSnapshot(user.id);
    this.writeCache(user.id, snapshot);
    return [...snapshot.effectivePermissions];
  }

  async getAvailablePermissionsByUserId(userId: string): Promise<string[]> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      return [];
    }

    const cached = this.readCached(normalizedUserId);
    if (cached) {
      return [...cached.availablePermissions];
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

    const snapshot = await this.computePermissionSnapshot(user.id);
    this.writeCache(user.id, snapshot);
    return [...snapshot.availablePermissions];
  }

  async getAvailablePermissionsByKeycloakId(
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

    return this.getAvailablePermissionsByUserId(user.id);
  }

  async setUserPermissionsByUserId(
    userId: string,
    permissions: string[],
  ): Promise<string[]> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('userId is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: normalizedUserId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const normalizedPermissions = this.normalizePermissionInput(permissions);
    const available = await this.computeAvailablePermissionsForUser(user.id);

    const nextPermissions = available.isSuperadmin
      ? this.normalizeSuperadminPermissions(normalizedPermissions)
      : this.assertAssignablePermissions(
          normalizedPermissions,
          available.permissionSet,
        );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { permissions: nextPermissions },
    });

    this.cache.delete(user.id);
    return available.isSuperadmin ? ['*'] : nextPermissions;
  }

  async setUserPermissionsByKeycloakId(
    keycloakUserId: string,
    permissions: string[],
  ): Promise<string[]> {
    const normalizedKeycloakId = keycloakUserId.trim();
    if (!normalizedKeycloakId) {
      throw new BadRequestException('keycloakUserId is required');
    }

    const user = await this.prisma.user.findFirst({
      where: { keycloakId: normalizedKeycloakId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.setUserPermissionsByUserId(user.id, permissions);
  }

  async reconcileUserPermissionsByUserId(userId: string): Promise<string[]> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      return [];
    }

    const user = await this.prisma.user.findUnique({
      where: { id: normalizedUserId },
      select: { id: true, permissions: true },
    });
    if (!user) {
      return [];
    }

    const available = await this.computeAvailablePermissionsForUser(user.id);

    if (available.isSuperadmin) {
      const superadminPermissions = ['*'];
      if (
        !this.arePermissionArraysEqual(user.permissions, superadminPermissions)
      ) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { permissions: superadminPermissions },
        });
      }
      this.cache.delete(user.id);
      return superadminPermissions;
    }

    const normalizedStored = this.normalizePermissionInput(user.permissions);
    const reconciled = normalizedStored.filter((permission) =>
      available.permissionSet.has(permission),
    );

    if (!this.arePermissionArraysEqual(normalizedStored, reconciled)) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { permissions: reconciled },
      });
    }

    this.cache.delete(user.id);
    return reconciled;
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

  private async computePermissionSnapshot(userId: string): Promise<{
    effectivePermissions: string[];
    availablePermissions: string[];
    isSuperadmin: boolean;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        permissions: true,
      },
    });
    if (!user) {
      return {
        effectivePermissions: [],
        availablePermissions: [],
        isSuperadmin: false,
      };
    }

    const available = await this.computeAvailablePermissionsForUser(user.id);
    if (available.isSuperadmin) {
      return {
        effectivePermissions: ['*'],
        availablePermissions: ['*'],
        isSuperadmin: true,
      };
    }

    const normalizedStored = this.normalizePermissionInput(user.permissions);
    const effectivePermissions = normalizedStored.filter((permission) =>
      available.permissionSet.has(permission),
    );

    return {
      effectivePermissions,
      availablePermissions: [...available.permissionSet].sort((left, right) =>
        left.localeCompare(right),
      ),
      isSuperadmin: false,
    };
  }

  private async computeAvailablePermissionsForUser(userId: string): Promise<{
    permissionSet: Set<string>;
    isSuperadmin: boolean;
  }> {
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
      return {
        permissionSet: new Set<string>(),
        isSuperadmin: true,
      };
    }

    const permissionSet = new Set<string>();

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
        permissionSet.add(rolePermission.permission.slug.toLowerCase());
      }
    }

    return {
      permissionSet,
      isSuperadmin: false,
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

  private readCached(userId: string): PermissionCacheEntry | null {
    const cached = this.cache.get(userId);
    if (!cached) {
      return null;
    }

    if (Date.now() >= cached.expiresAt) {
      this.cache.delete(userId);
      return null;
    }

    return {
      effectivePermissions: [...cached.effectivePermissions],
      availablePermissions: [...cached.availablePermissions],
      isSuperadmin: cached.isSuperadmin,
      expiresAt: cached.expiresAt,
    };
  }

  private writeCache(
    userId: string,
    snapshot: {
      effectivePermissions: string[];
      availablePermissions: string[];
      isSuperadmin: boolean;
    },
  ): void {
    this.cache.set(userId, {
      effectivePermissions: [...snapshot.effectivePermissions],
      availablePermissions: [...snapshot.availablePermissions],
      isSuperadmin: snapshot.isSuperadmin,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }

  private normalizePermissionInput(permissions: string[]): string[] {
    return [
      ...new Set(
        permissions
          .map((permission) => permission.trim().toLowerCase())
          .filter(Boolean),
      ),
    ].sort((left, right) => left.localeCompare(right));
  }

  private normalizeSuperadminPermissions(permissions: string[]): string[] {
    if (
      permissions.length === 0 ||
      this.arePermissionArraysEqual(permissions, ['*'])
    ) {
      return ['*'];
    }

    throw new BadRequestException(
      'Superadmin users can only persist ["*"] as permissions',
    );
  }

  private assertAssignablePermissions(
    permissions: string[],
    availablePermissions: Set<string>,
  ): string[] {
    const invalid = permissions.filter(
      (permission) => !availablePermissions.has(permission),
    );

    if (invalid.length > 0) {
      throw new BadRequestException(
        `Requested permissions are not assignable from current user roles: ${invalid.join(', ')}`,
      );
    }

    return permissions;
  }

  private arePermissionArraysEqual(left: string[], right: string[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index]) {
        return false;
      }
    }

    return true;
  }
}
