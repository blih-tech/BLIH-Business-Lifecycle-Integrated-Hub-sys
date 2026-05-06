export interface BrainChatRequest {
  userId: string;
  question: string;
  module: string;
  sessionId?: string;
}

export interface BrainChatResponse {
  sessionId: string;
  answer: string;
  sources: string[];
}

export interface BrainSession {
  id: string;
  title: string;
  module: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export interface BrainHistoryResponse {
  id: string;
  messages: {
    role: string;
    content: string;
    createdAt: Date;
  }[];
}

export interface CvUploadResponse {
  applicantId: string;
  score?: number;
  recommendation?: string;
  status: string;
}
