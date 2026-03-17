import type { WorkforcePendingApproval } from "@/features/hr/workforce/overview/types";

import { PendingApprovalCard } from "./pending-approval-card";

type PendingApprovalsSectionProps = {
  items: WorkforcePendingApproval[];
};

export function PendingApprovalsSection({ items }: PendingApprovalsSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-sm leading-4 tracking-[-0.3125px] text-black">Pending Approvals (4)</p>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <PendingApprovalCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
