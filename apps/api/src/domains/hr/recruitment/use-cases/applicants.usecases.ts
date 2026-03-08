import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  ApplicantListQueryDto,
  CreateApplicantDto,
  UpdateApplicantDto,
  UpdateApplicantStatusDto,
} from '../dto/applicant.dto';
import { RecruitmentNotificationService } from '../recruitment-notification.service';
import {
  applicantInclude,
  assertApplicantTransition,
  computeApplicantProfileScore,
  mapApplicant,
  normalizeEmail,
  normalizeSkillArray,
  recalculateJobMetrics,
  touchApplicantActivity,
} from './recruitment.usecase-helpers';

const dateOrUndefined = (value: string | null | undefined) =>
  value ? new Date(value) : undefined;

const decimalOrUndefined = (value: number | null | undefined) =>
  value == null ? undefined : value;

@Injectable()
export class CreateApplicantUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: RecruitmentNotificationService,
  ) {}

  async execute(dto: CreateApplicantDto, changedById?: string) {
    const submittedEmail = dto.email.trim();
    const normalizedEmail = normalizeEmail(submittedEmail);
    const [job, referredBy] = await Promise.all([
      this.prisma.job.findUnique({
        where: { id: dto.jobId },
        select: {
          id: true,
          title: true,
          status: true,
          createdById: true,
          requestForm: {
            select: {
              detailsForm: {
                select: {
                  applicationForm: { select: { id: true } },
                },
              },
            },
          },
        },
      }),
      dto.referredById
        ? this.prisma.user.findUnique({
            where: { id: dto.referredById },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'Applications are allowed only for published jobs',
      );
    }
    if (dto.referredById && !referredBy) {
      throw new BadRequestException(
        'referredById does not reference an existing user',
      );
    }

    const fallbackFormId = job.requestForm?.detailsForm?.applicationForm?.id;
    if (dto.applicationFormId && dto.applicationFormId !== fallbackFormId) {
      throw new BadRequestException(
        'applicationFormId does not belong to the selected job',
      );
    }

    const skills = normalizeSkillArray(dto.skills);
    const now = new Date();

    const applicant = await this.prisma
      .$transaction(async (tx) => {
        const created = await tx.applicant.create({
          data: {
            jobId: dto.jobId,
            applicationFormId: dto.applicationFormId ?? fallbackFormId,
            fullName: dto.fullName.trim(),
            email: submittedEmail,
            emailNormalized: normalizedEmail,
            phone: dto.phone ?? undefined,
            resumeUrl: dto.resumeUrl ?? undefined,
            linkedinUrl: dto.linkedinUrl ?? undefined,
            portfolioUrl: dto.portfolioUrl ?? undefined,
            githubUrl: dto.githubUrl ?? undefined,
            source: dto.source ?? 'COMPANY_SITE',
            referredById: dto.referredById ?? undefined,
            currentCompany: dto.currentCompany ?? undefined,
            currentPosition: dto.currentPosition ?? undefined,
            yearsExperience: dto.yearsExperience ?? undefined,
            location: dto.location ?? undefined,
            country: dto.country ?? undefined,
            city: dto.city ?? undefined,
            nationality: dto.nationality ?? undefined,
            expectedSalary: decimalOrUndefined(dto.expectedSalary),
            currentSalary: decimalOrUndefined(dto.currentSalary),
            educationLevel: dto.educationLevel ?? undefined,
            highestDegree: dto.highestDegree ?? undefined,
            skills,
            coverLetter: dto.coverLetter ?? undefined,
            sourceSnapshot:
              (dto.sourceSnapshot as Prisma.InputJsonValue | null) ?? undefined,
            customFieldValues:
              (dto.customFieldValues as Prisma.InputJsonValue | null) ??
              undefined,
            lastActivityAt: now,
            profileScore: computeApplicantProfileScore({
              yearsExperience: dto.yearsExperience ?? null,
              hasResume: !!dto.resumeUrl,
              skillsCount: skills.length,
              hasLinks:
                !!dto.linkedinUrl || !!dto.portfolioUrl || !!dto.githubUrl,
            }),
            educations: dto.educations
              ? {
                  create: dto.educations.map((education) => ({
                    institution: education.institution,
                    degree: education.degree,
                    field: education.field,
                    startDate: dateOrUndefined(education.startDate),
                    endDate: dateOrUndefined(education.endDate),
                  })),
                }
              : undefined,
            experiences: dto.experiences
              ? {
                  create: dto.experiences.map((experience) => ({
                    company: experience.company,
                    title: experience.title,
                    startDate: dateOrUndefined(experience.startDate),
                    endDate: dateOrUndefined(experience.endDate),
                    description: experience.description ?? undefined,
                  })),
                }
              : undefined,
            statusHistory: {
              create: {
                toStatus: 'APPLIED',
                changedById: changedById ?? undefined,
                changedAt: now,
              },
            },
          },
          include: applicantInclude,
        });

        await touchApplicantActivity(tx, created.id, now);
        await recalculateJobMetrics(tx, dto.jobId);
        return created;
      })
      .catch((error: unknown) => {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code?: string }).code === 'P2002'
        ) {
          throw new ConflictException(
            'Applicant already exists for this job and email',
          );
        }
        throw error;
      });

    await this.notifications.notifyUsers({
      userIds: [job.createdById],
      title: `New applicant for ${job.title}`,
      body: `${applicant.fullName} submitted an application.`,
      payload: {
        jobId: dto.jobId,
        applicantId: applicant.id,
      },
    });

    return mapApplicant(applicant);
  }
}

