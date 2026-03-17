import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateAttendanceCorrectionRequestDto,
  RejectAttendanceCorrectionRequestDto,
  UpdateAttendanceCorrectionRequestDto,
} from '@repo/types';
import type { Request } from 'express';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { HrUserLifecycleService } from '../hr-user-lifecycle.service';
import { AttendanceReconciliationService } from './attendance-reconciliation.service';
import { normalizeDateOnly } from './attendance-date.util';
import { mapAttendanceCorrectionRequestResponse } from './attendance-request.mapper';
import { buildRequestId, parseOptionalDateTime } from './time-request.utils';

@Injectable()
export class AttendanceCorrectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: HrUserLifecycleService,
    private readonly reconciliation: AttendanceReconciliationService,
  ) {}

  async create(dto: CreateAttendanceCorrectionRequestDto) {
    const employee = await this.lifecycle.assertAttendanceAllowed(
      dto.employeeId,
    );
    const date = normalizeDateOnly(dto.date);
    const requestedCheckInAt = parseOptionalDateTime(dto.requestedCheckInAt);
    const requestedCheckOutAt = parseOptionalDateTime(dto.requestedCheckOutAt);

    this.validateCorrectionPayload({
      requestedCheckInAt,
      requestedCheckOutAt,
      requestedStatus: dto.requestedStatus ?? null,
    });

    const attendanceLogId = await this.resolveAttendanceLogId({
      employeeId: employee.id,
      attendanceLogId: dto.attendanceLogId ?? null,
      date,
    });

    const year = date.getUTCFullYear();
    const count = await this.prisma.attendanceCorrectionRequest.count({
      where: {
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    });

    const created = await this.prisma.attendanceCorrectionRequest.create({
      data: {
        requestId: buildRequestId('ATC', year, count + 1),
        employeeId: employee.id,
        attendanceLogId: attendanceLogId ?? undefined,
        date,
        requestedCheckInAt: requestedCheckInAt ?? undefined,
        requestedCheckOutAt: requestedCheckOutAt ?? undefined,
        requestedStatus: dto.requestedStatus ?? undefined,
        reason: dto.reason.trim(),
        notes: dto.notes ?? undefined,
        status: dto.submit ? 'PENDING' : 'DRAFT',
        submittedAt: dto.submit ? new Date() : null,
      },
    });

    return mapAttendanceCorrectionRequestResponse(created);
  }

  async list(filters: { employeeId?: string; status?: string }) {
    const employeeId = filters.employeeId
      ? (await this.lifecycle.assertAttendanceAllowed(filters.employeeId)).id
      : undefined;

    const requests = await this.prisma.attendanceCorrectionRequest.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return requests.map(mapAttendanceCorrectionRequestResponse);
  }

  async get(id: string) {
    const request = await this.prisma.attendanceCorrectionRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Attendance correction request not found');
    }
    return mapAttendanceCorrectionRequestResponse(request);
  }

  async update(id: string, dto: UpdateAttendanceCorrectionRequestDto) {
    const existing = await this.prisma.attendanceCorrectionRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Attendance correction request not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft attendance correction requests can be updated',
      );
    }

    const requestedCheckInAt = parseOptionalDateTime(dto.requestedCheckInAt);
    const requestedCheckOutAt = parseOptionalDateTime(dto.requestedCheckOutAt);
    const requestedStatus =
      dto.requestedStatus !== undefined
        ? dto.requestedStatus
        : existing.requestedStatus;

    this.validateCorrectionPayload({
      requestedCheckInAt:
        requestedCheckInAt === undefined
          ? existing.requestedCheckInAt
          : requestedCheckInAt,
      requestedCheckOutAt:
        requestedCheckOutAt === undefined
          ? existing.requestedCheckOutAt
          : requestedCheckOutAt,
      requestedStatus,
    });

    const updated = await this.prisma.attendanceCorrectionRequest.update({
      where: { id },
      data: {
        ...(requestedCheckInAt !== undefined ? { requestedCheckInAt } : {}),
        ...(requestedCheckOutAt !== undefined ? { requestedCheckOutAt } : {}),
        ...(dto.requestedStatus !== undefined
          ? { requestedStatus: dto.requestedStatus }
          : {}),
        ...(dto.reason !== undefined ? { reason: dto.reason.trim() } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });

    return mapAttendanceCorrectionRequestResponse(updated);
  }

  async submit(id: string) {
    const existing = await this.prisma.attendanceCorrectionRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Attendance correction request not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft attendance correction requests can be submitted',
      );
    }

    const updated = await this.prisma.attendanceCorrectionRequest.update({
      where: { id },
      data: {
        status: 'PENDING',
        submittedAt: existing.submittedAt ?? new Date(),
        rejectionReason: null,
        approvedById: null,
        approvedAt: null,
      },
    });

    return mapAttendanceCorrectionRequestResponse(updated);
  }

  async cancel(id: string) {
    const existing = await this.prisma.attendanceCorrectionRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Attendance correction request not found');
    }
    if (!['DRAFT', 'PENDING'].includes(existing.status)) {
      throw new BadRequestException(
        'Only draft or pending attendance correction requests can be cancelled',
      );
    }

    const updated = await this.prisma.attendanceCorrectionRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return mapAttendanceCorrectionRequestResponse(updated);
  }

  async approve(id: string, req: Request & { user?: AuthPrincipal }) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId) {
      throw new BadRequestException('Approver user id required');
    }

    const existing = await this.prisma.attendanceCorrectionRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Attendance correction request not found');
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending attendance correction requests can be approved',
      );
    }

    const currentLog = existing.attendanceLogId
      ? await this.prisma.attendanceLog.findUnique({
          where: { id: existing.attendanceLogId },
        })
      : await this.prisma.attendanceLog.findUnique({
          where: {
            employeeId_date: {
              employeeId: existing.employeeId,
              date: existing.date,
            },
          },
        });

    const nextCheckInAt = existing.requestedCheckInAt ?? currentLog?.checkInAt;
    const nextCheckOutAt =
      existing.requestedCheckOutAt ?? currentLog?.checkOutAt;
    if (
      nextCheckInAt &&
      nextCheckOutAt &&
      nextCheckOutAt.getTime() < nextCheckInAt.getTime()
    ) {
      throw new BadRequestException(
        'Requested check-out time must be on or after check-in time',
      );
    }
    if (
      !currentLog &&
      !nextCheckInAt &&
      !nextCheckOutAt &&
      !existing.requestedStatus
    ) {
      throw new BadRequestException(
        'Correction approval requires an existing attendance log or requested attendance values',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.attendanceCorrectionRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedById: approverId,
          approvedAt: new Date(),
          rejectionReason: null,
        },
      });

      if (currentLog) {
        await tx.attendanceLog.update({
          where: { id: currentLog.id },
          data: {
            ...(existing.requestedCheckInAt !== null
              ? { checkInAt: existing.requestedCheckInAt }
              : {}),
            ...(existing.requestedCheckOutAt !== null
              ? { checkOutAt: existing.requestedCheckOutAt }
              : {}),
            ...(existing.requestedStatus
              ? {
                  status: existing.requestedStatus,
                  isAutoCalculated: false,
                  reconciledAt: new Date(),
                }
              : { isAutoCalculated: true }),
          },
        });
        return;
      }

      await tx.attendanceLog.create({
        data: {
          employeeId: existing.employeeId,
          date: existing.date,
          checkInAt: existing.requestedCheckInAt,
          checkOutAt: existing.requestedCheckOutAt,
          status: existing.requestedStatus ?? 'PRESENT',
          isAutoCalculated: existing.requestedStatus ? false : true,
          reconciledAt: new Date(),
        },
      });
    });

    if (!existing.requestedStatus) {
      await this.reconciliation.reconcileDateForUser(
        existing.employeeId,
        existing.date,
      );
    }

    return this.get(id);
  }

  async reject(
    id: string,
    body: RejectAttendanceCorrectionRequestDto,
    req: Request & { user?: AuthPrincipal },
  ) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId) {
      throw new BadRequestException('Approver user id required');
    }

    const existing = await this.prisma.attendanceCorrectionRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Attendance correction request not found');
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending attendance correction requests can be rejected',
      );
    }

    const updated = await this.prisma.attendanceCorrectionRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason: body.rejectionReason.trim(),
      },
    });

    return mapAttendanceCorrectionRequestResponse(updated);
  }

  private async resolveAttendanceLogId(input: {
    employeeId: string;
    attendanceLogId: string | null;
    date: Date;
  }) {
    if (input.attendanceLogId) {
      const log = await this.prisma.attendanceLog.findFirst({
        where: {
          id: input.attendanceLogId,
          employeeId: input.employeeId,
        },
        select: { id: true, date: true },
      });
      if (!log) {
        throw new BadRequestException(
          'attendanceLogId does not belong to the employee',
        );
      }
      if (log.date.getTime() !== input.date.getTime()) {
        throw new BadRequestException(
          'attendanceLogId date must match the correction request date',
        );
      }
      return log.id;
    }

    const log = await this.prisma.attendanceLog.findUnique({
      where: {
        employeeId_date: {
          employeeId: input.employeeId,
          date: input.date,
        },
      },
      select: { id: true },
    });

    return log?.id ?? null;
  }

  private validateCorrectionPayload(input: {
    requestedCheckInAt: Date | null | undefined;
    requestedCheckOutAt: Date | null | undefined;
    requestedStatus: string | null | undefined;
  }) {
    if (
      input.requestedCheckInAt === undefined &&
      input.requestedCheckOutAt === undefined &&
      input.requestedStatus == null
    ) {
      throw new BadRequestException(
        'Attendance correction requests must change check-in, check-out, or status',
      );
    }

    if (
      input.requestedCheckInAt &&
      input.requestedCheckOutAt &&
      input.requestedCheckOutAt.getTime() < input.requestedCheckInAt.getTime()
    ) {
      throw new BadRequestException(
        'requestedCheckOutAt must be on or after requestedCheckInAt',
      );
    }
  }
}
