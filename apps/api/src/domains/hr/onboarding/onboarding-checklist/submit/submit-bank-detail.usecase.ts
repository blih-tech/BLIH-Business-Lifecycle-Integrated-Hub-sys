import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { SubmitBankDetailTaskDto } from './execution.dto';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class SubmitBankDetailUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluateOnboarding: EvaluateOnboardingUseCase,
  ) {}

  async execute(
    taskInstanceId: string,
    dto: SubmitBankDetailTaskDto,
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
    if (checklist.taskInstance.targetDataModel !== 'EMPLOYEE_BANK_DETAIL') {
      throw new BadRequestException(
        'Task instance does not map to EMPLOYEE_BANK_DETAIL',
      );
    }

    const { employeeId } = checklist.onboarding;

    await this.prisma.$transaction(async (tx) => {
      // EmployeeBankDetail is a wrapper; upsert the wrapper then upsert the BankAccount record
      const wrapper = await tx.employeeBankDetail.upsert({
        where: { employeeId },
        update: { status: 'PENDING_REVIEW', hrFeedback: null },
        create: { employeeId, status: 'PENDING_REVIEW' },
      });

      // BankAccount has no unique composite — find primary account or create
      const existingAccount = await tx.bankAccount.findFirst({
        where: { employeeBankDetailId: wrapper.id, isPrimary: true },
        select: { id: true },
      });

      if (existingAccount) {
        await tx.bankAccount.update({
          where: { id: existingAccount.id },
          data: {
            bankName: dto.bankName,
            accountName: dto.accountType,
            accountNumber: dto.accountNumber,
            branchName: dto.branch,
          },
        });
      } else {
        await tx.bankAccount.create({
          data: {
            employeeBankDetailId: wrapper.id,
            bankName: dto.bankName,
            accountName: dto.accountType,
            accountNumber: dto.accountNumber,
            branchName: dto.branch,
            isPrimary: true,
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
