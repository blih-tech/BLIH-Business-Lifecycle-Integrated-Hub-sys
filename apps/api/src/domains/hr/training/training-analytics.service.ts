import { Injectable } from '@nestjs/common';
import type {
  TrainingBudgetUtilizationAnalyticsResponseDto,
  TrainingCompletionRateAnalyticsResponseDto,
  TrainingEffectivenessAnalyticsResponseDto,
  TrainingRoiAnalyticsResponseDto,
  TrainingSkillImprovementAnalyticsResponseDto,
} from '@repo/types';
import { PrismaService } from '../../../platform/prisma/prisma.service';

function dec(value: unknown): number {
  if (value == null) {
    return 0;
  }
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber(): number }).toNumber();
  }
  return Number(value);
}

function yearRange(year: number) {
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

@Injectable()
export class TrainingAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private get feedbackRepo() {
    return (this.prisma as unknown as Record<string, any>).trainingFeedback;
  }

  async getRoi(
    departmentId: string | undefined,
    year: number,
  ): Promise<TrainingRoiAnalyticsResponseDto> {
    const { start, end } = yearRange(year);
    const requests = await this.prisma.trainingRequest.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        createdAt: { gte: start, lt: end },
      },
      select: {
        id: true,
        cost: true,
        costPayer: true,
      },
    });

    const requestIds = requests.map((request) => request.id);
    const completions = await this.prisma.trainingCompletion.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        completionStatus: 'COMPLETED',
        ...(departmentId ? { trainingRequest: { departmentId } } : {}),
        ...(requestIds.length > 0
          ? { trainingRequestId: { in: requestIds } }
          : {}),
      },
      select: {
        id: true,
        skillsAcquired: true,
      },
    });

    const completionIds = completions.map((completion) => completion.id);
    const feedback = completionIds.length
      ? await this.feedbackRepo.aggregate({
          where: {
            trainingCompletionId: { in: completionIds },
            status: { in: ['SUBMITTED', 'REVIEWED'] },
          },
          _avg: { overallRating: true },
        })
      : { _avg: { overallRating: null } };

    const totalSpend = requests.reduce((sum, request) => {
      if (request.costPayer !== 'COMPANY') {
        return sum;
      }
      return sum + dec(request.cost);
    }, 0);
    const skillsRecorded = completions.reduce((sum, completion) => {
      return (
        sum +
        (Array.isArray(completion.skillsAcquired)
          ? completion.skillsAcquired.length
          : 0)
      );
    }, 0);
    const avgFeedbackRating =
      feedback._avg.overallRating != null
        ? dec(feedback._avg.overallRating)
        : null;

    const benefitIndex =
      completions.length * 1.5 +
      skillsRecorded * 0.75 +
      (avgFeedbackRating ?? 0) * 2;
    const roiScore =
      totalSpend <= 0
        ? Math.round(benefitIndex * 100) / 100
        : Math.round((benefitIndex / (totalSpend / 1000)) * 100) / 100;

    return {
      departmentId: departmentId ?? null,
      year,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalCompleted: completions.length,
      avgFeedbackRating,
      skillsRecorded,
      roiScore,
      methodology:
        'Proxy ROI based on company-funded spend, completion volume, feedback rating, and recorded skill gains.',
    };
  }

  async getCompletionRates(
    departmentId: string | undefined,
    year: number,
  ): Promise<TrainingCompletionRateAnalyticsResponseDto> {
    const { start, end } = yearRange(year);
    const requests = await this.prisma.trainingRequest.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        createdAt: { gte: start, lt: end },
      },
      select: {
        id: true,
        status: true,
      },
    });
    const requestIds = requests.map((request) => request.id);
    const completions = await this.prisma.trainingCompletion.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        ...(requestIds.length > 0
          ? { trainingRequestId: { in: requestIds } }
          : {}),
      },
      select: {
        completionStatus: true,
      },
    });

    const approvedRequests = requests.filter(
      (request) => request.status === 'APPROVED',
    ).length;
    const completedTrainings = completions.filter(
      (completion) => completion.completionStatus === 'COMPLETED',
    ).length;
    const droppedTrainings = completions.filter(
      (completion) => completion.completionStatus === 'DROPPED',
    ).length;

    return {
      departmentId: departmentId ?? null,
      year,
      totalRequests: requests.length,
      approvedRequests,
      completedTrainings,
      droppedTrainings,
      completionRate:
        approvedRequests === 0
          ? 0
          : Math.round((completedTrainings / approvedRequests) * 10000) / 100,
    };
  }

  async getEffectiveness(
    departmentId: string | undefined,
    year: number,
  ): Promise<TrainingEffectivenessAnalyticsResponseDto> {
    const { start, end } = yearRange(year);
    const completions = await this.prisma.trainingCompletion.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        ...(departmentId ? { trainingRequest: { departmentId } } : {}),
      },
      select: {
        id: true,
        scoreOrGrade: true,
      },
    });

    const completionIds = completions.map((completion) => completion.id);
    const feedback = completionIds.length
      ? await this.feedbackRepo.findMany({
          where: {
            trainingCompletionId: { in: completionIds },
            status: { in: ['SUBMITTED', 'REVIEWED'] },
          },
          select: {
            overallRating: true,
          },
        })
      : [];

    const feedbackRatings = feedback
      .map((item: { overallRating: unknown }) => dec(item.overallRating))
      .filter((value: number) => Number.isFinite(value) && value > 0);
    const completionScores = completions
      .map((item) => Number(item.scoreOrGrade))
      .filter((value: number) => Number.isFinite(value));

    const avgFeedbackRating =
      feedbackRatings.length === 0
        ? null
        : Math.round(
            (feedbackRatings.reduce(
              (sum: number, value: number) => sum + value,
              0,
            ) /
              feedbackRatings.length) *
              100,
          ) / 100;
    const avgCompletionScore =
      completionScores.length === 0
        ? null
        : Math.round(
            (completionScores.reduce((sum, value) => sum + value, 0) /
              completionScores.length) *
              100,
          ) / 100;

    const effectiveTrainingCount = completions.filter((completion) => {
      const numericScore = Number(completion.scoreOrGrade);
      return Number.isFinite(numericScore) ? numericScore >= 80 : false;
    }).length;

    const effectivenessIndex =
      Math.round(
        (((avgFeedbackRating ?? 0) / 5) * 60 +
          ((avgCompletionScore ?? 0) / 100) * 40) *
          100,
      ) / 100;

    return {
      departmentId: departmentId ?? null,
      year,
      avgFeedbackRating,
      submittedFeedbackCount: feedbackRatings.length,
      avgCompletionScore,
      effectiveTrainingCount,
      effectivenessIndex,
    };
  }

  async getBudgetUtilization(
    departmentId: string | undefined,
    year: number,
  ): Promise<TrainingBudgetUtilizationAnalyticsResponseDto> {
    const budgets = await this.prisma.trainingBudget.findMany({
      where: {
        year,
        ...(departmentId ? { departmentId } : {}),
      },
      select: {
        totalBudget: true,
        usedYtd: true,
      },
    });

    const totalBudget = budgets.reduce(
      (sum, row) => sum + dec(row.totalBudget),
      0,
    );
    const usedBudget = budgets.reduce((sum, row) => sum + dec(row.usedYtd), 0);
    const remainingBudget = Math.max(0, totalBudget - usedBudget);

    return {
      departmentId: departmentId ?? null,
      year,
      totalBudget: Math.round(totalBudget * 100) / 100,
      usedBudget: Math.round(usedBudget * 100) / 100,
      remainingBudget: Math.round(remainingBudget * 100) / 100,
      utilizationRate:
        totalBudget === 0
          ? 0
          : Math.round((usedBudget / totalBudget) * 10000) / 100,
    };
  }

  async getSkillImprovement(
    departmentId: string | undefined,
    year: number,
  ): Promise<TrainingSkillImprovementAnalyticsResponseDto> {
    const { start, end } = yearRange(year);
    const completions = await this.prisma.trainingCompletion.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        ...(departmentId ? { trainingRequest: { departmentId } } : {}),
      },
      select: {
        skillsAcquired: true,
        syncedToProfile: true,
      },
    });

    const frequencies = new Map<string, number>();
    let completionsWithSkills = 0;
    let totalSkillLinksRecorded = 0;
    let syncedProfiles = 0;

    for (const completion of completions) {
      const skills = Array.isArray(completion.skillsAcquired)
        ? completion.skillsAcquired
        : [];
      if (skills.length > 0) {
        completionsWithSkills += 1;
      }
      totalSkillLinksRecorded += skills.length;
      if (completion.syncedToProfile) {
        syncedProfiles += 1;
      }
      for (const skill of skills) {
        const skillId = String((skill as { skillId?: string }).skillId ?? '');
        if (!skillId) {
          continue;
        }
        frequencies.set(skillId, (frequencies.get(skillId) ?? 0) + 1);
      }
    }

    const topSkillIds = [...frequencies.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([skillId]) => skillId);

    return {
      departmentId: departmentId ?? null,
      year,
      completionsWithSkills,
      totalSkillLinksRecorded,
      syncedProfiles,
      topSkillIds,
    };
  }
}
