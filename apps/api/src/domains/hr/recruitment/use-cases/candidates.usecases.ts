import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  CandidateListQueryDto,
  CreateCandidateDto,
  UpdateCandidateDto,
} from '../dto/candidate.dto';
import {
  mapCandidate,
  normalizeEmail,
  splitFullName,
  touchCandidateActivity,
  computeCandidateProfileScore,
} from './recruitment.usecase-helpers';

@Injectable()
export class CreateCandidateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateCandidateDto) {
    const normalizedEmail = normalizeEmail(dto.email);
    const now = new Date();

    const candidate = await this.prisma.candidate.create({
      data: {
        fullName: `${dto.firstName} ${dto.lastName}`.trim(),
        email: normalizedEmail,
        phone: dto.phone ?? undefined,
        yearsExperience: dto.yearsExperience ?? undefined,
        linkedinUrl: dto.linkedinUrl ?? undefined,
        portfolioUrl: dto.portfolioUrl ?? undefined,
        githubUrl: dto.githubUrl ?? undefined,
        source: dto.source ?? 'COMPANY_SITE',
        referredBy: dto.referredById ?? undefined,
        cvUrl: dto.resumeUrl ?? undefined,
        location: dto.location ?? undefined,
        country: dto.country ?? undefined,
        city: dto.city ?? undefined,
        nationality: dto.nationality ?? undefined,
        expectedSalary: dto.expectedSalary ?? undefined,
        currentSalary: dto.currentSalary ?? undefined,
        educationLevel: dto.educationLevel ?? undefined,
        highestDegree: dto.highestDegree ?? undefined,
        lastActivityAt: now,
        profileScore: computeCandidateProfileScore({
          yearsExperience: dto.yearsExperience ?? null,
          hasResume: !!dto.resumeUrl,
          skillsCount: dto.skills?.length ?? 0,
          hasLinks: !!dto.linkedinUrl || !!dto.portfolioUrl || !!dto.githubUrl,
        }),
        candidateSkills: dto.skills
          ? {
              create: dto.skills.map((skill) => ({
                name: skill.name,
                level: skill.level ?? undefined,
                years: skill.years ?? undefined,
              })),
            }
          : undefined,
        educations: dto.educations
          ? {
              create: dto.educations.map((education) => ({
                institution: education.institution,
                degree: education.degree,
                field: education.field,
                startDate: education.startDate
                  ? new Date(education.startDate)
                  : undefined,
                endDate: education.endDate
                  ? new Date(education.endDate)
                  : undefined,
              })),
            }
          : undefined,
        experiences: dto.experiences
          ? {
              create: dto.experiences.map((experience) => ({
                company: experience.company,
                title: experience.title,
                startDate: experience.startDate
                  ? new Date(experience.startDate)
                  : undefined,
                endDate: experience.endDate
                  ? new Date(experience.endDate)
                  : undefined,
                description: experience.description ?? undefined,
              })),
            }
          : undefined,
      },
      include: {
        candidateSkills: { orderBy: { name: 'asc' } },
        educations: { orderBy: { startDate: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
      },
    });

    return mapCandidate(candidate);
  }
}

@Injectable()
export class ListCandidatesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: CandidateListQueryDto) {
    const list = await this.prisma.candidate.findMany({
      where: {
        ...(query.email ? { email: normalizeEmail(query.email) } : {}),
      },
      include: {
        candidateSkills: { orderBy: { name: 'asc' } },
        educations: { orderBy: { startDate: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((candidate) => mapCandidate(candidate));
  }
}

@Injectable()
export class GetCandidateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        candidateSkills: { orderBy: { name: 'asc' } },
        educations: { orderBy: { startDate: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
      },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return mapCandidate(candidate);
  }
}

@Injectable()
export class UpdateCandidateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateCandidateDto) {
    const existing = await this.prisma.candidate.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        fullName: true,
        yearsExperience: true,
        cvUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        githubUrl: true,
      },
    });
    const existingName = splitFullName(existing.fullName);
    const nextFirstName = dto.firstName ?? existingName.firstName;
    const nextLastName = dto.lastName ?? existingName.lastName;

    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.candidate.update({
        where: { id },
        data: {
          ...((dto.firstName !== undefined || dto.lastName !== undefined) && {
            fullName: `${nextFirstName} ${nextLastName}`.trim(),
          }),
          ...(dto.email !== undefined && {
            email: normalizeEmail(dto.email),
          }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.yearsExperience !== undefined && {
            yearsExperience: dto.yearsExperience,
          }),
          ...(dto.linkedinUrl !== undefined && {
            linkedinUrl: dto.linkedinUrl,
          }),
          ...(dto.portfolioUrl !== undefined && {
            portfolioUrl: dto.portfolioUrl,
          }),
          ...(dto.githubUrl !== undefined && { githubUrl: dto.githubUrl }),
          ...(dto.source !== undefined && { source: dto.source }),
          ...(dto.referredById !== undefined && {
            referredBy: dto.referredById,
          }),
          ...(dto.resumeUrl !== undefined && { cvUrl: dto.resumeUrl }),
          ...(dto.location !== undefined && { location: dto.location }),
          ...(dto.country !== undefined && { country: dto.country }),
          ...(dto.city !== undefined && { city: dto.city }),
          ...(dto.nationality !== undefined && {
            nationality: dto.nationality,
          }),
          ...(dto.expectedSalary !== undefined && {
            expectedSalary: dto.expectedSalary,
          }),
          ...(dto.currentSalary !== undefined && {
            currentSalary: dto.currentSalary,
          }),
          ...(dto.educationLevel !== undefined && {
            educationLevel: dto.educationLevel,
          }),
          ...(dto.highestDegree !== undefined && {
            highestDegree: dto.highestDegree,
          }),
          lastActivityAt: now,
          profileScore: computeCandidateProfileScore({
            yearsExperience:
              dto.yearsExperience ?? existing.yearsExperience ?? null,
            hasResume:
              dto.resumeUrl !== undefined ? !!dto.resumeUrl : !!existing.cvUrl,
            skillsCount: dto.skills?.length ?? null,
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

      if (dto.skills) {
        await tx.candidateSkill.deleteMany({ where: { candidateId: id } });
        if (dto.skills.length > 0) {
          await tx.candidateSkill.createMany({
            data: dto.skills.map((skill) => ({
              candidateId: id,
              name: skill.name,
              level: skill.level ?? undefined,
              years: skill.years ?? undefined,
            })),
          });
        }
      }

      if (dto.educations) {
        await tx.candidateEducation.deleteMany({ where: { candidateId: id } });
        if (dto.educations.length > 0) {
          await tx.candidateEducation.createMany({
            data: dto.educations.map((education) => ({
              candidateId: id,
              institution: education.institution,
              degree: education.degree,
              field: education.field,
              startDate: education.startDate
                ? new Date(education.startDate)
                : undefined,
              endDate: education.endDate
                ? new Date(education.endDate)
                : undefined,
            })),
          });
        }
      }

      if (dto.experiences) {
        await tx.candidateExperience.deleteMany({
          where: { candidateId: id },
        });
        if (dto.experiences.length > 0) {
          await tx.candidateExperience.createMany({
            data: dto.experiences.map((experience) => ({
              candidateId: id,
              company: experience.company,
              title: experience.title,
              startDate: experience.startDate
                ? new Date(experience.startDate)
                : undefined,
              endDate: experience.endDate
                ? new Date(experience.endDate)
                : undefined,
              description: experience.description ?? undefined,
            })),
          });
        }
      }

      await touchCandidateActivity(tx, id, now);

      return row;
    });

    const withRelations = await this.prisma.candidate.findUniqueOrThrow({
      where: { id: updated.id },
      include: {
        candidateSkills: { orderBy: { name: 'asc' } },
        educations: { orderBy: { startDate: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
      },
    });
    return mapCandidate(withRelations);
  }
}
