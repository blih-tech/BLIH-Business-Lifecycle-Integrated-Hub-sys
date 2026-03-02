import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapLeaveRequestResponse } from '../leave-request.mapper';

@Injectable()
export class GetLeaveRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const row = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Leave request not found');
    return mapLeaveRequestResponse(row);
  }
}
