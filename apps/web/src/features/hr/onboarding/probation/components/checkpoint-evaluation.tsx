'use client';

import { useState } from 'react';
import { createCheckpointEvaluation } from '@/features/hr/onboarding/probation/api/evaluation.api';
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
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await createCheckpointEvaluation({
        checkpointId,
        scores: [{ probationKpiId, score: Number(score || 0) }],
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Checkpoint score"
      />
      <Button type="button" onClick={onCreate} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
