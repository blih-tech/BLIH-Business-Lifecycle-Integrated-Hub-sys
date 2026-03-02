import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { AuthPrincipal } from '../../../../shared/interfaces/auth-principal.interface';
import { mapLeaveRequestResponse } from '../leave-request.mapper';

@Injectable()
export class ApproveLeaveRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, req: Request & { user?: AuthPrincipal }) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId) throw new BadRequestException('Approver user id required');

    const existing = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Leave request not found');
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending leave requests can be approved',
      );
    }

    const approvals = Array.isArray(existing.approvals)
      ? (existing.approvals as object[])
      : [];
    approvals.push({
      approverId,
      decision: 'APPROVED',
      actedAt: new Date().toISOString(),
    });

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: approverId,
        approvedAt: new Date(),
        approvals: approvals as object,
      },
    });
    return mapLeaveRequestResponse(updated);
  }
}
