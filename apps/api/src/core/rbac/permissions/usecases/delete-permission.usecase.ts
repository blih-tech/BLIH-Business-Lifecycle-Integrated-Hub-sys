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
    const existing = await this.prisma.permission.findUnique({
      where: { id: permissionId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Permission not found');
    }

    await this.prisma.permission.delete({
      where: { id: permissionId },
    });

    await this.userPermissionSnapshot.invalidateAll();
    return { success: true };
  }
}
