import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { RecruitmentRequestType } from '@repo/types';
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
  replacementEmployeeId?: string | null;
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
    if (!input.replacementEmployeeId) {
      throw new BadRequestException(
        'Replacement requests require replacementEmployeeId',
      );
    }
    if (!input.positionId) {
      throw new BadRequestException('Replacement requests require positionId');
    }
  } else if (input.replacementEmployeeId) {
    throw new BadRequestException(
      'replacementEmployeeId is only allowed for replacement requests',
    );
  }

  let replacementEmployee: {
    id: string;
    employment: {
      id: string;
      positionId: string | null;
      position: { departmentId: string } | null;
    } | null;
  } | null = null;

  if (input.replacementEmployeeId) {
    replacementEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { id: input.replacementEmployeeId },
          { userId: input.replacementEmployeeId },
        ],
      },
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
    if (!replacementEmployee)
      throw new NotFoundException('Replacement employee not found');
    if (!replacementEmployee.employment) {
      throw new BadRequestException(
        'Replacement employee must have an active employment record',
      );
    }

    if (
      input.positionId &&
      replacementEmployee.employment.positionId !== input.positionId
    ) {
      throw new BadRequestException(
        'Replacement employee must currently occupy the requested position',
      );
    }

    if (
      replacementEmployee.employment.position?.departmentId &&
      replacementEmployee.employment.position.departmentId !==
        input.departmentId
    ) {
      throw new BadRequestException(
        'Replacement employee must belong to the requested department',
      );
    }
  }

  if (input.enforceHeadcount && position) {
    await ensurePositionHasCapacity(prisma, position, replacementEmployee);
  }

  return {
    department,
    position,
    replacementEmployee,
  };
}

async function ensurePositionHasCapacity(
  prisma: PrismaService,
  position: {
    id: string;
    title: string;
    headcountLimit: number | null;
  },
  replacementEmployee: {
    employment: {
      positionId: string | null;
    } | null;
  } | null,
) {
  if (position.headcountLimit == null) return;

  const filledSeats = await prisma.userEmployment.count({
    where: {
      positionId: position.id,
      employee: {
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
    replacementEmployee?.employment?.positionId === position.id ? 1 : 0;
  const effectiveFilledSeats = Math.max(0, filledSeats - replacementSeatOffset);

  if (effectiveFilledSeats >= position.headcountLimit) {
    throw new BadRequestException(
      `Position "${position.title}" has reached its headcount limit`,
    );
  }
}
