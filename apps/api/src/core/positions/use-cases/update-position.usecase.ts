import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { mapPosition } from '../positions.mapper';

@Injectable()
export class UpdatePositionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(positionId: string, dto: UpdatePositionDto) {
    const existing = await this.prisma.position.findUnique({
      where: { id: positionId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Position not found');
    }

    const title = this.normalizeTitle(dto.title);
    const departmentId =
      dto.departmentId !== undefined
        ? await this.resolveDepartmentId(dto.departmentId)
        : undefined;
    const gradeId =
      dto.gradeId !== undefined
        ? await this.resolveGradeId(dto.gradeId)
        : undefined;

    try {
      const position = await this.prisma.position.update({
        where: { id: positionId },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(dto.departmentId !== undefined ? { departmentId } : {}),
          ...(dto.gradeId !== undefined ? { gradeId } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
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

  private normalizeTitle(title: string | undefined): string | undefined {
    if (title === undefined) {
      return undefined;
    }

    const normalized = title.trim();
    if (!normalized) {
      throw new BadRequestException('Position title is required');
    }

    return normalized;
  }

  private async resolveDepartmentId(
    departmentId: string | null | undefined,
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
