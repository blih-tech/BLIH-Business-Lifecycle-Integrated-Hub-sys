import { JWTPayload } from 'jose';

export interface KeycloakRealmAccess {
  roles?: string[];
}

export interface KeycloakResourceRole {
  roles?: string[];
}

export interface KeycloakTokenPayload extends JWTPayload {
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  scope?: string;
  azp?: string;
  nonce?: string;
  session_state?: string;
  amr?: string[];
  realm_access?: KeycloakRealmAccess;
  resource_access?: Record<string, KeycloakResourceRole>;
}

export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in?: number;
  refresh_token?: string;
  token_type: string;
  id_token?: string;
  scope?: string;
}

export interface KeycloakIntrospectionResponse {
  active: boolean;
  scope?: string;
  client_id?: string;
  username?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  aud?: string[] | string;
  iss?: string;
  sid?: string;
  session_state?: string;
}

export interface KeycloakUserInfoResponse {
  sub?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  realm_access?: KeycloakRealmAccess;
}

export interface KeycloakProfileClaims {
  sub?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

export interface KeycloakUserRepresentation {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

export interface KeycloakAdminCredentials {
  username: string;
  password: string;
}

export interface RealmSummary {
  id: string;
  realm: string;
  enabled?: boolean;
}
