import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class GetActionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(actionId: string) {
    const action = await this.prisma.permissionAction.findUnique({
      where: { id: actionId },
    });

    if (!action) {
      throw new NotFoundException('Permission action not found');
    }

    return {
      id: action.id,
      name: action.name,
      description: action.description,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
    };
  }
}
