import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../../domains/hr/employees/employee-subject.utils';

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      userIdOrKeycloakId,
    );

    const profile = await this.prisma.userProfile.findUnique({
      where: { employeeId: employee.id },
      include: {
        nationality: {
          select: { name: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    return {
      ...profile,
      nationality: profile.nationality?.name ?? null,
      dateOfBirth: profile.dateOfBirth?.toISOString() ?? null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
