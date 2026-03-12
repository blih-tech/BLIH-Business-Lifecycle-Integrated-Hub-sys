import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  AssetProvisioningResponseDto,
  CreateAssetProvisioningDto,
  AssetProvisioningStatusValue,
} from './asset-provisioning.dto';

const toIso = (value: Date | null | undefined) =>
  value ? value.toISOString() : null;

async function assertEmployeeExists(
  prisma: PrismaService,
  employeeId: string,
): Promise<void> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });
  if (!employee) {
    throw new BadRequestException(
      'employeeId does not reference an existing employee',
    );
  }
}

export function mapAssetProvisioning(record: {
  id: string;
  employeeId: string;
  equipment: unknown | null;
  platformPermissions: unknown | null;
  itSupervisorApprovedAt: Date | null;
  adminApprovedAt: Date | null;
  financeApprovalRequired: boolean;
  status: AssetProvisioningStatusValue;
  createdAt: Date;
  updatedAt: Date;
}): AssetProvisioningResponseDto {
  return {
    id: record.id,
    employeeId: record.employeeId,
    equipment: record.equipment ?? null,
    platformPermissions: record.platformPermissions ?? null,
    itSupervisorApprovedAt: toIso(record.itSupervisorApprovedAt),
    adminApprovedAt: toIso(record.adminApprovedAt),
    financeApprovalRequired: record.financeApprovalRequired,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

@Injectable()
export class CreateAssetProvisioningUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CreateAssetProvisioningDto,
  ): Promise<AssetProvisioningResponseDto> {
    await assertEmployeeExists(this.prisma, dto.employeeId);

    const record = await this.prisma.assetProvisioning.create({
      data: {
        employeeId: dto.employeeId,
        equipment: dto.equipment ?? undefined,
        platformPermissions: dto.platformPermissions ?? undefined,
        financeApprovalRequired: dto.financeApprovalRequired ?? false,
      },
    });

    return mapAssetProvisioning(record);
  }
}
