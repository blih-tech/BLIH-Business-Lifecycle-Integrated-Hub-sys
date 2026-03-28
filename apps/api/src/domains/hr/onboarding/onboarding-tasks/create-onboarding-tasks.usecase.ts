import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateOnboardingTaskDto } from './onboarding-tasks.dto';
import { TaskType, TargetDataModel } from '@repo/database';

// ─── Shared helpers ────────────────────────────────────────────────────────────

export function mapOnboardingTask(task: {
  id: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  targetDataModel: TargetDataModel | null;
  requiresHrVerification: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    taskType: task.taskType,
    targetDataModel: task.targetDataModel,
    requiresHrVerification: task.requiresHrVerification,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

// ─── Use Case ─────────────────────────────────────────────────────────────────

@Injectable()
export class CreateOnboardingTaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateOnboardingTaskDto) {
    if (dto.taskType === TaskType.NON_CUSTOM && !dto.targetDataModel) {
      throw new BadRequestException(
        'targetDataModel is required when taskType is NON_CUSTOM',
      );
    }

    const task = await this.prisma.onboardingTask.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        taskType: dto.taskType,
        targetDataModel: dto.targetDataModel ?? null,
        requiresHrVerification: dto.requiresHrVerification ?? false,
      },
    });

    return mapOnboardingTask(task);
  }
}
