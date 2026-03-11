import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  PolicyAcknowledgementResponseDto,
  UpdatePolicyAcknowledgementDto,
} from './policy-acknowledgement.dto';
import { mapPolicyAcknowledgement } from './create-policy-acknowledgement.usecase';

async function assertUserExists(
  prisma: PrismaService,
  userId: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw new BadRequestException(
      'verifiedById does not reference an existing user',
    );
  }
}

@Injectable()
export class UpdatePolicyAcknowledgementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdatePolicyAcknowledgementDto,
  ): Promise<PolicyAcknowledgementResponseDto> {
    const existing = await this.prisma.policyAcknowledgement.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(
        `Policy acknowledgement with id "${id}" not found`,
      );
    }

    if (dto.verifiedById) {
      await assertUserExists(this.prisma, dto.verifiedById);
    }

    const record = await this.prisma.policyAcknowledgement.update({
      where: { id },
      data: {
        ...(dto.policies !== undefined && { policies: dto.policies }),
        ...(dto.allAcknowledged !== undefined && {
          allAcknowledged: dto.allAcknowledged,
        }),
        ...(dto.confirmedAt !== undefined && {
          confirmedAt: dto.confirmedAt ? new Date(dto.confirmedAt) : null,
        }),
        ...(dto.systemAccessGrantedAt !== undefined && {
          systemAccessGrantedAt: dto.systemAccessGrantedAt
            ? new Date(dto.systemAccessGrantedAt)
            : null,
        }),
        ...(dto.verifiedById !== undefined && {
          verifiedById: dto.verifiedById,
        }),
        ...(dto.verifiedAt !== undefined && {
          verifiedAt: dto.verifiedAt ? new Date(dto.verifiedAt) : null,
        }),
      },
    });

    return mapPolicyAcknowledgement(record);
  }
}
