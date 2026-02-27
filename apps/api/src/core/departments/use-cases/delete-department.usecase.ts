import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteDepartmentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: {
        id: departmentId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const userCount = await this.prisma.user.count({
      where: {
        departmentId: department.id,
      },
    });
    if (userCount > 0) {
      throw new BadRequestException(
        `Department has ${userCount} linked user(s) and cannot be deleted`,
      );
    }

    await this.prisma.department.delete({
      where: {
        id: department.id,
      },
    });

    return {
      success: true,
      deletedDepartment: department.name,
    };
  }
}
