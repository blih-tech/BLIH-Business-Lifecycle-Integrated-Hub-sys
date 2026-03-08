import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
} from './recruitment.usecase-helpers';

@Injectable()
export class CreateCandidateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateCandidateDto) {
    const normalizedEmail = normalizeEmail(dto.email);
    const existing = await this.prisma.candidate.findUnique({
      where: { email: normalizedEmail },
      include: { candidateSkills: true },
    });
    if (existing) throw new ConflictException('Candidate email already exists');

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
        candidateSkills: dto.skills
          ? {
              create: dto.skills.map((skill) => ({
                name: skill.name,
                level: skill.level ?? undefined,
                years: skill.years ?? undefined,
              })),
            }
          : undefined,
      },
      include: { candidateSkills: { orderBy: { name: 'asc' } } },
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
      include: { candidateSkills: { orderBy: { name: 'asc' } } },
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
      include: { candidateSkills: { orderBy: { name: 'asc' } } },
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
      select: { id: true, fullName: true },
    });
    const existingName = splitFullName(existing.fullName);
    const nextFirstName = dto.firstName ?? existingName.firstName;
    const nextLastName = dto.lastName ?? existingName.lastName;

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

      return row;
    });

    const withSkills = await this.prisma.candidate.findUniqueOrThrow({
      where: { id: updated.id },
      include: { candidateSkills: { orderBy: { name: 'asc' } } },
    });
    return mapCandidate(withSkills);
  }
}
