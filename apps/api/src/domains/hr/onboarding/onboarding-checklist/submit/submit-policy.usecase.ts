import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { SubmitPolicyTaskDto } from './execution.dto';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class SubmitPolicyUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluateOnboarding: EvaluateOnboardingUseCase,
  ) {}

  async execute(
    taskInstanceId: string,
    dto: SubmitPolicyTaskDto,
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
      checklist.taskInstance.targetDataModel !==
      'EMPLOYEE_POLICY_ACKNOWLEDGEMENT'
    ) {
      throw new BadRequestException(
        'Task instance does not map to EMPLOYEE_POLICY_ACKNOWLEDGEMENT',
      );
    }

    const { employeeId } = checklist.onboarding;

    await this.prisma.$transaction(async (tx) => {
      // Ensure an EmployeePolicyAcknowledgement wrapper exists for this employee
      const wrapper = await tx.employeePolicyAcknowledgement.upsert({
        where: { employeeId },
        update: {},
        create: { employeeId },
      });

      // Create individual PolicyAcknowledgement records for each policy
      const now = new Date();
      await Promise.all(
        dto.acknowledgements.map((ack) =>
          tx.policyAcknowledgement.upsert({
            where: {
              employeePolicyAcknowledgementId_policyVersionId: {
                employeePolicyAcknowledgementId: wrapper.id,
                policyVersionId: ack.policyVersionId,
              },
            },
            update: { acknowledgedAt: now },
            create: {
              employeePolicyAcknowledgementId: wrapper.id,
              policyId: ack.policyId,
              policyVersionId: ack.policyVersionId,
              acknowledgedAt: now,
            },
          }),
        ),
      );

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
