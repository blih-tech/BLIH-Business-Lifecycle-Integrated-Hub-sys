import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SendNotificationUseCase } from '../../../core/notifications/use-cases/send-notification.usecase';
import { UserProvisioningService } from '../../../core/users/user-provisioning.service';
import { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { OnboardingStatus } from '../../../platform/prisma/prisma-client';
import {
  recalculateJobMetrics,
  transitionApplicantStatus,
} from './use-cases/recruitment.usecase-helpers';

@Injectable()
export class RecruitmentTransitionService {
  private readonly logger = new Logger(RecruitmentTransitionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly provisioning: UserProvisioningService,
    private readonly notifications: SendNotificationUseCase,
  ) {}

  async provisionEmployeeFromAcceptedOffer(input: {
    offerId: string;
    changedById?: string;
  }) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: input.offerId },
      select: {
        id: true,
        status: true,
        jobId: true,
        applicantId: true,
        onboardingId: true,
        salary: true,
        currency: true,
        startDate: true,
        payFrequency: true,
        employmentType: true,
        bonus: true,
        equity: true,
        applicant: {
          select: {
            id: true,
            status: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            linkedinUrl: true,
            portfolioUrl: true,
            githubUrl: true,
            skills: true,
            yearsExperience: true,
            currentCompany: true,
            currentPosition: true,
            educationLevel: true,
            highestDegree: true,
            location: true,
            nationality: true,
            source: true,
            referredById: true,
            sourceSnapshot: true,
            customFieldValues: true,
            coverLetter: true,
            educations: {
              select: {
                institution: true,
                degree: true,
                field: true,
                startDate: true,
                endDate: true,
              },
            },
            experiences: {
              select: {
                company: true,
                title: true,
                startDate: true,
                endDate: true,
                description: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            positionId: true,
            employmentType: true,
            hiringManagerId: true,
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.status !== 'SENT') {
      throw new BadRequestException('Only sent offers can be accepted');
    }

    if (offer.onboardingId) {
      throw new ConflictException(
        'Accepted offer has already been provisioned',
      );
    }

    if (offer.applicant.status !== 'OFFER') {
      throw new BadRequestException(
        'Applicant must be in OFFER status before offer acceptance',
      );
    }

    const username = await this.provisioning.generateUniqueUsername({
      email: offer.applicant.email,
      firstName: offer.applicant.firstName,
      lastName: offer.applicant.lastName,
    });

    await this.provisioning.assertLocalIdentityAvailable({
      email: offer.applicant.email,
      username,
    });

    const keycloakId = await this.provisioning.createExternalUser({
      email: offer.applicant.email,
      username,
      firstName: offer.applicant.firstName,
      lastName: offer.applicant.lastName,
      phone: offer.applicant.phone,
    });

    const now = new Date();
    const joinDate = offer.startDate ?? now;
    const managerEmploymentId = await this.resolveManagerEmploymentId(
      offer.job.hiringManagerId,
    );

    let provisionedUserId: string | null = null;

    try {
      const updatedOffer = await this.prisma.$transaction(async (tx) => {
        const provisioned = await this.provisioning.createLocalUserGraph(tx, {
          keycloakId,
          username,
          email: offer.applicant.email,
          firstName: offer.applicant.firstName,
          lastName: offer.applicant.lastName,
          phone: offer.applicant.phone,
          metadata: this.buildRecruitmentMetadata(offer),
          lifecycleStatus: 'ONBOARDING',
          employment: {
            positionId: offer.job.positionId,
            employmentType:
              offer.employmentType ?? offer.job.employmentType ?? 'FULL_TIME',
            managerEmploymentId,
            hiredAt: joinDate,
            changeReason: 'Recruitment offer accepted',
            changedById: input.changedById ?? null,
          },
          compensation: {
            baseSalary: offer.salary,
            currency: offer.currency,
            payFrequency: offer.payFrequency ?? 'MONTHLY',
            bonusEligible: Number(offer.bonus ?? 0) > 0,
            bonusRate: null,
            effectiveFrom: joinDate,
            changeReason: 'Recruitment offer accepted',
            changedById: input.changedById ?? null,
          },
        });

        provisionedUserId = provisioned.user.id;

        const onboarding = await tx.onboarding.create({
          data: {
            employeeId: provisioned.employee.id,
            status: OnboardingStatus.NOT_STARTED,
            joinDate,
          },
        });

        const onboardingTasks = await tx.onboardingTask.findMany({
          select: { id: true },
        });
        if (onboardingTasks.length > 0) {
          await tx.onboardingChecklist.createMany({
            data: onboardingTasks.map((task) => ({
              onboardingId: onboarding.id,
              onboardingTaskId: task.id,
            })),
          });
        }

        await tx.offer.update({
          where: { id: offer.id },
          data: {
            status: 'ACCEPTED',
            respondedAt: now,
            onboardingId: onboarding.id,
          },
        });

        await transitionApplicantStatus(tx, {
          applicantId: offer.applicantId,
          currentStatus: offer.applicant.status,
          nextStatus: 'HIRED',
          notes: 'Offer accepted',
          changedById: input.changedById,
          at: now,
        });

        await recalculateJobMetrics(tx, offer.jobId);

        const persistedOffer = await tx.offer.findUniqueOrThrow({
          where: { id: offer.id },
        });

        return {
          ...persistedOffer,
          employeeId: provisioned.employee.id,
          userId: provisioned.user.id,
        };
      });

      await this.dispatchOnboardingInvitation({
        keycloakId,
        userId: provisionedUserId,
        email: offer.applicant.email,
        firstName: offer.applicant.firstName,
        onboardingId: updatedOffer.onboardingId,
        employeeId: updatedOffer.employeeId ?? null,
        offerId: updatedOffer.id,
        jobId: updatedOffer.jobId,
        applicantId: updatedOffer.applicantId,
        joinDate,
      });

      return updatedOffer;
    } catch (error: unknown) {
      await this.provisioning.cleanupExternalUser(keycloakId);
      this.provisioning.rethrowPersistenceError(error);
    }
  }

  private async resolveManagerEmploymentId(
    hiringManagerId: string | null,
  ): Promise<string | null> {
    if (!hiringManagerId) {
      return null;
    }

    const managerEmployment = await this.prisma.userEmployment.findFirst({
      where: {
        employee: {
          is: {
            userId: hiringManagerId,
          },
        },
      },
      select: { id: true },
    });

    return managerEmployment?.id ?? null;
  }

  private buildRecruitmentMetadata(offer: {
    id: string;
    applicantId: string;
    jobId: string;
    bonus: Prisma.Decimal | null;
    equity: Prisma.Decimal | null;
    applicant: {
      linkedinUrl: string | null;
      portfolioUrl: string | null;
      githubUrl: string | null;
      skills: string[];
      yearsExperience: number | null;
      currentCompany: string | null;
      currentPosition: string | null;
      educationLevel: string | null;
      highestDegree: string | null;
      source: string;
      referredById: string | null;
      sourceSnapshot: unknown;
      customFieldValues: unknown;
      coverLetter: string | null;
      educations: Array<{
        institution: string;
        degree: string;
        field: string;
        startDate: Date | null;
        endDate: Date | null;
      }>;
      experiences: Array<{
        company: string;
        title: string;
        startDate: Date | null;
        endDate: Date | null;
        description: string | null;
      }>;
    };
  }): Prisma.InputJsonValue {
    return {
      recruitment: {
        offerId: offer.id,
        jobId: offer.jobId,
        applicantId: offer.applicantId,
        links: {
          linkedinUrl: offer.applicant.linkedinUrl,
          portfolioUrl: offer.applicant.portfolioUrl,
          githubUrl: offer.applicant.githubUrl,
        },
        skills: offer.applicant.skills,
        experienceSummary: {
          yearsExperience: offer.applicant.yearsExperience,
          currentCompany: offer.applicant.currentCompany,
          currentPosition: offer.applicant.currentPosition,
          educationLevel: offer.applicant.educationLevel,
          highestDegree: offer.applicant.highestDegree,
        },
        experienceItems: offer.applicant.experiences.map((experience) => ({
          company: experience.company,
          title: experience.title,
          startDate: experience.startDate?.toISOString() ?? null,
          endDate: experience.endDate?.toISOString() ?? null,
          description: experience.description,
        })),
        educationItems: offer.applicant.educations.map((education) => ({
          institution: education.institution,
          degree: education.degree,
          field: education.field,
          startDate: education.startDate?.toISOString() ?? null,
          endDate: education.endDate?.toISOString() ?? null,
        })),
        bonusAmount: offer.bonus?.toString() ?? null,
        equityAmount: offer.equity?.toString() ?? null,
        source: offer.applicant.source,
        referredById: offer.applicant.referredById,
        sourceSnapshot: offer.applicant.sourceSnapshot ?? null,
        customFieldValues: offer.applicant.customFieldValues ?? null,
        coverLetter: offer.applicant.coverLetter,
      },
    } as Prisma.InputJsonValue;
  }

  private async dispatchOnboardingInvitation(input: {
    keycloakId: string;
    userId: string | null;
    email: string;
    firstName: string;
    onboardingId: string | null;
    employeeId: string | null;
    offerId: string;
    jobId: string;
    applicantId: string;
    joinDate: Date;
  }): Promise<void> {
    try {
      await this.provisioning.sendRequiredActionsEmail({
        keycloakId: input.keycloakId,
        actions: ['UPDATE_PASSWORD'],
        lifespanSeconds: 60 * 60 * 24 * 7,
      });
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          action: 'recruitment.onboarding.keycloak_invite.failure',
          keycloakId: input.keycloakId,
          offerId: input.offerId,
          error:
            error instanceof Error
              ? error.message
              : 'unknown keycloak invite failure',
        }),
      );
    }

    try {
      await this.notifications.execute({
        type: 'onboarding',
        priority: 'high',
        title: 'Welcome to BLIH',
        body: `Your account is ready. Complete your onboarding steps before ${input.joinDate.toISOString().slice(0, 10)}.`,
        userId: input.userId ?? undefined,
        recipients: [input.email],
        channels: ['email', 'in_app'],
        payload: {
          onboardingId: input.onboardingId,
          employeeId: input.employeeId,
          offerId: input.offerId,
          jobId: input.jobId,
          applicantId: input.applicantId,
          joinDate: input.joinDate.toISOString().slice(0, 10),
        },
      });
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          action: 'recruitment.onboarding.notification.failure',
          email: input.email,
          offerId: input.offerId,
          error:
            error instanceof Error
              ? error.message
              : 'unknown onboarding notification failure',
        }),
      );
    }
  }
}
