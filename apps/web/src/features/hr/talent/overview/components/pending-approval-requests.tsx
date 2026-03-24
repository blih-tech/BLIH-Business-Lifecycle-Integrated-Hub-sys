import type { TalentApprovalRequest } from '@/features/hr/talent/overview/types';

import { ApprovalRequestCard } from './approval-request-card';

type PendingApprovalRequestsProps = {
  items: TalentApprovalRequest[];
};

export function PendingApprovalRequests({
  items,
}: PendingApprovalRequestsProps) {
  return (
    <section className="space-y-2.5">
      <div>
        <p className="text-base font-medium tracking-[-0.176px] text-black">
          Pending Approval Requests
        </p>
        <p className="text-xs text-[#666]">Review and approve requests.</p>
      </div>
      <div className="grid gap-2.5 lg:grid-cols-2">
        {items.map((item) => (
          <ApprovalRequestCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
