'use client';

import { useProbation } from '@/features/hr/onboarding/probation/hooks/use-probation';
import { ProbationForm } from '@/features/hr/onboarding/probation/components/probation-form';
import { Button } from '@/shared/components/ui/button';

type EditProbationScreenProps = {
  probationId: string;
};

export function EditProbationScreen({
  probationId,
}: EditProbationScreenProps): React.ReactElement {
  const { data, isLoading, isError, refetch } = useProbation(probationId);

  if (isLoading) return <p>Loading probation plan...</p>;
  if (isError || !data) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">
          Failed to load probation plan details.
        </p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return <ProbationForm probation={data} />;
}
