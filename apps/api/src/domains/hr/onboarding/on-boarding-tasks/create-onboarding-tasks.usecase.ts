import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateOnboardingTaskDto } from './on-boarding-tasks.dto';

// ─── Shared helpers ────────────────────────────────────────────────────────────

/** Assert a user UUID exists in the database, or throw a 400. */
async function assertUserExists(
  prisma: PrismaService,
  userId: string,
  field: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw new BadRequestException(
      `${field} does not reference an existing user`,
    );
  }
}

/** Map a raw Prisma OnboardingTask record to the response shape. */
export function mapOnboardingTask(task: {
  id: string;
  department: string;
  title: string;
  description: string | null;
  completedById: string | null;
  completedBy?: { firstName: string; lastName: string } | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { checklist: number };
}) {
  return {
    id: task.id,
    department: task.department,
    title: task.title,
    description: task.description,
    completedById: task.completedById,
    completedByName: task.completedBy
      ? `${task.completedBy.firstName} ${task.completedBy.lastName}`
      : null,
    checklistCount: task._count?.checklist ?? 0,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

/** Standard Prisma include for OnboardingTask queries. */
export const onboardingTaskInclude = {
  completedBy: {
    select: { firstName: true, lastName: true },
  },
  _count: {
    select: { checklist: true },
  },
} as const;

// ─── Use Case ─────────────────────────────────────────────────────────────────

@Injectable()
export class CreateOnboardingTaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateOnboardingTaskDto) {
    if (dto.completedById) {
      await assertUserExists(this.prisma, dto.completedById, 'completedById');
    }

    const task = await this.prisma.onboardingTask.create({
      data: {
        department: dto.department,
        title: dto.title,
        description: dto.description ?? null,
        completedById: dto.completedById ?? null,
      },
      include: onboardingTaskInclude,
    });

    return mapOnboardingTask(task);
  }
}
