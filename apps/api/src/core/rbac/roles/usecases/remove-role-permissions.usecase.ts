import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class RemoveRolePermissionsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(roleId: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { id: true },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const dedupedPermissionIds = [...new Set(permissionIds)];

    if (dedupedPermissionIds.length > 0) {
      await this.prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: { in: dedupedPermissionIds },
        },
      });
    }

    await this.userPermissionSnapshot.invalidateAll();
    return { success: true, roleId };
  }
}
