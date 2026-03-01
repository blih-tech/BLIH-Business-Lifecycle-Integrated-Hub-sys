import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { ListEmployeesQueryDto } from '@blih/types';

@Injectable()
export class ListEmployeesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListEmployeesQueryDto) {
    const {
      departmentId,
      lifecycleStatus,
      employmentType,
      search,
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.UserWhereInput = {};
    const employmentWhere: Prisma.UserEmploymentWhereInput = {};
    if (departmentId) {
      employmentWhere.position = {
        is: {
          departmentId,
        },
      };
    }
    if (lifecycleStatus) {
      where.lifecycle = { status: lifecycleStatus };
    }
    if (employmentType) {
      employmentWhere.employmentType = employmentType;
    }
    if (Object.keys(employmentWhere).length > 0) {
      where.employment = {
        is: employmentWhere,
      };
    }
    if (search?.trim()) {
      const term = search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          keycloakId: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          employment: {
            select: {
              employeeCode: true,
              positionId: true,
              position: {
                select: {
                  title: true,
                  departmentId: true,
                  department: { select: { name: true } },
                },
              },
              employmentType: true,
              hiredAt: true,
            },
          },
          lifecycle: { select: { status: true } },
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const items = users.map((u) => ({
      id: u.id,
      keycloakId: u.keycloakId,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone ?? null,
      status: u.status,
      departmentId: u.employment?.position?.departmentId ?? null,
      departmentName: u.employment?.position?.department?.name ?? null,
      employeeCode: u.employment?.employeeCode ?? null,
      positionId: u.employment?.positionId ?? null,
      positionTitle: u.employment?.position?.title ?? null,
      employmentType: u.employment?.employmentType ?? 'FULL_TIME',
      lifecycleStatus: u.lifecycle?.status ?? null,
      hiredAt: u.employment?.hiredAt?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
