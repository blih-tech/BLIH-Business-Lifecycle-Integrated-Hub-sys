import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import {
  buildSuccessEnvelope,
  type ResponseEnvelopeSuccessDto,
} from '../../../../shared/dto/response-envelope.dto';
import type { EmployeeListQueryDto } from '../dto/employee-list-query.dto';
import type { EmployeeListItemResponseDto } from '../dto/employee-response.dto';
import { resolveEmployeeSubjectOrThrow } from '../employee-subject.utils';
import {
  employeeFullInclude,
  mapEmployeeFull,
} from '../mappers/employee.mapper';
import type { ListEmployeesQueryDto } from '@repo/types';

function buildWhere(query: EmployeeListQueryDto): Prisma.EmployeeWhereInput {
  const and: Prisma.EmployeeWhereInput[] = [];

  const isUuid = (value: string): boolean =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );

  if (query.employeeStatus) {
    and.push({ employeeStatus: query.employeeStatus });
  }

  if (query.lifecycleStatus) {
    and.push({ lifecycle: { is: { status: query.lifecycleStatus } } });
  }

  if (query.employmentType || query.positionId || query.departmentId) {
    const employmentWhere: Prisma.UserEmploymentWhereInput = {};
    if (query.employmentType) {
      employmentWhere.employmentType = query.employmentType;
    }
    if (query.positionId) {
      employmentWhere.positionId = query.positionId;
    }
    if (query.departmentId) {
      employmentWhere.position = { is: { departmentId: query.departmentId } };
    }
    and.push({ employment: { is: employmentWhere } });
  }

  if (query.countryId || query.city || query.addressStatus) {
    const addressWhere: Prisma.EmployeeAddressWhereInput = {};
    if (query.countryId) addressWhere.countryId = query.countryId;
    if (query.city)
      addressWhere.city = { contains: query.city, mode: 'insensitive' };
    if (query.addressStatus) addressWhere.status = query.addressStatus;
    and.push({ employeeAddress: { is: addressWhere } });
  }

  if (query.profileStatus) {
    and.push({ profile: { is: { status: query.profileStatus } } });
  }
  if (query.bankStatus) {
    and.push({ employeeBankDetail: { is: { status: query.bankStatus } } });
  }
  if (query.emergencyContactStatus) {
    and.push({
      employeeEmergencyContact: {
        is: { status: query.emergencyContactStatus },
      },
    });
  }
  if (query.educationStatus) {
    and.push({ employeeEducation: { is: { status: query.educationStatus } } });
  }

  if (query.search?.trim()) {
    const term = query.search.trim();

    const searchOr: Prisma.EmployeeWhereInput[] = [
      {
        user: {
          is: {
            OR: [
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
              { username: { contains: term, mode: 'insensitive' } },
              { phone: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
      },
      {
        employment: {
          is: {
            OR: [
              { employeeCode: { contains: term, mode: 'insensitive' } },
              {
                position: {
                  is: { title: { contains: term, mode: 'insensitive' } },
                },
              },
              {
                position: {
                  is: {
                    department: {
                      is: { name: { contains: term, mode: 'insensitive' } },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    ];

    // `Employee.id` is a UUID column so we can only match by equality.
    if (isUuid(term)) {
      searchOr.unshift({ id: { equals: term } });
    }

    and.push({ OR: searchOr });
  }

  return and.length > 0 ? { AND: and } : {};
}

function mapListItem(
  employee: Prisma.EmployeeGetPayload<{
    include: {
      user: {
        select: {
          id: true;
          keycloakId: true;
          username: true;
          email: true;
          firstName: true;
          lastName: true;
          phone: true;
          status: true;
        };
      };
      employment: {
        include: {
          position: {
            select: {
              title: true;
              departmentId: true;
              department: { select: { name: true } };
            };
          };
        };
      };
      lifecycle: { select: { status: true } };
    };
  }>,
): EmployeeListItemResponseDto {
  return {
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
  };
}

@Injectable()
export class ListAllEmployeesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: EmployeeListQueryDto,
  ): Promise<EmployeeListItemResponseDto[]> {
    const employees = await this.prisma.employee.findMany({
      where: buildWhere(query),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            keycloakId: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
          },
        },
        employment: {
          include: {
            position: {
              select: {
                title: true,
                departmentId: true,
                department: { select: { name: true } },
              },
            },
          },
        },
        lifecycle: { select: { status: true } },
      },
    });

    return employees.map(mapListItem);
  }
}

@Injectable()
export class ListPaginatedEmployeesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: EmployeeListQueryDto,
    requestId: string,
  ): Promise<ResponseEnvelopeSuccessDto<EmployeeListItemResponseDto[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);

    const [employees, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              keycloakId: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              status: true,
            },
          },
          employment: {
            include: {
              position: {
                select: {
                  title: true,
                  departmentId: true,
                  department: { select: { name: true } },
                },
              },
            },
          },
          lifecycle: { select: { status: true } },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return buildSuccessEnvelope(
      employees.map(mapListItem),
      requestId,
      'Employees retrieved successfully',
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    );
  }
}

@Injectable()
export class GetEmployeeFullUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(employeeIdOrUserIdOrKeycloakId: string) {
    const subject = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeIdOrUserIdOrKeycloakId,
    );
    const employee = await this.prisma.employee.findUnique({
      where: { id: subject.id },
      include: employeeFullInclude,
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return mapEmployeeFull(employee);
  }
}

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
