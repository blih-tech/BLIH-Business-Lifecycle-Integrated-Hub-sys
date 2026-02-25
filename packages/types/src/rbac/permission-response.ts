export interface PermissionResponseDto {
  id: string;
  slug: string;
  moduleId: string;
  module: string;
  resourceId: string;
  resource: string;
  actionId: string;
  action: string;
  description?: string | null;
  createdAt: Date;
}
