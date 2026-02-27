import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UpdateUserEmploymentDto } from '../dto/update-user-employment.dto';

@Injectable()
export class UpdateUserEmploymentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string, dto: UpdateUserEmploymentDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.employeeCode) {
      const duplicate = await this.prisma.userEmployment.findFirst({
        where: {
          employeeCode: dto.employeeCode,
          NOT: {
            userId: user.id,
          },
        },
        select: { id: true },
      });
      if (duplicate) {
        throw new ConflictException('employeeCode already exists');
      }
    }

    const existing = await this.prisma.userEmployment.findUnique({
      where: { userId: user.id },
      select: { id: true, managerEmploymentId: true },
    });

    let managerEmploymentId: string | null | undefined;
    if (dto.managerEmploymentId !== undefined) {
      const normalized = dto.managerEmploymentId?.trim();
      if (!normalized) {
        managerEmploymentId = null;
      } else {
        const managerEmployment = await this.prisma.userEmployment.findUnique({
          where: { id: normalized },
          select: { id: true },
        });
        if (!managerEmployment) {
          throw new NotFoundException('Manager employment not found');
        }
        if (existing?.id && managerEmployment.id === existing.id) {
          throw new BadRequestException(
            'Employment manager cannot reference itself',
          );
        }
        if (existing?.id) {
          await this.assertNoEmploymentCycle(existing.id, managerEmployment.id);
        }
        managerEmploymentId = managerEmployment.id;
      }
    }

    const employment = await this.prisma.userEmployment.upsert({
      where: { userId: user.id },
      update: {
        ...(dto.employeeCode !== undefined
          ? { employeeCode: dto.employeeCode }
          : {}),
        ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle } : {}),
        ...(dto.employmentType !== undefined
          ? { employmentType: dto.employmentType }
          : {}),
        ...(managerEmploymentId !== undefined ? { managerEmploymentId } : {}),
        ...(dto.hiredAt !== undefined
          ? { hiredAt: new Date(dto.hiredAt) }
          : {}),
        ...(dto.probationEndAt !== undefined
          ? { probationEndAt: new Date(dto.probationEndAt) }
          : {}),
        ...(dto.confirmedAt !== undefined
          ? { confirmedAt: new Date(dto.confirmedAt) }
          : {}),
      },
      create: {
        userId: user.id,
        employeeCode: dto.employeeCode,
        jobTitle: dto.jobTitle,
        employmentType: dto.employmentType,
        managerEmploymentId,
        ...(dto.hiredAt !== undefined
          ? { hiredAt: new Date(dto.hiredAt) }
          : {}),
        ...(dto.probationEndAt !== undefined
          ? { probationEndAt: new Date(dto.probationEndAt) }
          : {}),
        ...(dto.confirmedAt !== undefined
          ? { confirmedAt: new Date(dto.confirmedAt) }
          : {}),
      },
    });

    return {
      ...employment,
      hiredAt: employment.hiredAt?.toISOString() ?? null,
      probationEndAt: employment.probationEndAt?.toISOString() ?? null,
      confirmedAt: employment.confirmedAt?.toISOString() ?? null,
      createdAt: employment.createdAt.toISOString(),
      updatedAt: employment.updatedAt.toISOString(),
    };
  }

  private async assertNoEmploymentCycle(
    currentEmploymentId: string,
    managerEmploymentId: string,
  ): Promise<void> {
    const visited = new Set<string>();
    let cursor: string | null = managerEmploymentId;

    while (cursor) {
      if (cursor === currentEmploymentId) {
        throw new BadRequestException('Employment manager cycle detected');
      }
      if (visited.has(cursor)) {
        break;
      }
      visited.add(cursor);
      const node = await this.prisma.userEmployment.findUnique({
        where: { id: cursor },
        select: { managerEmploymentId: true },
      });
      cursor = node?.managerEmploymentId ?? null;
    }
  }
}
