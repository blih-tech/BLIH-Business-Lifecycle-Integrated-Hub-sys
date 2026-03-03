import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { ListEmployeesQueryDto } from '@repo/types';

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

    const filters: Prisma.EmployeeWhereInput[] = [];
    const employmentWhere: Prisma.UserEmploymentWhereInput = {};
    if (departmentId) {
      employmentWhere.position = {
        is: {
          departmentId,
        },
      };
    }
    if (lifecycleStatus) {
      filters.push({
        lifecycle: {
          is: {
            status: lifecycleStatus,
          },
        },
      });
    }
    if (employmentType) {
      employmentWhere.employmentType = employmentType;
    }
    if (Object.keys(employmentWhere).length > 0) {
      filters.push({
        employment: {
          is: employmentWhere,
        },
      });
    }
    if (search?.trim()) {
      const term = search.trim();
      filters.push({
        user: {
          is: {
            OR: [
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
      });
    }
    const where: Prisma.EmployeeWhereInput = { AND: filters };

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          createdAt: true,
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
          user: {
            select: {
              keycloakId: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    const items = employees.map((employee) => ({
      id: employee.id,
      userId: employee.userId ?? null,
      keycloakId: employee.user?.keycloakId ?? null,
      username: employee.user?.username ?? null,
      email: employee.user?.email ?? null,
      firstName: employee.user?.firstName ?? null,
      lastName: employee.user?.lastName ?? null,
      phone: employee.user?.phone ?? null,
      status: employee.user?.status ?? null,
      departmentId: employee.employment?.position?.departmentId ?? null,
      departmentName: employee.employment?.position?.department?.name ?? null,
      employeeCode: employee.employment?.employeeCode ?? null,
      positionId: employee.employment?.positionId ?? null,
      positionTitle: employee.employment?.position?.title ?? null,
      employmentType: employee.employment?.employmentType ?? 'FULL_TIME',
      lifecycleStatus: employee.lifecycle?.status ?? null,
      hiredAt: employee.employment?.hiredAt?.toISOString() ?? null,
      createdAt: employee.createdAt.toISOString(),
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
