'use client';

import { useState } from 'react';
import { createFinalEvaluation } from '@/features/hr/onboarding/probation/api/evaluation.api';
import { Button } from '@/shared/components/ui/button';

type FinalEvaluationProps = {
  probationId: string;
  probationKpiId: string;
};

export function FinalEvaluation({
  probationId,
  probationKpiId,
}: FinalEvaluationProps): React.ReactElement {
  const [saving, setSaving] = useState(false);

  async function onConfirm() {
    setSaving(true);
    try {
      await createFinalEvaluation({
        probationId,
        outcome: 'CONFIRMED',
        scores: [{ probationKpiId, score: 80 }],
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button type="button" onClick={onConfirm} disabled={saving}>
      {saving ? 'Submitting...' : 'Submit Final Evaluation'}
    </Button>
  );
}
