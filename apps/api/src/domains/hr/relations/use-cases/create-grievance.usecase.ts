import { Injectable } from '@nestjs/common';
import type { CreateGrievanceDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';
import { mapGrievance } from '../relations.mapper';

@Injectable()
export class CreateGrievanceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateGrievanceDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
      'Employee not found',
    );
    const grievance = await this.prisma.grievance.create({
      data: {
        employeeId: employee.id,
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
