'use client';

import {
  CheckpointEvaluation,
  FinalEvaluation,
} from '@/features/hr/onboarding/probation/components';
import { useProbation } from '@/features/hr/onboarding/probation/hooks/use-probation';
import { Button } from '@/shared/components/ui/button';

type ProbationEvaluationsScreenProps = {
  probationId: string;
};

export function ProbationEvaluationsScreen({
  probationId,
}: ProbationEvaluationsScreenProps): React.ReactElement {
  const { data, isLoading, isError, refetch } = useProbation(probationId);

  if (isLoading) return <p>Loading probation evaluation data...</p>;
  if (isError || !data) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">
          Failed to load probation evaluation data.
        </p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const firstCheckpointId = data.checkpoints[0]?.id;
  const firstProbationKpiId = data.kpis[0]?.id;

  if (!firstCheckpointId || !firstProbationKpiId) {
    return (
      <p className="text-sm text-muted-foreground">
        This probation plan needs at least one checkpoint and KPI before
        evaluations can be submitted.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <CheckpointEvaluation
        checkpointId={firstCheckpointId}
        probationKpiId={firstProbationKpiId}
      />
      <FinalEvaluation
        probationId={probationId}
        probationKpiId={firstProbationKpiId}
      />
    </div>
  );
}
