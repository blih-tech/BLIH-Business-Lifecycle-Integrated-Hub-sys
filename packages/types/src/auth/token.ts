export interface TokenRequestDto {
  token: string;
  requestedSubject?: string;
  tokenTypeHint?: 'refresh_token' | 'access_token';
  reason?: string;
}

export interface TokenResponseDto {
  active: boolean;
  policyVersion?: string;
  sub?: string;
  email?: string;
  scopes: string[];
  roles: string[];
  permissions: string[];
  accessToken?: string;
  refreshToken?: string;
}
