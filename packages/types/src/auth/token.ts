export interface AuthLoginQueryDto {
  redirect?: string;
  redirect_origin?: string;
  prompt?: string;
}

export interface AuthCallbackQueryDto {
  code?: string;
  state?: string;
}

export interface AuthLogoutQueryDto {
  redirect?: string;
  redirect_origin?: string;
}

export interface ValidateTokenRequestDto {
  token: string;
}

export interface IntrospectTokenRequestDto {
  token: string;
}

export interface ExchangeTokenRequestDto {
  token: string;
  requestedSubject?: string;
}

export interface RefreshTokenRequestDto {
  token?: string;
}

export interface RevokeSessionRequestDto {
  token: string;
  tokenTypeHint?: 'refresh_token' | 'access_token';
  reason?: string;
}

export interface TokenRequestDto
  extends
    ValidateTokenRequestDto,
    Partial<Pick<ExchangeTokenRequestDto, 'requestedSubject'>>,
    Partial<Pick<RevokeSessionRequestDto, 'tokenTypeHint' | 'reason'>> {}

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

export interface RevokeSessionResponseDto {
  revoked: boolean;
  subject?: string;
  sessionId?: string;
  tokenTypeHint: 'refresh_token' | 'access_token';
  reason: string;
}
