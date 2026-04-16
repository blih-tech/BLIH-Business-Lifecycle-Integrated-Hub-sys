'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { InterviewQuestionResponseDto } from '@/types';

export function QuestionBank(): React.ReactElement {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['hr', 'recruitment', 'question-bank'],
    queryFn: async () => {
      const response = await apiClient.get<{
        data?: InterviewQuestionResponseDto[];
      }>('/hr/recruitment/interview-questions');
      return response.data ?? [];
    },
  });

  if (isLoading)
    return (
      <p className="text-sm text-muted-foreground">Loading questions...</p>
    );
  if (isError)
    return (
      <p className="text-sm text-destructive">Failed to load question bank.</p>
    );

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold">Question Bank</h3>
      <p className="text-sm text-muted-foreground">
        Active questions: {data?.length ?? 0}
      </p>
    </div>
  );
}
