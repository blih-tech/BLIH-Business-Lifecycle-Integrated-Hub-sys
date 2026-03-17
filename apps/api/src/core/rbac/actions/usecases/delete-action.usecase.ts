import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteActionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(actionId: string) {
    const existing = await this.prisma.permissionAction.findUnique({
      where: { id: actionId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Permission action not found');
    }

    await this.prisma.permissionAction.delete({
      where: { id: actionId },
    });

    return { success: true };
  }
}
