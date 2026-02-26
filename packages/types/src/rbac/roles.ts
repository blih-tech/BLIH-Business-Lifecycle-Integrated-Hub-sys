export interface CreateRoleDto {
  name: string;
  displayName: string;
  description?: string;
  parentRoleId?: string;
}

export interface UpdateRoleDto {
  displayName?: string;
  description?: string;
  parentRoleId?: string | null;
}

export interface AssignRoleDto {
  userId: string;
  roleName: string;
  assignedBy?: string;
  expiresAt?: string;
}

export interface AssignRolePermissionsDto {
  permissionIds: string[];
}

export interface RoleResponseDto {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isSystem: boolean;
  parentRoleId?: string | null;
  permissions: string[];
  assignmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListRolesQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isSystem?: boolean;
}
