export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

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
