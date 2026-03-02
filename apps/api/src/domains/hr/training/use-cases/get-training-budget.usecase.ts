import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingBudgetResponse } from '../training.mapper';
import { calculateTrainingBudget } from '../budget.utils';

@Injectable()
export class GetTrainingBudgetUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(departmentId: string, year: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: { positions: { where: { isActive: true } } },
    });
    if (!dept) throw new NotFoundException('Department not found');
    let b = await this.prisma.trainingBudget.findUnique({
      where: { departmentId_year: { departmentId, year } },
    });
    if (!b) {
      const prev = await this.prisma.trainingBudget.findUnique({
        where: { departmentId_year: { departmentId, year: year - 1 } },
      });
      const used =
        prev && Number(prev.totalBudget) > 0
          ? Number(prev.usedYtd) / Number(prev.totalBudget)
          : 0;
      const { totalBudget, perPersonAmount } = calculateTrainingBudget(
        dept.positions.length,
        used,
      );
      b = await this.prisma.trainingBudget.create({
        data: { departmentId, year, totalBudget, usedYtd: 0, perPersonAmount },
      });
    }
    return mapTrainingBudgetResponse(b);
  }
}
