import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { CreateActionDto } from '../dto/create-action.dto';

@Injectable()
export class CreateActionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateActionDto) {
    const normalizedName = dto.name.trim().toLowerCase();

    try {
      return await this.prisma.permissionAction.create({
        data: {
          name: normalizedName,
          description: dto.description,
        },
      });
    } catch {
      throw new BadRequestException('Action name already exists');
    }
  }
}
