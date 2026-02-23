import { Injectable, NotFoundException } from '@nestjs/common';
import { env } from '../../../../config/env.config';
import { KeycloakAdminService } from '../../../../platform/keycloak/keycloak-admin.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class RevokeRoleUseCase {
  constructor(
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(dto: AssignRoleDto) {
    const realmName = env.KEYCLOAK_REALM;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: dto.userId }, { keycloakId: dto.userId }],
      },
    });

    const role = await this.prisma.role.findFirst({
      where: {
        name: dto.roleName,
      },
      select: {
        id: true,
        name: true,
        dataScope: true,
      },
    });

    if (!user || !role) {
      throw new NotFoundException('User or role not found');
    }

    const assignment = await this.prisma.userRole.findFirst({
      where: {
        userId: user.id,
        roleId: role.id,
      },
      select: { id: true },
    });

    if (!assignment) {
      throw new NotFoundException('Scoped role assignment not found');
    }

    await this.prisma.userRole.delete({
      where: { id: assignment.id },
    });

    const remainingAssignments = await this.prisma.userRole.count({
      where: {
        userId: user.id,
        roleId: role.id,
      },
    });

    if (remainingAssignments === 0) {
      await this.keycloakAdmin.revokeRealmRole(realmName, user.keycloakId, {
        name: role.name,
      });
    }

    await this.userPermissionSnapshot.recomputeForUser(user.id);

    return { success: true };
  }
}
