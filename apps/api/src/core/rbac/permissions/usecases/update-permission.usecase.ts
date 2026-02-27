import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(permissionId: string, dto: UpdatePermissionDto) {
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
      select: { id: true },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const updated = await this.prisma.permission.update({
      where: { id: permission.id },
      data: {
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
      },
      include: {
        resource: {
          select: { name: true },
        },
        action: {
          select: { name: true },
        },
      },
    });

    return {
      id: updated.id,
      slug: updated.slug,
      resourceId: updated.resourceId,
      resource: updated.resource.name,
      actionId: updated.actionId,
      action: updated.action.name,
      description: updated.description,
      createdAt: updated.createdAt,
    };
  }
}
