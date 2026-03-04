import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapJobPostingResponse } from '../job-posting.mapper';

@Injectable()
export class CloseJobPostingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    body?: { status?: 'CANCELLED' | 'EXPIRED' | 'FILLED' },
  ) {
    const posting = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        position: { select: { title: true } },
        _count: { select: { candidates: true } },
      },
    });

    if (!posting) throw new NotFoundException('Job posting not found');
    if (['EXPIRED', 'CANCELLED', 'FILLED'].includes(posting.status)) {
      throw new BadRequestException('Job posting is already closed');
    }

    const closed = await this.prisma.jobPosting.update({
      where: { id },
      data: {
        status: body?.status ?? 'CANCELLED',
        closedAt: new Date(),
      },
      include: {
        position: { select: { title: true } },
        _count: { select: { candidates: true } },
      },
    });

    return mapJobPostingResponse(closed);
  }
}
