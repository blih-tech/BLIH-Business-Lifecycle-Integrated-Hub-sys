import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UserPermissionSnapshotService } from '../../rbac/user-permission-snapshot.service';

@Injectable()
export class ListUsersUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      users.map(async (user) => ({
        ...user,
        permissions:
          await this.userPermissionSnapshot.getEffectivePermissionsByUserId(
            user.id,
          ),
      })),
    );
  }
}
