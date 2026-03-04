import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateAssetProvisioningDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';
import { mapAssetProvisioningResponse } from '../asset-provisioning.mapper';
import { shouldRequireFinanceApproval } from '../asset-provisioning.utils';

@Injectable()
export class CreateAssetProvisioningUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateAssetProvisioningDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );

    const exists = await this.prisma.employee.findUnique({
      where: { id: employee.id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Employee not found');

    if ((dto.equipment?.length ?? 0) === 0 && !dto.platformPermissions) {
      throw new BadRequestException(
        'Asset provisioning requires equipment or platform permissions',
      );
    }

    const provisioning = await this.prisma.assetProvisioning.create({
      data: {
        employeeId: employee.id,
        equipment: (dto.equipment ?? undefined) as never,
        platformPermissions: (dto.platformPermissions ?? undefined) as never,
        financeApprovalRequired: shouldRequireFinanceApproval({
          equipment: dto.equipment,
          financeApprovalRequired: dto.financeApprovalRequired,
        }),
        status: 'PENDING',
      },
    });

    return mapAssetProvisioningResponse(provisioning);
  }
}
