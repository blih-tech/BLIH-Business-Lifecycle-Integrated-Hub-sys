import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

@Injectable()
export class UpdateDepartmentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(departmentId: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({
      where: {
        id: departmentId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const hasAnyChange = [dto.name, dto.description].some(
      (value) => value !== undefined,
    );
    if (!hasAnyChange) {
      throw new BadRequestException('At least one field must be provided');
    }

    const normalizedName = dto.name?.trim();
    if (dto.name !== undefined && !normalizedName) {
      throw new BadRequestException('Department name cannot be empty');
    }
    if (normalizedName && normalizedName !== department.name) {
      const duplicate = await this.prisma.department.findUnique({
        where: {
          name: normalizedName,
        },
        select: {
          id: true,
        },
      });
      if (duplicate) {
        throw new ConflictException('Department already exists');
      }
    }

    return this.prisma.department.update({
      where: {
        id: departmentId,
      },
      data: {
        ...(normalizedName !== undefined ? { name: normalizedName } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
      },
    });
  }
}
