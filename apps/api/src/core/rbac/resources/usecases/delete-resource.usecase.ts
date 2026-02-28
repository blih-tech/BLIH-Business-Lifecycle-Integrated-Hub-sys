import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteResourceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(resourceId: string) {
    const existing = await this.prisma.permissionResource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Permission resource not found');
    }

    await this.prisma.permissionResource.delete({
      where: { id: resourceId },
    });

    return { success: true };
  }
}
