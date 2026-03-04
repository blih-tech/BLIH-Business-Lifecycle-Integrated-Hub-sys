export interface ExitInterviewResponseDto {
  id: string;
  employeeId: string;
  resignationId: string;
  conductedById: string | null;
  conductedAt: string | null;
  questions: unknown;
  answers: unknown;
  wouldRecommend: boolean | null;
  wouldReturn: boolean | null;
  improvementNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExitInterviewDto {
  employeeId: string;
  resignationId: string;
  conductedById?: string | null;
  conductedAt?: string | null;
  questions?: unknown;
  answers?: unknown;
  wouldRecommend?: boolean | null;
  wouldReturn?: boolean | null;
  improvementNotes?: string | null;
}
