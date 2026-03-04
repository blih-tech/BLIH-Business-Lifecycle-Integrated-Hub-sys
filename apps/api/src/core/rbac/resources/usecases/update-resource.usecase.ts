import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UpdateResourceDto } from '../dto/update-resource.dto';

@Injectable()
export class UpdateResourceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(resourceId: string, dto: UpdateResourceDto) {
    const existing = await this.prisma.permissionResource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Permission resource not found');
    }

    return this.prisma.permissionResource.update({
      where: { id: resourceId },
      data: {
        description: dto.description,
      },
    });
  }
}
