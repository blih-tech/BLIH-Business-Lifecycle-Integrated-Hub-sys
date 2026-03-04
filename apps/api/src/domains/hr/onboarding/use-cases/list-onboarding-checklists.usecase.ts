import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapOnboardingChecklistResponse } from '../onboarding.mapper';

@Injectable()
export class ListOnboardingChecklistsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string; status?: string }) {
    const checklists = await this.prisma.onboardingChecklist.findMany({
      where: {
        ...(filters.employeeId && { employeeId: filters.employeeId }),
        ...(filters.status && {
          status: filters.status as
            | 'NOT_STARTED'
            | 'IN_PROGRESS'
            | 'COMPLETED'
            | 'OVERDUE',
        }),
      },
      include: { tasks: true },
      orderBy: { createdAt: 'desc' },
    });
    return checklists.map(mapOnboardingChecklistResponse);
  }
}
