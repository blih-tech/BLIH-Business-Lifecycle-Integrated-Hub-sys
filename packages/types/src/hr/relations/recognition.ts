export type RecognitionCategory = 'EXCELLENCE' | 'TEAMWORK' | 'INNOVATION' | 'SERVICE' | 'OTHER';
export type RecognitionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RecognitionResponseDto {
  id: string;
  nominatorId: string;
  nomineeEmployeeId: string;
  category: RecognitionCategory;
  description: string;
  impact: string | null;
  suggestedAward: string | null;
  publicRecognition: boolean;
  approvals: unknown;
  status: RecognitionStatus;
  approvedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecognitionDto {
  nominatorId: string;
  nomineeEmployeeId: string;
  category: RecognitionCategory;
  description: string;
  impact?: string | null;
  suggestedAward?: string | null;
  publicRecognition?: boolean;
}

export interface ApproveRecognitionDto {
  approved: boolean;
  comments?: string | null;
}
