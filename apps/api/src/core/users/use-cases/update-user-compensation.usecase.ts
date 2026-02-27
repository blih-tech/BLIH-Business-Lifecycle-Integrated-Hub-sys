import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UpdateUserCompensationDto } from '../dto/update-user-compensation.dto';

@Injectable()
export class UpdateUserCompensationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string, dto: UpdateUserCompensationDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const effectiveFrom =
      dto.effectiveFrom !== undefined ? new Date(dto.effectiveFrom) : undefined;
    const effectiveTo =
      dto.effectiveTo !== undefined ? new Date(dto.effectiveTo) : undefined;

    if (
      effectiveFrom &&
      effectiveTo &&
      effectiveFrom.getTime() >= effectiveTo.getTime()
    ) {
      throw new BadRequestException('effectiveFrom must be before effectiveTo');
    }

    const compensation = await this.prisma.userCompensation.upsert({
      where: { userId: user.id },
      update: {
        ...(dto.baseSalary !== undefined ? { baseSalary: dto.baseSalary } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.payFrequency !== undefined
          ? { payFrequency: dto.payFrequency }
          : {}),
        ...(dto.bonusEligible !== undefined
          ? { bonusEligible: dto.bonusEligible }
          : {}),
        ...(dto.bonusRate !== undefined ? { bonusRate: dto.bonusRate } : {}),
        ...(effectiveFrom !== undefined ? { effectiveFrom } : {}),
        ...(effectiveTo !== undefined ? { effectiveTo } : {}),
      },
      create: {
        userId: user.id,
        baseSalary: dto.baseSalary,
        currency: dto.currency,
        payFrequency: dto.payFrequency,
        bonusEligible: dto.bonusEligible ?? false,
        bonusRate: dto.bonusRate,
        effectiveFrom,
        effectiveTo,
      },
    });

    const historyFrom = compensation.effectiveFrom ?? new Date();
    const historyTo = compensation.effectiveTo ?? null;
    await this.assertNoOverlap(user.id, historyFrom, historyTo);

    await this.prisma.userCompensationHistory.create({
      data: {
        userId: user.id,
        baseSalary: compensation.baseSalary,
        currency: compensation.currency,
        payFrequency: compensation.payFrequency,
        bonusEligible: compensation.bonusEligible,
        bonusRate: compensation.bonusRate,
        validFrom: historyFrom,
        validTo: historyTo,
        changeReason: dto.changeReason,
        changedBy: dto.changedBy,
      },
    });

    return {
      ...compensation,
      baseSalary: compensation.baseSalary?.toString() ?? null,
      bonusRate: compensation.bonusRate?.toString() ?? null,
      effectiveFrom: compensation.effectiveFrom?.toISOString() ?? null,
      effectiveTo: compensation.effectiveTo?.toISOString() ?? null,
      createdAt: compensation.createdAt.toISOString(),
      updatedAt: compensation.updatedAt.toISOString(),
    };
  }

  private async assertNoOverlap(
    userId: string,
    validFrom: Date,
    validTo: Date | null,
  ): Promise<void> {
    const overlap = await this.prisma.userCompensationHistory.findFirst({
      where: {
        userId,
        validFrom: {
          lte: validTo ?? new Date('9999-12-31T23:59:59.999Z'),
        },
        OR: [
          { validTo: null },
          {
            validTo: {
              gte: validFrom,
            },
          },
        ],
      },
      select: { id: true },
    });
    if (overlap) {
      throw new BadRequestException(
        'Compensation history range overlaps an existing record',
      );
    }
  }
}
