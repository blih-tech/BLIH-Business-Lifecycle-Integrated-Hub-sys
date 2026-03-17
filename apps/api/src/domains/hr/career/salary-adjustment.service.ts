import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ApproveSalaryAdjustmentRequestDto,
  CreateSalaryAdjustmentRequestDto,
  RejectSalaryAdjustmentRequestDto,
  UpdateSalaryAdjustmentRequestDto,
} from '@repo/types';
import type { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UpdateUserCompensationUseCase } from '../../../core/users/use-cases/update-user-compensation.usecase';
import { resolveEmployeeSubjectOrThrow } from '../employees/employee-subject.utils';
import { mapSalaryAdjustmentRequest } from './career.mapper';
import {
  assertRequestPending,
  assertRequestSubmittable,
  assertRequestUpdatable,
  buildCareerRequestId,
  computePercentChange,
  parseOptionalDateOnly,
  toPrismaNullableJsonValue,
} from './career.utils';

@Injectable()
export class SalaryAdjustmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly updateCompensationUseCase: UpdateUserCompensationUseCase,
  ) {}

  async create(dto: CreateSalaryAdjustmentRequestDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.proposedById },
      select: { id: true },
    });

    const currentCompensation = await this.prisma.userCompensation.findUnique({
      where: { employeeId: employee.id },
      select: {
        baseSalary: true,
        currency: true,
      },
    });

    await this.assertAdjustmentContext(employee.id, dto.reason, {
      linkedReviewId: dto.linkedReviewId ?? null,
      linkedTransferRequestId: dto.linkedTransferRequestId ?? null,
    });

    const currentBaseSalary =
      currentCompensation?.baseSalary != null
        ? Number(currentCompensation.baseSalary)
        : null;
    const percentChange = computePercentChange(
      currentBaseSalary,
      dto.proposedBaseSalary,
    );

    const year = new Date().getUTCFullYear();
    const count = await this.prisma.salaryAdjustmentRequest.count({
      where: {
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    });

    const data: Prisma.SalaryAdjustmentRequestUncheckedCreateInput = {
      requestId: buildCareerRequestId('SAL', year, count + 1),
      employeeId: employee.id,
      proposedById: dto.proposedById,
      linkedReviewId: dto.linkedReviewId ?? null,
      linkedTransferRequestId: dto.linkedTransferRequestId ?? null,
      reason: dto.reason,
      currentBaseSalary,
      proposedBaseSalary: dto.proposedBaseSalary,
      percentChange,
      currency: dto.currency ?? currentCompensation?.currency ?? null,
      effectiveFrom: parseOptionalDateOnly(dto.effectiveFrom) ?? new Date(),
      justification: toPrismaNullableJsonValue(dto.justification),
      status: dto.submit ? 'PENDING' : 'DRAFT',
      submittedAt: dto.submit ? new Date() : null,
    };

    const row = await this.prisma.salaryAdjustmentRequest.create({
      data,
    });

    return mapSalaryAdjustmentRequest(row);
  }

  async list(filters: {
    employeeId?: string;
    status?: string;
    reason?: string;
  }) {
    const employeeId = filters.employeeId
      ? (await resolveEmployeeSubjectOrThrow(this.prisma, filters.employeeId))
          .id
      : undefined;

    const rows = await this.prisma.salaryAdjustmentRequest.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
        ...(filters.reason ? { reason: filters.reason as never } : {}),
      },
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });

    return rows.map(mapSalaryAdjustmentRequest);
  }

  async get(id: string) {
    const row = await this.prisma.salaryAdjustmentRequest.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException('Salary adjustment request not found');
    }
    return mapSalaryAdjustmentRequest(row);
  }

  async update(id: string, dto: UpdateSalaryAdjustmentRequestDto) {
    const existing = await this.prisma.salaryAdjustmentRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Salary adjustment request not found');
    }
    assertRequestUpdatable(existing.status, 'salary adjustment requests');

    await this.assertAdjustmentContext(
      existing.employeeId,
      dto.reason ?? existing.reason,
      {
        linkedReviewId:
          dto.linkedReviewId !== undefined
            ? dto.linkedReviewId
            : existing.linkedReviewId,
        linkedTransferRequestId:
          dto.linkedTransferRequestId !== undefined
            ? dto.linkedTransferRequestId
            : existing.linkedTransferRequestId,
      },
    );

    const currentBaseSalary =
      existing.currentBaseSalary != null
        ? Number(existing.currentBaseSalary)
        : null;
    const proposedBaseSalary =
      dto.proposedBaseSalary ?? Number(existing.proposedBaseSalary);
    const data: Prisma.SalaryAdjustmentRequestUncheckedUpdateInput = {
      ...(dto.linkedReviewId !== undefined
        ? { linkedReviewId: dto.linkedReviewId }
        : {}),
      ...(dto.linkedTransferRequestId !== undefined
        ? { linkedTransferRequestId: dto.linkedTransferRequestId }
        : {}),
      ...(dto.reason !== undefined ? { reason: dto.reason } : {}),
      ...(dto.proposedBaseSalary !== undefined
        ? { proposedBaseSalary: dto.proposedBaseSalary }
        : {}),
      percentChange: computePercentChange(
        currentBaseSalary,
        proposedBaseSalary,
      ),
      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      ...(dto.effectiveFrom !== undefined
        ? {
            effectiveFrom:
              parseOptionalDateOnly(dto.effectiveFrom) ?? undefined,
          }
        : {}),
      ...(dto.justification !== undefined
        ? { justification: toPrismaNullableJsonValue(dto.justification) }
        : {}),
    };

    const row = await this.prisma.salaryAdjustmentRequest.update({
      where: { id },
      data,
    });

    return mapSalaryAdjustmentRequest(row);
  }

  async submit(id: string) {
    const existing = await this.prisma.salaryAdjustmentRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Salary adjustment request not found');
    }
    assertRequestSubmittable(existing.status, 'salary adjustment requests');

    const row = await this.prisma.salaryAdjustmentRequest.update({
      where: { id },
      data: {
        status: 'PENDING',
        submittedAt: existing.submittedAt ?? new Date(),
        approvedById: null,
        approvedAt: null,
        rejectionReason: null,
      },
    });

    return mapSalaryAdjustmentRequest(row);
  }

  async approve(id: string, dto: ApproveSalaryAdjustmentRequestDto) {
    const existing = await this.prisma.salaryAdjustmentRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Salary adjustment request not found');
    }
    assertRequestPending(existing.status, 'salary adjustment requests');

    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.approvedById },
      select: { id: true },
    });

    await this.assertAdjustmentContext(existing.employeeId, existing.reason, {
      linkedReviewId: existing.linkedReviewId,
      linkedTransferRequestId: existing.linkedTransferRequestId,
      requireApprovedTransfer: true,
    });

    await this.updateCompensationUseCase.execute(existing.employeeId, {
      baseSalary: Number(existing.proposedBaseSalary).toFixed(2),
      currency: existing.currency ?? undefined,
      effectiveFrom: existing.effectiveFrom.toISOString(),
      changeReason:
        dto.changeReason ??
        `Salary adjustment approved (${existing.reason.toLowerCase()})`,
      changedById: dto.approvedById,
    });

    const row = await this.prisma.salaryAdjustmentRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: dto.approvedById,
        approvedAt: dto.approvedAt ? new Date(dto.approvedAt) : new Date(),
        rejectionReason: null,
      },
    });

    return mapSalaryAdjustmentRequest(row);
  }

  async reject(
    id: string,
    dto: RejectSalaryAdjustmentRequestDto,
    approvedById: string,
  ) {
    const existing = await this.prisma.salaryAdjustmentRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Salary adjustment request not found');
    }
    assertRequestPending(existing.status, 'salary adjustment requests');

    await this.prisma.user.findUniqueOrThrow({
      where: { id: approvedById },
      select: { id: true },
    });

    const row = await this.prisma.salaryAdjustmentRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById,
        approvedAt: new Date(),
        rejectionReason: dto.rejectionReason.trim(),
      },
    });

    return mapSalaryAdjustmentRequest(row);
  }

  private async assertAdjustmentContext(
    employeeId: string,
    reason: string,
    links: {
      linkedReviewId?: string | null;
      linkedTransferRequestId?: string | null;
      requireApprovedTransfer?: boolean;
    },
  ) {
    if (links.linkedReviewId) {
      const review = await this.prisma.performanceReview.findUnique({
        where: { id: links.linkedReviewId },
        select: {
          employeeId: true,
          status: true,
          category: true,
        },
      });
      if (!review || review.employeeId !== employeeId) {
        throw new BadRequestException(
          'linkedReviewId must belong to the target employee',
        );
      }
      if (review.status !== 'COMPLETED') {
        throw new BadRequestException(
          'Salary adjustments can only reference completed performance reviews',
        );
      }
      if (
        reason === 'MERIT' &&
        ['UNSATISFACTORY', 'BELOW_EXPECTATIONS'].includes(review.category ?? '')
      ) {
        throw new BadRequestException(
          'Merit salary adjustments require a satisfactory completed review',
        );
      }
    } else if (reason === 'MERIT' || reason === 'PROMOTION') {
      throw new BadRequestException(
        'MERIT and PROMOTION salary adjustments require linkedReviewId',
      );
    }

    if (reason === 'TRANSFER' && !links.linkedTransferRequestId) {
      throw new BadRequestException(
        'TRANSFER salary adjustments require linkedTransferRequestId',
      );
    }

    if (links.linkedTransferRequestId) {
      const transfer = await this.prisma.internalTransferRequest.findUnique({
        where: { id: links.linkedTransferRequestId },
        select: {
          employeeId: true,
          status: true,
        },
      });
      if (!transfer || transfer.employeeId !== employeeId) {
        throw new BadRequestException(
          'linkedTransferRequestId must belong to the target employee',
        );
      }
      if (links.requireApprovedTransfer && transfer.status !== 'APPROVED') {
        throw new BadRequestException(
          'Linked transfer request must be approved before applying salary adjustment',
        );
      }
    }
  }
}
