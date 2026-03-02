import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateRecruitmentRequestDto } from '@repo/types';
import { validateRecruitmentRequestInput } from '../recruitment-request.validation';

@Injectable()
export class CreateRecruitmentRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateRecruitmentRequestDto, submittedById: string) {
    await validateRecruitmentRequestInput(this.prisma, {
      departmentId: dto.departmentId,
      positionId: dto.positionId,
      type: dto.type,
      replacementUserId: dto.replacementUserId,
      enforceHeadcount: Boolean(dto.positionId),
    });

    const year = new Date().getFullYear();
    const count = await this.prisma.recruitmentRequest.count({
      where: { requestId: { startsWith: `REQ-${year}-` } },
    });
    const requestId = `REQ-${year}-${String(count + 1).padStart(3, '0')}`;
    const r = await this.prisma.recruitmentRequest.create({
      data: {
        requestId,
        departmentId: dto.departmentId,
        positionId: dto.positionId ?? undefined,
        type: dto.type ?? 'NEW',
        replacementUserId: dto.replacementUserId ?? undefined,
        rationale: (dto.rationale ?? undefined) as object | undefined,
        staffing: (dto.staffing ?? undefined) as object | undefined,
        schedule: (dto.schedule ?? undefined) as object | undefined,
        submittedById,
        status: 'DRAFT',
      },
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
      submittedById: withRels.submittedById,
      submittedByEmail: withRels.submittedBy.email,
      submittedAt: withRels.submittedAt?.toISOString() ?? null,
      createdAt: withRels.createdAt.toISOString(),
      updatedAt: withRels.updatedAt.toISOString(),
    };
  }
}
