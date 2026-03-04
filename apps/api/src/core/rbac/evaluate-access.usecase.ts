import { ForbiddenException, Injectable } from '@nestjs/common';
import { hasWildcardPermission } from '../../platform/keycloak/utils/role.util';
import { UserPermissionSnapshotService } from './user-permission-snapshot.service';

@Injectable()
export class EvaluateAccessUseCase {
  constructor(
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(userId: string, requiredPermissions: string[]) {
    const permissions =
      await this.userPermissionSnapshot.getEffectivePermissionsByUserId(userId);
    if (permissions.length === 0) {
      const fallbackPermissions =
        await this.userPermissionSnapshot.getEffectivePermissionsByKeycloakId(
          userId,
        );
      if (fallbackPermissions.length === 0) {
        throw new ForbiddenException('User not found');
      }
      return this.evaluatePermissions(fallbackPermissions, requiredPermissions);
    }

    return this.evaluatePermissions(permissions, requiredPermissions);
  }

  private evaluatePermissions(
    permissions: string[],
    requiredPermissions: string[],
  ) {
    const normalizedRequiredPermissions = requiredPermissions.map(
      (permission) => permission.toLowerCase(),
    );

    const missingPermissions = normalizedRequiredPermissions.filter(
      (permission) => !hasWildcardPermission(permissions, permission),
    );

    return {
      allowed: missingPermissions.length === 0,
      missingPermissions,
      permissions,
    };
  }
}
