import { Injectable } from '@nestjs/common';
import type { CreateGrievanceDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapGrievance } from '../relations.mapper';

@Injectable()
export class CreateGrievanceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateGrievanceDto) {
    await this.prisma.user.findUniqueOrThrow({ where: { id: dto.userId } });
    const grievance = await this.prisma.grievance.create({
      data: {
        userId: dto.userId,
        subject: dto.subject,
        description: dto.description,
        category: dto.category ?? null,
        submittedAt: new Date(),
        status: 'OPEN',
      },
    });
    return mapGrievance(grievance);
  }
}
