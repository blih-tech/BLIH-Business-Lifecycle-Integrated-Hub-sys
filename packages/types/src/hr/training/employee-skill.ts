import type { SkillLevel } from './skill.js';

export type SkillSource = 'SELF' | 'MANAGER' | 'ASSESSMENT' | 'TRAINING';

export interface EmployeeSkillResponseDto {
  id: string;
  userId: string;
  skillId: string;
  skillName?: string;
  level: SkillLevel;
  attestedAt: string | null;
  source: SkillSource;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertEmployeeSkillDto {
  skillId: string;
  level: SkillLevel;
  source?: SkillSource;
}

export interface UpsertEmployeeSkillsDto {
  skills: UpsertEmployeeSkillDto[];
}
