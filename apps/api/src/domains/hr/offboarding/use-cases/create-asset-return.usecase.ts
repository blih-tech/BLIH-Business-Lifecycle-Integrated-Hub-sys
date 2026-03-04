import { Injectable } from '@nestjs/common';
import type { CreateAssetReturnDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAssetReturn } from '../offboarding.mapper';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class CreateAssetReturnUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateAssetReturnDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    await this.prisma.offboardingChecklist.findUniqueOrThrow({
      where: { id: dto.checklistId },
    });
    const ar = await this.prisma.assetReturn.create({
      data: {
        employeeId: employee.id,
        checklistId: dto.checklistId,
        items: (dto.items ?? null) as never,
        depositReturn: dto.depositReturn ?? null,
        damageDeductions: dto.damageDeductions ?? null,
        netAmount: dto.netAmount ?? null,
        status: 'PENDING',
      },
    });
    return mapAssetReturn(ar);
  }
}
