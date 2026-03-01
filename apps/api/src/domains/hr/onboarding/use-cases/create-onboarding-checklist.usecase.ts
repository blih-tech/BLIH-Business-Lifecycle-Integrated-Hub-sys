import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateOnboardingChecklistDto } from '@blih/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import {
  addBusinessDays,
  getOnboardingTemplateTasks,
} from '../onboarding-checklist.template';
import { mapOnboardingChecklistResponse } from '../onboarding.mapper';

@Injectable()
export class CreateOnboardingChecklistUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateOnboardingChecklistDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: {
        id: true,
        employment: {
          select: {
            employmentType: true,
            position: { select: { title: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const joinDate = new Date(dto.joinDate);
    const employmentType = user.employment?.employmentType ?? 'FULL_TIME';
    const positionTitle = user.employment?.position?.title ?? null;

    const checklist = await this.prisma.onboardingChecklist.create({
      data: {
        userId: dto.userId,
        onboardingId: dto.onboardingId ?? undefined,
        hiringDecisionId: dto.hiringDecisionId ?? undefined,
        joinDate,
        overseerId: dto.overseerId ?? undefined,
        ceoSignOffRequired: dto.ceoSignOffRequired ?? false,
        totalItems: 0,
        completedItems: 0,
        status: 'NOT_STARTED',
      },
    });

    let totalItems = 0;
    if (dto.generateTasksFromTemplate) {
      const taskDefs = getOnboardingTemplateTasks(
        employmentType,
        positionTitle,
      );
      for (const def of taskDefs) {
        const dueDate = addBusinessDays(joinDate, def.dueDaysFromJoin);
        await this.prisma.onboardingTask.create({
          data: {
            checklistId: checklist.id,
            department: def.department,
            title: def.title,
            description: def.description,
            dueDate,
            status: 'PENDING',
          },
        });
        totalItems += 1;
      }
      await this.prisma.onboardingChecklist.update({
        where: { id: checklist.id },
        data: {
          totalItems,
          status: totalItems > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        },
      });
    }

    const withTasks = await this.prisma.onboardingChecklist.findUnique({
      where: { id: checklist.id },
      include: { tasks: true },
    });
    return mapOnboardingChecklistResponse(withTasks!);
  }
}
