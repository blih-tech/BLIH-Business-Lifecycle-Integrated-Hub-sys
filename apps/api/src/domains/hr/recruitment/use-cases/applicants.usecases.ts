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

type ApplicantFieldConfig = {
  key: string;
  enabled: boolean;
  required: boolean;
};

type ApplicantSectionConfig = {
  key: string;
  enabled: boolean;
  required: boolean;
};

type CustomFieldConfig = {
  customFieldId: string;
  required: boolean;
};

const hasValue = (value: unknown) => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return false;
};

const applicantFieldValue = (
  key: string,
  payload: {
    phone: string | null | undefined;
    linkedinUrl: string | null | undefined;
    portfolioUrl: string | null | undefined;
    githubUrl: string | null | undefined;
    expectedSalary: number | null | undefined;
    coverLetter: string | null | undefined;
  },
) => {
  switch (key) {
    case 'PHONE':
      return payload.phone;
    case 'LINKEDIN_URL':
      return payload.linkedinUrl;
    case 'PORTFOLIO_URL':
      return payload.portfolioUrl;
    case 'GITHUB_URL':
      return payload.githubUrl;
    case 'EXPECTED_SALARY':
      return payload.expectedSalary;
    case 'COVER_LETTER':
      return payload.coverLetter;
    default:
      return undefined;
  }
};

const toObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

