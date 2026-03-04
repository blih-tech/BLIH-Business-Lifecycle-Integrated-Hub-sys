import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { UpdateRecruitmentRequestDto } from '@repo/types';
import { validateRecruitmentRequestInput } from '../recruitment-request.validation';

@Injectable()
export class UpdateRecruitmentRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateRecruitmentRequestDto) {
    const existing = await this.prisma.recruitmentRequest.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        departmentId: true,
        positionId: true,
        type: true,
        replacementEmployeeId: true,
      },
    });
    if (!existing) throw new NotFoundException('Recruitment request not found');
    if (existing.status !== 'DRAFT')
      throw new NotFoundException('Only draft requests can be updated');

    const departmentId = existing.departmentId;
    const positionId =
      dto.positionId === undefined ? existing.positionId : dto.positionId;
    const type = dto.type ?? existing.type;
    const replacementEmployeeId =
      dto.replacementEmployeeId === undefined
        ? existing.replacementEmployeeId
        : dto.replacementEmployeeId;

    await validateRecruitmentRequestInput(this.prisma, {
      departmentId,
      positionId,
      type,
      replacementEmployeeId,
      enforceHeadcount: Boolean(positionId),
    });

    const data: Record<string, unknown> = {};
    if (dto.positionId !== undefined) data.positionId = dto.positionId;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.replacementEmployeeId !== undefined)
      data.replacementEmployeeId = dto.replacementEmployeeId;
    if (dto.rationale !== undefined) data.rationale = dto.rationale;
    if (dto.staffing !== undefined) data.staffing = dto.staffing;
    if (dto.schedule !== undefined) data.schedule = dto.schedule;
    const r = await this.prisma.recruitmentRequest.update({
      where: { id },
      data: data as never,
      include: {
        department: { select: { name: true } },
        position: { select: { title: true } },
        submittedBy: { select: { email: true } },
      },
    });
    const withRels = r as typeof r & {
      department: { name: string };
      position: { title: string } | null;
      submittedBy: { email: string };
    };
    return {
      id: withRels.id,
      requestId: withRels.requestId,
      departmentId: withRels.departmentId,
      departmentName: withRels.department.name,
      positionId: withRels.positionId ?? null,
      positionTitle: withRels.position?.title ?? null,
      type: withRels.type,
      status: withRels.status,
      replacementEmployeeId: withRels.replacementEmployeeId ?? null,
      submittedById: withRels.submittedById,
      submittedByEmail: withRels.submittedBy.email,
      submittedAt: withRels.submittedAt?.toISOString() ?? null,
      createdAt: withRels.createdAt.toISOString(),
      updatedAt: withRels.updatedAt.toISOString(),
    };
  }
}
