import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class GetUserCompensationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const compensation = await this.prisma.userCompensation.findUnique({
      where: { userId: user.id },
    });
    if (!compensation) {
      throw new NotFoundException('User compensation not found');
    }

    return {
      ...compensation,
      baseSalary: compensation.baseSalary?.toString() ?? null,
      bonusRate: compensation.bonusRate?.toString() ?? null,
      effectiveFrom: compensation.effectiveFrom?.toISOString() ?? null,
      effectiveTo: compensation.effectiveTo?.toISOString() ?? null,
      createdAt: compensation.createdAt.toISOString(),
      updatedAt: compensation.updatedAt.toISOString(),
    };
  }
}
