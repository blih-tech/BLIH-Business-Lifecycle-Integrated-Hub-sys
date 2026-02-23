import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { hasWildcardPermission } from '../../platform/keycloak/utils/role.util';

@Injectable()
export class EvaluateAccessUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, requiredPermissions: string[]) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { keycloakId: userId }],
      },
      select: {
        permissions: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const permissions = (user.permissions ?? [])
      .map((permission) => permission.toLowerCase())
      .filter(Boolean);

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
