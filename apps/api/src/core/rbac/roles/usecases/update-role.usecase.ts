import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { env } from '../../../../config/env.config';
import { KeycloakAdminService } from '../../../../platform/keycloak/keycloak-admin.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(roleName: string, dto: UpdateRoleDto) {
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

    const hasAnyChange = [
      dto.displayName,
      dto.description,
      dto.permissions,
      dto.parentRoleName,
      dto.dataScope,
    ].some((value) => value !== undefined);
    if (!hasAnyChange) {
      throw new BadRequestException('At least one field must be provided');
    }

    let parentRoleId: string | null | undefined;
    if (dto.parentRoleName !== undefined) {
      const normalizedParentRoleName = dto.parentRoleName.trim().toLowerCase();
      if (!normalizedParentRoleName) {
        parentRoleId = null;
      } else {
        if (normalizedParentRoleName === normalizedRoleName) {
          throw new BadRequestException('Role cannot be parent of itself');
        }
        const parentRole = await this.prisma.role.findUnique({
          where: { name: normalizedParentRoleName },
          select: { id: true },
        });
        if (!parentRole) {
          throw new BadRequestException(
            `Parent role not found: ${dto.parentRoleName}`,
          );
        }
        await this.assertNoCycle(role.id, parentRole.id);
        parentRoleId = parentRole.id;
      }
    }

    if (dto.permissions !== undefined) {
      const permissionSlugs = [
        ...new Set(
          dto.permissions
            .map((slug) => slug.trim().toLowerCase())
            .filter(Boolean),
        ),
      ];
      const persistedPermissions = await this.prisma.permission.findMany({
        where: {
          slug: { in: permissionSlugs },
        },
        select: { id: true, slug: true },
      });
      const permissionIdsBySlug = new Map(
        persistedPermissions.map((permission) => [
          permission.slug,
          permission.id,
        ]),
      );
      const unknownPermissionSlugs = permissionSlugs.filter(
        (slug) => !permissionIdsBySlug.has(slug),
      );
      if (unknownPermissionSlugs.length > 0) {
        throw new BadRequestException(
          `Unknown permission key(s): ${unknownPermissionSlugs.join(', ')}`,
        );
      }

      await this.prisma.rolePermission.deleteMany({
        where: { roleId: role.id },
      });
      if (permissionSlugs.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: permissionSlugs.map((slug) => ({
            roleId: role.id,
            permissionId: permissionIdsBySlug.get(slug)!,
          })),
          skipDuplicates: true,
        });
      }
    }

    const updated = await this.prisma.role.update({
      where: { id: role.id },
      data: {
        ...(dto.displayName !== undefined
          ? { displayName: dto.displayName }
          : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(parentRoleId !== undefined ? { parentRoleId } : {}),
        ...(dto.dataScope !== undefined
          ? { dataScope: dto.dataScope.toUpperCase() as never }
          : {}),
      },
      include: {
        parentRole: {
          select: { name: true },
        },
        permissions: {
          include: {
            permission: {
              select: { slug: true },
            },
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    const realmName = env.KEYCLOAK_REALM;
    await this.keycloakAdmin.updateRole(realmName, role.name, {
      name: role.name,
      description: updated.description ?? undefined,
    });

    await this.userPermissionSnapshot.recomputeAllUsers();

    return {
      id: updated.id,
      name: updated.name,
      displayName: updated.displayName,
      description: updated.description,
      dataScope: updated.dataScope.toLowerCase(),
      isSystem: updated.isSystem,
      parentRoleName: updated.parentRole?.name ?? null,
      permissions: updated.permissions
        .map((item) => item.permission.slug)
        .sort((left, right) => left.localeCompare(right)),
      assignmentCount: updated._count.users,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
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

      const node: { parentRoleId: string | null } | null =
        await this.prisma.role.findUnique({
          where: { id: cursor },
          select: { parentRoleId: true },
        });
      cursor = node?.parentRoleId ?? null;
    }
  }
}
