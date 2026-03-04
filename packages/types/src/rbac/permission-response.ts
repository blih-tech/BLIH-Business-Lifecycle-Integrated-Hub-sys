export interface PermissionResponseDto {
  id: string;
  slug: string;
  resourceId: string;
  resource: string;
  actionId: string;
  action: string;
  description?: string | null;
  createdAt: Date;
}

export interface CreatePermissionDto {
  resourceId: string;
  actionId: string;
  description?: string;
}

export interface UpdatePermissionDto {
  description?: string | null;
}
