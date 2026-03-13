import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteOnboardingTaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<{ success: true }> {
    const existing = await this.prisma.onboardingTask.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Onboarding task with id "${id}" not found`);
    }

    await this.prisma.$transaction([
      this.prisma.onboardingChecklist.deleteMany({
        where: { onboardingTaskId: id },
      }),
      this.prisma.onboardingTask.delete({ where: { id } }),
    ]);

    return { success: true };
  }
}
