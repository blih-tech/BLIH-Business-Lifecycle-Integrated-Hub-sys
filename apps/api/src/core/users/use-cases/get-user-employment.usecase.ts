import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class GetUserEmploymentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const employment = await this.prisma.userEmployment.findUnique({
      where: { userId: user.id },
      include: {
        position: {
          select: {
            title: true,
            departmentId: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    if (!employment) {
      throw new NotFoundException('User employment not found');
    }

    return {
      userId: employment.userId,
      employeeCode: employment.employeeCode,
      departmentId: employment.position?.departmentId ?? null,
      departmentName: employment.position?.department?.name ?? null,
      positionId: employment.positionId,
      positionTitle: employment.position?.title ?? null,
      employmentType: employment.employmentType,
      managerEmploymentId: employment.managerEmploymentId,
      hiredAt: employment.hiredAt?.toISOString() ?? null,
      probationEndAt: employment.probationEndAt?.toISOString() ?? null,
      confirmedAt: employment.confirmedAt?.toISOString() ?? null,
      createdAt: employment.createdAt.toISOString(),
      updatedAt: employment.updatedAt.toISOString(),
    };
  }
}
