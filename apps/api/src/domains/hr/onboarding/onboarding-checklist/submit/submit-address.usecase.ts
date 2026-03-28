import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { SubmitAddressTaskDto } from './execution.dto';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class SubmitAddressUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluateOnboarding: EvaluateOnboardingUseCase,
  ) {}

  async execute(
    taskInstanceId: string,
    dto: SubmitAddressTaskDto,
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

    if (checklist.taskInstance.targetDataModel !== 'EMPLOYEE_ADDRESS') {
      throw new BadRequestException(
        'Task instance does not map to EMPLOYEE_ADDRESS',
      );
    }

    const { employeeId } = checklist.onboarding;

    await this.prisma.$transaction(async (tx) => {
      // Upsert the Address model
      await tx.employeeAddress.upsert({
        where: { employeeId },
        update: {
          ...dto,
          status: 'PENDING_REVIEW',
          hrFeedback: null,
        },
        create: {
          employeeId,
          countryId: dto.countryId,
          city: dto.city,
          region: dto.region,
          subCity: dto.subCity,
          street: dto.street,
          houseNumber: dto.houseNumber,
          postalCode: dto.postalCode,
          status: 'PENDING_REVIEW',
        },
      });

      // Update the checklist status
      const nextStatus = checklist.taskInstance.requiresHrVerification
        ? 'SUBMITTED'
        : 'COMPLETED';

      await tx.onboardingChecklist.update({
        where: { id: checklist.id },
        data: { status: nextStatus },
      });

      // We pass the transaction directly to evaluate to preserve atomicity if it triggers completion
      await this.evaluateOnboarding.execute(checklist.onboardingId, tx);
    });

    return { success: true };
  }
}
