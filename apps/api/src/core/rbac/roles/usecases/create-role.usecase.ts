import { BadRequestException, Injectable } from '@nestjs/common';
import { KeycloakAdminService } from '../../../../platform/keycloak/keycloak-admin.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { env } from '../../../../config/env.config';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(dto: CreateRoleDto) {
    const realmName = env.KEYCLOAK_REALM;
    try {
      await this.keycloakAdmin.createRole(realmName, dto.name, dto.description);
    } catch (error: unknown) {
      const statusCode = (error as { response?: { status?: number } }).response
        ?.status;
      if (statusCode !== 409) {
        throw error;
      }
    }

    if (dto.parentRoleId) {
      const parentRole = await this.prisma.role.findUnique({
        where: { id: dto.parentRoleId },
        select: { id: true },
      });
      if (!parentRole) {
        throw new BadRequestException(
          `Parent role not found: ${dto.parentRoleId}`,
        );
      }
    }

    const role = await this.prisma.role.upsert({
      where: {
        name: dto.name,
      },
      update: {
        displayName: dto.displayName,
        description: dto.description,
        parentRoleId: dto.parentRoleId ?? null,
      },
      create: {
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        parentRoleId: dto.parentRoleId ?? null,
      },
    });

    await this.userPermissionSnapshot.invalidateAll();

    return role;
  }
}
