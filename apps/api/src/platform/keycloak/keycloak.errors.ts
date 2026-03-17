export class KeycloakBaseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
  }
}

export class KeycloakUnauthorizedError extends KeycloakBaseError {}
export class KeycloakUnavailableError extends KeycloakBaseError {}
export class KeycloakTokenValidationError extends KeycloakBaseError {}
export class KeycloakIdTokenValidationError extends KeycloakTokenValidationError {
  constructor(
    message: string,
    public readonly reason: 'invalid_id_token' | 'invalid_nonce',
    cause?: unknown,
  ) {
    super(message, cause);
  }
}
export class KeycloakRealmNotFoundError extends KeycloakBaseError {}
