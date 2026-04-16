'use client';

import { useState } from 'react';
import { submitInterviewFeedback } from '@/features/hr/recruitment/interviews/api/interviews.api';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type FeedbackFormProps = {
  interviewId: string;
  participantId: string;
};

export function FeedbackForm({
  interviewId,
  participantId,
}: FeedbackFormProps): React.ReactElement {
  const [score, setScore] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    try {
      await submitInterviewFeedback(interviewId, participantId, {
        score: score ? Number(score) : null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Score (0-100)"
      />
      <Button type="button" onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Feedback'}
      </Button>
    </div>
  );
}
