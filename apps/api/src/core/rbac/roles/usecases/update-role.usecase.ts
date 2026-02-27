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
      dto.parentRoleId,
    ].some((value) => value !== undefined);
    if (!hasAnyChange) {
      throw new BadRequestException('At least one field must be provided');
    }

    let parentRoleId: string | null | undefined;
    if (dto.parentRoleId !== undefined) {
      const normalizedParentRoleId = dto.parentRoleId?.trim();
      if (!normalizedParentRoleId) {
        parentRoleId = null;
      } else {
        if (normalizedParentRoleId === role.id) {
          throw new BadRequestException('Role cannot be parent of itself');
        }
        const parentRole = await this.prisma.role.findUnique({
          where: { id: normalizedParentRoleId },
          select: { id: true },
        });
        if (!parentRole) {
          throw new BadRequestException(
            `Parent role not found: ${dto.parentRoleId}`,
          );
        }
        await this.assertNoCycle(role.id, parentRole.id);
        parentRoleId = parentRole.id;
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
      },
      include: {
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

    this.userPermissionSnapshot.invalidateAll();

    return {
      id: updated.id,
      name: updated.name,
      displayName: updated.displayName,
      description: updated.description,
      isSystem: updated.isSystem,
      parentRoleId: updated.parentRoleId,
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

      const node = await this.prisma.role.findUnique({
        where: { id: cursor },
        select: { parentRoleId: true },
      });
      cursor = node?.parentRoleId ?? null;
    }
  }
}
