export type RoleDataScope = 'global' | 'organization' | 'department' | 'self';
export type RoleCreateDataScope = 'global' | 'self';

export interface CreateRoleDto {
  name: string;
  displayName: string;
  description?: string;
  permission?: string;
  permissions?: string[];
  parentRoleName?: string;
  dataScope?: RoleCreateDataScope;
}

export interface UpdateRoleDto {
  displayName?: string;
  description?: string;
  permissions?: string[];
  parentRoleName?: string;
  dataScope?: RoleDataScope;
}

export interface AssignRoleDto {
  userId: string;
  roleName: string;
  assignedBy?: string;
  expiresAt?: string;
}

export interface RoleResponseDto {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  dataScope: RoleDataScope;
  isSystem: boolean;
  parentRoleName?: string | null;
  permissions: string[];
  assignmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListRolesQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  dataScope?: RoleDataScope;
  isSystem?: boolean;
}
