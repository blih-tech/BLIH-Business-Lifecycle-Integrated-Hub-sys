import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { SubmitEducationTaskDto } from './execution.dto';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class SubmitEducationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluateOnboarding: EvaluateOnboardingUseCase,
  ) {}

  async execute(
    taskInstanceId: string,
    dto: SubmitEducationTaskDto,
  ): Promise<{ success: true }> {
    const checklist = await this.prisma.onboardingChecklist.findFirst({
      where: { taskInstanceId },
      include: {
        taskInstance: true,
        onboarding: { select: { id: true, employeeId: true } },
      },
    });

    if (!checklist) {
      throw new NotFoundException(
        `Task instance ${taskInstanceId} not found in checklist`,
      );
    }
    if (checklist.taskInstance.targetDataModel !== 'EMPLOYEE_EDUCATION') {
      throw new BadRequestException(
        'Task instance does not map to EMPLOYEE_EDUCATION',
      );
    }

    const { employeeId } = checklist.onboarding;

    await this.prisma.$transaction(async (tx) => {
      // EmployeeEducation is a wrapper; upsert wrapper then upsert the Education child record
      const wrapper = await tx.employeeEducation.upsert({
        where: { employeeId },
        update: { status: 'PENDING_REVIEW', hrFeedback: null },
        create: { employeeId, status: 'PENDING_REVIEW' },
      });

      // Find most recent education record to update, otherwise create
      const existingEd = await tx.education.findFirst({
        where: { employeeEducationId: wrapper.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      if (existingEd) {
        await tx.education.update({
          where: { id: existingEd.id },
          data: {
            institution: dto.institution,
            degree: dto.degree,
            fieldOfStudy: dto.fieldOfStudy,
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            isCompleted: !dto.endDate || new Date(dto.endDate) <= new Date(),
          },
        });
      } else {
        await tx.education.create({
          data: {
            employeeEducationId: wrapper.id,
            institution: dto.institution,
            degree: dto.degree,
            fieldOfStudy: dto.fieldOfStudy,
            level: 'UNDERGRADUATE' as any, // Required field — employee can detail further
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            isCompleted: !dto.endDate || new Date(dto.endDate) <= new Date(),
          },
        });
      }

      const nextStatus = checklist.taskInstance.requiresHrVerification
        ? 'SUBMITTED'
        : 'COMPLETED';

      await tx.onboardingChecklist.update({
        where: { id: checklist.id },
        data: { status: nextStatus },
      });

      await this.evaluateOnboarding.execute(checklist.onboardingId, tx);
    });

    return { success: true };
  }
}
