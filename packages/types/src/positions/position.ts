export interface PositionResponseDto {
  id: string;
  title: string;
  description?: string | null;
  departmentId: string;
  departmentName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionDto {
  title: string;
  description?: string;
  departmentId: string;
  isActive?: boolean;
}

export interface UpdatePositionDto {
  title?: string;
  description?: string | null;
  departmentId?: string | null;
  isActive?: boolean;
}
