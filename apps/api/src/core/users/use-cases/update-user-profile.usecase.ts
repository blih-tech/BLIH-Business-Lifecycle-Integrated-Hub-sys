import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import {
  ensureEmployeeForUser,
  resolveEmployeeSubjectOrThrow,
} from '../../../domains/hr/employees/employee-subject.utils';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string, dto: UpdateUserProfileDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      userIdOrKeycloakId,
      'Employee not found',
    ).catch(async (error) => {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
        },
        select: { id: true },
      });
      if (!user) {
        throw error;
      }
      return ensureEmployeeForUser(this.prisma, user.id);
    });

    const profile = await this.prisma.userProfile.upsert({
      where: {
        employeeId: employee.id,
      },
      update: {
        ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
        ...(dto.maritalStatus !== undefined
          ? { maritalStatus: dto.maritalStatus }
          : {}),
        ...(dto.nationalityId !== undefined
          ? { nationalityId: dto.nationalityId }
          : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        ...(dto.dateOfBirth !== undefined
          ? { dateOfBirth: new Date(dto.dateOfBirth) }
          : {}),
      },
      create: {
        employeeId: employee.id,
        gender: dto.gender,
        maritalStatus: dto.maritalStatus,
        nationalityId: dto.nationalityId,
        avatarUrl: dto.avatarUrl,
        additionalPhoneType: 'MOBILE' as any,
        ...(dto.dateOfBirth !== undefined
          ? { dateOfBirth: new Date(dto.dateOfBirth) }
          : {}),
      },
      include: {
        nationality: {
          select: { name: true },
        },
      },
    });

    return {
      ...profile,
      nationality: profile.nationality?.name ?? null,
      dateOfBirth: profile.dateOfBirth?.toISOString() ?? null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
