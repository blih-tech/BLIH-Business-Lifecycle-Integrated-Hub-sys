import type { SkillLevel } from './skill.js';

export interface RequiredSkillItem {
  skillId: string;
  requiredLevel: SkillLevel;
  criticality?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CurrentStateItem {
  userId: string;
  skillId: string;
  currentLevel: SkillLevel | null;
  gap: number;
}

export interface TrainingRecommendationItem {
  skillId: string;
  trainingTitle?: string;
  priority?: string;
}

export interface SkillGapAssessmentResponseDto {
  id: string;
  departmentId: string;
  assessedById: string;
  assessedAt: string;
  requiredSkills: RequiredSkillItem[];
  currentState: CurrentStateItem[];
  criticalGapsSummary: string | null;
  trainingRecommendations: TrainingRecommendationItem[] | null;
  hireRecommendations: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillGapAssessmentDto {
  departmentId: string;
  assessedById: string;
  requiredSkills: RequiredSkillItem[];
  currentState?: CurrentStateItem[];
  criticalGapsSummary?: string | null;
  trainingRecommendations?: TrainingRecommendationItem[] | null;
  hireRecommendations?: unknown;
}

export interface IndividualSkillGapResponseDto {
  userId: string;
  targetPositionId?: string | null;
  gaps: Array<{
    skillId: string;
    skillName: string;
    currentLevel: SkillLevel | null;
    requiredLevel: SkillLevel;
    gap: number;
    priority: 'HIGH' | 'MEDIUM';
  }>;
  strengths: Array<{
    skillId: string;
    skillName: string;
    level: SkillLevel;
  }>;
  readinessScore: number;
  totalGaps: number;
  criticalGaps: number;
}
