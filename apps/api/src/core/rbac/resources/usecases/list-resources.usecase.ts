import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class ListResourcesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const resources = await this.prisma.permissionResource.findMany({
      orderBy: { name: 'asc' },
      include: {
        module: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return resources.map((resource) => ({
      id: resource.id,
      moduleId: resource.moduleId,
      module: resource.module.name,
      name: resource.name,
      description: resource.description,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    }));
  }
}
