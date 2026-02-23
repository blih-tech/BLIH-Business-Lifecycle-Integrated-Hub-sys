import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class ListActionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const actions = await this.prisma.permissionAction.findMany({
      orderBy: { name: 'asc' },
    });

    return actions.map((action) => ({
      id: action.id,
      name: action.name,
      description: action.description,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
    }));
  }
}
