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
      const roles = new Set(
        (user.roles ?? []).map((role) => role.toLowerCase()),
      );
      const permissions = user.permissions ?? [];
      const hasRole = requiredRoles.every(
        (role) =>
          roles.has(role.toLowerCase()) ||
          hasWildcardPermission(permissions, role.toLowerCase()),
      );
      if (!hasRole) {
        this.logger.warn(
          `RbacGuard: Access denied. user.roles=${JSON.stringify([...roles])}, user.permissions=${JSON.stringify(permissions)}, requiredRoles=${JSON.stringify(requiredRoles)}`,
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
