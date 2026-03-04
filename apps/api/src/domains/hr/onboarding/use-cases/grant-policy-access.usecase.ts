import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPolicyAcknowledgementResponse } from '../policy-acknowledgement.mapper';
import { OnboardingLifecycleService } from '../onboarding-lifecycle.service';

@Injectable()
export class GrantPolicyAccessUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: OnboardingLifecycleService,
  ) {}

  async execute(id: string, body?: { grantedAt?: string | null }) {
    const record = await this.prisma.policyAcknowledgement.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException('Policy acknowledgement not found');
    if (!record.verifiedAt) {
      throw new BadRequestException(
        'Policies must be verified before granting access',
      );
    }

    const updated = await this.prisma.policyAcknowledgement.update({
      where: { id },
      data: {
        systemAccessGrantedAt: body?.grantedAt
          ? new Date(body.grantedAt)
          : new Date(),
      },
    });

    await this.lifecycle.activateEmployeeIfEligible(updated.employeeId);
    return mapPolicyAcknowledgementResponse(updated);
  }
}