const assertRequiredFormFields = (input: {
  applicantFields: ApplicantFieldConfig[];
  sections: ApplicantSectionConfig[];
  customFields: CustomFieldConfig[];
  payload: {
    firstName: string | null | undefined;
    lastName: string | null | undefined;
    email: string | null | undefined;
    phone: string | null | undefined;
    resumeUrl: string | null | undefined;
    linkedinUrl: string | null | undefined;
    portfolioUrl: string | null | undefined;
    githubUrl: string | null | undefined;
    expectedSalary: number | null | undefined;
    coverLetter: string | null | undefined;
    educationsCount: number;
    experiencesCount: number;
    skills: string[] | null | undefined;
    customFieldValues: unknown;
  };
}) => {
  const missingCoreFields = [
    ['firstName', input.payload.firstName],
    ['lastName', input.payload.lastName],
    ['email', input.payload.email],
    ['resumeUrl', input.payload.resumeUrl],
  ]
    .filter((entry) => !hasValue(entry[1]))
    .map((entry) => entry[0]);

  const missingApplicantFields = input.applicantFields
    .filter((field) => field.enabled && field.required)
    .filter((field) => !hasValue(applicantFieldValue(field.key, input.payload)))
    .map((field) => field.key);

  const missingSections = input.sections
    .filter((section) => section.enabled && section.required)
    .filter((section) => {
      if (section.key === 'EDUCATION') return input.payload.educationsCount < 1;
      if (section.key === 'EXPERIENCE')
        return input.payload.experiencesCount < 1;
      return false;
    })
    .map((section) => section.key);

  const customFieldValues = toObject(input.payload.customFieldValues) ?? {};
  const missingCustomFields = input.customFields
    .filter((field) => field.required)
    .filter((field) => !hasValue(customFieldValues[field.customFieldId]))
    .map((field) => field.customFieldId);

  if (
    missingCoreFields.length ||
    missingApplicantFields.length ||
    missingSections.length ||
    missingCustomFields.length
  ) {
    const details = [
      ...(missingCoreFields.length
        ? [`coreFields: ${missingCoreFields.join(', ')}`]
        : []),
      ...(missingApplicantFields.length
        ? [`applicantFields: ${missingApplicantFields.join(', ')}`]
        : []),
      ...(missingSections.length
        ? [`sections: ${missingSections.join(', ')}`]
        : []),
      ...(missingCustomFields.length
        ? [`customFields: ${missingCustomFields.join(', ')}`]
        : []),
    ].join('; ');
    throw new BadRequestException(
      `Missing required application fields (${details})`,
    );
  }
};

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
          applicationForm: {
            select: {
              id: true,
              applicantFields: {
                select: {
                  key: true,
                  enabled: true,
                  required: true,
                },
              },
              sections: {
                select: {
                  key: true,
                  enabled: true,
                  required: true,
                },
              },
              customFields: {
                select: {
                  customFieldId: true,
                  required: true,
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

    const fallbackFormId = job.applicationForm?.id;
    if (dto.applicationFormId && dto.applicationFormId !== fallbackFormId) {
      throw new BadRequestException(
        'applicationFormId does not belong to the selected job',
      );
    }

    const skills = normalizeSkillArray(dto.skills);
    assertRequiredFormFields({
      applicantFields: job.applicationForm?.applicantFields ?? [],
      sections: job.applicationForm?.sections ?? [],
      customFields: job.applicationForm?.customFields ?? [],
      payload: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        resumeUrl: dto.resumeUrl,
        linkedinUrl: dto.linkedinUrl,
        portfolioUrl: dto.portfolioUrl,
        githubUrl: dto.githubUrl,
        expectedSalary: dto.expectedSalary,
        coverLetter: dto.coverLetter,
        educationsCount: dto.educations?.length ?? 0,
        experiencesCount: dto.experiences?.length ?? 0,
        skills,
        customFieldValues: dto.customFieldValues,
      },
    });

    const now = new Date();

    const applicant = await this.prisma
      .$transaction(async (tx) => {
        const created = await tx.applicant.create({
          data: {
            jobId: dto.jobId,
            applicationFormId: dto.applicationFormId ?? fallbackFormId,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
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
      body: `${applicant.firstName} ${applicant.lastName} submitted an application.`,
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
        firstName: true,
        lastName: true,
        phone: true,
        applicationFormId: true,
        currentCompany: true,
        currentPosition: true,
        yearsExperience: true,
        location: true,
        country: true,
        city: true,
        nationality: true,
        expectedSalary: true,
        currentSalary: true,
        educationLevel: true,
        highestDegree: true,
        resumeUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        githubUrl: true,
        skills: true,
        coverLetter: true,
        customFieldValues: true,
        _count: {
          select: {
            educations: true,
            experiences: true,
          },
        },
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

    const normalizedSkills =
      dto.skills === undefined ? undefined : normalizeSkillArray(dto.skills);
    const targetJobId = dto.jobId ?? existing.jobId;
    const targetJob = await this.prisma.job.findUnique({
      where: { id: targetJobId },
      select: {
        id: true,
        applicationForm: {
          select: { id: true },
        },
      },
    });
    if (!targetJob) {
      throw new BadRequestException('jobId does not reference an existing job');
    }

    let resolvedApplicationFormId = existing.applicationFormId;
    if (dto.applicationFormId !== undefined) {
      resolvedApplicationFormId = dto.applicationFormId;
    } else if (dto.jobId !== undefined) {
      resolvedApplicationFormId = targetJob.applicationForm?.id ?? null;
    }

    let resolvedForm: {
      id: string;
      jobId: string;
      applicantFields: ApplicantFieldConfig[];
      sections: ApplicantSectionConfig[];
      customFields: CustomFieldConfig[];
    } | null = null;

    if (resolvedApplicationFormId) {
      const form = await this.prisma.jobApplicationForm.findUnique({
        where: { id: resolvedApplicationFormId },
        select: {
          id: true,
          jobId: true,
          applicantFields: {
            select: {
              key: true,
              enabled: true,
              required: true,
            },
          },
          sections: {
            select: {
              key: true,
              enabled: true,
              required: true,
            },
          },
          customFields: {
            select: {
              customFieldId: true,
              required: true,
            },
          },
        },
      });
      if (!form || form.jobId !== targetJobId) {
        throw new BadRequestException(
          'applicationFormId does not belong to the selected job',
        );
      }
      resolvedForm = form;
    }

    const mergedPayload = {
      firstName: dto.firstName ?? existing.firstName,
      lastName: dto.lastName ?? existing.lastName,
      email: dto.email ?? existing.email,
      phone: dto.phone !== undefined ? dto.phone : existing.phone,
      resumeUrl:
        dto.resumeUrl !== undefined ? dto.resumeUrl : existing.resumeUrl,
      linkedinUrl:
        dto.linkedinUrl !== undefined ? dto.linkedinUrl : existing.linkedinUrl,
      portfolioUrl:
        dto.portfolioUrl !== undefined
          ? dto.portfolioUrl
          : existing.portfolioUrl,
      githubUrl:
        dto.githubUrl !== undefined ? dto.githubUrl : existing.githubUrl,
      expectedSalary:
        dto.expectedSalary !== undefined
          ? dto.expectedSalary
          : existing.expectedSalary == null
            ? null
            : Number(existing.expectedSalary),
      coverLetter:
        dto.coverLetter !== undefined ? dto.coverLetter : existing.coverLetter,
      educationsCount:
        dto.educations !== undefined
          ? dto.educations.length
          : existing._count.educations,
      experiencesCount:
        dto.experiences !== undefined
          ? dto.experiences.length
          : existing._count.experiences,
      skills: normalizedSkills ?? existing.skills ?? [],
      customFieldValues:
        dto.customFieldValues !== undefined
          ? dto.customFieldValues
          : existing.customFieldValues,
    };

    assertRequiredFormFields({
      applicantFields: resolvedForm?.applicantFields ?? [],
      sections: resolvedForm?.sections ?? [],
      customFields: resolvedForm?.customFields ?? [],
      payload: mergedPayload,
    });

    const now = new Date();

    await this.prisma
      .$transaction(async (tx) => {
        const persistedSkillCount =
          normalizedSkills?.length ??
          (Array.isArray(existing.skills) ? existing.skills.length : null) ??
          (await tx.applicant
            .findUnique({
              where: { id },
              select: { skills: true },
            })
            .then((row) => row?.skills?.length ?? 0));

        await tx.applicant.update({
          where: { id },
          data: {
            ...(dto.jobId !== undefined && { jobId: targetJobId }),
            ...((dto.applicationFormId !== undefined ||
              dto.jobId !== undefined) && {
              applicationFormId: resolvedApplicationFormId,
            }),
            ...(dto.firstName !== undefined && {
              firstName: dto.firstName.trim(),
            }),
            ...(dto.lastName !== undefined && {
              lastName: dto.lastName.trim(),
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
              skillsCount: persistedSkillCount,
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

      if (dto.status === 'SCREENING') data.screeningAt = now;
      if (dto.status === 'SHORTLISTED') data.shortlistedAt = now;
      if (dto.status === 'INTERVIEW') data.interviewAt = now;
      if (dto.status === 'OFFER') data.offerAt = now;
      if (dto.status === 'HIRED') data.hiredAt = now;
      if (dto.status === 'REJECTED') data.rejectedAt = now;
      if (dto.status === 'WITHDRAWN') data.withdrawnAt = now;

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
