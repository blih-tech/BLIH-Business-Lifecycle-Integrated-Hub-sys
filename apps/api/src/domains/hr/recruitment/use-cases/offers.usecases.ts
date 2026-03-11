import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  CreateOfferDto,
  OfferListQueryDto,
  RespondOfferDto,
  SendOfferDto,
  UpdateOfferDto,
  WithdrawOfferDto,
} from '../dto/offer.dto';
import {
  mapOffer,
  recalculateJobMetrics,
  touchApplicantActivity,
} from './recruitment.usecase-helpers';

@Injectable()
export class CreateOfferUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateOfferDto, createdById?: string) {
    if (!createdById)
      throw new ForbiddenException('Authenticated user id required');

    const applicant = await this.prisma.applicant.findUnique({
      where: { id: dto.applicantId },
      select: { id: true, jobId: true, status: true },
    });
    if (!applicant) throw new NotFoundException('Applicant not found');
    if (applicant.jobId !== dto.jobId) {
      throw new BadRequestException('Applicant does not belong to job');
    }

    const now = new Date();
    const created = await this.prisma.offer
      .create({
        data: {
          jobId: dto.jobId,
          applicantId: dto.applicantId,
          createdById,
          status: 'DRAFT',
          salary: dto.salary ?? undefined,
          currency: dto.currency ?? undefined,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          payFrequency: dto.payFrequency ?? undefined,
          employmentType: dto.employmentType ?? undefined,
          bonus: dto.bonus ?? undefined,
          equity: dto.equity ?? undefined,
          offerLetterUrl: dto.offerLetterUrl ?? undefined,
          notes: dto.notes ?? undefined,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        },
      })
      .catch((error: unknown) => {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code?: string }).code === 'P2002'
        ) {
          throw new ConflictException(
            'Offer already exists for this job and applicant',
          );
        }
        throw error;
      });

    await this.prisma.$transaction(async (tx) => {
      await touchApplicantActivity(tx, dto.applicantId, now);
      await recalculateJobMetrics(tx, dto.jobId);
    });

    return mapOffer(created);
  }
}

@Injectable()
export class ListOffersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: OfferListQueryDto) {
    const rows = await this.prisma.offer.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
        ...(query.jobId ? { jobId: query.jobId } : {}),
        ...(query.applicantId ? { applicantId: query.applicantId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => mapOffer(row));
  }
}

@Injectable()
export class GetOfferUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const row = await this.prisma.offer.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Offer not found');
    return mapOffer(row);
  }
}

@Injectable()
export class UpdateOfferUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateOfferDto) {
    const existing = await this.prisma.offer.findUnique({
      where: { id },
      select: { id: true, status: true, jobId: true, applicantId: true },
    });
    if (!existing) throw new NotFoundException('Offer not found');
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft offers can be updated');
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data: {
        ...(dto.salary !== undefined && { salary: dto.salary }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.startDate !== undefined && {
          startDate: dto.startDate ? new Date(dto.startDate) : null,
        }),
        ...(dto.payFrequency !== undefined && {
          payFrequency: dto.payFrequency,
        }),
        ...(dto.employmentType !== undefined && {
          employmentType: dto.employmentType,
        }),
        ...(dto.bonus !== undefined && { bonus: dto.bonus }),
        ...(dto.equity !== undefined && { equity: dto.equity }),
        ...(dto.offerLetterUrl !== undefined && {
          offerLetterUrl: dto.offerLetterUrl,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.expiresAt !== undefined && {
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        }),
      },
    });

    return mapOffer(updated);
  }
}

@Injectable()
export class SendOfferUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: SendOfferDto) {
    const existing = await this.prisma.offer.findUnique({
      where: { id },
      select: { id: true, status: true, jobId: true, applicantId: true },
    });
    if (!existing) throw new NotFoundException('Offer not found');
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft offers can be sent');
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.offer.update({
        where: { id },
        data: {
          status: 'SENT',
          sentAt: now,
          ...(dto.expiresAt ? { expiresAt: new Date(dto.expiresAt) } : {}),
        },
      });

      await tx.applicant.update({
        where: { id: existing.applicantId },
        data: { status: 'OFFER', offerAt: now, lastActivityAt: now },
      });

      await touchApplicantActivity(tx, existing.applicantId, now);
      await recalculateJobMetrics(tx, existing.jobId);
      return row;
    });

    return mapOffer(updated);
  }
}

@Injectable()
export class RespondOfferUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: RespondOfferDto) {
    const existing = await this.prisma.offer.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        jobId: true,
        applicantId: true,
        onboardingId: true,
      },
    });
    if (!existing) throw new NotFoundException('Offer not found');
    if (existing.status !== 'SENT') {
      throw new BadRequestException('Only sent offers can be responded to');
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const nextStatus = dto.decision;
      const row = await tx.offer.update({
        where: { id },
        data: { status: nextStatus, respondedAt: now },
      });

      if (nextStatus === 'DECLINED') {
        await tx.applicant.update({
          where: { id: existing.applicantId },
          data: { status: 'REJECTED', rejectedAt: now, lastActivityAt: now },
        });
        await touchApplicantActivity(tx, existing.applicantId, now);
        await recalculateJobMetrics(tx, existing.jobId);
        return row;
      }

      // ACCEPTED => create Employee + Onboarding and mark applicant hired
      const employee = await tx.employee.create({ data: {} });
      const onboarding = await tx.onboarding.create({
        data: { employeeId: employee.id, status: 'PENDING' },
      });

      await tx.offer.update({
        where: { id },
        data: { onboardingId: onboarding.id },
      });

      await tx.applicant.update({
        where: { id: existing.applicantId },
        data: { status: 'HIRED', hiredAt: now, lastActivityAt: now },
      });

      await touchApplicantActivity(tx, existing.applicantId, now);
      await recalculateJobMetrics(tx, existing.jobId);

      // re-fetch for onboardingId
      return tx.offer.findUniqueOrThrow({ where: { id } });
    });

    return mapOffer(updated);
  }
}

@Injectable()
export class WithdrawOfferUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: WithdrawOfferDto) {
    const existing = await this.prisma.offer.findUnique({
      where: { id },
      select: { id: true, status: true, jobId: true, applicantId: true },
    });
    if (!existing) throw new NotFoundException('Offer not found');
    if (!['DRAFT', 'SENT'].includes(existing.status)) {
      throw new BadRequestException(
        'Only draft or sent offers can be withdrawn',
      );
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.offer.update({
        where: { id },
        data: {
          status: 'WITHDRAWN',
          respondedAt: existing.status === 'SENT' ? now : undefined,
          notes: dto.reason ? `${dto.reason}` : undefined,
        },
      });

      await touchApplicantActivity(tx, existing.applicantId, now);
      await recalculateJobMetrics(tx, existing.jobId);
      return row;
    });

    return mapOffer(updated);
  }
}
