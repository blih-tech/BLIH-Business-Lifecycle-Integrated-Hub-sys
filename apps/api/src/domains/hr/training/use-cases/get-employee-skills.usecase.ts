import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapEmployeeSkillResponse } from '../training.mapper';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class GetEmployeeSkillsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(employeeId: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeId,
    );
    const skills = await this.prisma.employeeSkill.findMany({
      where: { employeeId: employee.id },
      include: { skill: true },
      orderBy: { createdAt: 'desc' },
    });
    return skills.map(mapEmployeeSkillResponse);
  }
}
