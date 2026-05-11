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

      const hasRole = requiredRoles.every((required) => {
        const requiredLower = required.toLowerCase();

        this.logger.debug(
          `RbacGuard check: required="${requiredLower}", tokenRoles=${JSON.stringify([...tokenRoles])}, permissions=${JSON.stringify(permissions)}`,
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

        this.logger.warn(
          `RbacGuard: denied. required="${requiredLower}", tokenRoles has it=${tokenRoles.has(requiredLower)}, snapshot_has_it=${hasWildcardPermission(permissions, requiredLower)}`,
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
