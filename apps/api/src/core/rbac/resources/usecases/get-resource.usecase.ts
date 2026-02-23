import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class GetResourceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(resourceId: string) {
    const resource = await this.prisma.permissionResource.findUnique({
      where: { id: resourceId },
      include: {
        module: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException('Permission resource not found');
    }

    return {
      id: resource.id,
      moduleId: resource.moduleId,
      module: resource.module.name,
      name: resource.name,
      description: resource.description,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  }
}
