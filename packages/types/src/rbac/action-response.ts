export interface ActionResponseDto {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActionDto {
  name: string;
  description?: string;
}

export interface UpdateActionDto {
  description?: string | null;
}
