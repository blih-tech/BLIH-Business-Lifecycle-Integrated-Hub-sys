'use client';

import { useEffect, useState } from 'react';
import { ChecklistCard } from '@/features/hr/onboarding/checklists/components';

import {
  getChecklists,
  submitChecklist,
  approveChecklist,
  rejectChecklist,
} from './api/checklist.api';

import { mapChecklistToTemplate, ChecklistItem, ChecklistUI } from './mapper';

export function OnboardingChecklistsContent() {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getChecklists();
        setChecklists(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const updateLocalState = (id: string, status: ChecklistItem['status']) => {
    setChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    );
  };

  const handleSubmit = async (taskId: string, type: string, id: string) => {
    await submitChecklist(taskId, type);
    updateLocalState(id, 'SUBMITTED');
  };

  const handleApprove = async (taskId: string, type: string, id: string) => {
    await approveChecklist(taskId, type);
    updateLocalState(id, 'COMPLETED');
  };

  const handleReject = async (taskId: string, type: string, id: string) => {
    await rejectChecklist(taskId, type);
    updateLocalState(id, 'CHANGES_REQUESTED');
  };

  const mappedChecklists: ChecklistUI[] = mapChecklistToTemplate(checklists);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="mx-auto max-w-[1024px] space-y-5 px-4 py-4">
      <section>
        <h2 className="text-xl font-semibold">Onboarding Checklists</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {mappedChecklists.map((checklist) => (
            <ChecklistCard
              key={checklist.id}
              checklist={checklist}
              onSubmit={() =>
                handleSubmit(
                  checklist.taskId,
                  checklist.type,
                  checklist.originalId,
                )
              }
              onApprove={() =>
                handleApprove(
                  checklist.taskId,
                  checklist.type,
                  checklist.originalId,
                )
              }
              onReject={() =>
                handleReject(
                  checklist.taskId,
                  checklist.type,
                  checklist.originalId,
                )
              }
            />
          ))}
        </div>
      </section>
    </main>
  );
}
