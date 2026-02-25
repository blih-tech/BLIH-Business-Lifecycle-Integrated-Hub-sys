export interface UserResponseDto {
  id: string;
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  position?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}
