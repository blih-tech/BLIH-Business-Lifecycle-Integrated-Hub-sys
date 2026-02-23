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

    const dataScope = this.toRoleDataScope(dto.dataScope);

    const parentRole =
      dto.parentRoleName?.trim() && dto.parentRoleName.trim().length > 0
        ? await this.prisma.role.findUnique({
            where: { name: dto.parentRoleName.trim() },
            select: { id: true },
          })
        : null;
    if (dto.parentRoleName && !parentRole) {
      throw new BadRequestException(
        `Parent role not found: ${dto.parentRoleName}`,
      );
    }

    const role = await this.prisma.role.upsert({
      where: {
        name: dto.name,
      },
      update: {
        displayName: dto.displayName,
        description: dto.description,
        dataScope,
        parentRoleId: parentRole?.id ?? null,
      },
      create: {
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        dataScope,
        parentRoleId: parentRole?.id ?? null,
      },
    });

    const permissionKeys = [
      ...(dto.permissions ?? []),
      ...(dto.permission ? [dto.permission] : []),
    ]
      .map((permission) => permission.trim().toLowerCase())
      .filter(Boolean);

    if (permissionKeys.length > 0) {
      const uniquePermissionKeys = [...new Set(permissionKeys)];
      const persistedPermissions = await this.prisma.permission.findMany({
        where: {
          slug: {
            in: uniquePermissionKeys,
          },
        },
        select: {
          id: true,
          slug: true,
        },
      });
      const permissionBySlug = new Map(
        persistedPermissions.map((permission) => [
          permission.slug,
          permission.id,
        ]),
      );
      const unknownPermissionKeys = uniquePermissionKeys.filter(
        (permissionKey) => !permissionBySlug.has(permissionKey),
      );

      if (unknownPermissionKeys.length > 0) {
        throw new BadRequestException(
          `Unknown permission key(s): ${unknownPermissionKeys.join(', ')}`,
        );
      }

      await this.prisma.rolePermission.deleteMany({
        where: {
          roleId: role.id,
        },
      });

      const permissionRows: { roleId: string; permissionId: string }[] = [];
      for (const permissionKey of uniquePermissionKeys) {
        const permissionId = permissionBySlug.get(permissionKey);
        if (!permissionId) {
          continue;
        }
        permissionRows.push({
          roleId: role.id,
          permissionId,
        });
      }

      if (permissionRows.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: permissionRows,
          skipDuplicates: true,
        });
      }
    }

    await this.userPermissionSnapshot.recomputeAllUsers();

    return role;
  }

  private toRoleDataScope(scope?: CreateRoleDto['dataScope']) {
    return scope === 'self' ? ('SELF' as const) : ('GLOBAL' as const);
  }
}
