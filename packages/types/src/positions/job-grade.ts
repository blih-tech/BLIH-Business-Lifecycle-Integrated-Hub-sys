export interface JobGradeResponseDto {
  id: string;
  code: string;
  name: string;
  level: number;
  minSalary: number | null;
  maxSalary: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobGradeDto {
  code: string;
  name: string;
  level: number;
  minSalary?: number | null;
  maxSalary?: number | null;
}

export interface UpdateJobGradeDto {
  code?: string;
  name?: string;
  level?: number;
  minSalary?: number | null;
  maxSalary?: number | null;
}
