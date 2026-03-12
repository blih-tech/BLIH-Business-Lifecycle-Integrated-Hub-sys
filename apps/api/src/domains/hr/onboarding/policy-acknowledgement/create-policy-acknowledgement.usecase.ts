import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  CreatePolicyAcknowledgementDto,
  PolicyAcknowledgementResponseDto,
} from './policy-acknowledgement.dto';

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

export function mapPolicyAcknowledgement(record: {
  id: string;
  employeeId: string;
  policies: unknown | null;
  allAcknowledged: boolean;
  confirmedAt: Date | null;
  systemAccessGrantedAt: Date | null;
  verifiedById: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): PolicyAcknowledgementResponseDto {
  return {
    id: record.id,
    employeeId: record.employeeId,
    policies: record.policies ?? null,
    allAcknowledged: record.allAcknowledged,
    confirmedAt: toIso(record.confirmedAt),
    systemAccessGrantedAt: toIso(record.systemAccessGrantedAt),
    verifiedById: record.verifiedById,
    verifiedAt: toIso(record.verifiedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

@Injectable()
export class CreatePolicyAcknowledgementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CreatePolicyAcknowledgementDto,
  ): Promise<PolicyAcknowledgementResponseDto> {
    await assertEmployeeExists(this.prisma, dto.employeeId);

    const record = await this.prisma.policyAcknowledgement.create({
      data: {
        employeeId: dto.employeeId,
        policies: dto.policies ?? undefined,
        allAcknowledged: dto.allAcknowledged ?? false,
        confirmedAt: dto.confirmedAt ? new Date(dto.confirmedAt) : undefined,
      },
    });

    return mapPolicyAcknowledgement(record);
  }
}
