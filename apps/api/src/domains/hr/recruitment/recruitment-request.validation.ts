import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { RecruitmentRequestType } from '@blih/types';
import { PrismaService } from '../../../platform/prisma/prisma.service';

const ACTIVE_LIFECYCLE_STATUSES = [
  'ONBOARDING',
  'ACTIVE',
  'SUSPENDED',
] as const;

type RecruitmentValidationInput = {
  departmentId: string;
  positionId?: string | null;
  type?: RecruitmentRequestType;
  replacementUserId?: string | null;
  requirePosition?: boolean;
  enforceHeadcount?: boolean;
};

export async function validateRecruitmentRequestInput(
  prisma: PrismaService,
  input: RecruitmentValidationInput,
) {
  const department = await prisma.department.findUnique({
    where: { id: input.departmentId },
    select: { id: true, name: true },
  });
  if (!department) throw new NotFoundException('Department not found');

  if (input.requirePosition && !input.positionId) {
    throw new BadRequestException(
      'Position is required before submitting or publishing recruitment work',
    );
  }

  let position: {
    id: string;
    title: string;
    departmentId: string;
    headcountLimit: number | null;
    isActive: boolean;
  } | null = null;

  if (input.positionId) {
    position = await prisma.position.findUnique({
      where: { id: input.positionId },
      select: {
        id: true,
        title: true,
        departmentId: true,
        headcountLimit: true,
        isActive: true,
      },
    });
    if (!position) throw new NotFoundException('Position not found');
    if (!position.isActive) {
      throw new BadRequestException('Selected position is inactive');
    }
    if (position.departmentId !== input.departmentId) {
      throw new BadRequestException(
        'Selected position must belong to the requested department',
      );
    }
  }

  if (input.type === 'REPLACEMENT') {
    if (!input.replacementUserId) {
      throw new BadRequestException(
        'Replacement requests require replacementUserId',
      );
    }
    if (!input.positionId) {
      throw new BadRequestException('Replacement requests require positionId');
    }
  } else if (input.replacementUserId) {
    throw new BadRequestException(
      'replacementUserId is only allowed for replacement requests',
    );
  }

  let replacementUser: {
    id: string;
    employment: {
      id: string;
      positionId: string | null;
      position: { departmentId: string } | null;
    } | null;
  } | null = null;

  if (input.replacementUserId) {
    replacementUser = await prisma.user.findUnique({
      where: { id: input.replacementUserId },
      select: {
        id: true,
        employment: {
          select: {
            id: true,
            positionId: true,
            position: { select: { departmentId: true } },
          },
        },
      },
    });
    if (!replacementUser)
      throw new NotFoundException('Replacement user not found');
    if (!replacementUser.employment) {
      throw new BadRequestException(
        'Replacement user must have an active employment record',
      );
    }

    if (
      input.positionId &&
      replacementUser.employment.positionId !== input.positionId
    ) {
      throw new BadRequestException(
        'Replacement user must currently occupy the requested position',
      );
    }

    if (
      replacementUser.employment.position?.departmentId &&
      replacementUser.employment.position.departmentId !== input.departmentId
    ) {
      throw new BadRequestException(
        'Replacement user must belong to the requested department',
      );
    }
  }

  if (input.enforceHeadcount && position) {
    await ensurePositionHasCapacity(prisma, position, replacementUser);
  }

  return {
    department,
    position,
    replacementUser,
  };
}

async function ensurePositionHasCapacity(
  prisma: PrismaService,
  position: {
    id: string;
    title: string;
    headcountLimit: number | null;
  },
  replacementUser: {
    employment: {
      positionId: string | null;
    } | null;
  } | null,
) {
  if (position.headcountLimit == null) return;

  const filledSeats = await prisma.userEmployment.count({
    where: {
      positionId: position.id,
      user: {
        is: {
          OR: [
            { lifecycle: { is: null } },
            {
              lifecycle: {
                is: {
                  status: {
                    in: [...ACTIVE_LIFECYCLE_STATUSES],
                  },
                },
              },
            },
          ],
        },
      },
    },
  });

  const replacementSeatOffset =
    replacementUser?.employment?.positionId === position.id ? 1 : 0;
  const effectiveFilledSeats = Math.max(0, filledSeats - replacementSeatOffset);

  if (effectiveFilledSeats >= position.headcountLimit) {
    throw new BadRequestException(
      `Position "${position.title}" has reached its headcount limit`,
    );
  }
}
