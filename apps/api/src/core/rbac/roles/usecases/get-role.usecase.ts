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

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isSystem: role.isSystem,
      parentRoleId: role.parentRoleId,
      permissions: role.permissions
        .map((item) => item.permission.slug)
        .sort((left, right) => left.localeCompare(right)),
      assignmentCount: role._count.users,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
