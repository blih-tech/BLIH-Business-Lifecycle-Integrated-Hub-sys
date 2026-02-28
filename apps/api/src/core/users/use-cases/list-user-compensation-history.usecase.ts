import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class ListUserCompensationHistoryUseCase {
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

    const entries = await this.prisma.userCompensationHistory.findMany({
      where: { userId: user.id },
      orderBy: { validFrom: 'desc' },
    });

    return entries.map((entry) => ({
      ...entry,
      baseSalary: entry.baseSalary?.toString() ?? null,
      bonusRate: entry.bonusRate?.toString() ?? null,
      validFrom: entry.validFrom.toISOString(),
      validTo: entry.validTo?.toISOString() ?? null,
      createdAt: entry.createdAt.toISOString(),
    }));
  }
}
