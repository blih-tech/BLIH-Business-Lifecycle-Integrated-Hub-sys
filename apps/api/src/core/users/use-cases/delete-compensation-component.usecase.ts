import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteCompensationComponentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string, componentId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deleted = await this.prisma.compensationComponent.deleteMany({
      where: { id: componentId, userId: user.id },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Compensation component not found');
    }

    return { success: true };
  }
}
