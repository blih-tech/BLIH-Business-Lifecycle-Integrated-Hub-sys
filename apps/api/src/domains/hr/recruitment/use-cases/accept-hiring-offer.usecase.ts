import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AcceptOfferDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { CreateOnboardingChecklistUseCase } from '../../onboarding/use-cases/create-onboarding-checklist.usecase';
import { mapHiringDecisionResponse } from '../hiring-decision.mapper';

@Injectable()
export class AcceptHiringOfferUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createOnboardingChecklistUseCase: CreateOnboardingChecklistUseCase,
  ) {}

  async execute(id: string, dto: AcceptOfferDto) {
    if (!dto.accepted) {
      throw new BadRequestException(
        'This endpoint only supports accepted=true offer confirmations',
      );
    }

    const existing = await this.prisma.hiringDecision.findUnique({
      where: { id },
      include: {
        submittedBy: { select: { email: true } },
        onboarding: { select: { status: true, userId: true } },
      },
    });
    if (!existing) throw new NotFoundException('Hiring decision not found');
    if (existing.finalDecision !== 'OFFER_APPROVED') {
      throw new BadRequestException(
        'Only approved hiring decisions can move into onboarding',
      );
    }

    const employee = await this.prisma.user.findUnique({
      where: { id: dto.employeeId },
      select: { id: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    if (existing.employeeId && existing.employeeId !== dto.employeeId) {
      throw new BadRequestException(
        'Hiring decision is already linked to a different employee',
      );
    }

    const duplicateAccepted = await this.prisma.hiringDecision.findFirst({
      where: {
        recruitmentRequestId: existing.recruitmentRequestId,
        offerAccepted: true,
        id: { not: id },
      },
      select: { id: true },
    });
    if (duplicateAccepted) {
      throw new ConflictException(
        'A recruitment request cannot be linked to multiple accepted hires',
      );
    }

    const duplicateEmployee = await this.prisma.hiringDecision.findFirst({
      where: {
        employeeId: dto.employeeId,
        id: { not: id },
      },
      select: { id: true },
    });
    if (duplicateEmployee) {
      throw new ConflictException(
        'This employee is already linked to another hiring decision',
      );
    }

    const acceptedAt = dto.acceptedAt ? new Date(dto.acceptedAt) : new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      let onboardingId = dto.onboardingId ?? existing.onboardingId ?? null;

      if (onboardingId) {
        const onboarding = await tx.onboarding.findUnique({
          where: { id: onboardingId },
          select: { id: true, userId: true },
        });
        if (!onboarding) throw new NotFoundException('Onboarding not found');
        if (onboarding.userId !== dto.employeeId) {
          throw new BadRequestException(
            'Onboarding record must belong to the accepted employee',
          );
        }

        await tx.onboarding.update({
          where: { id: onboardingId },
          data: {
            status: 'IN_PROGRESS',
            startedAt: acceptedAt,
          },
        });
      } else {
        const onboarding = await tx.onboarding.create({
          data: {
            userId: dto.employeeId,
            status: 'IN_PROGRESS',
            startedAt: acceptedAt,
          },
          select: { id: true },
        });
        onboardingId = onboarding.id;
      }

      await tx.userLifecycle.upsert({
        where: { userId: dto.employeeId },
        update: {
          status: 'ONBOARDING',
        },
        create: {
          userId: dto.employeeId,
          status: 'ONBOARDING',
        },
      });

      await tx.candidate.update({
        where: { id: existing.candidateId },
        data: { status: 'HIRED' },
      });

      await tx.jobPosting.update({
        where: { id: existing.jobPostingId },
        data: { status: 'FILLED' },
      });

      await tx.recruitmentRequest.update({
        where: { id: existing.recruitmentRequestId },
        data: {
          status: 'COMPLETED',
          linkedUserId: dto.employeeId,
        },
      });

      return tx.hiringDecision.update({
        where: { id },
        data: {
          offerAccepted: true,
          acceptedAt,
          employeeId: dto.employeeId,
          onboardingId,
        },
        include: {
          submittedBy: { select: { email: true } },
          onboarding: { select: { status: true } },
        },
      });
    });

    // Create onboarding checklist from template when offer is accepted
    try {
      await this.createOnboardingChecklistUseCase.execute({
        userId: dto.employeeId,
        onboardingId: updated.onboardingId ?? undefined,
        hiringDecisionId: id,
        joinDate: acceptedAt.toISOString().slice(0, 10),
        generateTasksFromTemplate: true,
      });
    } catch {
      // Non-fatal: checklist can be created manually later
    }

    return mapHiringDecisionResponse(updated);
  }
}
