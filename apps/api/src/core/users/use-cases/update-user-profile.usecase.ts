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
        ...(dto.countryId !== undefined ? { countryId: dto.countryId } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        ...(dto.addressLine1 !== undefined
          ? { addressLine1: dto.addressLine1 }
          : {}),
        ...(dto.addressLine2 !== undefined
          ? { addressLine2: dto.addressLine2 }
          : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.state !== undefined ? { state: dto.state } : {}),
        ...(dto.postalCode !== undefined ? { postalCode: dto.postalCode } : {}),
        ...(dto.emergencyContactName !== undefined
          ? { emergencyContactName: dto.emergencyContactName }
          : {}),
        ...(dto.emergencyContactPhone !== undefined
          ? { emergencyContactPhone: dto.emergencyContactPhone }
          : {}),
        ...(dto.dateOfBirth !== undefined
          ? { dateOfBirth: new Date(dto.dateOfBirth) }
          : {}),
      },
      create: {
        employeeId: employee.id,
        gender: dto.gender,
        maritalStatus: dto.maritalStatus,
        nationalityId: dto.nationalityId,
        countryId: dto.countryId,
        avatarUrl: dto.avatarUrl,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        ...(dto.dateOfBirth !== undefined
          ? { dateOfBirth: new Date(dto.dateOfBirth) }
          : {}),
      },
      include: {
        nationality: {
          select: { name: true },
        },
        country: {
          select: { name: true },
        },
      },
    });

    return {
      ...profile,
      nationality: profile.nationality?.name ?? null,
      country: profile.country?.name ?? null,
      dateOfBirth: profile.dateOfBirth?.toISOString() ?? null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
