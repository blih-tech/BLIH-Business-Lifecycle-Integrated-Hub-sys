import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { SubmitContractTaskDto } from './execution.dto';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class SubmitContractUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluateOnboarding: EvaluateOnboardingUseCase,
  ) {}

  async execute(
    taskInstanceId: string,
    dto: SubmitContractTaskDto,
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
    if (checklist.taskInstance.targetDataModel !== 'EMPLOYEE_CONTRACT') {
      throw new BadRequestException(
        'Task instance does not map to EMPLOYEE_CONTRACT',
      );
    }

    const contract = await this.prisma.contract.findUnique({
      where: { id: dto.contractId },
      select: { id: true },
    });
    if (!contract) {
      throw new NotFoundException(`Contract ${dto.contractId} not found`);
    }

    const { employeeId } = checklist.onboarding;

    await this.prisma.$transaction(async (tx) => {
      // EmployeeContract is a wrapper that holds multiple Contract[] via relation
      const wrapper = await tx.employeeContract.upsert({
        where: { employeeId },
        update: { status: 'PENDING_REVIEW', hrFeedback: null },
        create: { employeeId, status: 'PENDING_REVIEW' },
      });

      // Link the submitted contract to this employee's wrapper
      await tx.contract.update({
        where: { id: dto.contractId },
        data: {
          employeeContractId: wrapper.id,
          ...(dto.signedFileUrl && { signedFileUrl: dto.signedFileUrl }),
        },
      });

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
