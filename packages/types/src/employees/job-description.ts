export interface CreateJobDescriptionDto {
  positionId?: string | null;
  title: string;
  level?: string | null;
  code?: string | null;
  summary?: string | null;
  duties?: string[] | null;
  skills?: Array<{ skill: string; level: string }> | null;
  kpis?: Array<{
    title: string;
    metric: string;
    target: string;
    frequency: string;
    weight: number;
  }> | null;
  documentUrl?: string | null;
  version?: number;
  effectiveFrom?: string | null;
}

export interface UpdateJobDescriptionDto {
  positionId?: string | null;
  title?: string;
  level?: string | null;
  code?: string | null;
  summary?: string | null;
  duties?: string[] | null;
  skills?: Array<{ skill: string; level: string }> | null;
  kpis?: Array<{
    title: string;
    metric: string;
    target: string;
    frequency: string;
    weight: number;
  }> | null;
  documentUrl?: string | null;
  version?: number;
  effectiveFrom?: string | null;
}

export interface JobDescriptionResponseDto {
  id: string;
  departmentId: string | null;
  departmentName?: string | null;
  positionId: string | null;
  positionTitle?: string | null;
  title: string;
  level: string | null;
  code: string | null;
  summary: string | null;
  duties: unknown;
  skills: unknown;
  kpis: unknown;
  documentUrl: string | null;
  version: number;
  effectiveFrom: string | null;
  createdAt: string;
  updatedAt: string;
}
