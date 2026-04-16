'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  useCreateProbation,
  useUpdateProbation,
} from '@/features/hr/onboarding/probation/hooks/use-probation';
import type { ProbationPlan } from '@/features/hr/onboarding/probation/api/probation.api';
import type { CreateProbationDto } from '@/types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type ProbationFormProps = {
  probation?: ProbationPlan;
};

export function ProbationForm({
  probation,
}: ProbationFormProps): React.ReactElement {
  const router = useRouter();
  const createMutation = useCreateProbation();
  const updateMutation = useUpdateProbation(probation?.id ?? '');
  const isEditMode = Boolean(probation);

  const initialValues = useMemo(
    () => ({
      employeeId: probation?.employeeId ?? '',
      startDate: probation?.startDate?.slice(0, 10) ?? '',
      endDate: probation?.endDate?.slice(0, 10) ?? '',
    }),
    [probation],
  );

  const [form, setForm] = useState(initialValues);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.employeeId || !form.startDate || !form.endDate) {
      toast.error('Please complete all required fields.');
      return;
    }

    const payload: CreateProbationDto = {
      employeeId: form.employeeId,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    try {
      if (isEditMode && probation) {
        await updateMutation.mutateAsync(payload);
        toast.success('Probation plan updated successfully.');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Probation plan created successfully.');
      }
      router.push('/dashboard/hr/onboarding/probation');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save probation plan. Please retry.',
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Employee ID</label>
        <Input
          value={form.employeeId}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, employeeId: event.target.value }))
          }
          placeholder="employee-uuid"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Start Date</label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, startDate: event.target.value }))
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">End Date</label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, endDate: event.target.value }))
            }
          />
        </div>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving
          ? isEditMode
            ? 'Updating...'
            : 'Creating...'
          : isEditMode
            ? 'Update Probation'
            : 'Create Probation'}
      </Button>
    </form>
  );
}
