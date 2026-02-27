import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UserPermissionSnapshotService } from '../../rbac/user-permission-snapshot.service';

@Injectable()
export class SetUserPermissionsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(userId: string, permissions: string[]) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { keycloakId: userId }],
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const effectivePermissions =
      await this.userPermissionSnapshot.setUserPermissionsByUserId(
        user.id,
        permissions,
      );

    return {
      userId: user.id,
      permissions: effectivePermissions,
    };
  }
}
