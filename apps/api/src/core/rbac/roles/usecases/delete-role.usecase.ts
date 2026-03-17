import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { env } from '../../../../config/env.config';
import { KeycloakAdminService } from '../../../../platform/keycloak/keycloak-admin.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(roleName: string) {
    const normalizedRoleName = roleName.trim().toLowerCase();
    const role = await this.prisma.role.findUnique({
      where: { name: normalizedRoleName },
      select: {
        id: true,
        name: true,
        isSystem: true,
      },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.isSystem) {
      throw new ForbiddenException('System roles are read-only');
    }

    const assignmentsCount = await this.prisma.userRole.count({
      where: {
        roleId: role.id,
      },
    });
    if (assignmentsCount > 0) {
      throw new BadRequestException(
        `Cannot delete role with active assignments (${assignmentsCount})`,
      );
    }

    const realmName = env.KEYCLOAK_REALM;
    try {
      await this.keycloakAdmin.deleteRole(realmName, role.name);
    } catch (error: unknown) {
      const statusCode = (error as { response?: { status?: number } }).response
        ?.status;
      if (statusCode !== 404) {
        throw error;
      }
    }

    await this.prisma.role.delete({
      where: { id: role.id },
    });

    await this.userPermissionSnapshot.invalidateAll();

    return { success: true, deletedRole: role.name };
  }
}
