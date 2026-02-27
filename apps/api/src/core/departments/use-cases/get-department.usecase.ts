import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class GetDepartmentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }
}
