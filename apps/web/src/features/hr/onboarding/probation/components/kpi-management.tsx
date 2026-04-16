'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  useCreateProbationKpi,
  useDeleteProbationKpi,
  useProbationKpis,
} from '@/features/hr/onboarding/probation/hooks/use-probation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type KpiManagementProps = {
  probationId?: string;
};

export function KpiManagement({
  probationId,
}: KpiManagementProps): React.ReactElement {
  const {
    data: kpis = [],
    isLoading,
    isError,
    refetch,
  } = useProbationKpis(probationId);
  const createMutation = useCreateProbationKpi();
  const deleteMutation = useDeleteProbationKpi();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function onCreate() {
    if (!name.trim()) {
      toast.error('KPI name is required.');
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
      });
      toast.success('KPI created successfully.');
      setName('');
      setDescription('');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create KPI.',
      );
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('KPI deleted.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete KPI.',
      );
    }
  }

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading KPIs...</p>;
  if (isError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">Failed to load KPI data.</p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold">KPI Management</h3>
      <p className="text-sm text-muted-foreground">KPIs: {kpis.length}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="KPI name"
        />
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
        />
        <Button
          type="button"
          onClick={onCreate}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Saving...' : 'Add KPI'}
        </Button>
      </div>
      <div className="space-y-2">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="flex items-center justify-between rounded border px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{kpi.name}</p>
              <p className="text-xs text-muted-foreground">
                {kpi.description ?? 'No description'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void onDelete(kpi.id)}
              disabled={deleteMutation.isPending}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
