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
      ...(query.dataScope
        ? { dataScope: query.dataScope.toUpperCase() as never }
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
      }),
    ]);

    return {
      items: roles.map((role) => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        dataScope: role.dataScope.toLowerCase(),
        isSystem: role.isSystem,
        parentRoleName: role.parentRole?.name ?? null,
        permissions: role.permissions
          .map((item) => item.permission.slug)
          .sort((left, right) => left.localeCompare(right)),
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
