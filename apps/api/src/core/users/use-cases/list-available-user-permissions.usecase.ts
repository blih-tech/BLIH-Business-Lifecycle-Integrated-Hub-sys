import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UserPermissionSnapshotService } from '../../rbac/user-permission-snapshot.service';

@Injectable()
export class ListAvailableUserPermissionsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(userId: string) {
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

    const permissions =
      await this.userPermissionSnapshot.getAvailablePermissionsByUserId(
        user.id,
      );

    return {
      userId: user.id,
      permissions,
    };
  }
}
