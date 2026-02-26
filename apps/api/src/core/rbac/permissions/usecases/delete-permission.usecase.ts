import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class DeletePermissionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(permissionId: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
      select: { id: true, slug: true },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.prisma.permission.delete({
      where: { id: permission.id },
    });

    this.userPermissionSnapshot.invalidateAll();

    return { success: true, deletedPermission: permission.slug };
  }
}
