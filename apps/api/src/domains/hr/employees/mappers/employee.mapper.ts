import type { Prisma } from '../../../../platform/prisma/prisma-client';
import { mapCompensationComponent } from '../../../../core/users/compensation-component.mapper';
import { buildCompensationSummary } from '../../../../core/users/compensation.utils';

export const employeeFullInclude = {
  user: {
    select: {
      id: true,
      keycloakId: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,
    },
  },
  profile: {
    include: {
      nationality: { select: { name: true } },
    },
  },
  employeeAddress: {
    include: {
      country: { select: { name: true } },
    },
  },
  employeeBankDetail: {
    include: {
      bankAccounts: {
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      },
    },
  },
  employeeEmergencyContact: {
    include: {
      emergencyContacts: {
        orderBy: [{ isFirstToCall: 'desc' }, { createdAt: 'desc' }],
      },
    },
  },
  employeeEducation: {
    include: {
      educations: {
        orderBy: [{ createdAt: 'desc' }],
      },
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
  compensationComponents: true,
  lifecycle: true,
  _count: {
    select: { employeeDocuments: true },
  },
} satisfies Prisma.EmployeeInclude;

export type EmployeeFullModel = Prisma.EmployeeGetPayload<{
  include: typeof employeeFullInclude;
}>;

export function mapEmployeeFull(employee: EmployeeFullModel) {
  return {
    id: employee.id,
    userId: employee.userId ?? null,
    keycloakId: employee.user?.keycloakId ?? null,
    username: employee.user?.username ?? null,
    email: employee.user?.email ?? null,
    firstName: employee.user?.firstName ?? null,
    lastName: employee.user?.lastName ?? null,
    phone: employee.user?.phone ?? null,
    userStatus: employee.user?.status ?? null,
    employeeStatus: employee.employeeStatus,
    profile: employee.profile
      ? {
          additionalEmail: employee.profile.additionalEmail ?? null,
          additionalEmailType: employee.profile.additionalEmailType ?? null,
          additionalPhone: employee.profile.additionalPhone ?? null,
          additionalPhoneType: employee.profile.additionalPhoneType,
          dateOfBirth: employee.profile.dateOfBirth?.toISOString() ?? null,
          gender: employee.profile.gender ?? null,
          nationalityId: employee.profile.nationalityId ?? null,
          nationalityName: employee.profile.nationality?.name ?? null,
          maritalStatus: employee.profile.maritalStatus ?? null,
          avatarUrl: employee.profile.avatarUrl ?? null,
          passportSizePhotoURL: employee.profile.passportSizePhotoURL ?? null,
          faydaNumber: employee.profile.faydaNumber ?? null,
          governmentIdCard: employee.profile.governmentIdCard ?? null,
          governmentIdCardType: employee.profile.governmentIdCardType ?? null,
          status: employee.profile.status,
          hrFeedback: employee.profile.hrFeedback ?? null,
        }
      : null,
    address: employee.employeeAddress
      ? {
          countryId: employee.employeeAddress.countryId,
          countryName: employee.employeeAddress.country?.name ?? null,
          city: employee.employeeAddress.city,
          region: employee.employeeAddress.region ?? null,
          subCity: employee.employeeAddress.subCity ?? null,
          woreda: employee.employeeAddress.woreda ?? null,
          kebele: employee.employeeAddress.kebele ?? null,
          street: employee.employeeAddress.street ?? null,
          houseNumber: employee.employeeAddress.houseNumber ?? null,
          postalCode: employee.employeeAddress.postalCode ?? null,
          status: employee.employeeAddress.status,
          hrFeedback: employee.employeeAddress.hrFeedback ?? null,
        }
      : null,
    bankDetail: employee.employeeBankDetail
      ? {
          bankAccounts: employee.employeeBankDetail.bankAccounts.map((a) => ({
            bankName: a.bankName,
            accountName: a.accountName,
            accountNumber: a.accountNumber,
            branchName: a.branchName ?? null,
            swiftCode: a.swiftCode ?? null,
            isPrimary: a.isPrimary,
            isActive: a.isActive,
          })),
          status: employee.employeeBankDetail.status,
          hrFeedback: employee.employeeBankDetail.hrFeedback ?? null,
        }
      : null,
    emergencyContacts: employee.employeeEmergencyContact
      ? {
          emergencyContacts:
            employee.employeeEmergencyContact.emergencyContacts.map((c) => ({
              firstName: c.firstName,
              lastName: c.lastName,
              relationship: c.relationship,
              primaryPhone: c.primaryPhone,
              email: c.email ?? null,
              isFirstToCall: c.isFirstToCall,
              isActive: c.isActive,
              notes: c.notes ?? null,
              countryId: c.countryId ?? null,
              city: c.city ?? null,
              subCity: c.subCity ?? null,
              woreda: c.woreda ?? null,
              kebele: c.kebele ?? null,
              street: c.street ?? null,
            })),
          status: employee.employeeEmergencyContact.status,
          hrFeedback: employee.employeeEmergencyContact.hrFeedback ?? null,
        }
      : null,
    education: employee.employeeEducation
      ? {
          educations: employee.employeeEducation.educations.map((e) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
            level: e.level,
            startDate: e.startDate?.toISOString() ?? null,
            endDate: e.endDate?.toISOString() ?? null,
            grade: e.grade ?? null,
            description: e.description ?? null,
            documentUrl: e.documentUrl ?? null,
            isCompleted: e.isCompleted,
          })),
          status: employee.employeeEducation.status,
          hrFeedback: employee.employeeEducation.hrFeedback ?? null,
        }
      : null,
    employment: employee.employment
      ? {
          employeeCode: employee.employment.employeeCode ?? null,
          departmentId: employee.employment.position?.departmentId ?? null,
          departmentName:
            employee.employment.position?.department?.name ?? null,
          positionId: employee.employment.positionId ?? null,
          positionTitle: employee.employment.position?.title ?? null,
          employmentType: employee.employment.employmentType,
          managerEmploymentId: employee.employment.managerEmploymentId ?? null,
          hiredAt: employee.employment.hiredAt?.toISOString() ?? null,
          probationEndAt:
            employee.employment.probationEndAt?.toISOString() ?? null,
          confirmedAt: employee.employment.confirmedAt?.toISOString() ?? null,
        }
      : null,
    compensation: employee.compensation
      ? {
          baseSalary: employee.compensation.baseSalary?.toString() ?? null,
          currency: employee.compensation.currency ?? null,
          payFrequency: employee.compensation.payFrequency,
          bonusEligible: employee.compensation.bonusEligible,
          bonusRate: employee.compensation.bonusRate?.toString() ?? null,
          effectiveFrom:
            employee.compensation.effectiveFrom?.toISOString() ?? null,
          effectiveTo: employee.compensation.effectiveTo?.toISOString() ?? null,
          summary: buildCompensationSummary(
            {
              baseSalary: employee.compensation.baseSalary?.toString() ?? null,
              currency: employee.compensation.currency ?? null,
              payFrequency: employee.compensation.payFrequency,
              bonusEligible: employee.compensation.bonusEligible,
              bonusRate: employee.compensation.bonusRate?.toString() ?? null,
            },
            employee.compensationComponents.map(mapCompensationComponent),
          ),
        }
      : null,
    lifecycle: employee.lifecycle
      ? {
          status: employee.lifecycle.status,
          onboardedAt: employee.lifecycle.onboardedAt?.toISOString() ?? null,
          suspendedAt: employee.lifecycle.suspendedAt?.toISOString() ?? null,
          terminatedAt: employee.lifecycle.terminatedAt?.toISOString() ?? null,
          offboardingCompleted: employee.lifecycle.offboardingCompleted,
        }
      : null,
    documentsCount: employee._count.employeeDocuments,
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
  };
}
