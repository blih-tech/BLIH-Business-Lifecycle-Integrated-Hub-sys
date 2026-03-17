import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteOnboardingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<{ success: true }> {
    const existing = await this.prisma.onboarding.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Onboarding with id "${id}" not found`);
    }

    await this.prisma.$transaction([
      this.prisma.onboardingChecklist.deleteMany({
        where: { onboardingId: id },
      }),
      this.prisma.onboarding.delete({ where: { id } }),
    ]);

    return { success: true };
  }
}
