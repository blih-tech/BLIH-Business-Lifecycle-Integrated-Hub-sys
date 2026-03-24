export type TrainingSkillsStat = {
  id: string;
  label: string;
  value: string;
  icon: 'clock' | 'check' | 'trend' | 'badge';
};

export type TrainingRequest = {
  id: string;
  initials: string;
  name: string;
  department: string;
  title: string;
  provider: string;
  cost: string;
  duration: string;
  startDate: string;
  justification: string;
  status: string;
};

export type PreviousTraining = {
  id: string;
  initials: string;
  name: string;
  department: string;
  trainingTitle: string;
  certificationLabel: string;
  certificationValue: string;
  score: string;
  completed: string;
};

export type SkillGapAssessment = {
  id: string;
  initials: string;
  name: string;
  department: string;
  status: 'ongoing' | 'completed';
  skillArea: string;
  progress?: number;
  dueDate?: string;
  identifiedGaps: string[];
  recommendedActions?: string[];
};

export type RecommendationPriority = 'high' | 'medium' | 'low';

export type TrainingRecommendation = {
  id: string;
  title: string;
  department: string;
  priority: RecommendationPriority;
  affectsCount: number;
  recommendation: string;
};
