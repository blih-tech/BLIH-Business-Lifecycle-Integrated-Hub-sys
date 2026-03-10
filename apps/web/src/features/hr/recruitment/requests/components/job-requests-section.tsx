"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CreateRequestDialog } from "@/features/hr/recruitment/requests/components/create-request-dialog";
import { JobRequestDetailsDialog } from "@/features/hr/recruitment/requests/components/job-request-details-dialog";
import { JobRequestCard } from "@/features/hr/recruitment/requests/components/job-request-card";
import { JobRequestJustifyDialog } from "@/features/hr/recruitment/requests/components/job-request-justify-dialog";
import type {
  FullJobRequest,
  JobRequestDepartment,
  JobRequestPriority,
} from "@/features/hr/recruitment/requests/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type JobRequestsSectionProps = {
  items: FullJobRequest[];
  currentUserName: string;
};

function departmentLabel(department: JobRequestDepartment) {
  if (department === "technical") return "Technical";
  if (department === "creative") return "Creative";
  return "Digital Marketing";
}

export function JobRequestsSection({ items, currentUserName }: JobRequestsSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [departmentFilter, setDepartmentFilter] = useState<JobRequestDepartment | "all">("all");
  const [selectedRequestIndex, setSelectedRequestIndex] = useState<number | null>(null);
  const [justifyRequestIndex, setJustifyRequestIndex] = useState<number | null>(null);
  const isCreateRequestDialogOpen = searchParams.get("create") === "new-request";
  const requestPriorityOrder: JobRequestPriority[] = ["high", "medium", "low"];
  const departmentOptions = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.requestForm.department as JobRequestDepartment))).map(
        (department) => ({
          value: department,
          label: departmentLabel(department),
        }),
      ),
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesDepartment =
          departmentFilter === "all" || item.requestForm.department === departmentFilter;

        return matchesDepartment;
      }),
    [departmentFilter, items],
  );
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
      <section className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Narrow the request list by department.
            </p>
          </div>

          <div className="grid gap-3 md:min-w-[260px] md:grid-cols-1">
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Department
              </p>
              <Select
                value={departmentFilter}
                onValueChange={(value) =>
                  setDepartmentFilter(value as JobRequestDepartment | "all")
                }
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredRequestEntries.map(({ request }, index) => (
              <JobRequestCard
                key={`${request.requestForm.jobTitle}-${index}`}
                item={request}
                currentUserName={currentUserName}
                priority={requestPriorityOrder[index % requestPriorityOrder.length] ?? "low"}
                onClick={() => setSelectedRequestIndex(index)}
                onJustifyClick={() => setJustifyRequestIndex(index)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">No matching requests</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing the department filter.
            </p>
          </div>
        )}
      </section>

      <JobRequestDetailsDialog
        request={selectedRequest}
        currentUserName={currentUserName}
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
        requestId={justifyRequestId}
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
