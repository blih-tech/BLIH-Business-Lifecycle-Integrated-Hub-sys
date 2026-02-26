import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class DeleteActionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(actionId: string) {
    const action = await this.prisma.permissionAction.findUnique({
      where: { id: actionId },
      select: { id: true, name: true },
    });
    if (!action) {
      throw new NotFoundException('Permission action not found');
    }

    await this.prisma.permissionAction.delete({
      where: { id: action.id },
    });

    this.userPermissionSnapshot.invalidateAll();

    return { success: true, deletedAction: action.name };
  }
}
