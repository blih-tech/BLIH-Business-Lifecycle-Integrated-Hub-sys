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

type OwnershipFilter = "all" | "mine";

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function departmentLabel(department: JobRequestDepartment) {
  if (department === "technical") return "Technical";
  if (department === "creative") return "Creative";
  return "Digital Marketing";
}

export function JobRequestsSection({ items, currentUserName }: JobRequestsSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>("all");
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
        const matchesOwnership =
          ownershipFilter === "all" ||
          normalizeName(item.requestForm.requestedBy) === normalizeName(currentUserName);
        const matchesDepartment =
          departmentFilter === "all" || item.requestForm.department === departmentFilter;

        return matchesOwnership && matchesDepartment;
      }),
    [currentUserName, departmentFilter, items, ownershipFilter],
  );

  const selectedRequest = useMemo(
    () => (selectedRequestIndex === null ? null : filteredItems[selectedRequestIndex] ?? null),
    [filteredItems, selectedRequestIndex],
  );
  const justifyRequest = useMemo(
    () => (justifyRequestIndex === null ? null : filteredItems[justifyRequestIndex] ?? null),
    [filteredItems, justifyRequestIndex],
  );

  useEffect(() => {
    if (selectedRequestIndex !== null && !filteredItems[selectedRequestIndex]) {
      setSelectedRequestIndex(null);
    }
    if (justifyRequestIndex !== null && !filteredItems[justifyRequestIndex]) {
      setJustifyRequestIndex(null);
    }
  }, [filteredItems, justifyRequestIndex, selectedRequestIndex]);

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
              Narrow the request list by ownership or department.
            </p>
          </div>

          <div className="grid gap-3 md:min-w-[420px] md:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Requests
              </p>
              <Select
                value={ownershipFilter}
                onValueChange={(value) => setOwnershipFilter(value as OwnershipFilter)}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Filter by owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="mine">Requested By Me</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
            {filteredItems.map((item, index) => (
              <JobRequestCard
                key={`${item.requestForm.jobTitle}-${index}`}
                item={item}
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
              Try changing the ownership or department filter.
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
