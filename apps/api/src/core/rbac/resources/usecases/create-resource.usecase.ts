import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { CreateResourceDto } from '../dto/create-resource.dto';

@Injectable()
export class CreateResourceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateResourceDto) {
    const normalizedName = dto.name.trim().toLowerCase();

    try {
      return await this.prisma.permissionResource.create({
        data: {
          name: normalizedName,
          description: dto.description,
        },
      });
    } catch {
      throw new BadRequestException('Resource name already exists');
    }
  }
}
