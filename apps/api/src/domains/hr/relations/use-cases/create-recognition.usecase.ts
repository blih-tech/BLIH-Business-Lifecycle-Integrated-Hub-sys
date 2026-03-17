import { Injectable } from '@nestjs/common';
import type { CreateRecognitionDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';
import { mapRecognition } from '../relations.mapper';

@Injectable()
export class CreateRecognitionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateRecognitionDto) {
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.nominatorId },
    });
    const nomineeEmployee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.nomineeEmployeeId,
      'Nominee employee not found',
    );
    const recognition = await this.prisma.recognition.create({
      data: {
        nominatorId: dto.nominatorId,
        nomineeEmployeeId: nomineeEmployee.id,
        category: dto.category as never,
        description: dto.description,
        impact: dto.impact ?? null,
        suggestedAward: dto.suggestedAward ?? null,
        publicRecognition: dto.publicRecognition ?? true,
        status: 'PENDING',
      },
    });
    return mapRecognition(recognition);
  }
}
