export type SurveyType = 'SATISFACTION' | 'PULSE';
export type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'scale' | 'text' | 'single' | 'multiple';
  options?: string[];
}

export interface SurveyResponseRecordDto {
  id: string;
  surveyId: string;
  employeeId: string | null;
  responses: unknown;
  submittedAt: string;
  createdAt: string;
}

export interface SurveyFormResponseDto {
  id: string;
  title: string;
  description: string | null;
  type: SurveyType;
  questions: SurveyQuestion[];
  anonymous: boolean;
  status: SurveyStatus;
  opensAt: string | null;
  closesAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurveyDto {
  title: string;
  description?: string | null;
  type?: SurveyType;
  questions: SurveyQuestion[];
  anonymous?: boolean;
  createdById: string;
  opensAt?: string | null;
  closesAt?: string | null;
}

export interface UpdateSurveyDto {
  title?: string;
  description?: string | null;
  status?: SurveyStatus;
  opensAt?: string | null;
  closesAt?: string | null;
}

export interface SubmitSurveyResponseDto {
  employeeId?: string | null;
  responses: unknown;
}

export interface SurveyAggregateResultsDto {
  surveyId: string;
  totalResponses: number;
  questionResults: Array<{
    questionId: string;
    questionText: string;
    type: string;
    average?: number;
    distribution?: Record<string, number>;
    textResponses?: string[];
  }>;
}
