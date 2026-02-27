import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { hasWildcardPermission } from '../../platform/keycloak/utils/role.util';
import { UserPermissionSnapshotService } from './user-permission-snapshot.service';

@Injectable()
export class EvaluateAccessUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(userId: string, requiredPermissions: string[]) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { keycloakId: userId }],
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const permissions =
      await this.userPermissionSnapshot.getEffectivePermissionsByUserId(
        user.id,
      );

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
