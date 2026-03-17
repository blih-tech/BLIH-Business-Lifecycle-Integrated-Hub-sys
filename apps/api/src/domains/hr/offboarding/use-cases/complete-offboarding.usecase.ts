import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class CompleteOffboardingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(resignationId: string) {
    const resignation = await this.prisma.resignation.findUnique({
      where: { id: resignationId },
    });
    if (!resignation) throw new NotFoundException('Resignation not found');
    const lifecycle = await this.prisma.userLifecycle.findUnique({
      where: { employeeId: resignation.employeeId },
    });
    if (lifecycle?.offboardingCompleted)
      throw new BadRequestException('Offboarding already completed');
    const now = new Date();
    await this.prisma.userLifecycle.upsert({
      where: { employeeId: resignation.employeeId },
      update: {
        status: 'RESIGNED',
        terminatedAt: now,
        offboardingCompleted: true,
      },
      create: {
        employeeId: resignation.employeeId,
        status: 'RESIGNED',
        terminatedAt: now,
        offboardingCompleted: true,
      },
    });
    await this.prisma.resignation.update({
      where: { id: resignationId },
      data: { status: 'COMPLETED' },
    });
    return {
      success: true,
      employeeId: resignation.employeeId,
      message: 'Offboarding completed; lifecycle updated.',
    };
  }
}
