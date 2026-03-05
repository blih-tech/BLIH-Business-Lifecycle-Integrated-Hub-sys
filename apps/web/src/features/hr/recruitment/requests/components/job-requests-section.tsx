"use client";

import { useMemo, useState } from "react";

import { JobRequestDetailsDialog } from "@/features/hr/recruitment/requests/components/job-request-details-dialog";
import { JobRequestCard } from "@/features/hr/recruitment/requests/components/job-request-card";
import type { JobRequestItem } from "@/features/hr/recruitment/requests/types";

type JobRequestsSectionProps = {
  items: JobRequestItem[];
};

export function JobRequestsSection({ items }: JobRequestsSectionProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const selectedRequest = useMemo(
    () => items.find((item) => item.id === selectedRequestId) ?? null,
    [items, selectedRequestId],
  );

  return (
    <>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item) => (
          <JobRequestCard key={item.id} item={item} onClick={() => setSelectedRequestId(item.id)} />
        ))}
      </section>

      <JobRequestDetailsDialog
        request={selectedRequest}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedRequestId(null);
        }}
      />
    </>
  );
}
