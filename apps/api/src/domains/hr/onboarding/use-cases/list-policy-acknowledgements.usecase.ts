import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPolicyAcknowledgementResponse } from '../policy-acknowledgement.mapper';

@Injectable()
export class ListPolicyAcknowledgementsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string; verified?: string }) {
    const list = await this.prisma.policyAcknowledgement.findMany({
      where: {
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.verified === 'true' ? { verifiedAt: { not: null } } : {}),
        ...(filters.verified === 'false' ? { verifiedAt: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(mapPolicyAcknowledgementResponse);
  }
}
