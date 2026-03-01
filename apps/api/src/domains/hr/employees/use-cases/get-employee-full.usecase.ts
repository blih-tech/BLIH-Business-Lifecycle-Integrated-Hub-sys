import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class GetEmployeeFullUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      include: {
        profile: {
          include: {
            nationality: { select: { name: true } },
            country: { select: { name: true } },
          },
        },
        employment: {
          include: {
            position: {
              select: {
                title: true,
                departmentId: true,
                department: { select: { name: true } },
              },
            },
          },
        },
        compensation: true,
        lifecycle: true,
        _count: {
          select: { employeeDocuments: true, contracts: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      keycloakId: user.keycloakId,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? null,
      status: user.status,
      departmentId: user.employment?.position?.departmentId ?? null,
      departmentName: user.employment?.position?.department?.name ?? null,
      profile: user.profile
        ? {
            dateOfBirth: user.profile.dateOfBirth?.toISOString() ?? null,
            gender: user.profile.gender,
            nationalityId: user.profile.nationalityId ?? null,
            nationalityName: user.profile.nationality?.name ?? null,
            maritalStatus: user.profile.maritalStatus,
            addressLine1: user.profile.addressLine1 ?? null,
            addressLine2: user.profile.addressLine2 ?? null,
            city: user.profile.city ?? null,
            state: user.profile.state ?? null,
            countryId: user.profile.countryId ?? null,
            countryName: user.profile.country?.name ?? null,
            postalCode: user.profile.postalCode ?? null,
            emergencyContactName: user.profile.emergencyContactName ?? null,
            emergencyContactPhone: user.profile.emergencyContactPhone ?? null,
          }
        : null,
      employment: user.employment
        ? {
            employeeCode: user.employment.employeeCode ?? null,
            departmentId: user.employment.position?.departmentId ?? null,
            departmentName: user.employment.position?.department?.name ?? null,
            positionId: user.employment.positionId ?? null,
            positionTitle: user.employment.position?.title ?? null,
            employmentType: user.employment.employmentType,
            managerEmploymentId: user.employment.managerEmploymentId ?? null,
            hiredAt: user.employment.hiredAt?.toISOString() ?? null,
            probationEndAt:
              user.employment.probationEndAt?.toISOString() ?? null,
            confirmedAt: user.employment.confirmedAt?.toISOString() ?? null,
          }
        : null,
      compensation: user.compensation
        ? {
            baseSalary: user.compensation.baseSalary?.toString() ?? null,
            currency: user.compensation.currency ?? null,
            payFrequency: user.compensation.payFrequency,
            bonusEligible: user.compensation.bonusEligible,
            effectiveFrom:
              user.compensation.effectiveFrom?.toISOString() ?? null,
            effectiveTo: user.compensation.effectiveTo?.toISOString() ?? null,
          }
        : null,
      lifecycle: user.lifecycle
        ? {
            status: user.lifecycle.status,
            onboardedAt: user.lifecycle.onboardedAt?.toISOString() ?? null,
            suspendedAt: user.lifecycle.suspendedAt?.toISOString() ?? null,
            terminatedAt: user.lifecycle.terminatedAt?.toISOString() ?? null,
            offboardingCompleted: user.lifecycle.offboardingCompleted,
          }
        : null,
      documentsCount: user._count.employeeDocuments,
      contractsCount: user._count.contracts,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
