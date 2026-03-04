import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreatePolicyAcknowledgementDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';
import { mapPolicyAcknowledgementResponse } from '../policy-acknowledgement.mapper';

@Injectable()
export class CreatePolicyAcknowledgementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreatePolicyAcknowledgementDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    if (!dto.allAcknowledged && (dto.policies?.length ?? 0) === 0) {
      throw new BadRequestException(
        'At least one policy acknowledgement is required',
      );
    }

    const created = await this.prisma.policyAcknowledgement.create({
      data: {
        employeeId: employee.id,
        policies: (dto.policies ?? undefined) as never,
        allAcknowledged: dto.allAcknowledged ?? false,
        confirmedAt: dto.confirmedAt ? new Date(dto.confirmedAt) : undefined,
      },
    });

    return mapPolicyAcknowledgementResponse(created);
  }
}
