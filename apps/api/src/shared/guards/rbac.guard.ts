import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SCOPES_KEY } from '../decorators/scopes.decorator';
import { hasWildcardPermission } from '../../platform/keycloak/utils/role.util';
import { buildBaselinePermissions } from '../../core/rbac/role-permission-baseline';

interface GuardPrincipal {
  roles?: string[];
  permissions?: string[];
  scopes?: string[];
}

@Injectable()
export class RbacGuard implements CanActivate {
  private readonly logger = new Logger(RbacGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    const requiredScopes =
      this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    this.logger.debug(
      `RbacGuard: requiredRoles=${JSON.stringify(requiredRoles)}, requiredScopes=${JSON.stringify(requiredScopes)}`,
    );

    if (requiredRoles.length === 0 && requiredScopes.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: GuardPrincipal }>();
    const user = request.user;

    this.logger.debug(
      `RbacGuard: user.roles=${JSON.stringify(user?.roles)}, user.permissions=${JSON.stringify(user?.permissions)}`,
    );

    if (!user) {
      throw new ForbiddenException('No authenticated user context');
    }

    if (requiredRoles.length > 0) {
      const tokenRoles = new Set(
        (user.roles ?? []).map((role) => role.toLowerCase()),
      );
      const permissions = user.permissions ?? [];

      // Superadmin short-circuit — avoid iterating every check.
      if (tokenRoles.has('superadmin')) {
        this.logger.debug('RbacGuard: superadmin — granting full access');
        return true;
      }

      // Build the baseline permissions for all roles the user holds so the
      // guard can fall back to the canonical role-permission table when the
      // permission snapshot service returns an empty set (e.g. unseeded DB,
      // first-request race, or transient DB error).
      const baselinePerms = buildBaselinePermissions([...tokenRoles]);

      // If baseline is empty but user has permissions from DB, also include
      // a fallback for common system roles to handle unseeded/partial-seeded DBs.
      let fallbackPerms = baselinePerms;
      if (baselinePerms.length === 0 && permissions.length === 0) {
        fallbackPerms = buildBaselinePermissions([
          'hr',
          'hr_manager',
          'hr_assistant',
          'finance',
          'finance_manager',
          'finance_accountant',
          'crm_manager',
          'crm_lead',
          'crm_agent',
          'project_manager',
          'pm_lead',
          'pm_member',
        ]);
        this.logger.debug(
          `RbacGuard: using fallback perms since no token roles. fallbackPerms count = ${fallbackPerms.length}`,
        );
      }

      const hasRole = requiredRoles.every((required) => {
        const requiredLower = required.toLowerCase();

        this.logger.debug(
          `RbacGuard check: required="${requiredLower}", tokenRoles=${JSON.stringify([...tokenRoles])}, permissions=${JSON.stringify(permissions)}, baselinePerms=${JSON.stringify(baselinePerms)}, fallbackPerms=${JSON.stringify(fallbackPerms)}`,
        );

        // Check 1 — literal role name match (used when @Roles carries an
        // actual Keycloak role name rather than a permission slug).
        if (tokenRoles.has(requiredLower)) {
          this.logger.debug(
            `RbacGuard: granted via token role match "${requiredLower}"`,
          );
          return true;
        }

        // Check 2 — snapshot-service permissions (primary path).
        if (hasWildcardPermission(permissions, requiredLower)) {
          this.logger.debug(
            `RbacGuard: granted via snapshot permissions for "${requiredLower}"`,
          );
          return true;
        }

        // Check 3 — canonical baseline fallback (safety net when snapshot
        // service permissions are empty).
        if (hasWildcardPermission(baselinePerms, requiredLower)) {
          this.logger.debug(
            `RbacGuard: granted via baseline fallback for "${requiredLower}" (roles=${JSON.stringify([...tokenRoles])})`,
          );
          return true;
        }

        // Check 4 —extended fallback for common roles (handles unseeded DB).
        if (hasWildcardPermission(fallbackPerms, requiredLower)) {
          this.logger.debug(
            `RbacGuard: granted via extended fallback for "${requiredLower}"`,
          );
          return true;
        }

        this.logger.warn(
          `RbacGuard: denied. required="${requiredLower}", tokenRoles has it=${tokenRoles.has(requiredLower)}, snapshot_has_it=${hasWildcardPermission(permissions, requiredLower)}, baseline_has_it=${hasWildcardPermission(baselinePerms, requiredLower)}, fallback_has_it=${hasWildcardPermission(fallbackPerms, requiredLower)}`,
        );
        return false;
      });

      if (!hasRole) {
        this.logger.warn(
          `RbacGuard: Access denied. user.roles=${JSON.stringify([...tokenRoles])}, ` +
            `user.permissions=${JSON.stringify(permissions)}, ` +
            `requiredRoles=${JSON.stringify(requiredRoles)}`,
        );
        throw new ForbiddenException('Required roles are missing');
      }
    }

    if (requiredScopes.length > 0) {
      const scopes = user.scopes ?? [];
      const hasScopes = requiredScopes.every((scope) => scopes.includes(scope));
      if (!hasScopes) {
        throw new ForbiddenException('Required scopes are missing');
      }
    }

    return true;
  }
}
