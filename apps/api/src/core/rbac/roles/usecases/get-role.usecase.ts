import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class GetRoleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(roleName: string) {
    const normalizedRoleName = roleName.trim().toLowerCase();

    const role = await this.prisma.role.findUnique({
      where: { name: normalizedRoleName },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }
    const effectivePermissions = await this.resolveRoleEffectivePermissions(
      role.id,
    );

    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isSystem: role.isSystem,
      parentRoleId: role.parentRoleId,
      permissions: effectivePermissions,
      assignmentCount: role._count.users,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  private async resolveRoleEffectivePermissions(
    roleId: string,
  ): Promise<string[]> {
    const roleIds = await this.expandParentRoleIds(roleId);
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId: {
          in: [...roleIds],
        },
      },
      select: {
        permission: {
          select: { slug: true },
        },
      },
    });

    return [
      ...new Set(rolePermissions.map((item) => item.permission.slug)),
    ].sort((left, right) => left.localeCompare(right));
  }

  private async expandParentRoleIds(roleId: string): Promise<Set<string>> {
    const visited = new Set<string>();
    let cursor: string | null = roleId;

    while (cursor && !visited.has(cursor)) {
      visited.add(cursor);
      const node: { parentRoleId: string | null } | null =
        await this.prisma.role.findUnique({
          where: { id: cursor },
          select: { parentRoleId: true },
        });
      cursor = node?.parentRoleId ?? null;
    }

    return visited;
  }
}
