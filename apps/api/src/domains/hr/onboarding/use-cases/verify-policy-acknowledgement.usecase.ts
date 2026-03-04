import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPolicyAcknowledgementResponse } from '../policy-acknowledgement.mapper';

@Injectable()
export class VerifyPolicyAcknowledgementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    verifiedById: string,
    body?: { verifiedAt?: string | null },
  ) {
    const record = await this.prisma.policyAcknowledgement.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException('Policy acknowledgement not found');
    if (!record.allAcknowledged) {
      throw new BadRequestException(
        'All policies must be acknowledged before verification',
      );
    }

    const updated = await this.prisma.policyAcknowledgement.update({
      where: { id },
      data: {
        verifiedById,
        verifiedAt: body?.verifiedAt ? new Date(body.verifiedAt) : new Date(),
      },
    });

    return mapPolicyAcknowledgementResponse(updated);
  }
}
