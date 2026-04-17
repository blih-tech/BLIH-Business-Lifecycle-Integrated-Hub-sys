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
    const dbPermissions =
      await this.getEffectivePermissionsByKeycloakId(keycloakUserId);

    const tokenBaseline = this.buildTokenRoleFallback(keycloakTokenRoles);

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
      return [...merged];
    }

    return dbPermissions;
  }

  private buildTokenRoleFallback(tokenRoles: string[]): string[] {
    const lowerRoles = tokenRoles.map((r) => r.toLowerCase());

    if (lowerRoles.includes('superadmin')) {
      return ['*'];
    }

    const permissions = new Set<string>();

    if (lowerRoles.includes('hr_manager') || lowerRoles.includes('hr')) {
      // Core employee & org management
      permissions.add('employee:*');
      permissions.add('department:*');
      permissions.add('position:*');
      permissions.add('job_grade:*');
      // User account management
      permissions.add('user:*');
      permissions.add('user_profile:*');
      permissions.add('user_employment:*');
      permissions.add('user_compensation:*');
      permissions.add('user_lifecycle:*');
      // Leave & attendance
      permissions.add('leave:*');
      permissions.add('attendance:*');
      permissions.add('attendance_correction:*');
      permissions.add('overtime:*');
      permissions.add('flex_work:*');
      permissions.add('punctuality:*');
      permissions.add('timesheet:*');
      permissions.add('attendance_report:*');
      // Recruitment
      permissions.add('job:*');
      permissions.add('job_approval:*');
      permissions.add('candidate:*');
      permissions.add('applicant:*');
      permissions.add('job_application:*');
      permissions.add('interview:*');
      permissions.add('offer:*');
      // Onboarding & probation
      permissions.add('onboarding:*');
      permissions.add('onboarding_task:*');
      permissions.add('onboarding_checklist:*');
      permissions.add('asset_provisioning:*');
      permissions.add('policy_acknowledgement:*');
      permissions.add('probation_plan:*');
      permissions.add('probation_kpi:*');
      permissions.add('probation_evaluation:*');
      permissions.add('probation_confirmation:*');
      // Performance & OKR
      permissions.add('performance:*');
      permissions.add('okr:*');
      // Training & skills
      permissions.add('training:*');
      permissions.add('training_feedback:*');
      permissions.add('training_analytics:*');
      permissions.add('certification:*');
      permissions.add('training_compliance:*');
      // Career & talent
      permissions.add('career_development:*');
      permissions.add('internal_transfer:*');
      permissions.add('salary_adjustment:*');
      permissions.add('succession_plan:*');
      permissions.add('promotion_proposal:*');
      // Employee relations & offboarding
      permissions.add('relations:*');
      permissions.add('offboarding:*');
    }
    if (lowerRoles.includes('hr_assistant')) {
      permissions.add('employee:view');
      permissions.add('employee:create');
      permissions.add('leave:view');
      permissions.add('leave:create');
      permissions.add('attendance:view');
      permissions.add('attendance_correction:view');
      permissions.add('overtime:view');
      permissions.add('department:view');
      permissions.add('position:view');
      permissions.add('user_profile:view');
      permissions.add('user_profile:update');
    }

    return [...permissions];
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

    // Hardcoded safety fallback for core roles if DB is not fully seeded
    // (covers the case where the Role row exists but RolePermission rows are missing,
    // OR where the user has no UserRole rows but we still reach here via the token roles path)
    const lowerRoles = expandedRoles.map((r) => r.name.toLowerCase());
    if (lowerRoles.includes('hr_manager') || lowerRoles.includes('hr')) {
      // Core employee & org management
      allowedByRoles.add('employee:*');
      allowedByRoles.add('department:*');
      allowedByRoles.add('position:*');
      allowedByRoles.add('job_grade:*');
      // User account management
      allowedByRoles.add('user:*');
      allowedByRoles.add('user_profile:*');
      allowedByRoles.add('user_employment:*');
      allowedByRoles.add('user_compensation:*');
      allowedByRoles.add('user_lifecycle:*');
      // Leave & attendance
      allowedByRoles.add('leave:*');
      allowedByRoles.add('attendance:*');
      allowedByRoles.add('attendance_correction:*');
      allowedByRoles.add('overtime:*');
      allowedByRoles.add('flex_work:*');
      allowedByRoles.add('punctuality:*');
      allowedByRoles.add('timesheet:*');
      allowedByRoles.add('attendance_report:*');
      // Recruitment
      allowedByRoles.add('job:*');
      allowedByRoles.add('job_approval:*');
      allowedByRoles.add('candidate:*');
      allowedByRoles.add('applicant:*');
      allowedByRoles.add('job_application:*');
      allowedByRoles.add('interview:*');
      allowedByRoles.add('offer:*');
      // Onboarding & probation
      allowedByRoles.add('onboarding:*');
      allowedByRoles.add('onboarding_task:*');
      allowedByRoles.add('onboarding_checklist:*');
      allowedByRoles.add('asset_provisioning:*');
      allowedByRoles.add('policy_acknowledgement:*');
      allowedByRoles.add('probation_plan:*');
      allowedByRoles.add('probation_kpi:*');
      allowedByRoles.add('probation_evaluation:*');
      allowedByRoles.add('probation_confirmation:*');
      // Performance & OKR
      allowedByRoles.add('performance:*');
      allowedByRoles.add('okr:*');
      // Training & skills
      allowedByRoles.add('training:*');
      allowedByRoles.add('training_feedback:*');
      allowedByRoles.add('training_analytics:*');
      allowedByRoles.add('certification:*');
      allowedByRoles.add('training_compliance:*');
      // Career & talent
      allowedByRoles.add('career_development:*');
      allowedByRoles.add('internal_transfer:*');
      allowedByRoles.add('salary_adjustment:*');
      allowedByRoles.add('succession_plan:*');
      allowedByRoles.add('promotion_proposal:*');
      // Employee relations & offboarding
      allowedByRoles.add('relations:*');
      allowedByRoles.add('offboarding:*');
    }
    if (lowerRoles.includes('hr_assistant')) {
      allowedByRoles.add('employee:view');
      allowedByRoles.add('employee:create');
      allowedByRoles.add('leave:view');
      allowedByRoles.add('leave:create');
      allowedByRoles.add('attendance:view');
      allowedByRoles.add('attendance_correction:view');
      allowedByRoles.add('overtime:view');
      allowedByRoles.add('department:view');
      allowedByRoles.add('position:view');
      allowedByRoles.add('user_profile:view');
      allowedByRoles.add('user_profile:update');
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
