import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapLeaveRequestResponse } from '../leave-request.mapper';

@Injectable()
export class SubmitLeaveRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const existing = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Leave request not found');
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft leave requests can be submitted',
      );
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'PENDING', submittedAt: new Date() },
    });
    return mapLeaveRequestResponse(updated);
  }
}
