import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapCompensationComponent } from '../compensation-component.mapper';

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

    const [compensation, components] = await Promise.all([
      this.prisma.userCompensation.findUnique({
        where: { userId: user.id },
      }),
      this.prisma.compensationComponent.findMany({
        where: { userId: user.id },
        orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);
    if (!compensation) {
      throw new NotFoundException('User compensation not found');
    }

    return {
      ...compensation,
      baseSalary: compensation.baseSalary?.toString() ?? null,
      bonusRate: compensation.bonusRate?.toString() ?? null,
      effectiveFrom: compensation.effectiveFrom?.toISOString() ?? null,
      effectiveTo: compensation.effectiveTo?.toISOString() ?? null,
      components: components.map(mapCompensationComponent),
      createdAt: compensation.createdAt.toISOString(),
      updatedAt: compensation.updatedAt.toISOString(),
    };
  }
}
