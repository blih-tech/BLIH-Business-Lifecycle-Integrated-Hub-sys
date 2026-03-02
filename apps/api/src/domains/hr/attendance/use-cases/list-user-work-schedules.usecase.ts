import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapUserWorkScheduleResponse } from '../attendance-config.mapper';

@Injectable()
export class ListUserWorkSchedulesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string | undefined) {
    if (!userId) {
      throw new BadRequestException('Query parameter userId is required');
    }

    const assignments = await this.prisma.userWorkSchedule.findMany({
      where: { userId },
      include: {
        schedule: {
          select: { name: true },
        },
      },
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });

    return assignments.map(mapUserWorkScheduleResponse);
  }
}
