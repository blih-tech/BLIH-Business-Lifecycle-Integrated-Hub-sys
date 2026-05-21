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

    const departmentId = await this.resolveDepartmentId(dto);
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

  private async resolveDepartmentId(dto: CreatePositionDto): Promise<string> {
    const { departmentId, departmentName } = dto;

    // 1. Try resolving by ID if provided
    if (departmentId?.trim()) {
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId.trim() },
        select: { id: true },
      });
      if (!department) {
        throw new NotFoundException('Department not found');
      }
      return department.id;
    }

    // 2. Try resolving by name if provided
    if (departmentName?.trim()) {
      const name = departmentName.trim();
      // Find or create
      const department = await this.prisma.department.upsert({
        where: { name },
        update: {},
        create: { name },
        select: { id: true },
      });
      return department.id;
    }

    throw new BadRequestException(
      'Department ID or Department Name is required',
    );
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
