import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { UpdateEmployeeDto } from '../dto/employee-update.dto';
import { resolveEmployeeSubjectOrThrow } from '../employee-subject.utils';
import {
  employeeFullInclude,
  mapEmployeeFull,
} from '../mappers/employee.mapper';

@Injectable()
export class UpdateEmployeeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(employeeId: string, dto: UpdateEmployeeDto) {
    const subject = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeId,
      'Employee not found',
    );

    // Explicit guardrails: auth-linked identity values are not updatable here.
    // (DTO intentionally does not expose them.)

    await this.prisma.$transaction(async (tx) => {
      if (dto.firstName !== undefined || dto.lastName !== undefined) {
        const employee = await tx.employee.findUnique({
          where: { id: subject.id },
          select: { userId: true },
        });
        if (!employee) throw new NotFoundException('Employee not found');
        if (!employee.userId) {
          throw new BadRequestException('Employee has no linked user');
        }

        await tx.user.update({
          where: { id: employee.userId },
          data: {
            ...(dto.firstName !== undefined
              ? { firstName: dto.firstName }
              : {}),
            ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
          },
        });
      }

      if (dto.employeeStatus !== undefined) {
        await tx.employee.update({
          where: { id: subject.id },
          data: { employeeStatus: dto.employeeStatus },
        });
      }

      if (dto.profile) {
        await tx.userProfile.upsert({
          where: { employeeId: subject.id },
          update: {
            ...(dto.profile.dateOfBirth !== undefined
              ? {
                  dateOfBirth:
                    dto.profile.dateOfBirth === null
                      ? null
                      : new Date(dto.profile.dateOfBirth),
                }
              : {}),
            ...(dto.profile.gender !== undefined
              ? { gender: dto.profile.gender }
              : {}),
            ...(dto.profile.nationalityId !== undefined
              ? { nationalityId: dto.profile.nationalityId }
              : {}),
            ...(dto.profile.maritalStatus !== undefined
              ? { maritalStatus: dto.profile.maritalStatus }
              : {}),
            ...(dto.profile.avatarUrl !== undefined
              ? { avatarUrl: dto.profile.avatarUrl }
              : {}),
            ...(dto.profile.passportSizePhotoURL !== undefined
              ? { passportSizePhotoURL: dto.profile.passportSizePhotoURL }
              : {}),
            ...(dto.profile.faydaNumber !== undefined
              ? { faydaNumber: dto.profile.faydaNumber }
              : {}),
            ...(dto.profile.governmentIdCard !== undefined
              ? { governmentIdCard: dto.profile.governmentIdCard }
              : {}),
            ...(dto.profile.governmentIdCardType !== undefined
              ? { governmentIdCardType: dto.profile.governmentIdCardType }
              : {}),
            ...(dto.profile.status !== undefined
              ? { status: dto.profile.status }
              : {}),
            ...(dto.profile.hrFeedback !== undefined
              ? { hrFeedback: dto.profile.hrFeedback }
              : {}),
          },
          create: {
            employeeId: subject.id,
            additionalPhoneType: 'MOBILE' as any,
            ...(dto.profile.dateOfBirth
              ? { dateOfBirth: new Date(dto.profile.dateOfBirth) }
              : {}),
            ...(dto.profile.gender ? { gender: dto.profile.gender } : {}),
          },
        });
      }

      if (dto.address) {
        await tx.employeeAddress.upsert({
          where: { employeeId: subject.id },
          update: {
            ...(dto.address.countryId !== undefined
              ? { countryId: dto.address.countryId }
              : {}),
            ...(dto.address.city !== undefined
              ? { city: dto.address.city }
              : {}),
            ...(dto.address.region !== undefined
              ? { region: dto.address.region }
              : {}),
            ...(dto.address.subCity !== undefined
              ? { subCity: dto.address.subCity }
              : {}),
            ...(dto.address.woreda !== undefined
              ? { woreda: dto.address.woreda }
              : {}),
            ...(dto.address.kebele !== undefined
              ? { kebele: dto.address.kebele }
              : {}),
            ...(dto.address.street !== undefined
              ? { street: dto.address.street }
              : {}),
            ...(dto.address.houseNumber !== undefined
              ? { houseNumber: dto.address.houseNumber }
              : {}),
            ...(dto.address.postalCode !== undefined
              ? { postalCode: dto.address.postalCode }
              : {}),
            ...(dto.address.status !== undefined
              ? { status: dto.address.status }
              : {}),
            ...(dto.address.hrFeedback !== undefined
              ? { hrFeedback: dto.address.hrFeedback }
              : {}),
          },
          create: {
            employeeId: subject.id,
            countryId:
              dto.address.countryId ??
              (() => {
                throw new BadRequestException('countryId is required');
              })(),
            city:
              dto.address.city ??
              (() => {
                throw new BadRequestException('city is required');
              })(),
          },
        });
      }

      if (dto.bankDetail) {
        const wrapper = await tx.employeeBankDetail.upsert({
          where: { employeeId: subject.id },
          update: {
            ...(dto.bankDetail.status !== undefined
              ? { status: dto.bankDetail.status }
              : {}),
            ...(dto.bankDetail.hrFeedback !== undefined
              ? { hrFeedback: dto.bankDetail.hrFeedback }
              : {}),
          },
          create: { employeeId: subject.id, status: 'PENDING_REVIEW' },
          select: { id: true },
        });

        if (dto.bankDetail.bankAccounts) {
          await tx.bankAccount.deleteMany({
            where: { employeeBankDetailId: wrapper.id },
          });
          await tx.bankAccount.createMany({
            data: dto.bankDetail.bankAccounts.map((a) => ({
              employeeBankDetailId: wrapper.id,
              bankName: a.bankName ?? '',
              accountName: a.accountName ?? '',
              accountNumber: a.accountNumber ?? '',
              branchName: a.branchName ?? null,
              swiftCode: a.swiftCode ?? null,
              isPrimary: a.isPrimary ?? true,
              isActive: a.isActive ?? true,
            })),
          });
        }
      }

      if (dto.emergencyContacts) {
        const wrapper = await tx.employeeEmergencyContact.upsert({
          where: { employeeId: subject.id },
          update: {
            ...(dto.emergencyContacts.status !== undefined
              ? { status: dto.emergencyContacts.status }
              : {}),
            ...(dto.emergencyContacts.hrFeedback !== undefined
              ? { hrFeedback: dto.emergencyContacts.hrFeedback }
              : {}),
          },
          create: { employeeId: subject.id, status: 'PENDING_REVIEW' },
          select: { id: true },
        });

        if (dto.emergencyContacts.emergencyContacts) {
          await tx.emergencyContact.deleteMany({
            where: { employeeEmergencyContactId: wrapper.id },
          });
          await tx.emergencyContact.createMany({
            data: dto.emergencyContacts.emergencyContacts.map((c) => ({
              employeeEmergencyContactId: wrapper.id,
              firstName: c.firstName ?? '',
              lastName: c.lastName ?? '',
              relationship: c.relationship ?? '',
              primaryPhone: c.primaryPhone ?? '',
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
        }
      }

      if (dto.education) {
        const wrapper = await tx.employeeEducation.upsert({
          where: { employeeId: subject.id },
          update: {
            ...(dto.education.status !== undefined
              ? { status: dto.education.status }
              : {}),
            ...(dto.education.hrFeedback !== undefined
              ? { hrFeedback: dto.education.hrFeedback }
              : {}),
          },
          create: { employeeId: subject.id, status: 'PENDING_REVIEW' },
          select: { id: true },
        });

        if (dto.education.educations) {
          await tx.education.deleteMany({
            where: { employeeEducationId: wrapper.id },
          });
          await tx.education.createMany({
            data: dto.education.educations.map((e) => ({
              employeeEducationId: wrapper.id,
              institution: e.institution ?? '',
              degree: e.degree ?? '',
              fieldOfStudy: e.fieldOfStudy ?? '',
              level: (e.level ?? 'BACHELOR') as any,
              startDate: e.startDate ? new Date(e.startDate) : null,
              endDate: e.endDate ? new Date(e.endDate) : null,
              grade: e.grade ?? null,
              description: e.description ?? null,
              documentUrl: e.documentUrl ?? null,
              isCompleted:
                e.endDate == null ? true : new Date(e.endDate) <= new Date(),
            })),
          });
        }
      }

      // NOTE: employment/compensation updates are handled through existing record endpoints for now.
      // The module-level update focuses on the HR-managed sub-entities.
    });

    const employee = await this.prisma.employee.findUnique({
      where: { id: subject.id },
      include: employeeFullInclude,
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return mapEmployeeFull(employee);
  }
}
