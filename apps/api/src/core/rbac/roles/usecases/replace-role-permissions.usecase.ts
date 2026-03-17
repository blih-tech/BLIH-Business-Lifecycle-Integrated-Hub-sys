import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class ReplaceRolePermissionsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(roleId: string, permissionIds: string[]) {
    const dedupedPermissionIds = [...new Set(permissionIds)];

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { id: true },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (dedupedPermissionIds.length > 0) {
      const existingPermissions = await this.prisma.permission.findMany({
        where: {
          id: { in: dedupedPermissionIds },
        },
        select: { id: true },
      });

      if (existingPermissions.length !== dedupedPermissionIds.length) {
        throw new BadRequestException('One or more permission ids are invalid');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      if (dedupedPermissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: dedupedPermissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
          skipDuplicates: true,
        });
      }
    });

    await this.userPermissionSnapshot.invalidateAll();
    return { success: true, roleId };
  }
}
