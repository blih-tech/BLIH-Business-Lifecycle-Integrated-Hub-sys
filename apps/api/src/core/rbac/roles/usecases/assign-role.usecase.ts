import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { env } from '../../../../config/env.config';
import { KeycloakAdminService } from '../../../../platform/keycloak/keycloak-admin.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class AssignRoleUseCase {
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
      },
    });

    if (!user || !role) {
      throw new NotFoundException('User or role not found');
    }

    await this.keycloakAdmin.assignRealmRole(realmName, user.keycloakId, {
      name: role.name,
    });

    const existing = await this.prisma.userRole.findFirst({
      where: {
        userId: user.id,
        roleId: role.id,
      },
    });

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Invalid expiresAt value');
    }

    const assignment = existing
      ? await this.prisma.userRole.update({
          where: { id: existing.id },
          data: {
            assignedBy: dto.assignedBy,
            expiresAt,
          },
        })
      : await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
            assignedBy: dto.assignedBy,
            expiresAt,
          },
        });

    await this.userPermissionSnapshot.invalidateUser(user.id);
    const permissions =
      await this.userPermissionSnapshot.getEffectivePermissionsByUserId(
        user.id,
      );

    return {
      ...assignment,
      permissions,
    };
  }
}
