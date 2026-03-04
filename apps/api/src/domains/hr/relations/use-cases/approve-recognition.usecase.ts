import { Injectable, NotFoundException } from '@nestjs/common';
import type { ApproveRecognitionDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapRecognition } from '../relations.mapper';

@Injectable()
export class ApproveRecognitionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, approverId: string, dto: ApproveRecognitionDto) {
    const existing = await this.prisma.recognition.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Recognition not found');
    await this.prisma.user.findUniqueOrThrow({ where: { id: approverId } });
    const approvals =
      (existing.approvals as Array<{
        approverId: string;
        approved: boolean;
        comments?: string;
        at: string;
      }>) ?? [];
    const newEntry = {
      approverId,
      approved: dto.approved,
      comments: dto.comments ?? null,
      at: new Date().toISOString(),
    };
    const updatedApprovals = [...approvals, newEntry];
    const status = dto.approved ? 'APPROVED' : 'REJECTED';
    const updated = await this.prisma.recognition.update({
      where: { id },
      data: {
        approvals: updatedApprovals as never,
        status: status as never,
        approvedById: dto.approved ? approverId : null,
      },
    });
    return mapRecognition(updated);
  }
}
