import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

export async function resolveEmployeeSubjectOrThrow(
  prisma: PrismaService,
  idOrUserIdOrKeycloakId: string,
  message = 'Employee not found',
) {
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: idOrUserIdOrKeycloakId },
        { userId: idOrUserIdOrKeycloakId },
        {
          user: {
            is: {
              keycloakId: idOrUserIdOrKeycloakId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!employee) {
    throw new NotFoundException(message);
  }

  return employee;
}

export async function ensureEmployeeForUser(
  prisma: PrismaService,
  userId: string,
) {
  return prisma.employee.upsert({
    where: {
      userId,
    },
    update: {},
    create: {
      id: userId,
      userId,
    },
    select: {
      id: true,
      userId: true,
    },
  });
}
