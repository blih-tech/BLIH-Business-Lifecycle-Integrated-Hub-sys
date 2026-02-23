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
export class KeycloakRealmNotFoundError extends KeycloakBaseError {}
