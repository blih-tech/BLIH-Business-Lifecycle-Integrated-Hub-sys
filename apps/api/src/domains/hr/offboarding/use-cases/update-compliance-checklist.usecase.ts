import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateComplianceChecklistDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapComplianceChecklist } from '../offboarding.mapper';

@Injectable()
export class UpdateComplianceChecklistUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateComplianceChecklistDto) {
    const existing = await this.prisma.complianceChecklist.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Compliance checklist not found');
    const data: Record<string, unknown> = {};
    if (dto.terminationLetterSent !== undefined)
      data.terminationLetterSent = dto.terminationLetterSent;
    if (dto.exitInterviewDone !== undefined)
      data.exitInterviewDone = dto.exitInterviewDone;
    if (dto.clearanceCertificateDone !== undefined)
      data.clearanceCertificateDone = dto.clearanceCertificateDone;
    if (dto.unionNotified !== undefined) data.unionNotified = dto.unionNotified;
    if (dto.laborOfficeFiled !== undefined)
      data.laborOfficeFiled = dto.laborOfficeFiled;
    if (dto.noPendingClaims !== undefined)
      data.noPendingClaims = dto.noPendingClaims;
    if (dto.verifiedById !== undefined) data.verifiedById = dto.verifiedById;
    if (dto.verifiedAt !== undefined)
      data.verifiedAt = dto.verifiedAt ? new Date(dto.verifiedAt) : null;
    const updated = await this.prisma.complianceChecklist.update({
      where: { id },
      data: data as never,
    });
    return mapComplianceChecklist(updated);
  }
}
