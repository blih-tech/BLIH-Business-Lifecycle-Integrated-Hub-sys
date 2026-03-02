export type CompletionStatus = 'COMPLETED' | 'PARTIAL' | 'DROPPED';

export interface SkillsAcquiredItem {
  skillId: string;
  levelGain?: string;
}

export interface TrainingCompletionResponseDto {
  id: string;
  userId: string;
  trainingRequestId: string | null;
  title: string;
  provider: string | null;
  startDate: string | null;
  endDate: string | null;
  completionStatus: CompletionStatus;
  scoreOrGrade: string | null;
  certificateNumber: string | null;
  certificateUrl: string | null;
  expiryDate: string | null;
  skillsAcquired: SkillsAcquiredItem[] | null;
  attestedAt: string | null;
  syncedToProfile: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingCompletionDto {
  userId: string;
  trainingRequestId?: string | null;
  title: string;
  provider?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  completionStatus: CompletionStatus;
  scoreOrGrade?: string | null;
  certificateNumber?: string | null;
  certificateUrl?: string | null;
  expiryDate?: string | null;
  skillsAcquired?: SkillsAcquiredItem[] | null;
  attestedAt?: string | null;
}

export interface UpdateTrainingCompletionDto {
  title?: string;
  provider?: string | null;
  endDate?: string | null;
  completionStatus?: CompletionStatus;
  scoreOrGrade?: string | null;
  certificateNumber?: string | null;
  certificateUrl?: string | null;
  expiryDate?: string | null;
  skillsAcquired?: SkillsAcquiredItem[] | null;
  attestedAt?: string | null;
  syncedToProfile?: boolean;
}
