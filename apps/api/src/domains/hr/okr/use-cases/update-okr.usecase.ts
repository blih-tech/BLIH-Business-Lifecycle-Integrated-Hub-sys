import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateOkrDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { OkrStatus } from '../../../../platform/prisma/generated/enums';
import { assertOkrDateRange } from '../okr-policy.utils';
import { mapOkrResponse } from '../okr.mapper';

@Injectable()
export class UpdateOkrUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateOkrDto) {
    const okr = await this.prisma.okr.findUnique({
      where: { id },
      select: { id: true, scope: true, startDate: true, endDate: true },
    });
    if (!okr) throw new NotFoundException('OKR not found');

    if (dto.departmentId !== undefined) {
      if (okr.scope === 'COMPANY' && dto.departmentId != null) {
        throw new NotFoundException(
          'COMPANY OKRs cannot be assigned to a department',
        );
      }
      if (dto.departmentId) {
        await this.prisma.department.findUniqueOrThrow({
          where: { id: dto.departmentId },
        });
      }
    }

    const nextStartDate =
      dto.startDate !== undefined ? new Date(dto.startDate) : okr.startDate;
    const nextEndDate =
      dto.endDate !== undefined ? new Date(dto.endDate) : okr.endDate;
    assertOkrDateRange(nextStartDate, nextEndDate);

    const data: {
      title?: string;
      description?: string | null;
      status?: OkrStatus;
      departmentId?: string | null;
      startDate?: Date;
      endDate?: Date;
    } = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status as OkrStatus;
    if (dto.departmentId !== undefined) data.departmentId = dto.departmentId;
    if (dto.startDate !== undefined) data.startDate = nextStartDate;
    if (dto.endDate !== undefined) data.endDate = nextEndDate;

    const updated = await this.prisma.okr.update({
      where: { id },
      data,
      include: {
        department: { select: { name: true } },
        keyResults: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return mapOkrResponse(updated);
  }
}
