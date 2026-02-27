export interface SetUserPermissionsDto {
  permissions: string[];
}

export interface AvailableUserPermissionsResponseDto {
  userId: string;
  permissions: string[];
}
