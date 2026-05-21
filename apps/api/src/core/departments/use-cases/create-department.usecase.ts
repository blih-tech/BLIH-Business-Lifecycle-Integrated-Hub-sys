import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';

@Injectable()
export class CreateDepartmentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateDepartmentDto) {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('Department name is required');
    }

    const parentId = await this.resolveParentId(dto.parentId);
    const description = dto.description?.trim() || null;

    try {
      return await this.prisma.department.create({
        data: {
          name,
          description,
          parentId,
        },
        select: {
          id: true,
          name: true,
          parentId: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Department name already exists');
      }
      throw error;
    }
  }

  private async resolveParentId(
    parentId: string | null | undefined,
  ): Promise<string | null> {
    const normalized = parentId?.trim();
    if (!normalized) {
      return null;
    }

    const parent = await this.prisma.department.findUnique({
      where: { id: normalized },
      select: { id: true },
    });
    if (!parent) {
      throw new NotFoundException('Parent department not found');
    }

    return parent.id;
  }
}
