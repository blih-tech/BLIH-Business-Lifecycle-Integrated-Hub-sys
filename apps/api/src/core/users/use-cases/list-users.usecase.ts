import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    return this.prisma.user
      .findMany({
        include: {
          employee: {
            select: {
              employment: {
                select: {
                  position: {
                    select: {
                      departmentId: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      .then((users) =>
        users.map((user) => ({
          id: user.id,
          keycloakId: user.keycloakId,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          status: user.status,
          departmentId:
            user.employee?.employment?.position?.departmentId ?? null,
          permissions: user.permissions,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      );
  }
}
