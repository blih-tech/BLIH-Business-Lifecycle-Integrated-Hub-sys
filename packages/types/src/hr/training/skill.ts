export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

/** Const array for validation/Swagger (used by recruitment job/candidate skills) */
export const SKILL_LEVELS = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
] as const;

export interface SkillResponseDto {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillDto {
  name: string;
  category?: string | null;
  description?: string | null;
}

export interface UpdateSkillDto {
  name?: string;
  category?: string | null;
  description?: string | null;
}
