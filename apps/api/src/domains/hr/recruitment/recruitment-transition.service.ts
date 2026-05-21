import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SendNotificationUseCase } from '../../../core/notifications/use-cases/send-notification.usecase';
import { UserProvisioningService } from '../../../core/users/user-provisioning.service';
import { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import {
  recalculateJobMetrics,
  transitionApplicantStatus,
} from './use-cases/recruitment.usecase-helpers';
import type { HireApplicantDto } from './dto/applicant.dto';

@Injectable()
export class RecruitmentTransitionService {
  private readonly logger = new Logger(RecruitmentTransitionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly provisioning: UserProvisioningService,
    private readonly notifications: SendNotificationUseCase,
  ) {}

  async hireApplicant(
    applicantId: string,
    dto: HireApplicantDto,
    changedById?: string,
  ) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
      include: {
        offers: {
          where: { status: 'ACCEPTED' },
        },
        job: true,
        educations: true,
        experiences: true,
      },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    if (applicant.offers.length === 0) {
      throw new BadRequestException(
        'Only applicants with accepted offers can be hired.',
      );
    }

    const offer = applicant.offers[0];

    // Determine primary email and phone properties matching DTO preferences
    const primaryEmail =
      dto.isCompanyEmailPrimary && dto.companyEmail
        ? dto.companyEmail
        : applicant.email;
    const primaryPhone =
      dto.isCompanyPhonePrimary && dto.companyPhone
        ? dto.companyPhone
        : applicant.phone;

    const username = await this.provisioning.generateUniqueUsername({
      email: primaryEmail,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
    });

    await this.provisioning.assertLocalIdentityAvailable({
      email: primaryEmail,
      username,
    });

    const keycloakId = await this.provisioning.createExternalUser({
      email: primaryEmail,
      username,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      phone: primaryPhone ?? undefined,
    });

    const now = new Date();
    const joinDate = offer.startDate ?? now;
    const managerEmploymentId = await this.resolveManagerEmploymentId(
      applicant.job.hiringManagerId,
    );

    let provisionedUserId: string | null = null;
    let provisionedEmployeeId: string | null = null;

    try {
      const hiredTransactionResult = await this.prisma.$transaction(
        async (tx) => {
          const provisioned = await this.provisioning.createLocalUserGraph(tx, {
            keycloakId,
            username,
            email: primaryEmail,
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            phone: primaryPhone,
            metadata: this.buildRecruitmentMetadata(offer, applicant),
            lifecycleStatus: 'ONBOARDING',
            employment: {
              positionId: applicant.job.positionId,
              employmentType:
                offer.employmentType ??
                applicant.job.employmentType ??
                'FULL_TIME',
              managerEmploymentId,
              hiredAt: joinDate,
              changeReason: 'Recruitment offer accepted',
              changedById: changedById ?? null,
            },
            compensation: {
              baseSalary: offer.salary,
              currency: offer.currency,
              payFrequency: offer.payFrequency ?? 'MONTHLY',
              bonusEligible: Number(offer.bonus ?? 0) > 0,
              bonusRate: null,
              effectiveFrom: joinDate,
              changeReason: 'Recruitment offer accepted',
              changedById: changedById ?? null,
            },
          });

          provisionedUserId = provisioned.user.id;
          provisionedEmployeeId = provisioned.employee.id;

          // Connect applicant profile to new Employee
          await tx.applicant.update({
            where: { id: applicantId },
            data: {
              employee: {
                connect: { id: provisioned.employee.id },
              },
            },
          });

          await transitionApplicantStatus(tx, {
            applicantId: applicantId,
            currentStatus: applicant.status,
            nextStatus: 'HIRED',
            notes: 'Hired by HR User Creation Process',
            changedById: changedById,
            at: now,
          });

          await recalculateJobMetrics(tx, applicant.jobId);

          // ── Auto-create Onboarding record and checklist ──────────────
          const allTasks = await tx.onboardingTask.findMany({
            orderBy: { createdAt: 'asc' },
          });

          const onboarding = await tx.onboarding.create({
            data: {
              employeeId: provisioned.employee.id,
              status: 'IN_PROGRESS',
              startedAt: joinDate,
            },
          });

          const defaultDueDate = new Date(joinDate);
          defaultDueDate.setDate(defaultDueDate.getDate() + 14);

          for (const task of allTasks) {
            const instance = await tx.onboardingTaskInstance.create({
              data: {
                title: task.title,
                description: task.description,
                taskType: task.taskType,
                targetDataModel: task.targetDataModel,
                requiresHrVerification: task.requiresHrVerification,
              },
            });

            await tx.onboardingChecklist.create({
              data: {
                onboardingId: onboarding.id,
                taskInstanceId: instance.id,
                status: 'TODO',
                dueDate: defaultDueDate,
                isRequired: true,
              },
            });
          }

          // Link offer to the new onboarding record
          await tx.offer.update({
            where: { id: offer.id },
            data: { onboardingId: onboarding.id },
          });

          this.logger.log(
            JSON.stringify({
              action: 'recruitment.onboarding.auto_created',
              onboardingId: onboarding.id,
              employeeId: provisioned.employee.id,
              offerId: offer.id,
              checklistCount: allTasks.length,
            }),
          );

          return {
            employeeId: provisioned.employee.id,
            userId: provisioned.user.id,
            applicantId: applicantId,
            jobId: applicant.jobId,
            onboardingId: onboarding.id,
          };
        },
      );

      await this.dispatchWelcomeInvitation({
        keycloakId,
        userId: provisionedUserId,
        email: primaryEmail,
        firstName: applicant.firstName,
        employeeId: provisionedEmployeeId,
        jobId: hiredTransactionResult.jobId,
        applicantId: hiredTransactionResult.applicantId,
        onboardingId: hiredTransactionResult.onboardingId,
      });

      return hiredTransactionResult;
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

  private buildRecruitmentMetadata(
    offer: {
      id: string;
      bonus: Prisma.Decimal | null;
      equity: Prisma.Decimal | null;
    },
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
    },
  ): Prisma.InputJsonValue {
    return {
      recruitment: {
        offerId: offer.id,
        links: {
          linkedinUrl: applicant.linkedinUrl,
          portfolioUrl: applicant.portfolioUrl,
          githubUrl: applicant.githubUrl,
        },
        skills: applicant.skills,
        experienceSummary: {
          yearsExperience: applicant.yearsExperience,
          currentCompany: applicant.currentCompany,
          currentPosition: applicant.currentPosition,
          educationLevel: applicant.educationLevel,
          highestDegree: applicant.highestDegree,
        },
        experienceItems: applicant.experiences.map((experience) => ({
          company: experience.company,
          title: experience.title,
          startDate: experience.startDate?.toISOString() ?? null,
          endDate: experience.endDate?.toISOString() ?? null,
          description: experience.description,
        })),
        educationItems: applicant.educations.map((education) => ({
          institution: education.institution,
          degree: education.degree,
          field: education.field,
          startDate: education.startDate?.toISOString() ?? null,
          endDate: education.endDate?.toISOString() ?? null,
        })),
        bonusAmount: offer.bonus?.toString() ?? null,
        equityAmount: offer.equity?.toString() ?? null,
        source: applicant.source,
        referredById: applicant.referredById,
        sourceSnapshot: applicant.sourceSnapshot ?? null,
        customFieldValues: applicant.customFieldValues ?? null,
        coverLetter: applicant.coverLetter,
      },
    } as Prisma.InputJsonValue;
  }

  private async dispatchWelcomeInvitation(input: {
    keycloakId: string;
    userId: string | null;
    email: string;
    firstName: string;
    employeeId: string | null;
    jobId: string;
    applicantId: string;
    onboardingId: string;
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
        body: `Your account is ready. Log in to complete your onboarding tasks.`,
        userId: input.userId ?? undefined,
        recipients: [input.email],
        channels: ['email', 'in_app'],
        payload: {
          employeeId: input.employeeId,
          jobId: input.jobId,
          applicantId: input.applicantId,
          onboardingId: input.onboardingId,
        },
      });
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          action: 'recruitment.onboarding.notification.failure',
          email: input.email,
          error:
            error instanceof Error
              ? error.message
              : 'unknown onboarding notification failure',
        }),
      );
    }
  }
}
