export interface PositionResponseDto {
  id: string;
  title: string;
  description?: string | null;
  departmentId: string;
  departmentName: string;
  gradeId?: string | null;
  gradeCode?: string | null;
  gradeName?: string | null;
  gradeLevel?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionDto {
  title: string;
  description?: string;
  departmentId: string;
  gradeId?: string | null;
  isActive?: boolean;
}

export interface UpdatePositionDto {
  title?: string;
  description?: string | null;
  departmentId?: string | null;
  gradeId?: string | null;
  isActive?: boolean;
}
