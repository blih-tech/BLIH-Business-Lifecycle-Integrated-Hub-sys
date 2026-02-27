import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class DeleteResourceUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(resourceId: string) {
    const resource = await this.prisma.permissionResource.findUnique({
      where: { id: resourceId },
      select: { id: true, name: true },
    });
    if (!resource) {
      throw new NotFoundException('Permission resource not found');
    }

    await this.prisma.permissionResource.delete({
      where: { id: resource.id },
    });

    this.userPermissionSnapshot.invalidateAll();

    return { success: true, deletedResource: resource.name };
  }
}
