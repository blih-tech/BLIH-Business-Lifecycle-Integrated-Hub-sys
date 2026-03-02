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
      select: {
        id: true,
        userId: true,
        employeeCode: true,
        positionId: true,
        employmentType: true,
        managerEmploymentId: true,
        hiredAt: true,
        probationEndAt: true,
        confirmedAt: true,
      },
    });

    let positionId: string | null | undefined;
    if (dto.positionId !== undefined) {
      const normalized = dto.positionId?.trim();
      if (!normalized) {
        positionId = null;
      } else {
        const position = await this.prisma.position.findUnique({
          where: { id: normalized },
          select: { id: true, departmentId: true },
        });
        if (!position) {
          throw new NotFoundException('Position not found');
        }
        positionId = position.id;
      }
    }

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

    if (dto.changedById) {
      const changedBy = await this.prisma.user.findUnique({
        where: { id: dto.changedById },
        select: { id: true },
      });
      if (!changedBy) {
        throw new NotFoundException('Changed by user not found');
      }
    }

    const employment = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.userEmployment.upsert({
        where: { userId: user.id },
        update: {
          ...(dto.employeeCode !== undefined
            ? { employeeCode: dto.employeeCode }
            : {}),
          ...(positionId !== undefined ? { positionId } : {}),
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
          positionId,
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
        include: {
          position: {
            select: {
              title: true,
              gradeId: true,
              grade: {
                select: {
                  code: true,
                  name: true,
                  level: true,
                },
              },
              departmentId: true,
              department: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const changed =
        !existing ||
        existing.employeeCode !== saved.employeeCode ||
        existing.positionId !== saved.positionId ||
        existing.employmentType !== saved.employmentType ||
        existing.managerEmploymentId !== saved.managerEmploymentId ||
        existing.hiredAt?.toISOString() !== saved.hiredAt?.toISOString() ||
        existing.probationEndAt?.toISOString() !==
          saved.probationEndAt?.toISOString() ||
        existing.confirmedAt?.toISOString() !==
          saved.confirmedAt?.toISOString();

      if (changed) {
        await tx.userEmploymentHistory.updateMany({
          where: {
            userEmploymentId: saved.id,
            effectiveTo: null,
          },
          data: {
            effectiveTo: new Date(),
          },
        });

        await tx.userEmploymentHistory.create({
          data: {
            userEmploymentId: saved.id,
            employeeCode: saved.employeeCode,
            departmentId: saved.position?.departmentId ?? null,
            positionId: saved.positionId,
            employmentType: saved.employmentType,
            managerEmploymentId: saved.managerEmploymentId,
            effectiveFrom: saved.hiredAt ?? new Date(),
            changeReason: dto.changeReason,
            changedById: dto.changedById ?? null,
          },
        });
      }

      return saved;
    });

    return {
      userId: employment.userId,
      employeeCode: employment.employeeCode,
      departmentId: employment.position?.departmentId ?? null,
      departmentName: employment.position?.department?.name ?? null,
      positionId: employment.positionId,
      positionTitle: employment.position?.title ?? null,
      jobGradeId: employment.position?.gradeId ?? null,
      jobGradeCode: employment.position?.grade?.code ?? null,
      jobGradeName: employment.position?.grade?.name ?? null,
      jobGradeLevel: employment.position?.grade?.level ?? null,
      employmentType: employment.employmentType,
      managerEmploymentId: employment.managerEmploymentId,
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
