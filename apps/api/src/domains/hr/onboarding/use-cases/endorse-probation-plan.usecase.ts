import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationPlanResponse } from '../probation.mapper';

type EndorsementRole = 'EMPLOYEE' | 'SUPERVISOR' | 'HR_MANAGER';

@Injectable()
export class EndorseProbationPlanUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    body: { role: EndorsementRole; endorsedAt?: string | null },
  ) {
    const plan = await this.prisma.probationKpiPlan.findUnique({
      where: { id },
    });
    if (!plan) throw new NotFoundException('Probation plan not found');
    if (plan.status === 'COMPLETED' || plan.status === 'CANCELLED') {
      throw new BadRequestException(
        'Closed probation plans cannot be endorsed',
      );
    }

    const endorsedAt = body.endorsedAt ? new Date(body.endorsedAt) : new Date();
    const updated = await this.prisma.probationKpiPlan.update({
      where: { id },
      data: {
        ...(body.role === 'EMPLOYEE' && { employeeEndorsedAt: endorsedAt }),
        ...(body.role === 'SUPERVISOR' && { supervisorEndorsedAt: endorsedAt }),
        ...(body.role === 'HR_MANAGER' && { hrEndorsedAt: endorsedAt }),
      },
    });

    const shouldActivate =
      updated.employeeEndorsedAt &&
      updated.supervisorEndorsedAt &&
      updated.hrEndorsedAt;

    if (shouldActivate && updated.status !== 'ACTIVE') {
      const active = await this.prisma.probationKpiPlan.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });
      return mapProbationPlanResponse(active);
    }

    return mapProbationPlanResponse(updated);
  }
}
