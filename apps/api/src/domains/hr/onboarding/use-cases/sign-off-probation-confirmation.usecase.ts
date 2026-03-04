import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationConfirmationResponse } from '../probation.mapper';

@Injectable()
export class SignOffProbationConfirmationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, body?: { signedOffAt?: string | null }) {
    const record = await this.prisma.probationConfirmation.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException('Probation confirmation not found');
    if (!record.hrCheckedAt) {
      throw new BadRequestException(
        'HR review is required before CEO sign-off',
      );
    }

    const signedOffAt = body?.signedOffAt
      ? new Date(body.signedOffAt)
      : new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const confirmation = await tx.probationConfirmation.update({
        where: { id },
        data: {
          ceoSignOffAt: signedOffAt,
          employeeNotifiedAt: record.employeeNotifiedAt ?? signedOffAt,
        },
      });

      const latestPlan = await tx.probationKpiPlan.findFirst({
        where: {
          employeeId: record.employeeId,
          status: { in: ['ACTIVE', 'DRAFT'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (record.verdict === 'CONFIRM') {
        await tx.userLifecycle.upsert({
          where: { employeeId: record.employeeId },
          update: {
            status: 'ACTIVE',
            onboardedAt: signedOffAt,
          },
          create: {
            employeeId: record.employeeId,
            status: 'ACTIVE',
            onboardedAt: signedOffAt,
          },
        });

        await tx.userEmployment.update({
          where: { employeeId: record.employeeId },
          data: {
            confirmedAt: signedOffAt,
          },
        });

        if (latestPlan) {
          await tx.probationKpiPlan.update({
            where: { id: latestPlan.id },
            data: { status: 'COMPLETED' },
          });
        }
      }

      if (record.verdict === 'EXTEND') {
        const extension = (record.extension ?? {}) as Record<string, unknown>;
        const newEndDate =
          typeof extension.newEndDate === 'string'
            ? new Date(extension.newEndDate)
            : null;
        if (!newEndDate) {
          throw new BadRequestException(
            'Extension confirmations must include extension.newEndDate',
          );
        }

        const extensionDays = Math.ceil(
          (newEndDate.getTime() - signedOffAt.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        if (extensionDays > 183) {
          throw new BadRequestException(
            'Probation extensions cannot exceed 6 months',
          );
        }

        await tx.userEmployment.update({
          where: { employeeId: record.employeeId },
          data: {
            probationEndAt: newEndDate,
          },
        });

        if (latestPlan) {
          await tx.probationKpiPlan.update({
            where: { id: latestPlan.id },
            data: {
              probationEnd: newEndDate,
              status: 'ACTIVE',
            },
          });
        }
      }

      if (record.verdict === 'TERMINATE') {
        await tx.userLifecycle.upsert({
          where: { employeeId: record.employeeId },
          update: {
            status: 'TERMINATED',
            terminatedAt: signedOffAt,
            terminationReason: (
              (record.termination ?? {}) as Record<string, unknown>
            ).reason as string | undefined,
          },
          create: {
            employeeId: record.employeeId,
            status: 'TERMINATED',
            terminatedAt: signedOffAt,
            terminationReason: (
              (record.termination ?? {}) as Record<string, unknown>
            ).reason as string | undefined,
          },
        });

        if (latestPlan) {
          await tx.probationKpiPlan.update({
            where: { id: latestPlan.id },
            data: { status: 'COMPLETED' },
          });
        }
      }

      return confirmation;
    });

    return mapProbationConfirmationResponse(updated);
  }
}
