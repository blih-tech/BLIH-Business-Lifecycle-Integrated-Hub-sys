import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateOvertimeRequestDto,
  RejectOvertimeRequestDto,
  UpdateOvertimeRequestDto,
} from '@repo/types';
import type { Request } from 'express';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { HrUserLifecycleService } from '../hr-user-lifecycle.service';
import { mapOvertimeRequestResponse } from './attendance-request.mapper';
import { normalizeDateOnly } from './attendance-date.util';
import { buildRequestId } from './time-request.utils';

@Injectable()
export class OvertimeRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: HrUserLifecycleService,
  ) {}

  async create(dto: CreateOvertimeRequestDto) {
    const employee = await this.lifecycle.assertAttendanceAllowed(
      dto.employeeId,
    );
    const date = normalizeDateOnly(dto.date);
    await this.assertValidRequest({
      employeeId: employee.id,
      attendanceLogId: dto.attendanceLogId ?? null,
      date,
      requestedMinutes: dto.requestedMinutes,
    });

    const year = date.getUTCFullYear();
    const count = await this.prisma.overtimeRequest.count({
      where: {
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    });

    const created = await this.prisma.overtimeRequest.create({
      data: {
        requestId: buildRequestId('OT', year, count + 1),
        employeeId: employee.id,
        attendanceLogId: dto.attendanceLogId ?? undefined,
        date,
        requestedMinutes: dto.requestedMinutes,
        reason: dto.reason.trim(),
        notes: dto.notes ?? undefined,
        status: dto.submit ? 'PENDING' : 'DRAFT',
        submittedAt: dto.submit ? new Date() : null,
      },
    });

    return mapOvertimeRequestResponse(created);
  }

  async list(filters: { employeeId?: string; status?: string }) {
    const employeeId = filters.employeeId
      ? (await this.lifecycle.assertAttendanceAllowed(filters.employeeId)).id
      : undefined;

    const requests = await this.prisma.overtimeRequest.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return requests.map(mapOvertimeRequestResponse);
  }

  async get(id: string) {
    const request = await this.prisma.overtimeRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Overtime request not found');
    }
    return mapOvertimeRequestResponse(request);
  }

  async update(id: string, dto: UpdateOvertimeRequestDto) {
    const existing = await this.prisma.overtimeRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Overtime request not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft overtime requests can be updated',
      );
    }

    await this.assertValidRequest({
      employeeId: existing.employeeId,
      attendanceLogId: existing.attendanceLogId,
      date: existing.date,
      requestedMinutes: dto.requestedMinutes ?? existing.requestedMinutes,
    });

    const updated = await this.prisma.overtimeRequest.update({
      where: { id },
      data: {
        ...(dto.requestedMinutes !== undefined
          ? { requestedMinutes: dto.requestedMinutes }
          : {}),
        ...(dto.reason !== undefined ? { reason: dto.reason.trim() } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });

    return mapOvertimeRequestResponse(updated);
  }

  async submit(id: string) {
    const existing = await this.prisma.overtimeRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Overtime request not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft overtime requests can be submitted',
      );
    }

    const updated = await this.prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'PENDING',
        submittedAt: existing.submittedAt ?? new Date(),
        rejectionReason: null,
        approvedById: null,
        approvedAt: null,
      },
    });

    return mapOvertimeRequestResponse(updated);
  }

  async cancel(id: string) {
    const existing = await this.prisma.overtimeRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Overtime request not found');
    }
    if (!['DRAFT', 'PENDING'].includes(existing.status)) {
      throw new BadRequestException(
        'Only draft or pending overtime requests can be cancelled',
      );
    }

    const updated = await this.prisma.overtimeRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return mapOvertimeRequestResponse(updated);
  }

  async approve(id: string, req: Request & { user?: AuthPrincipal }) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId) {
      throw new BadRequestException('Approver user id required');
    }

    const existing = await this.prisma.overtimeRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Overtime request not found');
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending overtime requests can be approved',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.overtimeRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedById: approverId,
          approvedAt: new Date(),
          rejectionReason: null,
        },
      });

      const currentLog = existing.attendanceLogId
        ? await tx.attendanceLog.findUnique({
            where: { id: existing.attendanceLogId },
          })
        : await tx.attendanceLog.findUnique({
            where: {
              employeeId_date: {
                employeeId: existing.employeeId,
                date: existing.date,
              },
            },
          });

      if (currentLog) {
        await tx.attendanceLog.update({
          where: { id: currentLog.id },
          data: {
            overtimeMinutes: Math.max(
              currentLog.overtimeMinutes ?? 0,
              existing.requestedMinutes,
            ),
            overtimeApproved: true,
          },
        });
        return;
      }

      await tx.attendanceLog.create({
        data: {
          employeeId: existing.employeeId,
          date: existing.date,
          status: 'PRESENT',
          isAutoCalculated: false,
          overtimeMinutes: existing.requestedMinutes,
          overtimeApproved: true,
          reconciledAt: new Date(),
          notes: 'Approved overtime request',
        },
      });
    });

    return this.get(id);
  }

  async reject(
    id: string,
    body: RejectOvertimeRequestDto,
    req: Request & { user?: AuthPrincipal },
  ) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId) {
      throw new BadRequestException('Approver user id required');
    }

    const existing = await this.prisma.overtimeRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Overtime request not found');
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending overtime requests can be rejected',
      );
    }

    const updated = await this.prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason: body.rejectionReason.trim(),
      },
    });

    return mapOvertimeRequestResponse(updated);
  }

  private async assertValidRequest(input: {
    employeeId: string;
    attendanceLogId: string | null;
    date: Date;
    requestedMinutes: number;
  }) {
    if (
      !Number.isInteger(input.requestedMinutes) ||
      input.requestedMinutes <= 0
    ) {
      throw new BadRequestException(
        'requestedMinutes must be a positive integer',
      );
    }
    if (input.requestedMinutes > 720) {
      throw new BadRequestException(
        'requestedMinutes cannot exceed 720 minutes in a single request',
      );
    }

    if (!input.attendanceLogId) {
      return;
    }

    const log = await this.prisma.attendanceLog.findFirst({
      where: {
        id: input.attendanceLogId,
        employeeId: input.employeeId,
      },
      select: {
        id: true,
        date: true,
      },
    });
    if (!log) {
      throw new BadRequestException(
        'attendanceLogId does not belong to the employee',
      );
    }
    if (log.date.getTime() !== input.date.getTime()) {
      throw new BadRequestException(
        'attendanceLogId date must match the overtime request date',
      );
    }
  }
}
