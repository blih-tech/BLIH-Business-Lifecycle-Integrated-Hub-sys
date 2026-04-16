'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateFinalEvaluation } from '@/features/hr/onboarding/probation/hooks/use-probation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type FinalEvaluationProps = {
  probationId: string;
  probationKpiId: string;
};

export function FinalEvaluation({
  probationId,
  probationKpiId,
}: FinalEvaluationProps): React.ReactElement {
  const [score, setScore] = useState('80');
  const createMutation = useCreateFinalEvaluation();

  async function onConfirm() {
    const numericScore = Number(score);
    if (
      !Number.isFinite(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      toast.error('Score must be a number between 0 and 100.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        probationId,
        outcome: 'CONFIRMED',
        scores: [{ probationKpiId, score: numericScore }],
      });
      toast.success('Final evaluation submitted.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to submit final evaluation.',
      );
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={score}
        onChange={(event) => setScore(event.target.value)}
        placeholder="Final score"
      />
      <Button
        type="button"
        onClick={onConfirm}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Submitting...' : 'Submit Final Evaluation'}
      </Button>
    </div>
  );
}
