import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SendNotificationUseCase } from '../../../../core/notifications/use-cases/send-notification.usecase';
import { UserProvisioningService } from '../../../../core/users/user-provisioning.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateEmployeeDto } from '../dto/employee-create.dto';
import {
  employeeFullInclude,
  mapEmployeeFull,
} from '../mappers/employee.mapper';

@Injectable()
export class CreateEmployeeUseCase {
  private readonly logger = new Logger(CreateEmployeeUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly provisioning: UserProvisioningService,
    private readonly notifications: SendNotificationUseCase,
  ) {}

  async execute(dto: CreateEmployeeDto) {
    if (dto.bankAccounts.length === 0) {
      throw new BadRequestException('At least one bank account is required');
    }
    if (dto.emergencyContacts.length === 0) {
      throw new BadRequestException(
        'At least one emergency contact is required',
      );
    }
    // Education records are optional at creation and can be added later
    // via the employee profile update flow.

    const username = await this.provisioning.generateUniqueUsername({
      email: dto.primaryEmail,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    await this.provisioning.assertLocalIdentityAvailable({
      email: dto.primaryEmail,
      username,
    });

    const keycloakId = await this.provisioning.createExternalUser({
      email: dto.primaryEmail,
      username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.primaryPhone,
    });

    let provisionedUserId: string | null = null;
    let provisionedEmployeeId: string | null = null;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const provisioned = await this.provisioning.createLocalUserGraph(tx, {
          keycloakId,
          username,
          email: dto.primaryEmail,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.primaryPhone,
          metadata: undefined,
          lifecycleStatus: 'ONBOARDING',
          employment: dto.employment
            ? {
                positionId: dto.employment.positionId ?? undefined,
                employmentType: dto.employment.employmentType ?? undefined,
                managerEmploymentId:
                  dto.employment.managerEmploymentId ?? undefined,
                hiredAt: dto.employment.hiredAt
                  ? new Date(dto.employment.hiredAt)
                  : undefined,
                employeeCode: dto.employment.employeeCode ?? undefined,
                changeReason: dto.employment.changeReason ?? undefined,
                changedById: dto.employment.changedById ?? undefined,
              }
            : null,
          compensation: dto.compensation
            ? {
                baseSalary: dto.compensation.baseSalary ?? undefined,
                currency: dto.compensation.currency ?? undefined,
                payFrequency: dto.compensation.payFrequency ?? undefined,
                bonusEligible: dto.compensation.bonusEligible ?? undefined,
                bonusRate: dto.compensation.bonusRate ?? undefined,
                effectiveFrom: dto.compensation.effectiveFrom
                  ? new Date(dto.compensation.effectiveFrom)
                  : undefined,
                effectiveTo: dto.compensation.effectiveTo
                  ? new Date(dto.compensation.effectiveTo)
                  : undefined,
                changeReason: dto.compensation.changeReason ?? undefined,
                changedById: dto.compensation.changedById ?? undefined,
              }
            : null,
        });

        provisionedUserId = provisioned.user.id;
        provisionedEmployeeId = provisioned.employee.id;

        await tx.employee.update({
          where: { id: provisioned.employee.id },
          data: {
            employeeStatus: dto.employeeStatus ?? 'ONBOARDING',
          },
        });

        await tx.userProfile.upsert({
          where: { employeeId: provisioned.employee.id },
          update: {
            additionalEmail: dto.additionalEmail,
            additionalPhone: dto.additionalPhone,
            additionalPhoneType: dto.additionalPhoneType,
            ...(dto.profile?.dateOfBirth !== undefined &&
            dto.profile?.dateOfBirth !== null
              ? { dateOfBirth: new Date(dto.profile.dateOfBirth) }
              : {}),
            ...(dto.profile?.gender !== undefined
              ? { gender: dto.profile.gender }
              : {}),
            ...(dto.profile?.nationalityId !== undefined
              ? { nationalityId: dto.profile.nationalityId }
              : {}),
            ...(dto.profile?.maritalStatus !== undefined
              ? { maritalStatus: dto.profile.maritalStatus }
              : {}),
            ...(dto.profile?.avatarUrl !== undefined
              ? { avatarUrl: dto.profile.avatarUrl }
              : {}),
            ...(dto.profile?.passportSizePhotoURL !== undefined
              ? { passportSizePhotoURL: dto.profile.passportSizePhotoURL }
              : {}),
            ...(dto.profile?.faydaNumber !== undefined
              ? { faydaNumber: dto.profile.faydaNumber }
              : {}),
            ...(dto.profile?.governmentIdCard !== undefined
              ? { governmentIdCard: dto.profile.governmentIdCard }
              : {}),
            ...(dto.profile?.governmentIdCardType !== undefined
              ? { governmentIdCardType: dto.profile.governmentIdCardType }
              : {}),
            status: 'PENDING_REVIEW',
            hrFeedback: null,
          },
          create: {
            employeeId: provisioned.employee.id,
            additionalEmail: dto.additionalEmail,
            additionalPhone: dto.additionalPhone,
            additionalPhoneType: dto.additionalPhoneType,
            ...(dto.profile?.dateOfBirth
              ? { dateOfBirth: new Date(dto.profile.dateOfBirth) }
              : {}),
            ...(dto.profile?.gender ? { gender: dto.profile.gender } : {}),
            ...(dto.profile?.nationalityId
              ? { nationalityId: dto.profile.nationalityId }
              : {}),
            ...(dto.profile?.maritalStatus
              ? { maritalStatus: dto.profile.maritalStatus }
              : {}),
            ...(dto.profile?.avatarUrl
              ? { avatarUrl: dto.profile.avatarUrl }
              : {}),
            ...(dto.profile?.passportSizePhotoURL
              ? { passportSizePhotoURL: dto.profile.passportSizePhotoURL }
              : {}),
            ...(dto.profile?.faydaNumber
              ? { faydaNumber: dto.profile.faydaNumber }
              : {}),
            ...(dto.profile?.governmentIdCard
              ? { governmentIdCard: dto.profile.governmentIdCard }
              : {}),
            ...(dto.profile?.governmentIdCardType
              ? { governmentIdCardType: dto.profile.governmentIdCardType }
              : {}),
            status: 'PENDING_REVIEW',
          },
        });

        await tx.employeeAddress.upsert({
          where: { employeeId: provisioned.employee.id },
          update: {
            countryId: dto.address.countryId,
            city: dto.address.city,
            region: dto.address.region ?? null,
            subCity: dto.address.subCity ?? null,
            woreda: dto.address.woreda ?? null,
            kebele: dto.address.kebele ?? null,
            street: dto.address.street ?? null,
            houseNumber: dto.address.houseNumber ?? null,
            postalCode: dto.address.postalCode ?? null,
            status: 'PENDING_REVIEW',
            hrFeedback: null,
          },
          create: {
            employeeId: provisioned.employee.id,
            countryId: dto.address.countryId,
            city: dto.address.city,
            region: dto.address.region ?? null,
            subCity: dto.address.subCity ?? null,
            woreda: dto.address.woreda ?? null,
            kebele: dto.address.kebele ?? null,
            street: dto.address.street ?? null,
            houseNumber: dto.address.houseNumber ?? null,
            postalCode: dto.address.postalCode ?? null,
            status: 'PENDING_REVIEW',
          },
        });

        const bankWrapper = await tx.employeeBankDetail.upsert({
          where: { employeeId: provisioned.employee.id },
          update: { status: 'PENDING_REVIEW', hrFeedback: null },
          create: {
            employeeId: provisioned.employee.id,
            status: 'PENDING_REVIEW',
          },
          select: { id: true },
        });

        await tx.bankAccount.deleteMany({
          where: { employeeBankDetailId: bankWrapper.id },
        });
        await tx.bankAccount.createMany({
          data: dto.bankAccounts.map((a) => ({
            employeeBankDetailId: bankWrapper.id,
            bankName: a.bankName,
            accountName: a.accountName,
            accountNumber: a.accountNumber,
            branchName: a.branchName ?? null,
            swiftCode: a.swiftCode ?? null,
            isPrimary: a.isPrimary ?? true,
            isActive: a.isActive ?? true,
          })),
        });

        const emergencyWrapper = await tx.employeeEmergencyContact.upsert({
          where: { employeeId: provisioned.employee.id },
          update: { status: 'PENDING_REVIEW', hrFeedback: null },
          create: {
            employeeId: provisioned.employee.id,
            status: 'PENDING_REVIEW',
          },
          select: { id: true },
        });

        await tx.emergencyContact.deleteMany({
          where: { employeeEmergencyContactId: emergencyWrapper.id },
        });
        await tx.emergencyContact.createMany({
          data: dto.emergencyContacts.map((c) => ({
            employeeEmergencyContactId: emergencyWrapper.id,
            firstName: c.firstName,
            lastName: c.lastName,
            relationship: c.relationship,
            primaryPhone: c.primaryPhone,
            email: c.email ?? null,
            isFirstToCall: c.isFirstToCall ?? false,
            isActive: c.isActive ?? true,
            notes: c.notes ?? null,
            countryId: c.countryId ?? null,
            city: c.city ?? null,
            subCity: c.subCity ?? null,
            woreda: c.woreda ?? null,
            kebele: c.kebele ?? null,
            street: c.street ?? null,
          })),
        });

        const educationWrapper = await tx.employeeEducation.upsert({
          where: { employeeId: provisioned.employee.id },
          update: { status: 'PENDING_REVIEW', hrFeedback: null },
          create: {
            employeeId: provisioned.employee.id,
            status: 'PENDING_REVIEW',
          },
          select: { id: true },
        });

        await tx.education.deleteMany({
          where: { employeeEducationId: educationWrapper.id },
        });
        await tx.education.createMany({
          data: dto.educations.map((e) => ({
            employeeEducationId: educationWrapper.id,
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
            level: e.level,
            startDate: e.startDate ? new Date(e.startDate) : null,
            endDate: e.endDate ? new Date(e.endDate) : null,
            grade: e.grade ?? null,
            description: e.description ?? null,
            documentUrl: e.documentUrl ?? null,
            isCompleted:
              e.endDate == null ? true : new Date(e.endDate) <= new Date(),
          })),
        });

        if (dto.contract) {
          const contract = await tx.contract.findUnique({
            where: { id: dto.contract.contractId },
            select: { id: true, employeeContractId: true },
          });
          if (!contract) {
            throw new NotFoundException('Contract not found');
          }
          if (contract.employeeContractId) {
            throw new BadRequestException(
              'Contract is already linked to an employee',
            );
          }

          const wrapper = await tx.employeeContract.upsert({
            where: { employeeId: provisioned.employee.id },
            update: { status: 'PENDING_REVIEW', hrFeedback: null },
            create: {
              employeeId: provisioned.employee.id,
              status: 'PENDING_REVIEW',
            },
            select: { id: true },
          });

          await tx.contract.update({
            where: { id: dto.contract.contractId },
            data: {
              employeeContractId: wrapper.id,
              ...(dto.contract.signedFileUrl
                ? { signedFileUrl: dto.contract.signedFileUrl }
                : {}),
            },
          });
        }

        if (dto.policyAcknowledgements) {
          const wrapper = await tx.employeePolicyAcknowledgement.upsert({
            where: { employeeId: provisioned.employee.id },
            update: {},
            create: { employeeId: provisioned.employee.id },
            select: { id: true },
          });
          const now = new Date();
          await Promise.all(
            dto.policyAcknowledgements.acknowledgements.map((ack) =>
              tx.policyAcknowledgement.upsert({
                where: {
                  employeePolicyAcknowledgementId_policyVersionId: {
                    employeePolicyAcknowledgementId: wrapper.id,
                    policyVersionId: ack.policyVersionId,
                  },
                },
                update: { acknowledgedAt: now },
                create: {
                  employeePolicyAcknowledgementId: wrapper.id,
                  policyId: ack.policyId,
                  policyVersionId: ack.policyVersionId,
                  acknowledgedAt: now,
                },
              }),
            ),
          );
        }

        const employee = await tx.employee.findUnique({
          where: { id: provisioned.employee.id },
          include: employeeFullInclude,
        });
        if (!employee) {
          throw new NotFoundException('Employee not found after creation');
        }
        return mapEmployeeFull(employee);
      });

      await this.dispatchWelcomeInvitation({
        keycloakId,
        userId: provisionedUserId,
        email: dto.primaryEmail,
        employeeId: provisionedEmployeeId,
        firstName: dto.firstName,
      });

      return result;
    } catch (error: unknown) {
      await this.provisioning.cleanupExternalUser(keycloakId);
      this.provisioning.rethrowPersistenceError(error);
    }
  }

  private async dispatchWelcomeInvitation(input: {
    keycloakId: string;
    userId: string | null;
    email: string;
    employeeId: string | null;
    firstName: string;
  }): Promise<void> {
    try {
      await this.provisioning.sendRequiredActionsEmail({
        keycloakId: input.keycloakId,
        actions: ['UPDATE_PASSWORD'],
        lifespanSeconds: 60 * 60 * 24 * 7,
      });
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          action: 'employees.onboarding.keycloak_invite.failure',
          keycloakId: input.keycloakId,
          error:
            error instanceof Error
              ? error.message
              : 'unknown keycloak invite failure',
        }),
      );
    }

    try {
      await this.notifications.execute({
        type: 'onboarding',
        priority: 'high',
        title: 'Welcome to BLIH',
        body: `Your account is ready. Log in to wait for the HR department to assign onboarding tasks.`,
        userId: input.userId ?? undefined,
        recipients: [input.email],
        channels: ['email', 'in_app'],
        payload: {
          employeeId: input.employeeId,
        },
      });
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          action: 'employees.onboarding.notification.failure',
          email: input.email,
          error:
            error instanceof Error
              ? error.message
              : 'unknown onboarding notification failure',
        }),
      );
    }
  }
}
