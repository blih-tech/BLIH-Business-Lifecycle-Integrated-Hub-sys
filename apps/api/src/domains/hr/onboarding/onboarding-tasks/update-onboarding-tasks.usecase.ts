import {
  BadRequestException,
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

    // Validate completedById if it is being set
    if (dto.completedById) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.completedById },
        select: { id: true },
      });
      if (!user) {
        throw new BadRequestException(
          'completedById does not reference an existing user',
        );
      }
    }

    const updated = await this.prisma.onboardingTask.update({
      where: { id },
      data: {
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.completedById !== undefined && {
          completedById: dto.completedById,
        }),
      },
      include: onboardingTaskInclude,
    });

    return mapOnboardingTask(updated);
  }
}
