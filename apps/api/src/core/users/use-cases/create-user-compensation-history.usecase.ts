import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { CreateCompensationHistoryDto } from '../dto/create-compensation-history.dto';

@Injectable()
export class CreateUserCompensationHistoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string, dto: CreateCompensationHistoryDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validFrom = new Date(dto.validFrom);
    const validTo = dto.validTo ? new Date(dto.validTo) : null;
    if (validTo && validFrom.getTime() >= validTo.getTime()) {
      throw new BadRequestException('validFrom must be before validTo');
    }

    if (dto.changedById) {
      const changedByUser = await this.prisma.user.findUnique({
        where: { id: dto.changedById },
        select: { id: true },
      });
      if (!changedByUser) {
        throw new BadRequestException(
          'changedById must reference an existing user',
        );
      }
    }

    await this.assertSalaryWithinGradeBand(user.id, dto.baseSalary ?? null);

    await this.assertNoOverlap(user.id, validFrom, validTo);

    const entry = await this.prisma.userCompensationHistory.create({
      data: {
        userId: user.id,
        baseSalary: dto.baseSalary,
        currency: dto.currency,
        payFrequency: dto.payFrequency,
        bonusEligible: dto.bonusEligible ?? false,
        bonusRate: dto.bonusRate,
        validFrom,
        validTo,
        changeReason: dto.changeReason,
        changedById: dto.changedById,
      },
    });

    return {
      ...entry,
      baseSalary: entry.baseSalary?.toString() ?? null,
      bonusRate: entry.bonusRate?.toString() ?? null,
      validFrom: entry.validFrom.toISOString(),
      validTo: entry.validTo?.toISOString() ?? null,
      createdAt: entry.createdAt.toISOString(),
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

  private async assertSalaryWithinGradeBand(
    userId: string,
    baseSalary: string | null,
  ): Promise<void> {
    if (!baseSalary) {
      return;
    }

    const employment = await this.prisma.userEmployment.findUnique({
      where: { userId },
      select: {
        position: {
          select: {
            grade: {
              select: {
                code: true,
                minSalary: true,
                maxSalary: true,
              },
            },
          },
        },
      },
    });

    const grade = employment?.position?.grade;
    if (!grade) {
      return;
    }

    const salary = Number(baseSalary);
    const min = grade.minSalary != null ? Number(grade.minSalary) : null;
    const max = grade.maxSalary != null ? Number(grade.maxSalary) : null;
    if ((min != null && salary < min) || (max != null && salary > max)) {
      throw new BadRequestException(
        `baseSalary must fall within the salary band for grade ${grade.code}`,
      );
    }
  }
}
