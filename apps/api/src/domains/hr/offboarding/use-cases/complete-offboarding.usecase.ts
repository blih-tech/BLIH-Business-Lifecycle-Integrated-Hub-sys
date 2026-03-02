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
      where: { userId: resignation.userId },
    });
    if (lifecycle?.offboardingCompleted)
      throw new BadRequestException('Offboarding already completed');
    const now = new Date();
    await this.prisma.userLifecycle.upsert({
      where: { userId: resignation.userId },
      update: {
        status: 'RESIGNED',
        terminatedAt: now,
        offboardingCompleted: true,
      },
      create: {
        userId: resignation.userId,
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
      userId: resignation.userId,
      message: 'Offboarding completed; lifecycle updated.',
    };
  }
}