@Injectable()
export class ListApplicantsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ApplicantListQueryDto) {
    const list = await this.prisma.applicant.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
        ...(query.jobId ? { jobId: query.jobId } : {}),
        ...(query.email
          ? { emailNormalized: normalizeEmail(query.email) }
          : {}),
      },
      include: applicantInclude,
      orderBy: { createdAt: 'desc' },
    });

    return list.map((applicant) => mapApplicant(applicant));
  }
}

@Injectable()
export class GetApplicantUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
      include: applicantInclude,
    });
    if (!applicant) throw new NotFoundException('Applicant not found');
    return mapApplicant(applicant);
  }
}

@Injectable()
export class UpdateApplicantUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateApplicantDto) {
    const existing = await this.prisma.applicant.findUnique({
      where: { id },
      select: {
        id: true,
        jobId: true,
        email: true,
        applicationFormId: true,
        yearsExperience: true,
        resumeUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        githubUrl: true,
        skills: true,
      },
    });
    if (!existing) throw new NotFoundException('Applicant not found');

    if (dto.referredById !== undefined && dto.referredById !== null) {
      const referredBy = await this.prisma.user.findUnique({
        where: { id: dto.referredById },
        select: { id: true },
      });
      if (!referredBy) {
        throw new BadRequestException(
          'referredById does not reference an existing user',
        );
      }
    }

    if (dto.applicationFormId !== undefined && dto.applicationFormId !== null) {
      const form = await this.prisma.jobApplicationForm.findUnique({
        where: { id: dto.applicationFormId },
        select: {
          id: true,
          jobDetailsForm: {
            select: { requestForm: { select: { jobId: true } } },
          },
        },
      });
      const formJobId = form?.jobDetailsForm.requestForm.jobId;
      if (!form || formJobId !== existing.jobId) {
        throw new BadRequestException(
          'applicationFormId does not belong to the selected job',
        );
      }
    }

    const normalizedSkills =
      dto.skills === undefined ? undefined : normalizeSkillArray(dto.skills);
    const now = new Date();

