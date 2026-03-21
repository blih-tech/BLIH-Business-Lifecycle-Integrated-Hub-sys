import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateOnboardingTaskDto } from './onboarding-tasks.dto';

// ─── Shared helpers ────────────────────────────────────────────────────────────

/** Map a raw Prisma OnboardingTask record to the response shape. */
export function mapOnboardingTask(task: {
  id: string;
  department: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { checklist: number };
}) {
  return {
    id: task.id,
    department: task.department,
    title: task.title,
    description: task.description,
    checklistCount: task._count?.checklist ?? 0,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

/** Standard Prisma include for OnboardingTask queries. */
export const onboardingTaskInclude = {
  _count: {
    select: { checklist: true },
  },
} as const;

// ─── Use Case ─────────────────────────────────────────────────────────────────

@Injectable()
export class CreateOnboardingTaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateOnboardingTaskDto) {
    const task = await this.prisma.onboardingTask.create({
      data: {
        department: dto.department,
        title: dto.title,
        description: dto.description ?? null,
      },
      include: onboardingTaskInclude,
    });

    return mapOnboardingTask(task);
  }
}
