import type {
  EmployeeFull,
  FinalEvaluation,
  ProbationPlan,
} from '../api/probation.api';
import type { ProbationEmployee } from '../types';

export function mapProbationToEmployee(
  plan: ProbationPlan,
  evaluation?: FinalEvaluation | null,
  employee?: EmployeeFull | null,
): ProbationEmployee {
  const start = new Date(plan.startDate);
  const end = new Date(plan.endDate);

  const daysRemaining = Math.max(
    0,
    Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const fullName =
    [employee?.firstName, employee?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Employee';

  return {
    id: plan.id,
    name: fullName,
    role: employee?.employment?.positionTitle || 'Unknown Role',
    department: employee?.departmentName || 'Unknown Dept',
    avatarText:
      fullName
        .split(' ')
        .filter(Boolean)
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'NA',

    startDate: start.toDateString(),
    endDate: end.toDateString(),
    daysRemaining: `${daysRemaining} Days`,

    automatedScore: evaluation ? `${evaluation.totalScore ?? 0}%` : '0%',

    reviews: plan.checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      dateLabel: checkpoint.name,
      dateValue: new Date(checkpoint.checkpointDate).toDateString(),
      scoreLabel: 'Score',
      scoreValue: evaluation ? `${evaluation.totalScore ?? 0}%` : '-',
      reviewer: 'HR',
    })),

    kpiMetrics: plan.kpis.map((kpi) => ({
      id: kpi.id,
      label: kpi.kpiName,
      score: '-', // backend doesn't store formatted score
      progress: evaluation ? Math.min(100, evaluation.totalScore || 0) : 0,
    })),

    overallScore: evaluation ? `${evaluation.totalScore ?? 0}%` : '0%',
  };
}
