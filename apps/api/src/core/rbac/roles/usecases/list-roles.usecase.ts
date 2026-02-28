import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { ListRolesQueryDto } from '../dto/list-roles-query.dto';

@Injectable()
export class ListRolesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListRolesQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where = {
      ...(query.search
        ? {
            OR: [
              {
                name: { contains: query.search, mode: 'insensitive' as const },
              },
              {
                displayName: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
      ...(query.isSystem !== undefined ? { isSystem: query.isSystem } : {}),
    };

    const [total, roles] = await Promise.all([
      this.prisma.role.count({ where }),
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
    ]);

    const allRoles = await this.prisma.role.findMany({
      select: {
        id: true,
        parentRoleId: true,
      },
    });
    const parentByRoleId = new Map(
      allRoles.map((role) => [role.id, role.parentRoleId] as const),
    );

    const effectiveRoleIdsByRoleId = new Map<string, string[]>();
    const allEffectiveRoleIds = new Set<string>();

    for (const role of roles) {
      const visited = new Set<string>();
      let cursor: string | null = role.id;

      while (cursor && !visited.has(cursor)) {
        visited.add(cursor);
        cursor = parentByRoleId.get(cursor) ?? null;
      }

      const roleIds = [...visited];
      effectiveRoleIdsByRoleId.set(role.id, roleIds);
      for (const roleId of roleIds) {
        allEffectiveRoleIds.add(roleId);
      }
    }

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId: {
          in: [...allEffectiveRoleIds],
        },
      },
      select: {
        roleId: true,
        permission: {
          select: {
            slug: true,
          },
        },
      },
    });

    const permissionSlugsByRoleId = new Map<string, string[]>();
    for (const rolePermission of rolePermissions) {
      const existing = permissionSlugsByRoleId.get(rolePermission.roleId) ?? [];
      existing.push(rolePermission.permission.slug);
      permissionSlugsByRoleId.set(rolePermission.roleId, existing);
    }

    return {
      items: roles.map((role) => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isSystem: role.isSystem,
        parentRoleId: role.parentRoleId,
        permissions: [
          ...new Set(
            (effectiveRoleIdsByRoleId.get(role.id) ?? []).flatMap(
              (effectiveRoleId) =>
                permissionSlugsByRoleId.get(effectiveRoleId) ?? [],
            ),
          ),
        ].sort((left, right) => left.localeCompare(right)),
        assignmentCount: role._count.users,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
      page,
      limit,
      total,
    };
  }
}
