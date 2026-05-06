import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import {
  buildSuccessEnvelope,
  type ResponseEnvelopeSuccessDto,
} from '../../../shared/dto/response-envelope.dto';
import type {
  OnboardingListQueryDto,
  OnboardingResponseDto,
} from './onboarding.dto';
import { mapOnboarding, onboardingInclude } from './create-onboarding.usecase';

// ─── Shared filter builder ──────────────────────────────────────────────────

function buildWhere(
  query: OnboardingListQueryDto,
): Prisma.OnboardingWhereInput {
  const where: Prisma.OnboardingWhereInput = {};

  if (query.employeeId) {
    where.employeeId = query.employeeId;
  }

  if (query.status) {
    where.status = query.status;
  }

  const checklistFilters: Prisma.OnboardingChecklistWhereInput = {};
  if (query.taskInstanceId) {
    checklistFilters.taskInstanceId = query.taskInstanceId;
  }
  if (query.checklistStatus) {
    checklistFilters.status = query.checklistStatus;
  }

  if (Object.keys(checklistFilters).length > 0) {
    where.checklists = { some: checklistFilters };
  }

  return where;
}

// ─── Use Cases ────────────────────────────────────────────────────────────────

/** Returns the full (un-paginated) list of onboarding records with filters. */
@Injectable()
export class ListAllOnboardingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: OnboardingListQueryDto,
  ): Promise<OnboardingResponseDto[]> {
    const onboarding = await this.prisma.onboarding.findMany({
      where: buildWhere(query),
      include: onboardingInclude,
      orderBy: { createdAt: 'desc' },
    });

    return onboarding.map(mapOnboarding);
  }
}

/** Returns a paginated list of onboarding records wrapped in a success envelope. */
@Injectable()
export class ListPaginatedOnboardingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: OnboardingListQueryDto,
    requestId: string,
  ): Promise<ResponseEnvelopeSuccessDto<OnboardingResponseDto[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);

    const [onboarding, total] = await this.prisma.$transaction([
      this.prisma.onboarding.findMany({
        where,
        include: onboardingInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.onboarding.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return buildSuccessEnvelope(
      onboarding.map(mapOnboarding),
      requestId,
      'Onboarding records retrieved successfully',
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    );
  }
}

/** Returns a single onboarding record by id, or throws 404. */
@Injectable()
export class GetOnboardingByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<OnboardingResponseDto> {
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { id },
      include: onboardingInclude,
    });

    if (!onboarding) {
      throw new NotFoundException(`Onboarding with id "${id}" not found`);
    }

    return mapOnboarding(onboarding);
  }
}
