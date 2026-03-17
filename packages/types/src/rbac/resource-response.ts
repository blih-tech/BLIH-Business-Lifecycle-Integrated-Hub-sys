export interface ResourceResponseDto {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceDto {
  name: string;
  description?: string;
}

export interface UpdateResourceDto {
  description?: string | null;
}
