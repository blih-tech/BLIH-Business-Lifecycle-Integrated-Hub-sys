import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPolicyAcknowledgementResponse } from '../policy-acknowledgement.mapper';

@Injectable()
export class GetPolicyAcknowledgementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const record = await this.prisma.policyAcknowledgement.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException('Policy acknowledgement not found');
    return mapPolicyAcknowledgementResponse(record);
  }
}
