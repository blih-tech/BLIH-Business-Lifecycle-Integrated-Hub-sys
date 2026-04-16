import type { ChecklistTemplate } from '@/features/hr/onboarding/checklists/types';

export type ChecklistStatus =
  | 'TODO'
  | 'SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'COMPLETED';

export type ChecklistItem = {
  id: string;
  status: ChecklistStatus;
  dueDate?: string | null;
  taskInstanceId: string;
  taskId: string;
  type: string;
};

export type ChecklistUI = ChecklistTemplate & {
  originalId: string;
  status: ChecklistStatus;
  taskId: string;
  type: string;
};

export function mapChecklistToTemplate(items: ChecklistItem[]): ChecklistUI[] {
  return items.map((item) => ({
    id: item.id,
    originalId: item.id,
    status: item.status,
    taskId: item.taskId,
    type: item.type,
    title: 'Onboarding Task',
    department: 'HR',
    totalItems: 1,
    timesUsed: 0,
    createdAt: '-',
    lastUsedAt: '-',
    items: [`Task ID: ${item.taskInstanceId}`],
  }));
}
