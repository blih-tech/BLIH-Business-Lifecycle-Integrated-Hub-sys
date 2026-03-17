import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapLeaveRequestResponse } from '../leave-request.mapper';

@Injectable()
export class ListLeaveRequestsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const list = await this.prisma.leaveRequest.findMany({
      where,
      include: {
        approvalSteps: {
          orderBy: { level: 'asc' },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { submittedAt: 'desc' }],
    });

    return list.map(mapLeaveRequestResponse);
  }
}
