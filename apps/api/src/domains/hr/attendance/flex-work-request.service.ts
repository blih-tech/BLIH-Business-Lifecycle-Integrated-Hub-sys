import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateFlexWorkRequestDto,
  RejectFlexWorkRequestDto,
  UpdateFlexWorkRequestDto,
} from '@repo/types';
import type { Request } from 'express';
import { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { HrUserLifecycleService } from '../hr-user-lifecycle.service';
import { AttendanceCalendarService } from './attendance-calendar.service';
import { AttendanceReconciliationService } from './attendance-reconciliation.service';
import { mapFlexWorkRequestResponse } from './attendance-request.mapper';
import { enumerateDateRange, normalizeDateOnly } from './attendance-date.util';
import {
  buildRequestId,
  validateDateRange,
  validateMinuteWindow,
} from './time-request.utils';

@Injectable()
export class FlexWorkRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: HrUserLifecycleService,
    private readonly calendar: AttendanceCalendarService,
    private readonly reconciliation: AttendanceReconciliationService,
  ) {}

  async create(dto: CreateFlexWorkRequestDto) {
    const employee = await this.lifecycle.assertAttendanceAllowed(
      dto.employeeId,
    );
    const startDate = normalizeDateOnly(dto.startDate);
    const endDate = normalizeDateOnly(dto.endDate);

    await this.assertValidRequest({
      employeeId: employee.id,
      requestType: dto.requestType,
      startDate,
      endDate,
      requestedStartMinute: dto.requestedStartMinute ?? null,
      requestedEndMinute: dto.requestedEndMinute ?? null,
      currentId: null,
    });

    const year = startDate.getUTCFullYear();
    const count = await this.prisma.flexWorkRequest.count({
      where: {
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    });

    const created = await this.prisma.flexWorkRequest.create({
      data: {
        requestId: buildRequestId('FLX', year, count + 1),
        employeeId: employee.id,
        requestType: dto.requestType as never,
        startDate,
        endDate,
        requestedStartMinute: dto.requestedStartMinute ?? undefined,
        requestedEndMinute: dto.requestedEndMinute ?? undefined,
        reason: dto.reason.trim(),
        details:
          dto.details === undefined
            ? undefined
            : dto.details === null
              ? Prisma.JsonNull
              : (dto.details as Prisma.InputJsonValue),
        status: dto.submit ? 'PENDING' : 'DRAFT',
        submittedAt: dto.submit ? new Date() : null,
      },
    });

    return mapFlexWorkRequestResponse(created);
  }

  async list(filters: {
    employeeId?: string;
    status?: string;
    requestType?: string;
  }) {
    const employeeId = filters.employeeId
      ? (await this.lifecycle.assertAttendanceAllowed(filters.employeeId)).id
      : undefined;

    const requests = await this.prisma.flexWorkRequest.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
        ...(filters.requestType
          ? { requestType: filters.requestType as never }
          : {}),
      },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    });

    return requests.map(mapFlexWorkRequestResponse);
  }

  async get(id: string) {
    const request = await this.prisma.flexWorkRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Flex work request not found');
    }
    return mapFlexWorkRequestResponse(request);
  }

  async update(id: string, dto: UpdateFlexWorkRequestDto) {
    const existing = await this.prisma.flexWorkRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Flex work request not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft flex work requests can be updated',
      );
    }

    const startDate =
      dto.startDate !== undefined
        ? normalizeDateOnly(dto.startDate)
        : existing.startDate;
    const endDate =
      dto.endDate !== undefined
        ? normalizeDateOnly(dto.endDate)
        : existing.endDate;
    const requestedStartMinute =
      dto.requestedStartMinute !== undefined
        ? dto.requestedStartMinute
        : existing.requestedStartMinute;
    const requestedEndMinute =
      dto.requestedEndMinute !== undefined
        ? dto.requestedEndMinute
        : existing.requestedEndMinute;

    await this.assertValidRequest({
      employeeId: existing.employeeId,
      requestType: existing.requestType,
      startDate,
      endDate,
      requestedStartMinute,
      requestedEndMinute,
      currentId: existing.id,
    });

    const updated = await this.prisma.flexWorkRequest.update({
      where: { id },
      data: {
        ...(dto.startDate !== undefined ? { startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate } : {}),
        ...(dto.requestedStartMinute !== undefined
          ? { requestedStartMinute: dto.requestedStartMinute }
          : {}),
        ...(dto.requestedEndMinute !== undefined
          ? { requestedEndMinute: dto.requestedEndMinute }
          : {}),
        ...(dto.reason !== undefined ? { reason: dto.reason.trim() } : {}),
        ...(dto.details !== undefined
          ? {
              details:
                dto.details === null
                  ? Prisma.JsonNull
                  : (dto.details as Prisma.InputJsonValue),
            }
          : {}),
      },
    });

    return mapFlexWorkRequestResponse(updated);
  }

  async submit(id: string) {
    const existing = await this.prisma.flexWorkRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Flex work request not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft flex work requests can be submitted',
      );
    }

    const updated = await this.prisma.flexWorkRequest.update({
      where: { id },
      data: {
        status: 'PENDING',
        submittedAt: existing.submittedAt ?? new Date(),
        rejectionReason: null,
        approvedById: null,
        approvedAt: null,
      },
    });

    return mapFlexWorkRequestResponse(updated);
  }

  async cancel(id: string) {
    const existing = await this.prisma.flexWorkRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Flex work request not found');
    }
    if (!['DRAFT', 'PENDING'].includes(existing.status)) {
      throw new BadRequestException(
        'Only draft or pending flex work requests can be cancelled',
      );
    }

    const updated = await this.prisma.flexWorkRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return mapFlexWorkRequestResponse(updated);
  }

  async approve(id: string, req: Request & { user?: AuthPrincipal }) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId) {
      throw new BadRequestException('Approver user id required');
    }

    const existing = await this.prisma.flexWorkRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Flex work request not found');
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending flex work requests can be approved',
      );
    }

    const updated = await this.prisma.flexWorkRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    await this.reconciliation.reconcileRangeForUser(
      updated.employeeId,
      updated.startDate,
      updated.endDate,
    );

    return mapFlexWorkRequestResponse(updated);
  }

  async reject(
    id: string,
    body: RejectFlexWorkRequestDto,
    req: Request & { user?: AuthPrincipal },
  ) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId) {
      throw new BadRequestException('Approver user id required');
    }

    const existing = await this.prisma.flexWorkRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Flex work request not found');
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending flex work requests can be rejected',
      );
    }

    const updated = await this.prisma.flexWorkRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason: body.rejectionReason.trim(),
      },
    });

    return mapFlexWorkRequestResponse(updated);
  }

  private async assertValidRequest(input: {
    employeeId: string;
    requestType: string;
    startDate: Date;
    endDate: Date;
    requestedStartMinute: number | null;
    requestedEndMinute: number | null;
    currentId: string | null;
  }) {
    validateDateRange(input.startDate, input.endDate);

    if (input.requestType === 'FLEX_TIME') {
      validateMinuteWindow(
        input.requestedStartMinute,
        input.requestedEndMinute,
      );
    }

    const overlappingLeave = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId: input.employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: input.endDate },
        endDate: { gte: input.startDate },
      },
      select: { id: true },
    });
    if (overlappingLeave) {
      throw new BadRequestException(
        'Flex work requests cannot overlap active leave requests',
      );
    }

    const overlappingRequest = await this.prisma.flexWorkRequest.findFirst({
      where: {
        employeeId: input.employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: input.endDate },
        endDate: { gte: input.startDate },
        ...(input.currentId ? { NOT: { id: input.currentId } } : {}),
      },
      select: { id: true },
    });
    if (overlappingRequest) {
      throw new BadRequestException(
        'Overlapping flex work request already exists for the selected period',
      );
    }

    if (input.requestType === 'WORK_FROM_HOME') {
      let hasRemoteEligibleDay = false;
      for (const date of enumerateDateRange(input.startDate, input.endDate)) {
        const context = await this.calendar.getCalendarContext(
          input.employeeId,
          date,
        );
        if (
          context.schedule.day?.isWorkingDay &&
          context.schedule.day.remoteAllowed
        ) {
          hasRemoteEligibleDay = true;
          break;
        }
      }

      if (!hasRemoteEligibleDay) {
        throw new BadRequestException(
          'Selected period does not contain any remote-eligible working days',
        );
      }
    }
  }
}
