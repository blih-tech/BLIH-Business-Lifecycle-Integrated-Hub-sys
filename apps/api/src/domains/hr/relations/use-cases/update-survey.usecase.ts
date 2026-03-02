import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateSurveyDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSurvey } from '../relations.mapper';

@Injectable()
export class UpdateSurveyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateSurveyDto) {
    const existing = await this.prisma.survey.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Survey not found');
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.opensAt !== undefined)
      data.opensAt = dto.opensAt ? new Date(dto.opensAt) : null;
    if (dto.closesAt !== undefined)
      data.closesAt = dto.closesAt ? new Date(dto.closesAt) : null;
    const updated = await this.prisma.survey.update({
      where: { id },
      data: data as never,
    });
    return mapSurvey(updated);
  }
}
