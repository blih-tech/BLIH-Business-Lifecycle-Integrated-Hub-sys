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
    const normalizedRoleName = dto.name.trim().toLowerCase();
    const realmName = env.KEYCLOAK_REALM;
    try {
      await this.keycloakAdmin.createRole(
        realmName,
        normalizedRoleName,
        dto.description,
      );
    } catch (error: unknown) {
      const statusCode = (error as { response?: { status?: number } }).response
        ?.status;
      if (statusCode !== 409) {
        throw error;
      }
    }

    const existingRole = await this.prisma.role.findUnique({
      where: { name: normalizedRoleName },
      select: { id: true },
    });

    const parentRole =
      dto.parentRoleId?.trim() && dto.parentRoleId.trim().length > 0
        ? await this.prisma.role.findUnique({
            where: { id: dto.parentRoleId.trim() },
            select: { id: true },
          })
        : null;
    if (dto.parentRoleId && !parentRole) {
      throw new BadRequestException(
        `Parent role not found: ${dto.parentRoleId}`,
      );
    }
    if (existingRole && parentRole?.id === existingRole.id) {
      throw new BadRequestException('Role cannot be parent of itself');
    }
    if (existingRole && parentRole) {
      await this.assertNoCycle(existingRole.id, parentRole.id);
    }

    const role = await this.prisma.role.upsert({
      where: {
        name: normalizedRoleName,
      },
      update: {
        displayName: dto.displayName,
        description: dto.description,
        parentRoleId: parentRole?.id ?? null,
      },
      create: {
        name: normalizedRoleName,
        displayName: dto.displayName,
        description: dto.description,
        parentRoleId: parentRole?.id ?? null,
      },
    });

    this.userPermissionSnapshot.invalidateAll();

    return role;
  }

  private async assertNoCycle(
    roleId: string,
    parentRoleId: string,
  ): Promise<void> {
    const visited = new Set<string>();
    let cursor: string | null = parentRoleId;

    while (cursor) {
      if (cursor === roleId) {
        throw new BadRequestException('Role hierarchy cycle detected');
      }
      if (visited.has(cursor)) {
        break;
      }
      visited.add(cursor);

      const node = await this.prisma.role.findUnique({
        where: { id: cursor },
        select: { parentRoleId: true },
      });
      cursor = node?.parentRoleId ?? null;
    }
  }
}
