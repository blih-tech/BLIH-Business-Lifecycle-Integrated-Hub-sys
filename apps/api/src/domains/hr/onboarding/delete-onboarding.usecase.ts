import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteOnboardingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<{ success: true }> {
    const existing = await this.prisma.onboarding.findUnique({
      where: { id },
      include: {
        checklists: { select: { taskInstanceId: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Onboarding with id "${id}" not found`);
    }

    const instanceIds = existing.checklists.map((c) => c.taskInstanceId);

    await this.prisma.$transaction([
      this.prisma.onboarding.delete({ where: { id } }),
      ...(instanceIds.length > 0
        ? [
            this.prisma.onboardingTaskInstance.deleteMany({
              where: { id: { in: instanceIds } },
            }),
          ]
        : []),
    ]);

    return { success: true };
  }
}
