export interface TrainingRoiAnalyticsResponseDto {
  departmentId: string | null;
  year: number;
  totalSpend: number;
  totalCompleted: number;
  avgFeedbackRating: number | null;
  skillsRecorded: number;
  roiScore: number;
  methodology: string;
}

export interface TrainingCompletionRateAnalyticsResponseDto {
  departmentId: string | null;
  year: number;
  totalRequests: number;
  approvedRequests: number;
  completedTrainings: number;
  droppedTrainings: number;
  completionRate: number;
}

export interface TrainingEffectivenessAnalyticsResponseDto {
  departmentId: string | null;
  year: number;
  avgFeedbackRating: number | null;
  submittedFeedbackCount: number;
  avgCompletionScore: number | null;
  effectiveTrainingCount: number;
  effectivenessIndex: number;
}

export interface TrainingBudgetUtilizationAnalyticsResponseDto {
  departmentId: string | null;
  year: number;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  utilizationRate: number;
}

export interface TrainingSkillImprovementAnalyticsResponseDto {
  departmentId: string | null;
  year: number;
  completionsWithSkills: number;
  totalSkillLinksRecorded: number;
  syncedProfiles: number;
  topSkillIds: string[];
}
