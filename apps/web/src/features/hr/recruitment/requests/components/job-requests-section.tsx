"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CreateRequestDialog } from "@/features/hr/recruitment/requests/components/create-request-dialog";
import { JobRequestDetailsDialog } from "@/features/hr/recruitment/requests/components/job-request-details-dialog";
import { JobRequestCard } from "@/features/hr/recruitment/requests/components/job-request-card";
import { JobRequestJustifyDialog } from "@/features/hr/recruitment/requests/components/job-request-justify-dialog";
import type { FullJobRequest, JobRequestPriority } from "@/features/hr/recruitment/requests/types";

type JobRequestsSectionProps = {
  items: FullJobRequest[];
  currentUserName: string;
};

export function JobRequestsSection({ items, currentUserName }: JobRequestsSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRequestIndex, setSelectedRequestIndex] = useState<number | null>(null);
  const [justifyRequestIndex, setJustifyRequestIndex] = useState<number | null>(null);
  const isCreateRequestDialogOpen = searchParams.get("create") === "new-request";
  const requestPriorityOrder: JobRequestPriority[] = ["high", "medium", "low"];

  const selectedRequest = useMemo(
    () => (selectedRequestIndex === null ? null : items[selectedRequestIndex] ?? null),
    [items, selectedRequestIndex],
  );
  const justifyRequest = useMemo(
    () => (justifyRequestIndex === null ? null : items[justifyRequestIndex] ?? null),
    [items, justifyRequestIndex],
  );

  function handleCreateRequestDialogOpenChange(isOpen: boolean) {
    if (isOpen) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("create");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <JobRequestCard
            key={`${item.requestForm.jobTitle}-${index}`}
            item={item}
            priority={requestPriorityOrder[index % requestPriorityOrder.length] ?? "low"}
            onClick={() => setSelectedRequestIndex(index)}
            onJustifyClick={() => setJustifyRequestIndex(index)}
          />
        ))}
      </section>

      <JobRequestDetailsDialog
        request={selectedRequest}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedRequestIndex(null);
        }}
        onApprove={() => setSelectedRequestIndex(null)}
        onJustify={() => {
          setSelectedRequestIndex(null);
          setJustifyRequestIndex(selectedRequestIndex);
        }}
      />

      <JobRequestJustifyDialog
        request={justifyRequest}
        onOpenChange={(isOpen) => {
          if (!isOpen) setJustifyRequestIndex(null);
        }}
      />

      <CreateRequestDialog
        open={isCreateRequestDialogOpen}
        onOpenChange={handleCreateRequestDialogOpenChange}
        currentUserName={currentUserName}
      />
    </>
  );
}
