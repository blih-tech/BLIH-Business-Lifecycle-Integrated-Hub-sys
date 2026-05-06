import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { SubmitEmergencyContactTaskDto } from './execution.dto';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class SubmitEmergencyContactUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluateOnboarding: EvaluateOnboardingUseCase,
  ) {}

  async execute(
    taskInstanceId: string,
    dto: SubmitEmergencyContactTaskDto,
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
    if (
      checklist.taskInstance.targetDataModel !== 'EMPLOYEE_EMERGENCY_CONTACT'
    ) {
      throw new BadRequestException(
        'Task instance does not map to EMPLOYEE_EMERGENCY_CONTACT',
      );
    }

    const { employeeId } = checklist.onboarding;

    await this.prisma.$transaction(async (tx) => {
      // EmployeeEmergencyContact is a wrapper; upsert wrapper then create/update EmergencyContact child
      const wrapper = await tx.employeeEmergencyContact.upsert({
        where: { employeeId },
        update: { status: 'PENDING_REVIEW', hrFeedback: null },
        create: { employeeId, status: 'PENDING_REVIEW' },
      });

      // Split name into firstName/lastName (fallback: use full name as firstName)
      const nameParts = dto.name.trim().split(' ');
      const firstName = nameParts[0] ?? dto.name;
      const lastName = nameParts.slice(1).join(' ') || firstName;

      // Create or replace the primary contact entry
      const existing = await tx.emergencyContact.findFirst({
        where: { employeeEmergencyContactId: wrapper.id, isFirstToCall: true },
        select: { id: true },
      });

      if (existing) {
        await tx.emergencyContact.update({
          where: { id: existing.id },
          data: {
            firstName,
            lastName,
            relationship: dto.relationship,
            primaryPhone: dto.phone,
            email: dto.email,
          },
        });
      } else {
        await tx.emergencyContact.create({
          data: {
            employeeEmergencyContactId: wrapper.id,
            firstName,
            lastName,
            relationship: dto.relationship,
            primaryPhone: dto.phone,
            email: dto.email,
            isFirstToCall: true,
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
