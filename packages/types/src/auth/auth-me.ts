export interface AuthMeUserDto {
  id: string;
  keycloakId: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  departmentId?: string | null;
}

export interface AuthMeAuthDto {
  sub: string;
  roles: string[];
  permissions: string[];
  scopes: string[];
  sessionId?: string;
  clientId?: string;
}

export interface AuthMeResponseDto {
  user: AuthMeUserDto;
  auth: AuthMeAuthDto;
}
