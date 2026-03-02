import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { CreatePositionDto } from '../dto/create-position.dto';
import { mapPosition } from '../positions.mapper';

@Injectable()
export class CreatePositionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreatePositionDto) {
    const title = dto.title.trim();
    if (!title) {
      throw new BadRequestException('Position title is required');
    }

    const departmentId = await this.resolveDepartmentId(dto.departmentId);
    const gradeId = await this.resolveGradeId(dto.gradeId);

    try {
      const position = await this.prisma.position.create({
        data: {
          title,
          description: dto.description,
          departmentId,
          gradeId,
          isActive: dto.isActive ?? true,
        },
        include: {
          department: {
            select: {
              name: true,
            },
          },
          grade: {
            select: {
              code: true,
              name: true,
              level: true,
            },
          },
        },
      });

      return mapPosition(position);
    } catch {
      throw new ConflictException('Position title already exists');
    }
  }

  private async resolveDepartmentId(
    departmentId: string | undefined,
  ): Promise<string> {
    const normalized = departmentId?.trim();
    if (!normalized) {
      throw new BadRequestException('Department is required');
    }

    const department = await this.prisma.department.findUnique({
      where: { id: normalized },
      select: { id: true },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department.id;
  }

  private async resolveGradeId(
    gradeId: string | null | undefined,
  ): Promise<string | null> {
    const normalized = gradeId?.trim();
    if (!normalized) {
      return null;
    }

    const grade = await this.prisma.jobGrade.findUnique({
      where: { id: normalized },
      select: { id: true },
    });
    if (!grade) {
      throw new NotFoundException('Job grade not found');
    }

    return grade.id;
  }
}
