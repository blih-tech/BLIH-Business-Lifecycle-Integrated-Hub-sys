import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { UpdateOnboardingTaskDto } from './onboarding-tasks.dto';
import { mapOnboardingTask } from './create-onboarding-tasks.usecase';
import { TaskType } from '@repo/database';

@Injectable()
export class UpdateOnboardingTaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateOnboardingTaskDto) {
    const existing = await this.prisma.onboardingTask.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Onboarding task with id "${id}" not found`);
    }

    const newTaskType =
      dto.taskType !== undefined ? dto.taskType : existing.taskType;
    const newTargetDataModel =
      dto.targetDataModel !== undefined
        ? dto.targetDataModel
        : existing.targetDataModel;

    if (
      newTaskType === TaskType.NON_CUSTOM &&
      !newTargetDataModel &&
      newTargetDataModel !== undefined
    ) {
      throw new BadRequestException(
        'targetDataModel is required when taskType is NON_CUSTOM',
      );
    }

    const updated = await this.prisma.onboardingTask.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.taskType !== undefined && { taskType: dto.taskType }),
        ...(dto.targetDataModel !== undefined && {
          targetDataModel: dto.targetDataModel,
        }),
        ...(dto.requiresHrVerification !== undefined && {
          requiresHrVerification: dto.requiresHrVerification,
        }),
      },
    });

    return mapOnboardingTask(updated);
  }
}
