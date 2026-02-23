import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class GetPermissionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(permissionId: string) {
    const permission = await this.prisma.permission.findUnique({
      where: {
        id: permissionId,
      },
      include: {
        module: {
          select: {
            name: true,
          },
        },
        resource: {
          select: {
            name: true,
          },
        },
        action: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return {
      id: permission.id,
      slug: permission.slug,
      moduleId: permission.moduleId,
      module: permission.module.name,
      resourceId: permission.resourceId,
      resource: permission.resource.name,
      actionId: permission.actionId,
      action: permission.action.name,
      description: permission.description,
      createdAt: permission.createdAt,
    };
  }
}
