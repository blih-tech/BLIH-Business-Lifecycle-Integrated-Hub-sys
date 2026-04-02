export interface RagAskResponse {
  answer: string;
  sources: string[];
}

export interface RagAskRequest {
  question: string;
  history?: { role: string; content: string }[];
  filter?: Record<string, unknown>;
  queryVariants?: string[];
  reasoningMode?: 'single-module' | 'cross-module';
}

export interface RagIngestRequest {
  text: string;
  source: string;
  metadata?: {
    module: string;
    userId?: string;
    type: string;
    tags?: string[];
    isAI?: boolean;
  };
}
