'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateCheckpointEvaluation } from '@/features/hr/onboarding/probation/hooks/use-probation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type CheckpointEvaluationProps = {
  checkpointId: string;
  probationKpiId: string;
};

export function CheckpointEvaluation({
  checkpointId,
  probationKpiId,
}: CheckpointEvaluationProps): React.ReactElement {
  const [score, setScore] = useState('');
  const createMutation = useCreateCheckpointEvaluation();

  async function onCreate() {
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
        checkpointId,
        scores: [{ probationKpiId, score: numericScore }],
      });
      toast.success('Checkpoint evaluation saved.');
      setScore('');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to submit checkpoint evaluation.',
      );
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Checkpoint score"
      />
      <Button
        type="button"
        onClick={onCreate}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
