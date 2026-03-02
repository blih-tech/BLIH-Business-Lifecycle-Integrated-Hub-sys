import { Injectable } from '@nestjs/common';
import type { CreateComplianceChecklistDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapComplianceChecklist } from '../offboarding.mapper';

@Injectable()
export class CreateComplianceChecklistUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateComplianceChecklistDto) {
    await this.prisma.user.findUniqueOrThrow({ where: { id: dto.userId } });
    await this.prisma.resignation.findUniqueOrThrow({
      where: { id: dto.resignationId },
    });
    const cc = await this.prisma.complianceChecklist.create({
      data: {
        userId: dto.userId,
        resignationId: dto.resignationId,
        terminationType: dto.terminationType as never,
        noticePeriodContractual: dto.noticePeriodContractual ?? null,
        noticePeriodActual: dto.noticePeriodActual ?? null,
        payInLieu: dto.payInLieu ?? null,
        finalDues: (dto.finalDues ?? null) as never,
        terminationLetterSent: dto.terminationLetterSent ?? false,
        exitInterviewDone: dto.exitInterviewDone ?? false,
        clearanceCertificateDone: dto.clearanceCertificateDone ?? false,
        unionNotified: dto.unionNotified ?? false,
        laborOfficeFiled: dto.laborOfficeFiled ?? false,
        noPendingClaims: dto.noPendingClaims ?? false,
      },
    });
    return mapComplianceChecklist(cc);
  }
}
