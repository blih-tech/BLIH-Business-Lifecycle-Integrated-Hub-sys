import { requestJson } from '@/features/hr/onboarding/shared/api-client';

type OnboardingChecklistStatus =
  | 'TODO'
  | 'SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'COMPLETED';

type OnboardingRecord = {
  id: string;
  createdAt: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  checklists: Array<{
    status: OnboardingChecklistStatus;
  }>;
};

type ProbationPlan = {
  status:
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'FAILED'
    | 'EXTENDED';
};

function getMonthLabel(date: Date): string {
  return date.toLocaleString(undefined, { month: 'short' });
}

export async function getOverviewStats() {
  const [onboarding, probation] = await Promise.all([
    requestJson<OnboardingRecord[]>('/hr/onboarding'),
    requestJson<ProbationPlan[]>('/hr/probation'),
  ]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const completedThisMonth = onboarding.filter((item) => {
    if (item.status !== 'COMPLETED') return false;
    const created = new Date(item.createdAt);
    return (
      created.getMonth() === thisMonth && created.getFullYear() === thisYear
    );
  }).length;

  const monthCounts: Record<string, number> = {};
  onboarding.forEach((item) => {
    const month = getMonthLabel(new Date(item.createdAt));
    monthCounts[month] = (monthCounts[month] ?? 0) + 1;
  });

  const totalChecklistItems = onboarding.reduce(
    (sum, item) => sum + item.checklists.length,
    0,
  );
  const completedChecklistItems = onboarding.reduce(
    (sum, item) =>
      sum + item.checklists.filter((c) => c.status === 'COMPLETED').length,
    0,
  );

  const dailyPerformance = totalChecklistItems
    ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
    : 0;

  return {
    activeOnboarding: onboarding.filter((item) => item.status === 'IN_PROGRESS')
      .length,
    completedThisMonth,
    onProbation: probation.filter(
      (p) =>
        p.status === 'NOT_STARTED' ||
        p.status === 'IN_PROGRESS' ||
        p.status === 'EXTENDED',
    ).length,
    workHours: {
      daily: `${Math.min(8, Math.round((dailyPerformance / 100) * 8))}h`,
      dailyPerformance: `${dailyPerformance}%`,
      monthly: `${Math.min(160, Math.round((dailyPerformance / 100) * 160))}h`,
      monthlyPerformance: `${dailyPerformance}%`,
      annually: `${Math.min(1920, Math.round((dailyPerformance / 100) * 1920))}h`,
      annualPerformance: `${dailyPerformance}%`,
    },
    totalChecklists: onboarding.length,
    totalItems: totalChecklistItems,
    timesUsed: completedChecklistItems,
    jobApplicationFrequency: Object.entries(monthCounts).map(
      ([month, count]) => ({
        month,
        count,
      }),
    ),
  };
}
