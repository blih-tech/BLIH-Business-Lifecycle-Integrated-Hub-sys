export interface SecurityPolicyDto {
  requireMfa: boolean;
  maxConcurrentSessions: number;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  lockoutThreshold: number;
}
