import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { UpdateOnboardingTaskDto } from './onboarding-tasks.dto';
import {
  mapOnboardingTask,
  onboardingTaskInclude,
} from './create-onboarding-tasks.usecase';

@Injectable()
export class UpdateOnboardingTaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateOnboardingTaskDto) {
    // Ensure the task exists
    const existing = await this.prisma.onboardingTask.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Onboarding task with id "${id}" not found`);
    }

    const updated = await this.prisma.onboardingTask.update({
      where: { id },
      data: {
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      include: onboardingTaskInclude,
    });

    return mapOnboardingTask(updated);
  }
}
