import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class RemoveRolePermissionsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(roleId: string, permissionIds: string[]) {
    const normalizedRoleId = roleId.trim();
    const normalizedPermissionIds = [
      ...new Set(
        permissionIds
          .map((permissionId) => permissionId.trim())
          .filter(Boolean),
      ),
    ];

    const role = await this.prisma.role.findUnique({
      where: { id: normalizedRoleId },
      select: { id: true },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: normalizedPermissionIds },
      },
      select: {
        id: true,
      },
    });
    const existingPermissionIds = new Set(
      permissions.map((permission) => permission.id),
    );
    const missingPermissionIds = normalizedPermissionIds.filter(
      (permissionId) => !existingPermissionIds.has(permissionId),
    );
    if (missingPermissionIds.length > 0) {
      throw new BadRequestException(
        `Unknown permission id(s): ${missingPermissionIds.join(', ')}`,
      );
    }

    const affectedCount = await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.rolePermission.deleteMany({
        where: {
          roleId: role.id,
          permissionId: {
            in: normalizedPermissionIds,
          },
        },
      });
      return deleted.count;
    });

    this.userPermissionSnapshot.invalidateAll();

    return {
      success: true,
      roleId: role.id,
      affectedCount,
    };
  }
}
