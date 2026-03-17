import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UpdateJobGradeDto } from '../dto/update-job-grade.dto';
import { mapJobGrade } from '../job-grades.mapper';

@Injectable()
export class UpdateJobGradeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(jobGradeId: string, dto: UpdateJobGradeDto) {
    const existing = await this.prisma.jobGrade.findUnique({
      where: { id: jobGradeId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Job grade not found');
    }

    const code =
      dto.code !== undefined ? dto.code.trim().toUpperCase() : undefined;
    const name = dto.name !== undefined ? dto.name.trim() : undefined;
    if (code !== undefined && !code) {
      throw new BadRequestException('Job grade code is required');
    }
    if (name !== undefined && !name) {
      throw new BadRequestException('Job grade name is required');
    }

    const minSalary = dto.minSalary !== undefined ? dto.minSalary : undefined;
    const maxSalary = dto.maxSalary !== undefined ? dto.maxSalary : undefined;
    if (minSalary != null && maxSalary != null && minSalary > maxSalary) {
      throw new BadRequestException(
        'minSalary must be less than or equal to maxSalary',
      );
    }

    try {
      const jobGrade = await this.prisma.jobGrade.update({
        where: { id: jobGradeId },
        data: {
          ...(code !== undefined ? { code } : {}),
          ...(name !== undefined ? { name } : {}),
          ...(dto.level !== undefined ? { level: dto.level } : {}),
          ...(dto.minSalary !== undefined ? { minSalary: dto.minSalary } : {}),
          ...(dto.maxSalary !== undefined ? { maxSalary: dto.maxSalary } : {}),
        },
      });
      return mapJobGrade(jobGrade);
    } catch {
      throw new ConflictException('Job grade code already exists');
    }
  }
}
