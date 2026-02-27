import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class ListDepartmentsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    return this.prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
