import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class ListEmployeeContractsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const contracts = await this.prisma.contract.findMany({
      where: { userId: user.id },
      orderBy: [{ sequenceNumber: 'desc' }],
    });

    return contracts.map((c) => ({
      id: c.id,
      userId: c.userId,
      contractType: c.contractType,
      sequenceNumber: c.sequenceNumber,
      startDate: c.startDate.toISOString().slice(0, 10),
      endDate: c.endDate?.toISOString().slice(0, 10) ?? null,
      trialApplies: c.trialApplies,
      trialEndDate: c.trialEndDate?.toISOString().slice(0, 10) ?? null,
      trialConfirmed: c.trialConfirmed,
      documentUrl: c.documentUrl ?? null,
      status: c.status,
      syncedToFinance: c.syncedToFinance,
      syncedAt: c.syncedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }
}
