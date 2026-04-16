import { CheckSquare, Copy, Pencil, Trash2 } from 'lucide-react';
import type { ChecklistTemplate } from '@/features/hr/onboarding/checklists/types';
import { Button } from '@/shared/components/ui/button';

type ChecklistStatus = 'TODO' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'COMPLETED';

type ChecklistCardProps = {
  checklist: ChecklistTemplate & {
    originalId: string;
    type: string;
    taskId: string;
    status: ChecklistStatus;
  };
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
};

export function ChecklistCard({
  checklist,
  onSubmit,
  onApprove,
  onReject,
  onComplete,
}: ChecklistCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white p-5">
      {/* HEADER */}
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-black">{checklist.title}</h3>
        <span className="inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1 py-0.5 text-xs font-semibold uppercase text-primary">
          {checklist.department}
        </span>
      </div>

      {/* META */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-[8px] bg-[#f5f5f5] p-3">
        <div>
          <p className="text-xs text-[#666]">Total Items</p>
          <p className="text-base font-semibold">{checklist.totalItems}</p>
        </div>
        <div>
          <p className="text-xs text-[#666]">Times Used</p>
          <p className="text-base font-semibold">{checklist.timesUsed}</p>
        </div>
        <div>
          <p className="text-xs text-[#666]">Created</p>
          <p className="text-sm font-medium">{checklist.createdAt}</p>
        </div>
        <div>
          <p className="text-xs text-[#666]">Last Used</p>
          <p className="text-sm font-medium">{checklist.lastUsedAt}</p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="mt-4 rounded-[8px] bg-[#f5f5f5] px-3 pt-3 pb-2">
        <p className="text-sm font-medium">Checklist Items:</p>
        <ul className="mt-1 space-y-1">
          {checklist.items.map((item) => (
            <li
              key={item}
              className={`text-sm ${
                item.startsWith('+')
                  ? 'font-medium text-primary'
                  : 'text-[#666]'
              }`}
            >
              {item.startsWith('+') ? (
                item
              ) : (
                <>
                  <CheckSquare className="mr-1 inline h-3 w-3 text-primary" />
                  {item}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* STATUS */}
      <div className="mt-3 text-sm font-medium">
        Status: <span className="text-primary">{checklist.status}</span>
      </div>

      {/* ACTIONS */}
      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <Button type="button" className="h-8 px-4 text-sm">
          Use This Checklist
        </Button>

        {checklist.status === 'TODO' && (
          <Button onClick={onSubmit}>Submit</Button>
        )}

        {checklist.status === 'CHANGES_REQUESTED' && (
          <Button onClick={onSubmit}>Resubmit</Button>
        )}

        {checklist.status === 'SUBMITTED' && (
          <>
            <Button onClick={onApprove}>Approve</Button>
            <Button variant="destructive" onClick={onReject}>
              Reject
            </Button>
          </>
        )}

        {checklist.status !== 'COMPLETED' && (
          <Button onClick={onComplete}>Complete</Button>
        )}
      </div>

      {/* ICON BUTTONS */}
      <div className="mt-3 flex items-center gap-2">
        <button className="grid h-8 w-8 place-items-center border rounded">
          <Pencil className="h-4 w-4" />
        </button>
        <button className="grid h-8 w-8 place-items-center border rounded">
          <Copy className="h-4 w-4" />
        </button>
        <button className="grid h-8 w-8 place-items-center border rounded">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
