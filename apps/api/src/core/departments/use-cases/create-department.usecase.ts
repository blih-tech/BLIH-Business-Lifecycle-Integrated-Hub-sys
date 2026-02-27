import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';

@Injectable()
export class CreateDepartmentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateDepartmentDto) {
    const normalizedName = dto.name.trim();
    if (!normalizedName) {
      throw new BadRequestException('Department name is required');
    }

    const existing = await this.prisma.department.findUnique({
      where: {
        name: normalizedName,
      },
      select: {
        id: true,
      },
    });
    if (existing) {
      throw new ConflictException('Department already exists');
    }

    return this.prisma.department.create({
      data: {
        name: normalizedName,
        description: dto.description,
      },
    });
  }
}
