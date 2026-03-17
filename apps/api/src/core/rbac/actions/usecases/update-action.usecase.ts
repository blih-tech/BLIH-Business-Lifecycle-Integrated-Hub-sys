import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UpdateActionDto } from '../dto/update-action.dto';

@Injectable()
export class UpdateActionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(actionId: string, dto: UpdateActionDto) {
    const existing = await this.prisma.permissionAction.findUnique({
      where: { id: actionId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Permission action not found');
    }

    return this.prisma.permissionAction.update({
      where: { id: actionId },
      data: {
        description: dto.description,
      },
    });
  }
}
