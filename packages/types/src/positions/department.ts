export interface DepartmentResponseDto {
  id: string;
  name: string;
  parentId: string | null;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string | null;
  parentId?: string | null;
}
