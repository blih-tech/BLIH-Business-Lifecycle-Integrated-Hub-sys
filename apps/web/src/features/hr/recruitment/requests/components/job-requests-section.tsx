"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CreateRequestDialog } from "@/features/hr/recruitment/requests/components/create-request-dialog";
import { JobRequestDetailsDialog } from "@/features/hr/recruitment/requests/components/job-request-details-dialog";
import { JobRequestCard } from "@/features/hr/recruitment/requests/components/job-request-card";
import { JobRequestJustifyDialog } from "@/features/hr/recruitment/requests/components/job-request-justify-dialog";
import { JobRequestCardSkeleton } from "@/features/hr/recruitment/requests/components/job-request-card-skeleton";
import type { FullJobRequest, JobRequestPriority } from "@/features/hr/recruitment/requests/types";

type JobRequestsSectionProps = {
  items: FullJobRequest[];
  currentUserName: string;
  isLoading?: boolean;
};

export function JobRequestsSection({ items, currentUserName, isLoading = false }: JobRequestsSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRequestIndex, setSelectedRequestIndex] = useState<number | null>(null);
  const [justifyRequestIndex, setJustifyRequestIndex] = useState<number | null>(null);
  const isCreateRequestDialogOpen = searchParams.get("create") === "new-request";
  const requestPriorityOrder: JobRequestPriority[] = ["high", "medium", "low"];

  const filteredItems = useMemo(() => items, [items]);
  const filteredRequestEntries = useMemo(
    () =>
      filteredItems.map((request) => ({
        request,
        requestId: `REQ-${String(items.indexOf(request) + 1).padStart(3, "0")}`,
      })),
    [filteredItems, items],
  );

  const selectedRequest = useMemo(
    () => (selectedRequestIndex === null ? null : filteredRequestEntries[selectedRequestIndex]?.request ?? null),
    [filteredRequestEntries, selectedRequestIndex],
  );
  const justifyRequest = useMemo(
    () => (justifyRequestIndex === null ? null : filteredRequestEntries[justifyRequestIndex]?.request ?? null),
    [filteredRequestEntries, justifyRequestIndex],
  );
  const justifyRequestId = useMemo(
    () => (justifyRequestIndex === null ? null : filteredRequestEntries[justifyRequestIndex]?.requestId ?? null),
    [filteredRequestEntries, justifyRequestIndex],
  );

  useEffect(() => {
    if (selectedRequestIndex !== null && !filteredRequestEntries[selectedRequestIndex]) {
      setSelectedRequestIndex(null);
    }
    if (justifyRequestIndex !== null && !filteredRequestEntries[justifyRequestIndex]) {
      setJustifyRequestIndex(null);
    }
  }, [filteredRequestEntries, justifyRequestIndex, selectedRequestIndex]);

  function handleCreateRequestDialogOpenChange(isOpen: boolean) {
    if (isOpen) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("create");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <JobRequestCardSkeleton key={`request-skeleton-${index}`} />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredRequestEntries.map(({ request }, index) => (
            <JobRequestCard
              key={`${request.requestForm.jobTitle}-${index}`}
              item={request}
              priority={requestPriorityOrder[index % requestPriorityOrder.length] ?? "low"}
              onClick={() => setSelectedRequestIndex(index)}
              onJustifyClick={() => setJustifyRequestIndex(index)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center">
          <p className="text-sm font-semibold text-foreground">No requests</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No requests are available for this section yet.
          </p>
        </div>
      )}

      {!isLoading ? (
        <JobRequestDetailsDialog
        request={selectedRequest}
        currentUserName={currentUserName}
        variant={selectedRequest?.status ?? "active"}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedRequestIndex(null);
        }}
        onApprove={() => setSelectedRequestIndex(null)}
        onJustify={() => {
          setSelectedRequestIndex(null);
          setJustifyRequestIndex(selectedRequestIndex);
        }}
        onEdit={() => setSelectedRequestIndex(null)}
        />
      ) : null}

      {!isLoading ? (
        <JobRequestJustifyDialog
        request={justifyRequest}
        requestId={justifyRequestId}
        onOpenChange={(isOpen) => {
          if (!isOpen) setJustifyRequestIndex(null);
        }}
        />
      ) : null}

      {!isLoading ? (
        <CreateRequestDialog
        open={isCreateRequestDialogOpen}
        onOpenChange={handleCreateRequestDialogOpenChange}
        currentUserName={currentUserName}
        />
      ) : null}
    </>
  );
}
