export interface AccessEvaluationDto {
  userId: string;
  requiredPermissions: string[];
  ownerUserId?: string;
}
