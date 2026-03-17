export type FeedbackType = 'COURSE' | 'TRAINER' | 'PROVIDER';

export type FeedbackStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED';

export type FeedbackRatingScale = 'ONE_TO_FIVE' | 'ONE_TO_TEN';

export type FeedbackSubmissionType =
  | 'ANONYMOUS'
  | 'IDENTIFIED'
  | 'MANAGER_ONLY';

export type FeedbackQuestionType =
  | 'RATING'
  | 'TEXT'
  | 'BOOLEAN'
  | 'MULTIPLE_CHOICE';

export interface FeedbackTemplateQuestionDto {
  id: string;
  text: string;
  type: FeedbackQuestionType;
  required?: boolean;
  options?: string[];
}

export interface FeedbackResponseItemDto {
  questionId: string;
  value: string | number | boolean;
}

export interface TrainingFeedbackTemplateResponseDto {
  id: string;
  name: string;
  description: string | null;
  feedbackType: FeedbackType;
  ratingScale: FeedbackRatingScale;
  questions: FeedbackTemplateQuestionDto[];
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackTemplateDto {
  name: string;
  description?: string | null;
  feedbackType: FeedbackType;
  ratingScale: FeedbackRatingScale;
  questions: FeedbackTemplateQuestionDto[];
  isActive?: boolean;
}

export interface TrainingFeedbackResponseDto {
  id: string;
  trainingCompletionId: string;
  templateId: string;
  template: TrainingFeedbackTemplateResponseDto;
  participantId: string;
  submissionType: FeedbackSubmissionType;
  status: FeedbackStatus;
  responses: FeedbackResponseItemDto[];
  overallRating: number | null;
  comments: string | null;
  submittedAt: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  actionTaken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingFeedbackDto {
  trainingCompletionId: string;
  templateId: string;
  submissionType: FeedbackSubmissionType;
  responses: FeedbackResponseItemDto[];
  overallRating?: number | null;
  comments?: string | null;
  submit?: boolean;
}
