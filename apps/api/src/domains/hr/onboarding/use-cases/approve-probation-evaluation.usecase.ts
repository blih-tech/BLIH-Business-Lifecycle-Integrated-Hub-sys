import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationEvaluationResponse } from '../probation.mapper';
import {
  getRequiredProbationApprovals,
  normalizeProbationApprovalRole,
} from '../probation.utils';

@Injectable()
export class ApproveProbationEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    body: { role: string; approvedAt?: string | null },
  ) {
    const evaluation = await this.prisma.probationEvaluation.findUnique({
      where: { id },
    });
    if (!evaluation)
      throw new NotFoundException('Probation evaluation not found');
    if (!evaluation.finalDecision) {
      throw new BadRequestException(
        'Set a final decision before running the approval chain',
      );
    }

    const required = getRequiredProbationApprovals({
      finalDecision: evaluation.finalDecision,
      extensionDays: evaluation.extensionDays,
    });
    const role = normalizeProbationApprovalRole(body.role);
    if (!required.includes(role)) {
      throw new BadRequestException(
        `Approval from ${role} is not required for this evaluation`,
      );
    }

    const approvedAt = body.approvedAt ? new Date(body.approvedAt) : new Date();
    const updated = await this.prisma.probationEvaluation.update({
      where: { id },
      data: {
        ...(role === 'SUPERVISOR' && { supervisorApprovedAt: approvedAt }),
        ...(role === 'HR_MANAGER' && { hrApprovedAt: approvedAt }),
        ...(role === 'CEO' && { ceoApprovedAt: approvedAt }),
      },
    });

    return mapProbationEvaluationResponse(updated);
  }
}
