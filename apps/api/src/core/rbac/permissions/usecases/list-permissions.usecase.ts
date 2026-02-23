import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class ListPermissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { slug: 'asc' },
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

    return permissions.map((permission) => ({
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
    }));
  }
}
