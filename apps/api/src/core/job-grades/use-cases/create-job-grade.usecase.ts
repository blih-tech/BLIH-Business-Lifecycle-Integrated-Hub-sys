import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { CreateJobGradeDto } from '../dto/create-job-grade.dto';
import { mapJobGrade } from '../job-grades.mapper';

@Injectable()
export class CreateJobGradeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateJobGradeDto) {
    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();
    if (!code) {
      throw new BadRequestException('Job grade code is required');
    }
    if (!name) {
      throw new BadRequestException('Job grade name is required');
    }
    this.assertSalaryRange(dto.minSalary ?? null, dto.maxSalary ?? null);

    try {
      const jobGrade = await this.prisma.jobGrade.create({
        data: {
          code,
          name,
          level: dto.level,
          minSalary: dto.minSalary ?? null,
          maxSalary: dto.maxSalary ?? null,
        },
      });
      return mapJobGrade(jobGrade);
    } catch {
      throw new ConflictException('Job grade code already exists');
    }
  }

  private assertSalaryRange(
    minSalary: number | null,
    maxSalary: number | null,
  ) {
    if (minSalary != null && maxSalary != null && minSalary > maxSalary) {
      throw new BadRequestException(
        'minSalary must be less than or equal to maxSalary',
      );
    }
  }
}