    await this.prisma
      .$transaction(async (tx) => {
        await tx.applicant.update({
          where: { id },
          data: {
            ...(dto.jobId !== undefined && { jobId: dto.jobId }),
            ...(dto.applicationFormId !== undefined && {
              applicationFormId: dto.applicationFormId,
            }),
            ...(dto.fullName !== undefined && {
              fullName: dto.fullName.trim(),
            }),
            ...(dto.email !== undefined && {
              email: dto.email.trim(),
              emailNormalized: normalizeEmail(dto.email),
            }),
            ...(dto.phone !== undefined && { phone: dto.phone }),
            ...(dto.resumeUrl !== undefined && { resumeUrl: dto.resumeUrl }),
            ...(dto.linkedinUrl !== undefined && {
              linkedinUrl: dto.linkedinUrl,
            }),
            ...(dto.portfolioUrl !== undefined && {
              portfolioUrl: dto.portfolioUrl,
            }),
            ...(dto.githubUrl !== undefined && { githubUrl: dto.githubUrl }),
            ...(dto.source !== undefined && { source: dto.source }),
            ...(dto.referredById !== undefined && {
              referredById: dto.referredById,
            }),
            ...(dto.currentCompany !== undefined && {
              currentCompany: dto.currentCompany,
            }),
            ...(dto.currentPosition !== undefined && {
              currentPosition: dto.currentPosition,
            }),
            ...(dto.yearsExperience !== undefined && {
              yearsExperience: dto.yearsExperience,
            }),
            ...(dto.location !== undefined && { location: dto.location }),
            ...(dto.country !== undefined && { country: dto.country }),
            ...(dto.city !== undefined && { city: dto.city }),
            ...(dto.nationality !== undefined && {
              nationality: dto.nationality,
            }),
            ...(dto.expectedSalary !== undefined && {
              expectedSalary: decimalOrUndefined(dto.expectedSalary),
            }),
            ...(dto.currentSalary !== undefined && {
              currentSalary: decimalOrUndefined(dto.currentSalary),
            }),
            ...(dto.educationLevel !== undefined && {
              educationLevel: dto.educationLevel,
            }),
            ...(dto.highestDegree !== undefined && {
              highestDegree: dto.highestDegree,
            }),
            ...(normalizedSkills !== undefined && { skills: normalizedSkills }),
            ...(dto.coverLetter !== undefined && {
              coverLetter: dto.coverLetter,
            }),
            ...(dto.sourceSnapshot !== undefined && {
              sourceSnapshot:
                (dto.sourceSnapshot as Prisma.InputJsonValue | null) ??
                Prisma.DbNull,
            }),
            ...(dto.customFieldValues !== undefined && {
              customFieldValues:
                (dto.customFieldValues as Prisma.InputJsonValue | null) ??
                Prisma.DbNull,
            }),
            lastActivityAt: now,
            profileScore: computeApplicantProfileScore({
              yearsExperience:
                dto.yearsExperience ?? existing.yearsExperience ?? null,
              hasResume:
                dto.resumeUrl !== undefined
                  ? !!dto.resumeUrl
                  : !!existing.resumeUrl,
              skillsCount:
                normalizedSkills?.length ?? existing.skills?.length ?? 0,
              hasLinks:
                dto.linkedinUrl !== undefined ||
                dto.portfolioUrl !== undefined ||
                dto.githubUrl !== undefined
                  ? !!dto.linkedinUrl || !!dto.portfolioUrl || !!dto.githubUrl
                  : !!existing.linkedinUrl ||
                    !!existing.portfolioUrl ||
                    !!existing.githubUrl,
            }),
          },
        });

        if (dto.educations !== undefined) {
          await tx.applicantEducation.deleteMany({
            where: { applicantId: id },
          });
          if (dto.educations.length > 0) {
            await tx.applicantEducation.createMany({
              data: dto.educations.map((education) => ({
                applicantId: id,
                institution: education.institution,
                degree: education.degree,
                field: education.field,
                startDate: dateOrUndefined(education.startDate),
                endDate: dateOrUndefined(education.endDate),
              })),
            });
          }
        }

        if (dto.experiences !== undefined) {
          await tx.applicantExperience.deleteMany({
            where: { applicantId: id },
          });
          if (dto.experiences.length > 0) {
            await tx.applicantExperience.createMany({
              data: dto.experiences.map((experience) => ({
                applicantId: id,
                company: experience.company,
                title: experience.title,
                startDate: dateOrUndefined(experience.startDate),
                endDate: dateOrUndefined(experience.endDate),
                description: experience.description ?? undefined,
              })),
            });
          }
        }
      })
      .catch((error: unknown) => {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code?: string }).code === 'P2002'
        ) {
          throw new ConflictException(
            'Applicant already exists for this job and email',
          );
        }
        throw error;
      });

    const updated = await this.prisma.applicant.findUniqueOrThrow({
      where: { id },
      include: applicantInclude,
    });

    return mapApplicant(updated);
  }
}

@Injectable()
export class UpdateApplicantStatusUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateApplicantStatusDto,
    changedById?: string,
  ) {
    const existing = await this.prisma.applicant.findUnique({
      where: { id },
      select: { id: true, status: true, jobId: true },
    });
    if (!existing) throw new NotFoundException('Applicant not found');
    assertApplicantTransition(existing.status, dto.status);

    const now = new Date();
    const statusChanged = existing.status !== dto.status;
    const updated = await this.prisma.$transaction(async (tx) => {
      const data: Prisma.ApplicantUpdateInput = {
        status: dto.status,
        lastActivityAt: now,
      };

      if (dto.status === 'SHORTLISTED') data.shortlistedAt = now;
      if (dto.status === 'INTERVIEW') data.interviewAt = now;
      if (dto.status === 'OFFER') data.offerAt = now;
      if (dto.status === 'HIRED') data.hiredAt = now;
      if (dto.status === 'REJECTED') data.rejectedAt = now;

      const row = await tx.applicant.update({
        where: { id },
        data,
        include: applicantInclude,
      });

      if (statusChanged) {
        await tx.applicantStatusHistory.create({
          data: {
            applicantId: id,
            fromStatus: existing.status,
            toStatus: dto.status,
            notes: dto.notes ?? undefined,
            changedById: changedById ?? undefined,
            changedAt: now,
          },
        });
      }

      await touchApplicantActivity(tx, id, now);
      await recalculateJobMetrics(tx, existing.jobId);
      return row;
    });

    return mapApplicant(updated);
  }
}
