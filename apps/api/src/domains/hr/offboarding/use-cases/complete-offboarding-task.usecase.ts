import { Injectable, NotFoundException } from '@nestjs/common';
import type { CompleteOffboardingTaskDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapOffboardingTask } from '../offboarding.mapper';

@Injectable()
export class CompleteOffboardingTaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    checklistId: string,
    taskId: string,
    dto: CompleteOffboardingTaskDto,
  ) {
    const task = await this.prisma.offboardingTask.findFirst({
      where: { id: taskId, checklistId },
    });
    if (!task) throw new NotFoundException('Task not found');
    const data: Record<string, unknown> = { status: dto.status };
    if (dto.status === 'COMPLETED') {
      data.completedAt = new Date();
      if (dto.completedById) data.completedById = dto.completedById;
    }
    const updated = await this.prisma.offboardingTask.update({
      where: { id: taskId },
      data: data as never,
    });
    const allTasks = await this.prisma.offboardingTask.findMany({
      where: { checklistId },
    });
    const allDone = allTasks.every(
      (t) => t.id === taskId || t.status === 'COMPLETED',
    );
    if (allDone) {
      await this.prisma.offboardingChecklist.update({
        where: { id: checklistId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }
    return mapOffboardingTask(updated);
  }
}
