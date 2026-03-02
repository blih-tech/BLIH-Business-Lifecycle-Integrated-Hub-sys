export interface ExitInterviewResponseDto {
  id: string;
  userId: string;
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
  userId: string;
  resignationId: string;
  conductedById?: string | null;
  conductedAt?: string | null;
  questions?: unknown;
  answers?: unknown;
  wouldRecommend?: boolean | null;
  wouldReturn?: boolean | null;
  improvementNotes?: string | null;
}
